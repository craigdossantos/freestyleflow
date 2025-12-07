import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useGameStore } from '../store';

export const LocalMusicLayer: React.FC = () => {
    const setBpm = useGameStore((state) => state.setBpm);
    const setIsPlaying = useGameStore((state) => state.setIsPlaying);
    const isPlaying = useGameStore((state) => state.isPlaying);
    const triggerSync = useGameStore((state) => state.triggerSync);
    const setCurrentBeat = useGameStore((state) => state.setCurrentBeat);
    const currentSong = useGameStore((state) => state.currentSong);

    const soundRef = useRef<Audio.Sound | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);
    const wasPlayingRef = useRef(false);

    // Unload sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                console.log('Unloading sound on unmount');
                soundRef.current.unloadAsync();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // React to isPlaying changes from the top play button
    useEffect(() => {
        const handlePlayStateChange = async () => {
            if (isPlaying && !wasPlayingRef.current && currentSong) {
                // User pressed play - start the song
                await startSong();
            } else if (!isPlaying && wasPlayingRef.current) {
                // User pressed stop - stop the song
                await stopSong();
            }
            wasPlayingRef.current = isPlaying;
        };

        handlePlayStateChange();
    }, [isPlaying, currentSong]);

    const startSong = async () => {
        if (!currentSong) {
            Alert.alert('No Track Selected', 'Please select a track from the Menu first.');
            setIsPlaying(false);
            return;
        }

        try {
            console.log(`[LocalMusicLayer] Starting: ${currentSong.title} (${currentSong.bpm} BPM)`);

            if (!currentSong.source) {
                Alert.alert('Error', 'Song source missing.');
                setIsPlaying(false);
                return;
            }

            setIsLoading(true);

            // Stop current sound if any
            if (soundRef.current) {
                try {
                    await soundRef.current.stopAsync();
                    await soundRef.current.unloadAsync();
                } catch (e) {
                    // Ignore cleanup errors
                }
                soundRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Setup game state first
            setBpm(currentSong.bpm);
            setCurrentBeat(0);
            triggerSync();

            // Load and play the sound
            const { sound, status } = await Audio.Sound.createAsync(
                currentSong.source,
                { shouldPlay: true, volume: 1.0 },
                (playbackStatus) => {
                    if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
                        console.log('[LocalMusicLayer] Song finished.');
                        setIsPlaying(false);
                        setIsSoundPlaying(false);
                    }
                }
            );

            console.log('[LocalMusicLayer] Sound loaded, duration:', status.isLoaded ? status.durationMillis : 'unknown');
            soundRef.current = sound;
            setIsLoading(false);
            setIsSoundPlaying(true);

            // The game ball is already playing (isPlaying is true)
            // Wait for the beat drop to sync properly
            const delayMs = currentSong.startTime * 1000;
            console.log(`[LocalMusicLayer] Beat drop in ${delayMs}ms...`);

        } catch (error: any) {
            setIsLoading(false);
            setIsPlaying(false);
            console.error('[LocalMusicLayer] Playback error:', error.message);
            Alert.alert('Playback Error', `Could not play "${currentSong.title}". ${error.message || 'Unknown error'}`);
        }
    };

    const stopSong = async () => {
        console.log('[LocalMusicLayer] Stopping song');
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
            } catch (e) {
                // Ignore errors
            }
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsSoundPlaying(false);
    };

    // Show selected song info (no separate play button - controlled by top button)
    return (
        <View style={styles.container}>
            {currentSong ? (
                <View style={styles.songDisplay}>
                    <View style={styles.songInfo}>
                        <Text style={styles.label}>{isSoundPlaying ? 'NOW PLAYING' : 'SELECTED TRACK'}</Text>
                        <Text style={styles.songTitle}>{currentSong.title}</Text>
                        <Text style={styles.songMeta}>{currentSong.bpm} BPM</Text>
                    </View>
                    {isLoading && (
                        <ActivityIndicator size="large" color={COLORS.accent} />
                    )}
                </View>
            ) : (
                <View style={styles.noSongContainer}>
                    <Text style={styles.noSongText}>No track selected</Text>
                    <Text style={styles.noSongHint}>Go to Menu to select a track</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    songDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    songInfo: {
        flex: 1,
    },
    label: {
        color: '#666',
        fontFamily: FONTS.main,
        fontSize: 12,
        marginBottom: 4,
    },
    songTitle: {
        color: '#FFF',
        fontFamily: FONTS.main,
        fontSize: 24,
        marginBottom: 4,
    },
    songMeta: {
        color: '#888',
        fontFamily: FONTS.main,
        fontSize: 14,
    },
    noSongContainer: {
        alignItems: 'center',
    },
    noSongText: {
        color: '#666',
        fontFamily: FONTS.main,
        fontSize: 18,
        marginBottom: 8,
    },
    noSongHint: {
        color: '#444',
        fontFamily: FONTS.main,
        fontSize: 14,
    },
});
