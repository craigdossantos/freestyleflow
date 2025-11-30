import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'user_rhyme_progress';

export interface FamilyProgress {
    timesPlayed: number;
    lastPlayed: string; // ISO Date
}

export interface UserRhymeProgress {
    [familyId: string]: FamilyProgress;
}

export const ProgressService = {
    /**
     * Get all progress data
     */
    getAllProgress: async (): Promise<UserRhymeProgress> => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : {};
        } catch (e) {
            console.error('Failed to load progress', e);
            return {};
        }
    },

    /**
     * Get progress for a specific family
     */
    getFamilyProgress: async (familyId: string): Promise<FamilyProgress | null> => {
        const all = await ProgressService.getAllProgress();
        return all[familyId] || null;
    },

    /**
     * Increment play count for a family
     */
    incrementFamilyPlayCount: async (familyId: string) => {
        try {
            const all = await ProgressService.getAllProgress();
            const current = all[familyId] || { timesPlayed: 0, lastPlayed: '' };

            all[familyId] = {
                timesPlayed: current.timesPlayed + 1,
                lastPlayed: new Date().toISOString(),
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    },

    /**
     * Reset all progress (for debugging/testing)
     */
    resetProgress: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
};
