import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    runOnJS,
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { useGameStore } from '../store';

const BALL_SIZE = 20;
const ROW_HEIGHT = 80;
const GRID_PADDING = 20;
const GAP = 10;

export const MetronomeBall: React.FC = () => {
    const { width } = useWindowDimensions();
    const bpm = useGameStore((state) => state.bpm);
    const syncTrigger = useGameStore((state) => state.syncTrigger);
    const breakBrick = useGameStore((state) => state.breakBrick);
    const setCurrentBeat = useGameStore((state) => state.setCurrentBeat);
    const resetRow = useGameStore((state) => state.resetRow);
    const isPlaying = useGameStore((state) => state.isPlaying);

    const currentBeat = useGameStore((state) => state.currentBeat);
    const shiftBoard = useGameStore((state) => state.shiftBoard);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const availableWidth = width - (GRID_PADDING * 2);
    const beatDuration = 60000 / bpm;

    const getTargetX = (col: number) => {
        'worklet';
        const colWidth = availableWidth / 4;
        // Center of the column
        return (col * colWidth) + (colWidth / 2) - (BALL_SIZE / 2);
    };

    const onBeatHit = (beatIndex: number) => {
        setCurrentBeat(beatIndex);
        // Break brick on the current beat (Row 0)
        breakBrick(beatIndex);
    };

    useEffect(() => {
        console.log(`[MetronomeBall] Effect triggered. Sync: ${syncTrigger}, BPM: ${bpm}, Beat: ${currentBeat}, Playing: ${isPlaying}`);

        // Initialize position based on currentBeat (0-3)
        const startBeat = currentBeat % 4;
        const startCol = startBeat;

        console.log(`[MetronomeBall] Resetting to Beat ${startBeat} (Row: 0, Col: ${startCol})`);

        translateX.value = getTargetX(startCol);
        translateY.value = 0; // Always top row

        if (!isPlaying) {
            // If not playing, just hold the position
            return;
        }

        function runLoop(beatIndex: number) {
            'worklet';
            // Always Row 0
            const col = beatIndex % 4;

            const currentX = getTargetX(col);

            const nextBeatIndex = (beatIndex + 1) % 4; // Loop 0-3
            const nextCol = nextBeatIndex;

            const nextX = getTargetX(nextCol);

            // Sync positions
            translateX.value = currentX;
            translateY.value = 0;

            // Trigger JS for Beat Hit
            runOnJS(onBeatHit)(beatIndex);

            // Trigger Board Shift if we are at the end of the loop (Beat 3)
            // This happens AS we start animating to Beat 0
            if (beatIndex === 3) {
                console.log('[MetronomeBall] End of Loop (Beat 3) - Triggering Shift');
                runOnJS(shiftBoard)();
            }

            // Animate X
            translateX.value = withTiming(nextX, { duration: beatDuration, easing: Easing.linear });

            // Animate Y (Bounce) - Always bounce on Row 0
            // Current Y = 0. Next Y = 0.
            // Peak Y = -40.
            const peakY = -40;

            translateY.value = withSequence(
                withTiming(peakY, { duration: beatDuration / 2, easing: Easing.out(Easing.quad) }),
                withTiming(0, { duration: beatDuration / 2, easing: Easing.in(Easing.quad) }, (finished) => {
                    if (finished) {
                        runLoop(nextBeatIndex);
                    }
                })
            );
        }

        // Start loop from the current beat
        runOnUI(runLoop)(startBeat);

        return () => {
            cancelAnimation(translateX);
            cancelAnimation(translateY);
        };
    }, [bpm, syncTrigger, width, isPlaying]); // Restart if width, bpm, syncTrigger, or isPlaying changes

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <View style={[styles.container, { width: availableWidth }]} pointerEvents="none">
            <Animated.View style={[styles.ball, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: GRID_PADDING,
        height: ROW_HEIGHT * 4,
    },
    ball: {
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        backgroundColor: COLORS.accent,
        // Center vertically relative to brick height (50)
        // Brick Top = (80 - 50) / 2 = 15.
        // We want Ball Bottom to touch Brick Top.
        // Ball Bottom = Ball Top + 20.
        // So Ball Top + 20 = 15 => Ball Top = -5.
        marginTop: -5,
    },
});
