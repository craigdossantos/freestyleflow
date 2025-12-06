import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SHAPES } from '../constants/theme';
import rhymeDataRaw from './data/rhyme_levels.json';

// Define types based on the JSON structure
interface RhymeFamily {
    family_id: string;
    label: string;
    count: number;
    words: string[];
    slant_words?: string[];
}

interface RhymeData {
    syllable_1_families: RhymeFamily[];
    syllable_2_families: RhymeFamily[];
    syllable_3_families: RhymeFamily[];
    syllable_4_plus_families: RhymeFamily[];
    [key: string]: RhymeFamily[]; // Index signature for dynamic access
}

const rhymeData = rhymeDataRaw as RhymeData;

export default function DictionaryScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSyllables, setSelectedSyllables] = useState<number | null>(null);

    // Flatten all families for search
    const allFamilies = useMemo(() => {
        let families: { family: RhymeFamily, syllables: number }[] = [];
        families = families.concat(rhymeData.syllable_1_families.map(f => ({ family: f, syllables: 1 })));
        families = families.concat(rhymeData.syllable_2_families.map(f => ({ family: f, syllables: 2 })));
        families = families.concat(rhymeData.syllable_3_families.map(f => ({ family: f, syllables: 3 })));
        families = families.concat(rhymeData.syllable_4_plus_families.map(f => ({ family: f, syllables: 4 })));
        return families;
    }, []);

    // Search Logic
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const query = searchQuery.toLowerCase().trim();

        // Find family containing the word
        const found = allFamilies.find(item => item.family.words.includes(query));
        if (found) {
            return found;
        }
        return null;
    }, [searchQuery, allFamilies]);

    // Browse Logic
    const browseResults = useMemo(() => {
        if (selectedSyllables === null) return null;
        if (selectedSyllables === 1) return rhymeData.syllable_1_families;
        if (selectedSyllables === 2) return rhymeData.syllable_2_families;
        if (selectedSyllables === 3) return rhymeData.syllable_3_families;
        if (selectedSyllables === 4) return rhymeData.syllable_4_plus_families;
        return [];
    }, [selectedSyllables]);

    const renderFamilyItem = ({ item }: { item: RhymeFamily }) => (
        <View style={styles.familyCard}>
            <Text style={styles.familyLabel}>{item.label}</Text>
            <Text style={styles.familyWords}>
                {item.words.slice(0, 10).join(', ')}
                {item.words.length > 10 ? '...' : ''}
            </Text>
            {item.slant_words && item.slant_words.length > 0 && (
                <>
                    <Text style={styles.slantLabel}>Imperfect:</Text>
                    <Text style={styles.slantWords}>
                        {item.slant_words.slice(0, 10).join(', ')}
                        {item.slant_words.length > 10 ? '...' : ''}
                    </Text>
                </>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Text style={styles.title}>RHYMING DICTIONARY</Text>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Search for a word..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text) setSelectedSyllables(null); // Clear browse if searching
                    }}
                />
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                {[1, 2, 3, 4].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.filterButton,
                            selectedSyllables === num && styles.filterButtonActive
                        ]}
                        onPress={() => {
                            setSelectedSyllables(num === selectedSyllables ? null : num);
                            setSearchQuery(''); // Clear search if browsing
                        }}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            selectedSyllables === num && styles.filterButtonTextActive
                        ]}>
                            {num === 4 ? '4+' : num} SYL
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results Area */}
            <View style={styles.resultsContainer}>
                {searchQuery ? (
                    searchResults ? (
                        <ScrollView>
                            <View style={styles.resultCard}>
                                <Text style={styles.resultTitle}>
                                    Rhymes for "{searchQuery}" ({searchResults.syllables} Syllables)
                                </Text>
                                <Text style={styles.familyLabel}>{searchResults.family.label}</Text>
                                <View style={styles.wordList}>
                                    {searchResults.family.words.map((word, index) => (
                                        <Text key={index} style={styles.wordItem}>{word}</Text>
                                    ))}
                                </View>
                                {searchResults.family.slant_words && searchResults.family.slant_words.length > 0 && (
                                    <>
                                        <Text style={[styles.familyLabel, { marginTop: 20, color: '#FFA500' }]}>Imperfect Rhymes</Text>
                                        <View style={styles.wordList}>
                                            {searchResults.family.slant_words.map((word, index) => (
                                                <Text key={index} style={[styles.wordItem, { color: '#DDD' }]}>{word}</Text>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    ) : (
                        <Text style={styles.noResults}>No rhymes found for "{searchQuery}"</Text>
                    )
                ) : selectedSyllables ? (
                    <FlatList
                        data={browseResults}
                        keyExtractor={(item) => item.family_id}
                        renderItem={renderFamilyItem}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <Text style={styles.placeholderText}>
                        Search for a word or select a syllable count to browse.
                    </Text>
                )}
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>BACK TO MENU</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 30,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: FONTS.main,
    },
    searchSection: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: COLORS.cardBg,
        color: COLORS.text,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        padding: 15,
        fontSize: 16,
        fontFamily: FONTS.main,
        ...SHAPES.rect,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    filterButton: {
        flex: 1,
        backgroundColor: COLORS.cardBg,
        padding: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.text,
        ...SHAPES.rect,
    },
    filterButtonActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    filterButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.main,
    },
    filterButtonTextActive: {
        color: '#FFF',
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: COLORS.cardBg,
        marginBottom: 20,
        padding: 10,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        borderStyle: 'dashed',
        ...SHAPES.rect,
    },
    placeholderText: {
        color: COLORS.dimmed,
        textAlign: 'center',
        marginTop: 50,
        fontFamily: FONTS.main,
    },
    noResults: {
        color: COLORS.accent,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: FONTS.main,
    },
    listContent: {
        paddingBottom: 20,
    },
    familyCard: {
        backgroundColor: COLORS.cardBg,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.accent,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.dimmed,
    },
    familyLabel: {
        color: COLORS.dimmed,
        fontSize: 12,
        marginBottom: 5,
        fontFamily: FONTS.main,
        textTransform: 'uppercase',
    },
    familyWords: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.main,
        lineHeight: 20,
    },
    slantLabel: {
        color: COLORS.accent,
        fontSize: 12,
        marginTop: 10,
        marginBottom: 5,
        fontFamily: FONTS.main,
        textTransform: 'uppercase',
    },
    slantWords: {
        color: COLORS.dimmed,
        fontSize: 14,
        fontFamily: FONTS.main,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    resultCard: {
        padding: 10,
    },
    resultTitle: {
        color: COLORS.accent,
        fontSize: 18,
        marginBottom: 10,
        fontFamily: FONTS.main,
    },
    wordList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    wordItem: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.main,
        marginRight: 15,
        marginBottom: 10,
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
});
