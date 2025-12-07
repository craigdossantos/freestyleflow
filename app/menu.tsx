import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SONGS } from '../constants/songList';
import { COLORS, FONTS, SHAPES } from '../constants/theme';
import { useGameStore } from '../store';

// Function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

export default function MenuScreen() {
    const router = useRouter();
    const setVideoId = useGameStore((state) => state.setVideoId);
    const includeImperfect = useGameStore((state) => state.includeImperfect);
    const setIncludeImperfect = useGameStore((state) => state.setIncludeImperfect);
    const rhymeScheme = useGameStore((state) => state.rhymeScheme);
    const setRhymeScheme = useGameStore((state) => state.setRhymeScheme);
    const musicMode = useGameStore((state) => state.musicMode);
    const setMusicMode = useGameStore((state) => state.setMusicMode);
    const currentSong = useGameStore((state) => state.currentSong);
    const setCurrentSong = useGameStore((state) => state.setCurrentSong);
    const cameraFilter = useGameStore((state) => state.cameraFilter);
    const setCameraFilter = useGameStore((state) => state.setCameraFilter);
    const musicVolume = useGameStore((state) => state.musicVolume);
    const setMusicVolume = useGameStore((state) => state.setMusicVolume);
    const [inputUrl, setInputUrl] = useState('');

    const CAMERA_FILTERS = [
        { id: 'none', label: 'NORMAL' },
        { id: 'noir', label: 'NOIR' },
        { id: 'chrome', label: 'CHROME' },
        { id: 'thermal', label: 'THERMAL' },
        { id: 'comic', label: 'COMIC' },
        { id: 'pastel', label: 'PASTEL' },
    ] as const;

    const handleLoadVideo = () => {
        const extractedId = extractVideoId(inputUrl);
        if (extractedId) {
            setVideoId(extractedId);
            setInputUrl('');
            router.back(); // Go back to game
        } else {
            alert('Invalid YouTube URL or Video ID');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>MENU</Text>
                <View style={{ width: 70 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
            <View style={styles.section}>
                <Text style={styles.label}>MUSIC SOURCE</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                    <TouchableOpacity
                        style={[styles.schemeButton, musicMode === 'youtube' && styles.schemeButtonActive]}
                        onPress={() => setMusicMode('youtube')}
                    >
                        <Text style={[styles.schemeButtonText, musicMode === 'youtube' && styles.schemeButtonTextActive]}>YOUTUBE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.schemeButton, musicMode === 'local' && styles.schemeButtonActive]}
                        onPress={() => setMusicMode('local')}
                    >
                        <Text style={[styles.schemeButtonText, musicMode === 'local' && styles.schemeButtonTextActive]}>BUILT-IN SONGS</Text>
                    </TouchableOpacity>
                </View>

                {musicMode === 'youtube' && (
                    <>
                        <Text style={styles.label}>Select Background Video</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Paste YouTube URL or Video ID"
                            placeholderTextColor="#666"
                            value={inputUrl}
                            onChangeText={setInputUrl}
                            onSubmitEditing={handleLoadVideo}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleLoadVideo}>
                            <Text style={styles.buttonText}>LOAD VIDEO</Text>
                        </TouchableOpacity>
                    </>
                )}

                {musicMode === 'local' && (
                    <>
                        <Text style={styles.label}>SELECT TRACK</Text>
                        <ScrollView style={styles.songList} showsVerticalScrollIndicator={false}>
                            {SONGS.map((song) => (
                                <TouchableOpacity
                                    key={song.id}
                                    style={[
                                        styles.songItem,
                                        currentSong?.id === song.id && styles.songItemActive
                                    ]}
                                    onPress={() => setCurrentSong(song)}
                                >
                                    <Text style={[
                                        styles.songTitle,
                                        currentSong?.id === song.id && styles.songTitleActive
                                    ]}>{song.title}</Text>
                                    <Text style={styles.songMeta}>{song.bpm} BPM</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}
            </View>

            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.button, { marginBottom: 10, backgroundColor: includeImperfect ? '#00FF00' : '#333' }]}
                    onPress={() => setIncludeImperfect(!includeImperfect)}
                >
                    <Text style={[styles.buttonText, { color: includeImperfect ? '#000' : '#FFF' }]}>
                        IMPERFECT RHYMES: {includeImperfect ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>
                {/* Rhyme Scheme Selector */}
                <Text style={styles.label}>RHYME SCHEME</Text>
                <View style={styles.schemeContainer}>
                    {['AABB', 'AAAA', 'ABAB', 'AXBX', 'XAXB'].map((scheme) => (
                        <TouchableOpacity
                            key={scheme}
                            style={[
                                styles.schemeButton,
                                rhymeScheme === scheme && styles.schemeButtonActive
                            ]}
                            onPress={() => setRhymeScheme(scheme)}
                        >
                            <Text style={[
                                styles.schemeButtonText,
                                rhymeScheme === scheme && styles.schemeButtonTextActive
                            ]}>{scheme}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Rhyming Dictionary Button */}
                <TouchableOpacity style={styles.button} onPress={() => router.push('/dictionary')}>
                    <Text style={styles.buttonText}>RHYMING DICTIONARY</Text>
                </TouchableOpacity>

                {/* Rhyme Mastery Button */}
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => router.push('/progress')}>
                    <Text style={styles.buttonText}>RHYME MASTERY</Text>
                </TouchableOpacity>
            </View>

            {/* Camera Filters Section */}
            <View style={styles.section}>
                <Text style={styles.label}>CAMERA FILTERS</Text>
                <View style={styles.schemeContainer}>
                    {CAMERA_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.schemeButton,
                                cameraFilter === filter.id && styles.schemeButtonActive
                            ]}
                            onPress={() => setCameraFilter(filter.id)}
                        >
                            <Text style={[
                                styles.schemeButtonText,
                                cameraFilter === filter.id && styles.schemeButtonTextActive
                            ]}>{filter.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Volume Controls Section */}
            <View style={styles.section}>
                <Text style={styles.label}>RECORDING VOLUME</Text>
                <View style={styles.volumeContainer}>
                    <Text style={styles.volumeLabel}>MUSIC: {Math.round(musicVolume * 100)}%</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        value={musicVolume}
                        onValueChange={setMusicVolume}
                        minimumTrackTintColor={COLORS.accent}
                        maximumTrackTintColor={COLORS.cardBorder}
                        thumbTintColor={COLORS.accent}
                    />
                    <Text style={styles.volumeHint}>
                        Lower music volume to make your voice stand out more in recordings
                    </Text>
                </View>
            </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 16,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        textAlign: 'center',
        fontFamily: FONTS.main,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 30,
    },
    label: {
        color: COLORS.text,
        fontSize: 16,
        marginBottom: 10,
        fontFamily: FONTS.main,
    },
    input: {
        backgroundColor: COLORS.cardBg,
        color: COLORS.text,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        padding: 15,
        fontSize: 16,
        marginBottom: 10,
        fontFamily: FONTS.main,
        ...SHAPES.rect,
    },
    button: {
        backgroundColor: COLORS.cardBg,
        padding: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.text,
        ...SHAPES.rect,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.main,
    },
    schemeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    schemeButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: COLORS.text,
        backgroundColor: COLORS.cardBg,
        ...SHAPES.rect,
    },
    schemeButtonActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    schemeButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 14,
    },
    schemeButtonTextActive: {
        color: '#FFF',
    },
    songList: {
        maxHeight: 180,
    },
    songItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        marginBottom: 8,
        ...SHAPES.rect,
    },
    songItemActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    songTitle: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 16,
    },
    songTitleActive: {
        color: '#FFF',
    },
    songMeta: {
        color: COLORS.dimmed,
        fontFamily: FONTS.main,
        fontSize: 12,
        marginTop: 2,
    },
    volumeContainer: {
        marginBottom: 10,
    },
    volumeLabel: {
        color: COLORS.text,
        fontFamily: FONTS.main,
        fontSize: 14,
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    volumeHint: {
        color: COLORS.dimmed,
        fontFamily: FONTS.main,
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});
