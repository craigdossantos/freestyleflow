import { Audio } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

            // 1. Configure Audio for Silent Mode (iOS)
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });

            // 2. Stop current
            setIsPlaying(false); // Force stop game loop immediately
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // 3. Load new
            setCurrentSong(song);

            // Check if source exists (paranoia check based on user error)
            if (!song.source) {
                console.error('Song source is missing for:', song.title);
                alert('Error: Song source missing. Please check file mapping.');
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                song.source,
                { shouldPlay: true }
            );
            soundRef.current = sound;

            // 4. Setup Game State
            setBpm(song.bpm);

            // Wait for Start Time
            const delayMs = song.startTime * 1000;
            console.log(`[LocalMusicLayer] Waiting ${delayMs}ms for drop...`);

            // Reset Beat
            setCurrentBeat(0);
            triggerSync();

            timeoutRef.current = setTimeout(() => {
                console.log('[LocalMusicLayer] DROP! Starting game loop.');
                setIsPlaying(true); // Force start game loop
            }, delayMs);

            // Setup finish listener
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    console.log('[LocalMusicLayer] Song finished.');
                    setIsPlaying(false);
                }
            });

        } catch (error) {
            console.error('Error playing song:', error);
            alert('Error playing song. See console.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>SELECT TRACK</Text>
            <ScrollView style={styles.list}>
                {SONGS.map((song) => (
                    <TouchableOpacity
                        key={song.filename}
                        style={[
                            styles.songItem,
                            currentSong?.filename === song.filename && styles.activeSong
                        ]}
                        onPress={() => playSong(song)}
                    >
                        <Text style={[
                            styles.songTitle,
                            currentSong?.filename === song.filename && styles.activeSongText
                        ]}>{song.title}</Text>
                        <Text style={styles.songMeta}>
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
    header: {
        color: '#666',
        fontFamily: FONTS.main,
        fontSize: 14,
        marginBottom: 10,
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
});
