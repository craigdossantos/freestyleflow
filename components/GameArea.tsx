import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MetronomeBall } from './MetronomeBall';
import { RhymeGrid } from './RhymeGrid';

interface GameAreaProps {
    isFocused: boolean;
}

export function GameArea({ isFocused }: GameAreaProps) {
    return (
        <View style={styles.gameWrapper}>
            <RhymeGrid />
            {isFocused && <MetronomeBall />}
        </View>
    );
}

const styles = StyleSheet.create({
    gameWrapper: {
        position: 'relative',
        width: '100%',
        flex: 1, // Ensure it takes available space
        justifyContent: 'center',
        alignItems: 'center',
    },
});
