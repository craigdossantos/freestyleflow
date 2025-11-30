import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RhymeData } from '../data/rhymes';
import { ProgressService, UserRhymeProgress } from '../utils/progress';
import rhymeDataRaw from './data/rhyme_levels.json';

const rhymeData = rhymeDataRaw as RhymeData;

export default function ProgressScreen() {
    const router = useRouter();
    const [progress, setProgress] = useState<UserRhymeProgress>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        const data = await ProgressService.getAllProgress();
        setProgress(data);
        setLoading(false);
    };

    const families = rhymeData.syllable_1_families;

    const stats = useMemo(() => {
        const seenCount = Object.keys(progress).length;
        const totalCount = families.length;
        const totalPractices = Object.values(progress).reduce((acc, curr) => acc + curr.timesPlayed, 0);
        return { seenCount, totalCount, totalPractices };
    }, [progress, families]);

    const handlePlayNew = () => {
        // Find families not in progress
        const unplayed = families.filter(f => !progress[f.family_id]);
        if (unplayed.length === 0) {
            // All played! Pick random
            const random = families[Math.floor(Math.random() * families.length)];
            router.push({ pathname: '/', params: { familyId: random.family_id } });
        } else {
            const random = unplayed[Math.floor(Math.random() * unplayed.length)];
            router.push({ pathname: '/', params: { familyId: random.family_id } });
        }
    };

    const handlePlayWeakest = () => {
        // Sort families by play count (ascending)
        // Families not in progress count as 0
        const sorted = [...families].sort((a, b) => {
            const countA = progress[a.family_id]?.timesPlayed || 0;
            const countB = progress[b.family_id]?.timesPlayed || 0;
            return countA - countB;
        });

        // Pick one of the top 5 weakest
        const pool = sorted.slice(0, 5);
        const random = pool[Math.floor(Math.random() * pool.length)];
        router.push({ pathname: '/', params: { familyId: random.family_id } });
    };

    const handleSelectFamily = (familyId: string) => {
        router.push({ pathname: '/', params: { familyId } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>RHYME MASTERY</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Stats Overview */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.seenCount} / {stats.totalCount}</Text>
                    <Text style={styles.statLabel}>Families Seen</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalPractices}</Text>
                    <Text style={styles.statLabel}>Total Practices</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.newButton]} onPress={handlePlayNew}>
                    <Text style={styles.actionButtonText}>PLAY NEW FAMILY</Text>
                    <Text style={styles.actionButtonSubtext}>Find something you haven't seen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.weakestButton]} onPress={handlePlayWeakest}>
                    <Text style={styles.actionButtonText}>PRACTICE WEAKEST</Text>
                    <Text style={styles.actionButtonSubtext}>Improve your least played rhymes</Text>
                </TouchableOpacity>
            </View>

            {/* Family List */}
            <Text style={styles.sectionTitle}>ALL FAMILIES (1-SYLLABLE)</Text>
            <ScrollView style={styles.listContainer}>
                {families.map((family) => {
                    const p = progress[family.family_id];
                    const isSeen = !!p;
                    const count = p?.timesPlayed || 0;

                    return (
                        <TouchableOpacity
                            key={family.family_id}
                            style={[styles.listItem, isSeen && styles.listItemSeen]}
                            onPress={() => handleSelectFamily(family.family_id)}
                        >
                            <View>
                                <Text style={styles.familyLabel}>{family.label}</Text>
                                <Text style={styles.familyExamples}>{family.words.slice(0, 4).join(', ')}...</Text>
                            </View>
                            <View style={styles.progressBadge}>
                                <Text style={styles.progressText}>{count} plays</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    backButton: {
        padding: 10,
    },
    backText: {
        color: '#666',
        fontFamily: 'Courier',
        fontWeight: 'bold',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Courier',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 15,
        borderRadius: 8,
        minWidth: 140,
        borderWidth: 1,
        borderColor: '#333',
    },
    statValue: {
        color: '#00FF00',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 5,
        fontFamily: 'Courier',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
        gap: 15,
    },
    actionButton: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    newButton: {
        backgroundColor: '#1a1a1a',
        borderColor: '#00FF00',
    },
    weakestButton: {
        backgroundColor: '#1a1a1a',
        borderColor: '#FF00FF',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Courier',
        marginBottom: 5,
    },
    actionButtonSubtext: {
        color: '#888',
        fontSize: 12,
        fontFamily: 'Courier',
    },
    sectionTitle: {
        color: '#666',
        marginLeft: 20,
        marginBottom: 10,
        fontFamily: 'Courier',
        fontSize: 12,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#111',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#222',
    },
    listItemSeen: {
        borderColor: '#004400',
        backgroundColor: '#051105',
    },
    familyLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Courier',
        marginBottom: 4,
    },
    familyExamples: {
        color: '#666',
        fontSize: 12,
        fontFamily: 'Courier',
    },
    progressBadge: {
        backgroundColor: '#222',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    progressText: {
        color: '#888',
        fontSize: 10,
        fontFamily: 'Courier',
    },
});
