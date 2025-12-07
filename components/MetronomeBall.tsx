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
const COMPACT_BALL_SIZE = 16;
const ROW_HEIGHT = 80;
const COMPACT_ROW_HEIGHT = 55;
const GRID_PADDING = 20;
const GAP = 10;

interface MetronomeBallProps {
    compact?: boolean;
}

export const MetronomeBall: React.FC<MetronomeBallProps> = ({ compact = false }) => {
    const ballSize = compact ? COMPACT_BALL_SIZE : BALL_SIZE;
    const rowHeight = compact ? COMPACT_ROW_HEIGHT : ROW_HEIGHT;
    const { width } = useWindowDimensions();
    const bpm = useGameStore((state) => state.bpm);
    const syncTrigger = useGameStore((state) => state.syncTrigger);
    const breakBrick = useGameStore((state) => state.breakBrick);
    const setCurrentBeat = useGameStore((state) => state.setCurrentBeat);
    const resetRow = useGameStore((state) => state.resetRow);
    const isPlaying = useGameStore((state) => state.isPlaying);

    const currentBeat = useGameStore((state) => state.currentBeat);
    const shiftBoard = useGameStore((state) => state.shiftBoard);
    const rhymeColumnIndex = useGameStore((state) => state.rhymeColumnIndex);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Match RhymeGrid's width calculation exactly
    const totalGap = GAP * 3; // 3 gaps between 4 columns
    const availableWidth = width - (GRID_PADDING * 2) - totalGap;
    const activeWidth = availableWidth * 0.4; // 40% for active word column
    const inactiveWidth = (availableWidth * 0.6) / 3; // 20% for other columns
    const beatDuration = 60000 / bpm;

    const getTargetX = (col: number) => {
        'worklet';
        // Calculate X position based on variable column widths
        // rhymeColumnIndex determines which column is the wide one
        let x = 0;
        for (let i = 0; i < col; i++) {
            const colIsActive = i === rhymeColumnIndex;
            x += colIsActive ? activeWidth : inactiveWidth;
            x += GAP; // Add gap after each column except last
        }
        // Now add half of the current column's width to get center
        const currentColIsActive = col === rhymeColumnIndex;
        const currentColWidth = currentColIsActive ? activeWidth : inactiveWidth;
        x += currentColWidth / 2;
        // Subtract half ball size to center the ball
        return x - (ballSize / 2);
    };

    const onBeatHit = (beatIndex: number) => {
        setCurrentBeat(beatIndex);
        // Break brick on the current beat (Row 0)
        breakBrick(beatIndex);
    };

    useEffect(() => {
        console.log(`[MetronomeBall] Effect triggered. Sync: ${syncTrigger}, BPM: ${bpm}, Beat: ${currentBeat}, Playing: ${isPlaying}`);

        if (!isPlaying) {
            // When not playing, position ball on top of first brick (column 0)
            translateX.value = getTargetX(0);
            translateY.value = 0;
            console.log(`[MetronomeBall] Not playing - ball positioned on first brick`);
            return;
        }

        // Initialize position based on currentBeat (0-3) when playing
        const startBeat = currentBeat % 4;
        const startCol = startBeat;

        console.log(`[MetronomeBall] Playing - starting at Beat ${startBeat} (Col: ${startCol})`);

        translateX.value = getTargetX(startCol);
        translateY.value = 0; // Always top row

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
    }, [bpm, syncTrigger, width, isPlaying, rhymeColumnIndex]); // Restart if width, bpm, syncTrigger, isPlaying, or column changes

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    // Dynamic styles based on compact mode
    // Row layout analysis:
    // - Row height: 80px (normal) / 55px (compact)
    // - Row has paddingVertical: 5px and alignItems: 'center'
    // - Brick height: 50px (normal) / 40px (compact)
    // - Content area: rowHeight - 10px (padding)
    // - Brick is centered in content: paddingTop + (contentHeight - brickHeight) / 2
    // Normal: 5 + (70 - 50) / 2 = 5 + 10 = 15px from row top
    // Compact: 5 + (45 - 40) / 2 = 5 + 2.5 = 7.5px from row top
    const brickHeight = compact ? 40 : 50;
    const contentHeight = rowHeight - 10; // subtract paddingVertical * 2
    const brickTop = 5 + (contentHeight - brickHeight) / 2;

    // Ball should land with its bottom touching the brick top
    // marginTop positions the ball's top edge
    // We want: ballTop + ballSize = brickTop (ball bottom = brick top)
    // So: ballTop = brickTop - ballSize
    // Normal: 15 - 20 = -5
    // Compact: 7.5 - 16 = -8.5
    const ballStyle = {
        width: ballSize,
        height: ballSize,
        borderRadius: ballSize / 2,
        backgroundColor: COLORS.accent,
        marginTop: brickTop - ballSize,
    };

    // Total width includes the brick widths plus gaps
    const totalWidth = availableWidth + totalGap;

    return (
        <View style={[styles.container, { width: totalWidth, height: rowHeight * 4 }]} pointerEvents="none">
            <Animated.View style={[ballStyle, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: GRID_PADDING,
    },
});
