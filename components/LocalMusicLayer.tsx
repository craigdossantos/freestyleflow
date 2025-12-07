import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SONGS, Song } from '../constants/songList';
import { COLORS, FONTS } from '../constants/theme';
import { useGameStore } from '../store';

export const LocalMusicLayer: React.FC = () => {
    const setBpm = useGameStore((state) => state.setBpm);
    const setIsPlaying = useGameStore((state) => state.setIsPlaying);
    const isPlaying = useGameStore((state) => state.isPlaying);
    const triggerSync = useGameStore((state) => state.triggerSync);
    const setCurrentBeat = useGameStore((state) => state.setCurrentBeat);

    const currentSong = useGameStore((state) => state.currentSong);
    const setCurrentSong = useGameStore((state) => state.setCurrentSong);

    const soundRef = useRef<Audio.Sound | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    // Effect to handle song stopping/cleanup when stopping the game manually
    useEffect(() => {
        if (!isPlaying && soundRef.current) {
            // If user stops game manually, pause the music
            soundRef.current.stopAsync();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [isPlaying]);

    const playSong = async (song: Song) => {
        try {
            console.log(`[LocalMusicLayer] Selected song: ${song.title}`);
            console.log(`[LocalMusicLayer] Metadata - BPM: ${song.bpm}, Start: ${song.startTime}, End: ${song.endTime}`);
            console.log(`[LocalMusicLayer] Source type:`, typeof song.source, song.source);

            // Check if source exists
            if (!song.source) {
                console.error('Song source is missing for:', song.title);
                Alert.alert('Error', 'Song source missing. Please check file mapping.');
                return;
            }

            setIsLoading(true);

            // 1. Stop current sound if any
            setIsPlaying(false);
            if (soundRef.current) {
                try {
                    await soundRef.current.stopAsync();
                    await soundRef.current.unloadAsync();
                } catch (e) {
                    console.log('[LocalMusicLayer] Error stopping previous sound:', e);
                }
                soundRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // 2. Set current song
            setCurrentSong(song);

            // 3. Configure Audio for playback
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // 4. Use expo-asset to properly load the asset
            // This is the key fix - we need to download/resolve the asset first
            console.log('[LocalMusicLayer] Loading asset with expo-asset...');
            const asset = Asset.fromModule(song.source);
            console.log('[LocalMusicLayer] Asset created:', asset.name, asset.type);

            // Download the asset if not already available locally
            if (!asset.localUri) {
                console.log('[LocalMusicLayer] Downloading asset...');
                await asset.downloadAsync();
            }

            console.log('[LocalMusicLayer] Asset localUri:', asset.localUri);
            console.log('[LocalMusicLayer] Asset uri:', asset.uri);

            if (!asset.localUri && !asset.uri) {
                throw new Error('Failed to resolve asset URI');
            }

            // 5. Create sound from the resolved URI
            const uri = asset.localUri || asset.uri;
            console.log('[LocalMusicLayer] Creating sound from URI:', uri);

            const { sound, status } = await Audio.Sound.createAsync(
                { uri },
                {
                    shouldPlay: true,
                    volume: 1.0,
                },
                (playbackStatus) => {
                    if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
                        console.log('[LocalMusicLayer] Song finished.');
                        setIsPlaying(false);
                    }
                }
            );

            console.log('[LocalMusicLayer] Sound created successfully, status:', status);
            soundRef.current = sound;
            setIsLoading(false);

            // 6. Setup Game State
            setBpm(song.bpm);

            // Wait for Start Time (the "drop")
            const delayMs = song.startTime * 1000;
            console.log(`[LocalMusicLayer] Waiting ${delayMs}ms for drop...`);

            // Reset Beat
            setCurrentBeat(0);
            triggerSync();

            timeoutRef.current = setTimeout(() => {
                console.log('[LocalMusicLayer] DROP! Starting game loop.');
                setIsPlaying(true);
            }, delayMs);

        } catch (error: any) {
            setIsLoading(false);
            console.error('[LocalMusicLayer] Error playing song:', error);
            console.error('[LocalMusicLayer] Error details:', error.message);
            Alert.alert(
                'Playback Error',
                `Could not play "${song.title}". ${error.message || 'Unknown error'}`
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>SELECT TRACK</Text>
                {isLoading && <ActivityIndicator size="small" color={COLORS.accent} />}
            </View>
            <ScrollView style={styles.list}>
                {SONGS.map((song) => (
                    <TouchableOpacity
                        key={song.filename}
                        style={[
                            styles.songItem,
                            currentSong?.filename === song.filename && styles.activeSong
                        ]}
                        onPress={() => playSong(song)}
                        disabled={isLoading}
                    >
                        <Text style={[
                            styles.songTitle,
                            currentSong?.filename === song.filename && styles.activeSongText,
                            isLoading && styles.disabledText
                        ]}>{song.title}</Text>
                        <Text style={[styles.songMeta, isLoading && styles.disabledText]}>
                            {song.bpm} BPM • Start: {song.startTime.toFixed(1)}s
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    header: {
        color: '#666',
        fontFamily: FONTS.main,
        fontSize: 14,
    },
    list: {
        flex: 1,
    },
    songItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 5,
        borderRadius: 8,
    },
    activeSong: {
        backgroundColor: COLORS.accent + '20', // 20% opacity
        borderColor: COLORS.accent,
        borderWidth: 1,
    },
    songTitle: {
        color: '#FFF',
        fontFamily: FONTS.main,
        fontSize: 16,
        marginBottom: 4,
    },
    activeSongText: {
        color: COLORS.accent,
    },
    songMeta: {
        color: '#888',
        fontFamily: FONTS.main,
        fontSize: 12,
    },
    disabledText: {
        opacity: 0.5,
    },
});
