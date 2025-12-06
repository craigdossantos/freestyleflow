import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import { useGameStore } from '../store';

export const TapButton: React.FC = () => {
    const { addTap, tapHistory, setBpm, resetTaps, bpm } = useGameStore();

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const dragGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
            translateY.value = contextY.value + event.translationY;
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    const handleTap = () => {
        const now = Date.now();
        addTap(now);

        const history = useGameStore.getState().tapHistory;

        if (history.length >= 4) {
            let totalInterval = 0;
            for (let i = 1; i < history.length; i++) {
                totalInterval += history[i] - history[i - 1];
            }
            const avgInterval = totalInterval / (history.length - 1);
            const newBpm = Math.round(60000 / avgInterval);

            setBpm(newBpm);
            useGameStore.getState().triggerSync();
        }
    };

    return (
        <GestureDetector gesture={dragGesture}>
            <Animated.View style={[styles.container, animatedStyle]}>
                <TouchableOpacity style={styles.button} onPress={handleTap} activeOpacity={0.7}>
                    <Text style={styles.bpmText}>{bpm}</Text>
                    <Text style={styles.tapText}>TAP</Text>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.background, // Ensure solid background
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 50, // Circle
    },
    bpmText: {
        color: COLORS.text,
        fontSize: 32,
        fontFamily: FONTS.main,
        lineHeight: 32,
    },
    tapText: {
        color: COLORS.dimmed,
        fontSize: 12,
        fontFamily: FONTS.main,
    },
});
