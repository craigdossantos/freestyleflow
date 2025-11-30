import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        backgroundColor: '#000',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        color: '#00FF00',
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'Courier',
    },
    section: {
        marginBottom: 40,
    },
    label: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Courier',
    },
    input: {
        backgroundColor: '#111',
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#333',
        padding: 15,
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Courier',
    },
    button: {
        backgroundColor: '#00FF00',
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Courier',
    },
    backButton: {
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Courier',
    },
});
