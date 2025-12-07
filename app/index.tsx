import { useMicrophonePermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { startInAppRecording, stopInAppRecording } from 'react-native-nitro-screen-recorder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameArea } from '../components/GameArea';
import { GLCameraLayer } from '../components/GLCameraLayer';
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
    const insets = useSafeAreaInsets();

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

    // Camera mode: full screen camera with game board at bottom
    if (cameraMode) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />

                {/* Full screen camera with GL shaders */}
                <GLCameraLayer />

                {/* Header overlay */}
                <View style={[styles.headerOverlay, { paddingTop: insets.top + 10, paddingHorizontal: Math.max(insets.left, 16) + 4 }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.push('/menu')} style={styles.menuButtonCamera}>
                            <Text style={styles.menuTextCamera}>☰ MENU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setCameraMode(!cameraMode)}
                            style={styles.cameraModeActiveButton}
                        >
                            <Text style={styles.cameraModeActiveText}>📷 CAMERA</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={handleTogglePlay}
                            style={[
                                styles.controlButton,
                                isPlaying && !isRecording ? styles.stopButtonActive : styles.playButtonStyle
                            ]}
                        >
                            {isPlaying && !isRecording ? (
                                <View style={styles.stopIcon} />
                            ) : (
                                <View style={styles.playIcon} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={isRecording ? handleStopRecording : handleStartRecording}
                            style={[
                                styles.controlButton,
                                styles.recordButtonStyle,
                                isRecording && styles.recordingActiveStyle
                            ]}
                        >
                            {isRecording ? (
                                <View style={styles.stopIcon} />
                            ) : (
                                <View style={styles.recordIcon} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Game board at bottom 45% of screen */}
                <View style={[styles.gameAreaBottom, { paddingBottom: insets.bottom + 20 }]}>
                    <GameArea isFocused={isFocused} />
                </View>

                {/* Hidden music layer to keep audio playing */}
                {musicMode === 'local' && (
                    <View style={styles.hiddenMusicLayer}>
                        <LocalMusicLayer />
                    </View>
                )}

                {/* Tap Button */}
                <View style={[styles.tapButtonContainer, { bottom: insets.bottom + 20, right: Math.max(insets.right, 16) + 4 }]}>
                    <TapButton />
                </View>
            </View>
        );
    }

    // Normal mode: standard layout
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Half */}
            <View style={[styles.topHalf, { paddingTop: insets.top + 10 }]}>
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: Math.max(insets.left, 16) + 4 }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.push('/menu')} style={styles.menuButton}>
                            <Text style={styles.menuText}>☰ MENU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setCameraMode(!cameraMode)}
                            style={styles.modeButton}
                        >
                            <Text style={styles.modeText}>○ CAMERA</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={handleTogglePlay}
                            style={[
                                styles.controlButton,
                                isPlaying ? styles.stopButtonActive : styles.playButtonStyle
                            ]}
                        >
                            {isPlaying ? (
                                <View style={styles.stopIcon} />
                            ) : (
                                <View style={styles.playIcon} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Game Area */}
                <View style={styles.contentArea}>
                    <GameArea isFocused={isFocused} />
                </View>
            </View>

            {/* Bottom Half */}
            <View style={[styles.bottomHalf, { paddingBottom: insets.bottom }]}>
                <View style={styles.videoWrapper}>
                    {musicMode === 'youtube' && (
                        <YouTubeLayer videoId={videoId} />
                    )}
                    {musicMode === 'local' && (
                        <LocalMusicLayer />
                    )}
                </View>
            </View>

            {/* Tap Button */}
            <View style={[styles.tapButtonContainer, { bottom: 280 + insets.bottom + 20, right: Math.max(insets.right, 16) + 4 }]}>
                <TapButton />
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    // Camera mode header styles
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    menuButtonCamera: {
        padding: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        ...SHAPES.rect,
    },
    menuTextCamera: {
        color: '#FFF',
        fontFamily: FONTS.main,
    },
    cameraModeActiveButton: {
        padding: 10,
        borderWidth: 2,
        backgroundColor: '#4488FF',
        borderColor: '#4488FF',
        ...SHAPES.rect,
    },
    cameraModeActiveText: {
        color: '#FFF',
        fontFamily: FONTS.main,
    },
    gameAreaBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%',
        justifyContent: 'flex-end',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonStyle: {
        borderColor: '#00CC00',
        backgroundColor: 'rgba(0, 204, 0, 0.15)',
    },
    stopButtonActive: {
        borderColor: '#FFAA00',
        backgroundColor: 'rgba(255, 170, 0, 0.2)',
    },
    playIcon: {
        width: 0,
        height: 0,
        marginLeft: 4,
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 16,
        borderStyle: 'solid',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#00CC00',
    },
    stopIcon: {
        width: 16,
        height: 16,
        backgroundColor: '#FFAA00',
    },
    recordButtonStyle: {
        borderColor: '#FF3333',
        backgroundColor: 'rgba(255, 51, 51, 0.15)',
    },
    recordingActiveStyle: {
        borderColor: '#FF0000',
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
    },
    recordIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF3333',
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    gameOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
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
    tapButtonContainer: {
        position: 'absolute',
        zIndex: 100,
    },
});
