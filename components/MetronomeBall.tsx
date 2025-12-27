import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../constants/theme";
import { useGameStore } from "../store";

const BALL_SIZE = 20;
const COMPACT_BALL_SIZE = 16;
const ROW_HEIGHT = 80;
const COMPACT_ROW_HEIGHT = 55;
const GRID_PADDING = 20;
const GAP = 10;

interface MetronomeBallProps {
  compact?: boolean;
}

export const MetronomeBall: React.FC<MetronomeBallProps> = ({
  compact = false,
}) => {
  const ballSize = compact ? COMPACT_BALL_SIZE : BALL_SIZE;
  const rowHeight = compact ? COMPACT_ROW_HEIGHT : ROW_HEIGHT;
  const { width } = useWindowDimensions();
  const bpm = useGameStore((state) => state.bpm);
  const syncTrigger = useGameStore((state) => state.syncTrigger);
  const breakBrick = useGameStore((state) => state.breakBrick);
  const setCurrentBeat = useGameStore((state) => state.setCurrentBeat);
  const setIsPlaying = useGameStore((state) => state.setIsPlaying);
  const isPlaying = useGameStore((state) => state.isPlaying);

  const currentBeat = useGameStore((state) => state.currentBeat);
  const shiftBoard = useGameStore((state) => state.shiftBoard);
  const rhymeColumnIndex = useGameStore((state) => state.rhymeColumnIndex);
  const currentSong = useGameStore((state) => state.currentSong);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Get beat data from current song
  const beats = useMemo(() => currentSong?.beats ?? [], [currentSong]);
  const downbeatsArray = useMemo(
    () => (currentSong?.downbeats ? Array.from(currentSong.downbeats) : []),
    [currentSong],
  );

  // Match RhymeGrid's width calculation exactly
  const totalGap = GAP * 3; // 3 gaps between 4 columns
  const availableWidth = width - GRID_PADDING * 2 - totalGap;
  const activeWidth = availableWidth * 0.4; // 40% for active word column
  const inactiveWidth = (availableWidth * 0.6) / 3; // 20% for other columns
  // Fallback beat duration for when no song is selected
  const fallbackBeatDuration = 60000 / bpm;

  const getTargetX = (col: number) => {
    "worklet";
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
    return x - ballSize / 2;
  };

  const onBeatHit = (beatIndex: number) => {
    setCurrentBeat(beatIndex);
    // Break brick on the current beat (Row 0)
    breakBrick(beatIndex);
  };

  // Helper to stop playback when song ends
  const stopPlayback = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    console.log(
      `[MetronomeBall] Effect triggered. Sync: ${syncTrigger}, BPM: ${bpm}, Beat: ${currentBeat}, Playing: ${isPlaying}`,
    );

    if (!isPlaying) {
      // When not playing, position ball on top of first brick (column 0)
      translateX.value = getTargetX(0);
      translateY.value = 0;
      console.log(
        `[MetronomeBall] Not playing - ball positioned on first brick`,
      );
      return;
    }

    // Initialize position based on currentBeat when playing
    // currentBeat now represents the index into the beats array
    const startBeatArrayIndex = currentBeat;
    const startCol = currentBeat % 4;

    console.log(
      `[MetronomeBall] Playing - starting at Beat array index ${startBeatArrayIndex} (Col: ${startCol})`,
    );

    translateX.value = getTargetX(startCol);
    translateY.value = 0; // Always top row

    // Check if we have beat data from the song
    const hasBeatData = beats.length > 0;

    function runLoop(beatArrayIndex: number) {
      "worklet";
      // Column position cycles 0-3
      const col = beatArrayIndex % 4;
      const nextCol = (beatArrayIndex + 1) % 4;

      const currentX = getTargetX(col);
      const nextX = getTargetX(nextCol);

      // Sync positions
      translateX.value = currentX;
      translateY.value = 0;

      // Trigger JS for Beat Hit (pass the array index)
      runOnJS(onBeatHit)(beatArrayIndex);

      // Trigger Board Shift at the end of every 4-beat cycle
      if (col === 3) {
        runOnJS(shiftBoard)();
      }

      // Calculate duration from beat array or use fallback
      let duration: number;
      if (hasBeatData && beatArrayIndex < beats.length - 1) {
        const currentBeatTime = beats[beatArrayIndex];
        const nextBeatTime = beats[beatArrayIndex + 1];
        duration = (nextBeatTime - currentBeatTime) * 1000; // Convert seconds to ms
      } else if (hasBeatData && beatArrayIndex >= beats.length - 1) {
        // End of song - stop playback
        runOnJS(stopPlayback)();
        return;
      } else {
        // Fallback to BPM-based timing
        duration = fallbackBeatDuration;
      }

      // Check if current beat is a downbeat for emphasis
      // We check by looking if the beat time is in the downbeats array
      const currentBeatTime = hasBeatData ? beats[beatArrayIndex] : 0;
      const isDownbeat =
        hasBeatData && downbeatsArray.includes(currentBeatTime);
      const peakY = isDownbeat ? -60 : -40; // Bigger bounce on downbeats

      // Animate X
      translateX.value = withTiming(nextX, {
        duration,
        easing: Easing.linear,
      });

      // Animate Y (Bounce)
      translateY.value = withSequence(
        withTiming(peakY, {
          duration: duration / 2,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(
          0,
          { duration: duration / 2, easing: Easing.in(Easing.quad) },
          (finished) => {
            if (finished) {
              runLoop(beatArrayIndex + 1);
            }
          },
        ),
      );
    }

    // Start loop from the current beat array index
    runOnUI(runLoop)(startBeatArrayIndex);

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
    };
  }, [
    bpm,
    syncTrigger,
    width,
    isPlaying,
    rhymeColumnIndex,
    beats,
    downbeatsArray,
  ]); // Include beat data in dependencies

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
    <View
      style={[styles.container, { width: totalWidth, height: rowHeight * 4 }]}
      pointerEvents="none"
    >
      <Animated.View style={[ballStyle, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: GRID_PADDING,
  },
});
