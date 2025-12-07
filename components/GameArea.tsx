import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MetronomeBall } from './MetronomeBall';
import { RhymeGrid } from './RhymeGrid';

interface GameAreaProps {
    isFocused: boolean;
    compact?: boolean;
}

export function GameArea({ isFocused, compact = false }: GameAreaProps) {
    return (
        <View style={styles.gameWrapper}>
            {/* Container for grid and ball - they need to be positioned relative to each other */}
            <View style={styles.gridContainer}>
                <RhymeGrid compact={compact} />
                {isFocused && <MetronomeBall compact={compact} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    gameWrapper: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        position: 'relative',
        width: '100%',
    },
});
