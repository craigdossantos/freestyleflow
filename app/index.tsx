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

    // Record Mode State
    const [recordMode, setRecordMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    useEffect(() => {
        // On mount (or focus), ensure we have rhymes loaded
        loadNewRhymes();
    }, []);

    const handleTogglePlay = async () => {
        if (!recordMode) {
            togglePlay();
            return;
        }

        // Record Mode Logic
        if (!isPlaying) {
            // Start Playing and Recording
            try {
                // Using startInAppRecording (iOS only for now - matches user environment)
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
                togglePlay(); // Start game
            } catch (error) {
                console.error("Failed to start recording:", error);
                Alert.alert("Recording Error", "Could not start screen recording. Are you on a Development Build?");
                // Fallback to just playing if recording fails
                togglePlay();
            }
        } else {
            // Stop Playing and Recording
            togglePlay(); // Stop game
            setIsRecording(false);
            try {
                const file = await stopInAppRecording();
                if (file) {
                    saveRecording(file.path);
                }
            } catch (error) {
                console.error("Failed to stop recording:", error);
            }
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
                            onPress={() => setRecordMode(!recordMode)}
                            style={[styles.modeButton, recordMode && styles.recordModeActive]}
                        >
                            <Text style={[styles.modeText, recordMode && { color: 'white' }]}>
                                {recordMode ? '● REC MODE' : '○ MODE'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Play/Stop Button */}
                    <TouchableOpacity
                        onPress={handleTogglePlay}
                        style={[
                            styles.playButton,
                            isPlaying ? styles.stopButton : (recordMode ? styles.recordStartButton : styles.startButton)
                        ]}
                    >
                        <Text style={styles.playButtonText}>
                            {isPlaying ? 'STOP' : (recordMode ? 'REC' : 'PLAY')}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ width: 60 }} />
                </View>

                {/* Top Content: Camera (if Record Mode) or GameArea (Normal) */}
                <View style={styles.contentArea}>
                    {recordMode ? (
                        <CameraLayer />
                    ) : (
                        <GameArea isFocused={isFocused} />
                    )}
                </View>
            </View>

            {/* Bottom Half */}
            <View style={styles.bottomHalf}>
                {/* Bottom Content: GameArea (if Record Mode) or Video (Normal) */}
                <View style={styles.videoWrapper}>
                    {recordMode ? (
                        <GameArea isFocused={isFocused} />
                    ) : (
                        musicMode === 'youtube' ? (
                            <YouTubeLayer videoId={videoId} />
                        ) : (
                            <LocalMusicLayer />
                        )
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
    recordModeActive: {
        backgroundColor: '#FF4444',
        borderColor: '#FF4444',
    },
    modeText: {
        color: COLORS.accent,
        fontFamily: FONTS.main,
    },
    playButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        ...SHAPES.rect,
        minWidth: 80,
        alignItems: 'center',
    },
    startButton: {
        borderColor: '#00FF00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
    },
    recordStartButton: {
        borderColor: '#FF0000',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    stopButton: {
        borderColor: '#FF0000',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
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
    controls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 100,
    },
});
