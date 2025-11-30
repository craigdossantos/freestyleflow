import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../store';

export const TapButton: React.FC = () => {
    const { addTap, tapHistory, setBpm, resetTaps } = useGameStore();

    const handleTap = () => {
        const now = Date.now();
        addTap(now);

        // We need at least 2 taps to calculate an interval, but 4 for better accuracy as per spec
        const history = useGameStore.getState().tapHistory; // Get fresh state

        if (history.length >= 4) {
            // Calculate average interval
            let totalInterval = 0;
            for (let i = 1; i < history.length; i++) {
                totalInterval += history[i] - history[i - 1];
            }
            const avgInterval = totalInterval / (history.length - 1);
            const newBpm = Math.round(60000 / avgInterval);

            setBpm(newBpm);
            useGameStore.getState().triggerSync(); // Force sync
            // Reset taps to start fresh or keep a rolling window? 
            // Spec says "Capture timestamps of the last 4 taps", implying rolling or reset.
            // Spec also says "Reset the ball's position... on the 4th tap".
            // Let's keep it simple: Calculate and reset history effectively by just using the last 4.
            // But to trigger the "sync", we might want to signal that explicitly.
            // For now, setting BPM is the main output.
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleTap} activeOpacity={0.7}>
                <Text style={styles.text}>TAP</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    button: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#00FF00', // Neon Green
        shadowColor: '#00FF00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    text: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
