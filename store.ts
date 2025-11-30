import { create } from 'zustand';
import rhymeDataRaw from './app/data/rhyme_levels.json';
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
    targetFamilyId: string | null;
    setTargetFamily: (familyId: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    bpm: 90, // Default BPM
    isPlaying: false,
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
    shiftBoard: () => {
        set((state) => {
            // 1. Shift Broken Bricks
            const newBrokenBricks: Record<number, boolean> = {};
            Object.keys(state.brokenBricks).forEach((key) => {
                const index = parseInt(key);
                const newIndex = index - 4;
                if (newIndex >= 0) {
                    newBrokenBricks[newIndex] = true;
                }
            });

            // 2. Shift Rhyme Rows
            const newRhymeRows = [...state.rhymeRows.slice(1)]; // Drop first

            // AABB Logic
            let newWord, newColor;
            let newSessionUsedWords = [...state.sessionUsedWords];

            const getGroup = () => {
                if (state.targetFamilyId) {
                    const family = ALL_FAMILIES.find(f => f.family_id === state.targetFamilyId);
                    return family ? family.words : ALL_FAMILIES[0].words;
                }
                const randomFamily = ALL_FAMILIES[Math.floor(Math.random() * ALL_FAMILIES.length)];
                return randomFamily.words;
            };

            const getUniqueWord = (group: string[], excludeWord?: string) => {
                // Filter out words used in session
                let available = group.filter(w => !newSessionUsedWords.includes(w));

                // If we excluded a specific word (e.g. the first word of the pair), filter it too
                if (excludeWord) {
                    available = available.filter(w => w !== excludeWord);
                }

                // If we ran out of words, reset session for this group (or just pick from group excluding current)
                if (available.length === 0) {
                    // Reset session used words? Or just pick any from group?
                    // Let's pick from group but exclude the specific 'excludeWord' if possible
                    available = group.filter(w => w !== excludeWord);
                    // If still empty (group has 1 word?), just return it
                    if (available.length === 0) return group[0];
                }

                return available[Math.floor(Math.random() * available.length)];
            };

            if (state.wordsInCurrentGroup < 2) {
                const group = state.lastRhymeGroup.length > 0 ? state.lastRhymeGroup : getGroup();

                // We need a pair for the last added row.
                // The last added row is at the end of newRhymeRows (which we just sliced, so it was the 2nd to last before slice?)
                // Wait. newRhymeRows = slice(1). The last element is the one we want to pair with.
                const pairWord = newRhymeRows[newRhymeRows.length - 1].word;

                newWord = getUniqueWord(group, pairWord);
                newColor = newRhymeRows[newRhymeRows.length - 1].color;

                set({ wordsInCurrentGroup: state.wordsInCurrentGroup + 1 });
            } else {
                const newGroup = getGroup();
                newWord = getUniqueWord(newGroup);

                const PALETTE = ['#FFD700', '#87CEEB', '#90EE90', '#FFB6C1', '#FFA07A'];
                const lastColor = newRhymeRows[newRhymeRows.length - 1].color;
                let nextColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                while (nextColor === lastColor) {
                    nextColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                }
                newColor = nextColor;

                set({
                    lastRhymeGroup: newGroup,
                    wordsInCurrentGroup: 1
                });
            }

            newSessionUsedWords.push(newWord);

            newRhymeRows.push({
                id: Date.now().toString() + Math.random(), // Unique ID
                word: newWord,
                color: newColor
            });

            console.log('[Store] Board Shifted');
            return {
                brokenBricks: newBrokenBricks,
                rhymeRows: newRhymeRows,
                sessionUsedWords: newSessionUsedWords
            };
        });
    },

    // Rhyme Logic
    rhymeRows: [], // Initialized in loadNewRhymes
    lastRhymeGroup: [],
    wordsInCurrentGroup: 0,
    sessionUsedWords: [],
    targetFamilyId: null,
    setTargetFamily: (familyId) => set({ targetFamilyId: familyId, sessionUsedWords: [] }), // Reset used words on family change

    loadNewRhymes: (rowIndex?: number) => {
        const getGroup = () => {
            const state = useGameStore.getState();
            if (state.targetFamilyId) {
                const family = ALL_FAMILIES.find(f => f.family_id === state.targetFamilyId);
                return family ? family.words : ALL_FAMILIES[0].words;
            }
            const randomFamily = ALL_FAMILIES[Math.floor(Math.random() * ALL_FAMILIES.length)];
            return randomFamily.words;
        };

        const randomGroup = getGroup();
        const state = useGameStore.getState();
        let newSessionUsedWords = [...state.sessionUsedWords];

        const getUniqueWord = (group: string[]) => {
            let available = group.filter(w => !newSessionUsedWords.includes(w));
            if (available.length === 0) {
                available = group;
            }
            return available[Math.floor(Math.random() * available.length)];
        };

        // If rowIndex is provided, update only that row
        if (typeof rowIndex === 'number') {
            const randomWord = getUniqueWord(randomGroup);
            newSessionUsedWords.push(randomWord);

            set((state) => {
                const newRows = [...state.rhymeRows];
                if (newRows[rowIndex]) {
                    newRows[rowIndex] = {
                        ...newRows[rowIndex],
                        word: randomWord
                    };
                }
                console.log(`[Store] Updated Row ${rowIndex} with word: ${randomWord}`);
                return { rhymeRows: newRows, sessionUsedWords: newSessionUsedWords };
            });
            return;
        }

        // Otherwise load all (initial load)
        console.log('[Store] Loading new rhymes (ALL)...');
        // Reset session used words for fresh load
        newSessionUsedWords = [];

        const shuffled = [...randomGroup].sort(() => 0.5 - Math.random());
        const rows: RhymeRow[] = [];
        const colors = ['#FFD700', '#FFD700', '#87CEEB', '#87CEEB']; // Initial AABB

        // Ensure we don't pick duplicates for the initial 4 if possible
        // Since we shuffled the group, just picking first 4 is usually fine for uniqueness
        // But we should check if group has enough words

        for (let i = 0; i < 4; i++) {
            // If group is small (e.g. 2 words), we might have to repeat.
            // But shuffled[i % length] handles that.
            // We just want to track them.
            const word = shuffled[i % shuffled.length];
            newSessionUsedWords.push(word);

            rows.push({
                id: `init-${i}`,
                word: word,
                color: colors[i]
            });
        }
        console.log('[Store] New rows:', rows);
        set({ rhymeRows: rows, lastRhymeGroup: randomGroup, wordsInCurrentGroup: 0, sessionUsedWords: newSessionUsedWords });
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
}));
