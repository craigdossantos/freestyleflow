import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { LinearTransition, runOnJS } from 'react-native-reanimated';
import { useGameStore } from '../store';

const BRICK_WIDTH = 80;
const ROW_HEIGHT = 80;
const GAP = 10;
const PADDING = 20;
const AVAILABLE_WIDTH = (BRICK_WIDTH * 4) + (GAP * 3);

export const RhymeGrid: React.FC = () => {
    const brokenBricks = useGameStore((state) => state.brokenBricks);
    const rhymeRows = useGameStore((state) => state.rhymeRows); // Get rows
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
        // Debounce: Ignore taps within 200ms
        if (now - lastTapRef.current < 200) {
            console.log('[RhymeGrid] Tap ignored (debounce)');
            return;
        }
        lastTapRef.current = now;

        console.log(`[RhymeGrid] Brick tapped: ${brickIndex}`);
        addTap(now);
        syncToBeat(brickIndex);
    };

    // Gesture Handler for Dragging
    const updateColumnFromGesture = (x: number) => {
        // Calculate column based on X position relative to grid
        // Grid starts at PADDING (20)
        const relativeX = x - PADDING;
        if (relativeX < 0 || relativeX > AVAILABLE_WIDTH) return;

        const colWidth = BRICK_WIDTH + GAP;
        const colIndex = Math.floor(relativeX / colWidth);

        // Clamp between 0 and 3
        const clampedIndex = Math.max(0, Math.min(3, colIndex));

        if (clampedIndex !== rhymeColumnIndex) {
            setRhymeColumnIndex(clampedIndex);
        }
    };

    const dragGesture = Gesture.Pan()
        .activateAfterLongPress(300) // 300ms hold to activate drag
        .onStart(() => {
            console.log('[RhymeGrid] Drag started');
        })
        .onUpdate((e) => {
            runOnJS(updateColumnFromGesture)(e.absoluteX);
        });

    const renderRow = (row: { id: string, word: string, color: string }, rowIndex: number) => {
        const baseIndex = rowIndex * 4;

        return (
            <Animated.View
                style={styles.row}
                key={row.id}
                layout={LinearTransition.duration(100)} // Fast snap to meet the ball
            >
                {[0, 1, 2, 3].map((colIndex) => {
                    const brickIndex = baseIndex + colIndex;
                    const isBroken = brokenBricks[brickIndex];
                    const isWordBrick = colIndex === rhymeColumnIndex;
                    const backgroundColor = colIndex === rhymeColumnIndex ? row.color : '#AAAAAA';

                    return (
                        <TouchableOpacity
                            key={`${row.id}-${colIndex}`}
                            activeOpacity={0.7}
                            onPress={() => handleBrickTap(brickIndex)}
                        >
                            <View
                                style={[
                                    styles.brick,
                                    { backgroundColor, width: BRICK_WIDTH },
                                    isBroken && styles.hiddenBrick
                                ]}
                            >
                                {isWordBrick && (
                                    <Text style={styles.brickText}>{row.word}</Text>
                                )}
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
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ROW_HEIGHT,
        paddingVertical: 10,
    },
    brick: {
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000', // Black border for cartoon/retro look
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Bottom shadow for 3D effect
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 4,
    },
    hiddenBrick: {
        opacity: 0,
    },
    brickText: {
        color: '#000',
        fontSize: 16, // Fit inside brick
        fontWeight: '900',
        fontFamily: 'Courier',
        textTransform: 'uppercase',
        textShadowColor: '#FFF',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
});
