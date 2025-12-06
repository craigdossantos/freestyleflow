import { create } from 'zustand';
import rhymeDataRaw from './app/data/rhyme_levels_filtered.json';
import { RhymeData } from './data/rhymes';

const rhymeData = rhymeDataRaw as RhymeData;
const ALL_FAMILIES = rhymeData.syllable_1_families;

export interface RhymeRow {
    id: string;
    word: string;
    color: string;
}

interface GameState {
    bpm: number;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    tapHistory: number[];
    setBpm: (bpm: number) => void;
    togglePlay: () => void;
    addTap: (timestamp: number) => void;
    resetTaps: () => void;
    syncTrigger: number;
    triggerSync: () => void;
    videoId: string;
    setVideoId: (videoId: string) => void;
    currentBeat: number;
    setCurrentBeat: (beat: number) => void;
    brokenBricks: Record<number, boolean>;
    breakBrick: (index: number) => void;
    resetBricks: () => void;
    resetRow: (rowIndex: number) => void;
    shiftBoard: () => void;
    rhymeRows: RhymeRow[];
    lastRhymeGroup: string[]; // Now stores words directly
    wordsInCurrentGroup: number;
    sessionUsedWords: string[]; // Track used words to avoid repeats
    loadNewRhymes: (rowIndex?: number) => void;
    syncToBeat: (beatIndex: number) => void;
    rhymeColumnIndex: number;
    setRhymeColumnIndex: (index: number) => void;
    targetFamilyIds: string[];
    toggleTargetFamily: (familyId: string) => void;
    clearTargetFamilies: () => void;
    masteryPercentage: number;
    setMasteryPercentage: (percentage: number) => void;
    includeImperfect: boolean;
    setIncludeImperfect: (include: boolean) => void;
    rhymeScheme: string;
    setRhymeScheme: (scheme: string) => void;
    patternIndex: number;
    activeGroups: { A: string[], B: string[] };

    musicMode: 'youtube' | 'local';
    setMusicMode: (mode: 'youtube' | 'local') => void;
    currentSong: any; // Using any for now to avoid circular dependency with Song interface
    setCurrentSong: (song: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
    bpm: 90, // Default BPM
    isPlaying: false,
    setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
    tapHistory: [],
    setBpm: (bpm) => set({ bpm }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    addTap: (timestamp) =>
        set((state) => {
            const newHistory = [...state.tapHistory, timestamp];
            if (newHistory.length > 4) {
                return { tapHistory: newHistory.slice(newHistory.length - 4) };
            }
            return { tapHistory: newHistory };
        }),
    resetTaps: () => set({ tapHistory: [] }),
    syncTrigger: 0,
    triggerSync: () => set((state) => {
        console.log('[Store] triggerSync called');
        return { syncTrigger: state.syncTrigger + 1 };
    }),
    videoId: 'AYaEa3ujqCE', // Default video
    setVideoId: (videoId: string) => set({ videoId }),
    currentBeat: 0,
    setCurrentBeat: (beat: number) => set({ currentBeat: beat }),
    brokenBricks: {}, // Map of index -> boolean
    breakBrick: (index: number) => set((state) => ({ brokenBricks: { ...state.brokenBricks, [index]: true } })),
    resetBricks: () => {
        set({ brokenBricks: {} });
        useGameStore.getState().loadNewRhymes();
    },
    resetRow: (rowIndex: number) => {
        set((state) => {
            const newBrokenBricks = { ...state.brokenBricks };
            for (let i = 0; i < 4; i++) {
                delete newBrokenBricks[rowIndex * 4 + i];
            }
            return { brokenBricks: newBrokenBricks };
        });
        useGameStore.getState().loadNewRhymes(rowIndex);
    },
    // Rhyme Logic
    rhymeRows: [], // Initialized in loadNewRhymes
    lastRhymeGroup: [],
    wordsInCurrentGroup: 0,
    sessionUsedWords: [],
    targetFamilyIds: [],
    toggleTargetFamily: (familyId) => set((state) => {
        const exists = state.targetFamilyIds.includes(familyId);
        const newIds = exists
            ? state.targetFamilyIds.filter(id => id !== familyId)
            : [...state.targetFamilyIds, familyId];
        return { targetFamilyIds: newIds, sessionUsedWords: [] };
    }),
    clearTargetFamilies: () => set({ targetFamilyIds: [], sessionUsedWords: [] }),
    masteryPercentage: 100, // Default to 100% mastery
    setMasteryPercentage: (percentage) => set({ masteryPercentage: percentage }),
    includeImperfect: false,
    setIncludeImperfect: (include) => set({ includeImperfect: include }),

    // Rhyme Scheme State
    rhymeScheme: 'AABB',
    setRhymeScheme: (scheme: string) => {
        set({ rhymeScheme: scheme, isPlaying: false, currentBeat: 0 });
        useGameStore.getState().loadNewRhymes();
    },
    patternIndex: 0,
    activeGroups: { A: [], B: [] },

    loadNewRhymes: (rowIndex?: number) => {
        const state = useGameStore.getState();

        // Helper to get a new group
        const getNewGroup = () => {
            const useTarget = state.targetFamilyIds.length > 0 && (Math.random() * 100 < state.masteryPercentage);
            let family;
            if (useTarget) {
                const randomTargetId = state.targetFamilyIds[Math.floor(Math.random() * state.targetFamilyIds.length)];
                family = ALL_FAMILIES.find(f => f.family_id === randomTargetId);
                if (!family) family = ALL_FAMILIES[0];
            } else {
                family = ALL_FAMILIES[Math.floor(Math.random() * ALL_FAMILIES.length)];
            }
            let words = [...family.words];
            if (state.includeImperfect && family.slant_words) {
                words = [...words, ...family.slant_words];
            }
            return words;
        };

        // Helper to get unique word
        const getUniqueWord = (group: string[], used: string[]) => {
            let available = group.filter(w => !used.includes(w));
            if (available.length === 0) available = group;
            return available[Math.floor(Math.random() * available.length)];
        };

        // If updating single row (debugging/reset), just pick random
        if (typeof rowIndex === 'number') {
            const group = getNewGroup();
            const word = getUniqueWord(group, state.sessionUsedWords);
            set((prev) => {
                const newRows = [...prev.rhymeRows];
                if (newRows[rowIndex]) newRows[rowIndex] = { ...newRows[rowIndex], word };
                return { rhymeRows: newRows };
            });
            return;
        }

        // Initial Load (4 rows)
        console.log('[Store] Loading new rhymes (Initial)...');
        const groupA = getNewGroup();
        const groupB = getNewGroup();
        const newActiveGroups = { A: groupA, B: groupB };
        let newSessionUsedWords: string[] = [];
        const rows: RhymeRow[] = [];

        // Define patterns
        const patterns: Record<string, string[]> = {
            'AABB': ['A', 'A', 'B', 'B'],
            'AAAA': ['A', 'A', 'A', 'A'],
            'ABAB': ['A', 'B', 'A', 'B'],
            'AXBX': ['A', 'X', 'B', 'X'],
            'XAXB': ['X', 'A', 'X', 'B'],
        };
        const currentPattern = patterns[state.rhymeScheme] || patterns['AABB'];
        const colors = ['#FFD700', '#FFD700', '#87CEEB', '#87CEEB']; // Default colors

        for (let i = 0; i < 4; i++) {
            const type = currentPattern[i];
            let word = '';
            let color = colors[i];

            if (type === 'A') {
                word = getUniqueWord(groupA, newSessionUsedWords);
                color = '#FFD700'; // Gold
            } else if (type === 'B') {
                word = getUniqueWord(groupB, newSessionUsedWords);
                color = '#87CEEB'; // SkyBlue
            } else {
                word = ''; // X
                color = '#CCCCCC'; // Gray
            }

            if (word) newSessionUsedWords.push(word);

            rows.push({
                id: `init-${i}-${Date.now()}`,
                word,
                color
            });
        }

        set({
            rhymeRows: rows,
            activeGroups: newActiveGroups,
            patternIndex: 3, // We just loaded 0-3
            sessionUsedWords: newSessionUsedWords
        });
    },

    shiftBoard: () => {
        set((state) => {
            // 1. Shift Broken Bricks
            const newBrokenBricks: Record<number, boolean> = {};
            Object.keys(state.brokenBricks).forEach((key) => {
                const index = parseInt(key);
                const newIndex = index - 4;
                if (newIndex >= 0) newBrokenBricks[newIndex] = true;
            });

            // 2. Shift Rhyme Rows
            const newRhymeRows = [...state.rhymeRows.slice(1)];

            // 3. Generate New Row
            const nextIndex = (state.patternIndex + 1) % 4;
            const patterns: Record<string, string[]> = {
                'AABB': ['A', 'A', 'B', 'B'],
                'AAAA': ['A', 'A', 'A', 'A'],
                'ABAB': ['A', 'B', 'A', 'B'],
                'AXBX': ['A', 'X', 'B', 'X'],
                'XAXB': ['X', 'A', 'X', 'B'],
            };
            const currentPattern = patterns[state.rhymeScheme] || patterns['AABB'];
            const type = currentPattern[nextIndex];

            // Helper to get new group (duplicated logic, could be extracted but inside set is tricky)
            const getNewGroup = () => {
                const useTarget = state.targetFamilyIds.length > 0 && (Math.random() * 100 < state.masteryPercentage);
                let family;
                if (useTarget) {
                    const randomTargetId = state.targetFamilyIds[Math.floor(Math.random() * state.targetFamilyIds.length)];
                    family = ALL_FAMILIES.find(f => f.family_id === randomTargetId);
                    if (!family) family = ALL_FAMILIES[0];
                } else {
                    family = ALL_FAMILIES[Math.floor(Math.random() * ALL_FAMILIES.length)];
                }
                let words = [...family.words];
                if (state.includeImperfect && family.slant_words) {
                    words = [...words, ...family.slant_words];
                }
                return words;
            };

            let newActiveGroups = { ...state.activeGroups };

            // Refresh groups logic
            if (state.rhymeScheme === 'AABB') {
                if (nextIndex === 0) newActiveGroups.A = getNewGroup();
                if (nextIndex === 2) newActiveGroups.B = getNewGroup();
            } else if (state.rhymeScheme === 'AAAA') {
                if (nextIndex === 0) newActiveGroups.A = getNewGroup();
            } else if (state.rhymeScheme === 'ABAB' || state.rhymeScheme === 'AXBX' || state.rhymeScheme === 'XAXB') {
                // For these, we probably want to refresh both at the start of the cycle?
                // Or maybe refresh A at 0, B at 1?
                // Let's refresh both at 0 to keep them distinct pairs.
                if (nextIndex === 0) {
                    newActiveGroups.A = getNewGroup();
                    newActiveGroups.B = getNewGroup();
                }
            }

            let newWord = '';
            let newColor = '#CCCCCC';
            let newSessionUsedWords = [...state.sessionUsedWords];

            const getUniqueWord = (group: string[]) => {
                let available = group.filter(w => !newSessionUsedWords.includes(w));
                if (available.length === 0) {
                    // Reset session for this group if exhausted?
                    available = group;
                }
                return available[Math.floor(Math.random() * available.length)];
            };

            if (type === 'A') {
                newWord = getUniqueWord(newActiveGroups.A);
                newColor = '#FFD700';
            } else if (type === 'B') {
                newWord = getUniqueWord(newActiveGroups.B);
                newColor = '#87CEEB';
            }

            if (newWord) newSessionUsedWords.push(newWord);
            if (newSessionUsedWords.length > 50) newSessionUsedWords.shift(); // Keep memory low

            newRhymeRows.push({
                id: Date.now().toString() + Math.random(),
                word: newWord,
                color: newColor
            });

            return {
                brokenBricks: newBrokenBricks,
                rhymeRows: newRhymeRows,
                patternIndex: nextIndex,
                activeGroups: newActiveGroups,
                sessionUsedWords: newSessionUsedWords
            };
        });
    },

    syncToBeat: (beatIndex: number) => set((state) => {
        console.log(`[Store] Syncing to beat: ${beatIndex}`);
        const normalizedBeat = beatIndex % 4;
        return {
            syncTrigger: state.syncTrigger + 1,
            currentBeat: normalizedBeat,
            brokenBricks: normalizedBeat === 0 ? {} : state.brokenBricks
        };
    }),
    rhymeColumnIndex: 3,
    setRhymeColumnIndex: (index: number) => set({ rhymeColumnIndex: index }),

    // Music Mode State
    musicMode: 'youtube', // 'youtube' | 'local'
    setMusicMode: (mode: 'youtube' | 'local') => set({ musicMode: mode }),
    currentSong: null,
    setCurrentSong: (song: any) => set({ currentSong: song }),
}));
