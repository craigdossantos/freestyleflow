import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { LinearTransition, runOnJS, SlideInUp } from 'react-native-reanimated';
import { COLORS, FONTS, SHAPES } from '../constants/theme';
import { useGameStore } from '../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 10;
const PADDING = 20;

export const RhymeGrid: React.FC = () => {
    const brokenBricks = useGameStore((state) => state.brokenBricks);
    const rhymeRows = useGameStore((state) => state.rhymeRows);
    const loadNewRhymes = useGameStore((state) => state.loadNewRhymes);
    const syncToBeat = useGameStore((state) => state.syncToBeat);
    const addTap = useGameStore((state) => state.addTap);
    const rhymeColumnIndex = useGameStore((state) => state.rhymeColumnIndex);
    const setRhymeColumnIndex = useGameStore((state) => state.setRhymeColumnIndex);

    useEffect(() => {
        console.log('[RhymeGrid] Mounting, loading rhymes...');
        loadNewRhymes();
    }, []);

    const lastTapRef = useRef(0);

    const handleBrickTap = (brickIndex: number) => {
        const now = Date.now();
        if (now - lastTapRef.current < 200) return;
        lastTapRef.current = now;
        addTap(now);
        syncToBeat(brickIndex);
    };

    const updateColumnFromGesture = (x: number) => {
        const colWidth = SCREEN_WIDTH / 4;
        const colIndex = Math.floor(x / colWidth);
        const clampedIndex = Math.max(0, Math.min(3, colIndex));
        if (clampedIndex !== rhymeColumnIndex) {
            setRhymeColumnIndex(clampedIndex);
        }
    };

    const dragGesture = Gesture.Pan()
        .activateAfterLongPress(300)
        .onUpdate((e) => {
            runOnJS(updateColumnFromGesture)(e.absoluteX);
        });

    const renderRow = (row: { id: string, word: string, color: string }, rowIndex: number) => {
        const baseIndex = rowIndex * 4;

        // Dynamic Sizing
        const totalGap = GAP * 3;
        const availableWidth = SCREEN_WIDTH - (PADDING * 2) - totalGap;
        const activeWidth = availableWidth * 0.4; // 40% for active word
        const inactiveWidth = (availableWidth * 0.6) / 3; // 20% for others

        return (
            <Animated.View
                style={styles.row}
                key={row.id}
                layout={LinearTransition.duration(100)}
                entering={SlideInUp.duration(100)}
            >
                {[0, 1, 2, 3].map((colIndex) => {
                    const brickIndex = baseIndex + colIndex;
                    const isBroken = brokenBricks[brickIndex];
                    const isWordBrick = colIndex === rhymeColumnIndex;
                    const width = isWordBrick ? activeWidth : inactiveWidth;
                    const backgroundColor = 'transparent';

                    return (
                        <TouchableOpacity
                            key={`${row.id}-${colIndex}`}
                            activeOpacity={0.7}
                            onPress={() => handleBrickTap(brickIndex)}
                        >
                            <View
                                style={[
                                    styles.brick,
                                    { backgroundColor, width },
                                    isBroken && styles.hiddenBrick
                                ]}
                            >
                                {isWordBrick && row.word ? (
                                    <Text
                                        style={styles.brickText}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {row.word}
                                    </Text>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>
        );
    };

    return (
        <GestureDetector gesture={dragGesture}>
            <View style={styles.container}>
                {rhymeRows.map((row, index) => renderRow(row, index))}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: PADDING,
        justifyContent: 'center',
        overflow: 'hidden', // Fix animation flashing
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        paddingVertical: 10,
    },
    brick: {
        height: 50,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        ...SHAPES.rect,
    },
    hiddenBrick: {
        opacity: 0,
    },
    brickText: {
        color: COLORS.text,
        fontSize: 20, // Start larger, let it scale down
        fontFamily: FONTS.main,
        textTransform: 'uppercase',
    },
});
