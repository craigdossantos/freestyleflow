import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SHAPES } from '../constants/theme';
import { RhymeData } from '../data/rhymes';
import { useGameStore } from '../store';
import { ProgressService, UserRhymeProgress } from '../utils/progress';
import rhymeDataRaw from './data/rhyme_levels.json';

const rhymeData = rhymeDataRaw as RhymeData;

export default function ProgressScreen() {
    const router = useRouter();
    const [progress, setProgress] = useState<UserRhymeProgress>({});
    const [loading, setLoading] = useState(true);
    const masteryPercentage = useGameStore((state) => state.masteryPercentage);
    const setMasteryPercentage = useGameStore((state) => state.setMasteryPercentage);
    const targetFamilyIds = useGameStore((state) => state.targetFamilyIds);
    const toggleTargetFamily = useGameStore((state) => state.toggleTargetFamily);
    const clearTargetFamilies = useGameStore((state) => state.clearTargetFamilies);

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
        clearTargetFamilies();

        if (unplayed.length === 0) {
            // All played! Pick random
            const random = families[Math.floor(Math.random() * families.length)];
            toggleTargetFamily(random.family_id);
        } else {
            const random = unplayed[Math.floor(Math.random() * unplayed.length)];
            toggleTargetFamily(random.family_id);
        }
        router.push('/');
    };

    const handlePlayWeakest = () => {
        // Sort families by play count (ascending)
        const sorted = [...families].sort((a, b) => {
            const countA = progress[a.family_id]?.timesPlayed || 0;
            const countB = progress[b.family_id]?.timesPlayed || 0;
            return countA - countB;
        });

        // Pick one of the top 5 weakest
        const pool = sorted.slice(0, 5);
        const random = pool[Math.floor(Math.random() * pool.length)];

        clearTargetFamilies();
        toggleTargetFamily(random.family_id);
        router.push('/');
    };

    const handleSelectFamily = (familyId: string) => {
        toggleTargetFamily(familyId);
    };

    const handleStartPractice = () => {
        router.push('/');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                stickyHeaderIndices={[3]}
            >
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

                {/* Mastery Slider (Sticky) */}
                <View style={[styles.sliderSection, { backgroundColor: COLORS.background, paddingVertical: 10 }]}>
                    <Text style={styles.sectionTitle}>MASTERY LEVEL: {masteryPercentage}%</Text>
                    <Text style={styles.sliderDescription}>
                        {masteryPercentage === 100 ? 'Always use selected rhyme family' :
                            masteryPercentage === 0 ? 'Always random rhymes' :
                                `${masteryPercentage}% chance to use selected family`}
                    </Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={100}
                        step={10}
                        value={masteryPercentage}
                        onValueChange={setMasteryPercentage}
                        minimumTrackTintColor={COLORS.accent}
                        maximumTrackTintColor={COLORS.cardBorder}
                        thumbTintColor={COLORS.accent}
                    />
                </View>

                {/* Family List */}
                <Text style={styles.sectionTitle}>ALL FAMILIES (1-SYLLABLE)</Text>
                <View style={styles.listContainer}>
                    {families.map((family) => {
                        const p = progress[family.family_id];
                        const isSeen = !!p;
                        const count = p?.timesPlayed || 0;
                        const isSelected = targetFamilyIds.includes(family.family_id);

                        return (
                            <TouchableOpacity
                                key={family.family_id}
                                style={[
                                    styles.listItem,
                                    isSeen && styles.listItemSeen,
                                    isSelected && styles.listItemSelected
                                ]}
                                onPress={() => handleSelectFamily(family.family_id)}
                            >
                                <View>
                                    <Text style={[styles.familyLabel, isSelected && styles.familyLabelSelected]}>{family.label}</Text>
                                    <Text style={styles.familyExamples}>{family.words.slice(0, 4).join(', ')}...</Text>
                                </View>
                                <View style={styles.progressBadge}>
                                    <Text style={styles.progressText}>{count} plays</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Start Button (Fixed at bottom) */}
            {targetFamilyIds.length > 0 && (
                <View style={styles.startContainer}>
                    <TouchableOpacity style={styles.startButton} onPress={handleStartPractice}>
                        <Text style={styles.startButtonText}>START PRACTICE ({targetFamilyIds.length})</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.text,
        fontFamily: FONTS.main,
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontFamily: FONTS.main,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        padding: 15,
        minWidth: 140,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        ...SHAPES.rect,
    },
    statValue: {
        color: COLORS.accent,
        fontSize: 24,
        fontFamily: FONTS.main,
    },
    statLabel: {
        color: COLORS.dimmed,
        fontSize: 12,
        marginTop: 5,
        fontFamily: FONTS.main,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
        gap: 15,
    },
    actionButton: {
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: COLORS.cardBg,
        ...SHAPES.rect,
    },
    newButton: {
        borderColor: COLORS.text,
    },
    weakestButton: {
        borderColor: COLORS.accent,
    },
    actionButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontFamily: FONTS.main,
        marginBottom: 5,
    },
    actionButtonSubtext: {
        color: COLORS.dimmed,
        fontSize: 12,
        fontFamily: FONTS.main,
    },
    sectionTitle: {
        color: COLORS.dimmed,
        marginLeft: 20,
        marginBottom: 10,
        fontFamily: FONTS.main,
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
        backgroundColor: COLORS.cardBg,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        ...SHAPES.rect,
    },
    listItemSeen: {
        borderColor: COLORS.accent,
        borderStyle: 'dashed',
    },
    familyLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.main,
        marginBottom: 4,
    },
    familyExamples: {
        color: COLORS.dimmed,
        fontSize: 12,
        fontFamily: FONTS.main,
    },
    progressBadge: {
        backgroundColor: COLORS.cardBg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    progressText: {
        color: COLORS.dimmed,
        fontSize: 10,
        fontFamily: FONTS.main,
    },
    sliderSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sliderDescription: {
        color: COLORS.dimmed,
        fontSize: 12,
        fontFamily: FONTS.main,
        marginBottom: 10,
        marginLeft: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    listItemSelected: {
        borderColor: COLORS.accent,
        backgroundColor: COLORS.accent,
        borderWidth: 2,
    },
    familyLabelSelected: {
        color: '#FFF',
    },
    startContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    startButton: {
        backgroundColor: COLORS.accent,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        ...SHAPES.rect,
    },
    startButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontFamily: FONTS.main,
    },
});
