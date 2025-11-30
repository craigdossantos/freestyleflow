import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MetronomeBall } from '../components/MetronomeBall';
import { RhymeGrid } from '../components/RhymeGrid';
import { TapButton } from '../components/TapButton';
import { YouTubeLayer } from '../components/YouTubeLayer';
import { useGameStore } from '../store';
import { ProgressService } from '../utils/progress';

export default function GameScreen() {
    const bpm = useGameStore((state) => state.bpm);
    const videoId = useGameStore((state) => state.videoId);
    const setTargetFamily = useGameStore((state) => state.setTargetFamily);
    const loadNewRhymes = useGameStore((state) => state.loadNewRhymes);
    const router = useRouter();
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (familyId) {
            console.log('[GameScreen] Setting target family:', familyId);
            setTargetFamily(familyId);
            loadNewRhymes(); // Reload grid with new family

            // Track progress
            ProgressService.incrementFamilyPlayCount(familyId);
        } else {
            setTargetFamily(null); // Reset to random
        }
    }, [familyId]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Content Layer - Top Half (Game) */}
            <View style={styles.topHalf}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.push('/menu')} style={styles.menuButton}>
                            <Text style={styles.menuText}>☰ MENU</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/progress')} style={styles.masteryButton}>
                            <Text style={styles.masteryText}>★ MASTERY</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bpmContainer}>
                        <Text style={styles.bpmText}>{bpm} BPM</Text>
                        <Text style={styles.modeText}>Mode: AABB</Text>
                    </View>
                    <View style={{ width: 60 }} />
                </View>

                {/* Game Area */}
                <View style={styles.gameArea}>
                    <View style={styles.gameWrapper}>
                        <RhymeGrid />
                        {isFocused && <MetronomeBall />}
                    </View>
                </View>
            </View>

            {/* Bottom Half (Video & Controls) */}
            <View style={styles.bottomHalf}>
                <View style={styles.videoWrapper}>
                    <YouTubeLayer videoId={videoId} />
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
        backgroundColor: '#000',
    },
    topHalf: {
        flex: 1, // Takes top space
        zIndex: 10, // Ensure game is on top
        backgroundColor: '#000',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    menuText: {
        color: '#00FF00',
        fontFamily: 'Courier',
        fontWeight: 'bold',
    },
    masteryButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#FF00FF',
    },
    masteryText: {
        color: '#FF00FF',
        fontFamily: 'Courier',
        fontWeight: 'bold',
    },
    bpmContainer: {
        alignItems: 'center',
    },
    bpmText: {
        color: '#00FF00',
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
    modeText: {
        color: '#666',
        fontSize: 14,
        marginTop: 5,
        fontFamily: 'Courier',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', // Center the wrapper horizontally
    },
    gameWrapper: {
        position: 'relative', // Context for absolute ball
        width: '100%',
    },
    bottomHalf: {
        height: 300, // Fixed height for video area
        borderTopWidth: 2,
        borderTopColor: '#333',
        position: 'relative',
    },
    videoWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111',
    },
    controls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
});
