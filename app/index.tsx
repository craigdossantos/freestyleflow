import { useMicrophonePermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { startInAppRecording, stopInAppRecording } from 'react-native-nitro-screen-recorder';
import { CameraLayer } from '../components/CameraLayer';
import { GameArea } from '../components/GameArea';
import { LocalMusicLayer } from '../components/LocalMusicLayer';
import { TapButton } from '../components/TapButton';
import { YouTubeLayer } from '../components/YouTubeLayer';
import { COLORS, FONTS, SHAPES } from '../constants/theme';
import { useGameStore } from '../store';

export default function GameScreen() {
    const bpm = useGameStore((state) => state.bpm);
    const videoId = useGameStore((state) => state.videoId);
    const musicMode = useGameStore((state) => state.musicMode);
    const loadNewRhymes = useGameStore((state) => state.loadNewRhymes);
    const router = useRouter();
    const isFocused = useIsFocused();

    const isPlaying = useGameStore((state) => state.isPlaying);
    const togglePlay = useGameStore((state) => state.togglePlay);

    // Camera Mode State (shows camera preview and allows recording)
    const [cameraMode, setCameraMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();

    useEffect(() => {
        // On mount (or focus), ensure we have rhymes loaded
        loadNewRhymes();
    }, []);

    // Simple play/pause for the game (no recording)
    const handleTogglePlay = () => {
        togglePlay();
    };

    // Start recording (only available in camera mode)
    const handleStartRecording = async () => {
        try {
            // Request microphone permission first
            if (!micPermission?.granted) {
                const { granted } = await requestMicPermission();
                if (!granted) {
                    Alert.alert("Permission Required", "Microphone permission is needed to record audio.");
                    return;
                }
            }

            // Using startInAppRecording (iOS only for now)
            await startInAppRecording({
                options: {
                    enableMic: true,
                    enableCamera: false, // We use our own CameraLayer
                },
                onRecordingFinished: (file) => {
                    console.log('Recording finished callback:', file.path);
                }
            });
            setIsRecording(true);
            // Also start the game when recording starts
            if (!isPlaying) {
                togglePlay();
            }
        } catch (error) {
            console.error("Failed to start recording:", error);
            Alert.alert("Recording Error", "Could not start screen recording. Are you on a Development Build?");
        }
    };

    // Stop recording
    const handleStopRecording = async () => {
        setIsRecording(false);
        // Stop the game too
        if (isPlaying) {
            togglePlay();
        }
        try {
            const file = await stopInAppRecording();
            if (file) {
                saveRecording(file.path);
            }
        } catch (error) {
            console.error("Failed to stop recording:", error);
        }
    };

    const saveRecording = async (url: string) => {
        if (!permissionResponse?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert("Permission Required", "We need permission to save the video to your library.");
                return;
            }
        }
        try {
            await MediaLibrary.saveToLibraryAsync(url);
            Alert.alert("Saved!", "Your freestyle session has been saved to your photos.");
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", "Failed to save video.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Half */}
            <View style={styles.topHalf}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.push('/menu')} style={styles.menuButton}>
                            <Text style={styles.menuText}>☰ MENU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setCameraMode(!cameraMode)}
                            style={[styles.modeButton, cameraMode && styles.cameraModeActive]}
                        >
                            <Text style={[styles.modeText, cameraMode && { color: 'white' }]}>
                                {cameraMode ? '📷 CAMERA' : '○ CAMERA'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.headerRight}>
                        {/* Play/Stop Button */}
                        <TouchableOpacity
                            onPress={handleTogglePlay}
                            style={[
                                styles.playButton,
                                isPlaying && !isRecording ? styles.stopButton : styles.startButton
                            ]}
                        >
                            <Text style={styles.playButtonText}>
                                {isPlaying && !isRecording ? 'STOP' : 'PLAY'}
                            </Text>
                        </TouchableOpacity>

                        {/* Record Button (only visible in camera mode) */}
                        {cameraMode && (
                            <TouchableOpacity
                                onPress={isRecording ? handleStopRecording : handleStartRecording}
                                style={[
                                    styles.recordButton,
                                    isRecording && styles.recordingActive
                                ]}
                            >
                                <Text style={styles.recordButtonText}>
                                    {isRecording ? '■ STOP' : '● REC'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Top Content: Camera (if Camera Mode) or GameArea (Normal) */}
                <View style={styles.contentArea}>
                    {cameraMode ? (
                        <CameraLayer />
                    ) : (
                        <GameArea isFocused={isFocused} />
                    )}
                </View>
            </View>

            {/* Bottom Half */}
            <View style={styles.bottomHalf}>
                {/* Bottom Content */}
                <View style={styles.videoWrapper}>
                    {/* Game area for camera mode */}
                    {cameraMode && (
                        <GameArea isFocused={isFocused} compact={true} />
                    )}

                    {/* YouTube layer - only when not in camera mode and using YouTube */}
                    {!cameraMode && musicMode === 'youtube' && (
                        <YouTubeLayer videoId={videoId} />
                    )}

                    {/* Local music layer - always mounted when using local music to preserve audio state */}
                    {musicMode === 'local' && (
                        <View style={cameraMode ? styles.hiddenMusicLayer : styles.visibleMusicLayer}>
                            <LocalMusicLayer />
                        </View>
                    )}
                </View>

                {/* Controls Overlay */}
                <View style={styles.controls}>
                    <TapButton />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topHalf: {
        flex: 1,
        zIndex: 10,
        backgroundColor: COLORS.background,
        paddingTop: 70,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuButton: {
        padding: 10,
        borderWidth: 2,
        borderColor: COLORS.text,
        ...SHAPES.rect,
    },
    menuText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
    },
    modeButton: {
        padding: 10,
        borderWidth: 2,
        borderColor: COLORS.accent,
        ...SHAPES.rect,
    },
    cameraModeActive: {
        backgroundColor: '#4488FF',
        borderColor: '#4488FF',
    },
    modeText: {
        color: COLORS.accent,
        fontFamily: FONTS.main,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    playButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        ...SHAPES.rect,
        minWidth: 70,
        alignItems: 'center',
    },
    startButton: {
        borderColor: '#00FF00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
    },
    stopButton: {
        borderColor: '#FFAA00',
        backgroundColor: 'rgba(255, 170, 0, 0.1)',
    },
    recordButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#FF0000',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        ...SHAPES.rect,
        minWidth: 70,
        alignItems: 'center',
    },
    recordingActive: {
        backgroundColor: '#FF0000',
        borderColor: '#FF0000',
    },
    recordButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 16,
    },
    playButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 16,
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    bottomHalf: {
        height: 280,
        borderTopWidth: 2,
        borderTopColor: COLORS.cardBorder,
        position: 'relative',
        overflow: 'hidden',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.cardBg,
    },
    hiddenMusicLayer: {
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
    },
    visibleMusicLayer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    controls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 100,
    },
});
