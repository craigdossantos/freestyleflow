import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [inputUrl, setInputUrl] = useState('');

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
            <Text style={styles.title}>MENU</Text>

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
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>BACK TO GAME</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.text,
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: FONTS.main,
    },
    section: {
        marginBottom: 40,
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
    backButton: {
        padding: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.text,
        ...SHAPES.rect,
    },
    backButtonText: {
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
});
