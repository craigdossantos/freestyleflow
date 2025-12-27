import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import { useGameStore } from "../store";
import { MetronomeBall } from "./MetronomeBall";
import { RhymeGrid } from "./RhymeGrid";

interface GameAreaProps {
  isFocused: boolean;
  compact?: boolean;
}

export function GameArea({ isFocused, compact = false }: GameAreaProps) {
  const currentSong = useGameStore((state) => state.currentSong);
  const currentBeat = useGameStore((state) => state.currentBeat);
  const isPlaying = useGameStore((state) => state.isPlaying);

  // Calculate beats until drop
  const beatsUntilDrop = useMemo(() => {
    if (!currentSong || !isPlaying) return -1;
    const { beats, beatDropTime } = currentSong;
    if (!beats || beats.length === 0) return -1;
    const dropBeatIndex = beats.findIndex((b: number) => b >= beatDropTime);
    if (dropBeatIndex === -1) return -1;
    return Math.max(0, dropBeatIndex - currentBeat);
  }, [currentSong, currentBeat, isPlaying]);

  return (
    <View style={styles.gameWrapper}>
      {/* Container for grid and ball - they need to be positioned relative to each other */}
      <View style={styles.gridContainer}>
        <RhymeGrid compact={compact} />
        {isFocused && <MetronomeBall compact={compact} />}
      </View>

      {/* Countdown overlay */}
      {beatsUntilDrop > 0 && beatsUntilDrop <= 4 && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{beatsUntilDrop}</Text>
        </View>
      )}
      {beatsUntilDrop === 0 && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.dropText}>DROP!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gameWrapper: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    position: "relative",
    width: "100%",
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  countdownText: {
    fontFamily: FONTS.main,
    fontSize: 120,
    fontWeight: "bold",
    color: COLORS.accent,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dropText: {
    fontFamily: FONTS.main,
    fontSize: 72,
    fontWeight: "bold",
    color: "#00FF00",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
