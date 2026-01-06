# feat: Sync Ball Bounce to Beat Metadata

## Summary

Sync the MetronomeBall animation to pre-computed beat timestamps from the AI-analyzed metadata in `aibeats/`, replacing BPM-calculated timing. Add a progress bar showing beat drop position, and support variable time signatures (4/4, 6/8, 3/4).

## Problem Statement

- Ball bounce uses calculated intervals: `beatDuration = 60000 / bpm`
- No sync to actual beat timestamps - just steady interval
- Precise beat timestamps in JSON files (300+ per song) are unused
- No visual indicator of when beat drops during intro

## Proposed Solution

Modify `runLoop` in `MetronomeBall.tsx` to use the `beats[]` array from metadata. Each beat duration comes from `beats[i+1] - beats[i]`. Add progress bar with beat drop marker.

---

## Implementation Plan

### Phase 1: Add Beat Data to Songs

File: `constants/songList.ts`

```typescript
// Import JSON files
import areWeCookedBeats from "../aibeats/Are We Cooked (96 BPM - 00;20.1 - 03;21.0).json";
import beepBooBooBeats from "../aibeats/Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).json";
// ... all 12 songs

export interface Song {
  id: string;
  title: string;
  filename: string;
  bpm: number;
  startTime: number;
  endTime: number;
  source: any;
  // Beat metadata (from JSON)
  beats: number[]; // All beat timestamps in seconds
  beatsPerMeasure: number; // 4 for 4/4, 6 for 6/8, 3 for 3/4
  beatDropTime: number; // When main beat kicks in
  duration: number; // Song duration in seconds
}

export const SONGS: Song[] = [
  {
    id: "are_we_cooked",
    title: "Are We Cooked",
    filename: "are_we_cooked.mp3",
    bpm: areWeCookedBeats.bpm,
    startTime: areWeCookedBeats.beat_drop_time,
    endTime: areWeCookedBeats.duration,
    source: require("../music/are_we_cooked.mp3"),
    beats: areWeCookedBeats.beats,
    beatsPerMeasure: areWeCookedBeats.beats_per_measure,
    beatDropTime: areWeCookedBeats.beat_drop_time,
    duration: areWeCookedBeats.duration,
  },
  // ... all 12 songs
];
```

### Phase 2: Modify MetronomeBall for Beat Array Timing

File: `components/MetronomeBall.tsx`

Key changes:

1. Use `useSharedValue` for beat data (required for worklet access)
2. Calculate duration from beat array instead of BPM
3. Use `beatIndex % beatsPerMeasure === 0` for downbeat detection (supports 4/4, 6/8, 3/4)
4. Fallback to BPM timing if no beat data

```typescript
import { useSharedValue } from "react-native-reanimated";

export const MetronomeBall: React.FC<MetronomeBallProps> = ({
  compact = false,
}) => {
  // ... existing code ...

  const currentSong = useGameStore((state) => state.currentSong);

  // Store beat data in shared values for worklet access
  const beatsShared = useSharedValue<number[]>([]);
  const beatsPerMeasureShared = useSharedValue(4);

  useEffect(() => {
    if (currentSong?.beats) {
      beatsShared.value = currentSong.beats;
      beatsPerMeasureShared.value = currentSong.beatsPerMeasure ?? 4;
    } else {
      beatsShared.value = [];
      beatsPerMeasureShared.value = 4;
    }
  }, [currentSong]);

  function runLoop(beatIndex: number) {
    "worklet";

    const beats = beatsShared.value;
    const beatsPerMeasure = beatsPerMeasureShared.value;
    const hasBeatData = beats.length > 1;

    // Calculate duration - use beat array or fallback to BPM
    let duration: number;
    if (hasBeatData && beatIndex < beats.length - 1) {
      duration = (beats[beatIndex + 1] - beats[beatIndex]) * 1000;
      // Sanity check: minimum 100ms, maximum 2000ms per beat
      duration = Math.max(100, Math.min(duration, 2000));
    } else if (hasBeatData && beatIndex >= beats.length - 1) {
      // End of song
      runOnJS(setIsPlaying)(false);
      return;
    } else {
      // Fallback to BPM calculation
      duration = 60000 / bpm;
    }

    const col = beatIndex % 4; // Always 4 columns in UI
    const nextBeatIndex = beatIndex + 1;
    const nextCol = nextBeatIndex % 4;

    // Downbeat detection using beat index and time signature
    // Works for 4/4 (every 4), 6/8 (every 6), 3/4 (every 3)
    const isDownbeat = beatIndex % beatsPerMeasure === 0;
    const peakY = isDownbeat ? -55 : -40;

    // Trigger JS callbacks
    runOnJS(onBeatHit)(beatIndex);
    if (col === 3) {
      runOnJS(shiftBoard)();
    }

    // Animate with actual beat duration
    translateX.value = withTiming(getTargetX(nextCol), {
      duration,
      easing: Easing.linear,
    });

    translateY.value = withSequence(
      withTiming(peakY, {
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(
        0,
        {
          duration: duration / 2,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runLoop(nextBeatIndex);
          }
        },
      ),
    );
  }

  // ... rest unchanged
};
```

### Phase 3: Add Progress Bar with Beat Drop Marker

File: `components/SongProgressBar.tsx` (new, ~40 lines)

Simple progress bar showing:

- Current playback position
- Star/marker at beat drop time
- Total duration

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { useGameStore } from '../store';

interface SongProgressBarProps {
  currentPosition: number; // seconds
}

export const SongProgressBar: React.FC<SongProgressBarProps> = ({ currentPosition }) => {
  const currentSong = useGameStore((state) => state.currentSong);

  if (!currentSong) return null;

  const { duration, beatDropTime } = currentSong;
  const progress = Math.min(currentPosition / duration, 1);
  const dropPosition = beatDropTime / duration;

  return (
    <View style={styles.container}>
      {/* Background track */}
      <View style={styles.track} />

      {/* Progress fill */}
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />

      {/* Beat drop marker */}
      <View style={[styles.dropMarker, { left: `${dropPosition * 100}%` }]}>
        <View style={styles.star} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    marginHorizontal: 20,
    marginTop: 10,
    position: 'relative',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    opacity: 0.3,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  dropMarker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.accent,
    transform: [{ rotate: '45deg' }],
  },
});
```

### Phase 4: Track Audio Position for Progress Bar

File: `components/LocalMusicLayer.tsx`

Add playback position tracking:

```typescript
const [playbackPosition, setPlaybackPosition] = useState(0);

// In Audio.Sound.createAsync options:
{
  shouldPlay: true,
  volume: musicVolume,
  progressUpdateIntervalMillis: 500, // Update every 500ms for progress bar
}

// In onPlaybackStatusUpdate callback:
const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
  if (status.isLoaded) {
    setPlaybackPosition(status.positionMillis / 1000);

    if (status.didJustFinish) {
      // ... existing finish handling
    }
  }
};
```

Then pass `playbackPosition` to `SongProgressBar`.

---

## Files to Modify

| File                             | Action | Changes                                                                                                        |
| -------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| `constants/songList.ts`          | Modify | Import JSON files, add `beats`, `beatsPerMeasure`, `beatDropTime`, `duration` to Song interface                |
| `components/MetronomeBall.tsx`   | Modify | Use `useSharedValue` for beats, calculate duration from array, use `beatIndex % beatsPerMeasure` for downbeats |
| `components/LocalMusicLayer.tsx` | Modify | Track playback position, pass to progress bar                                                                  |
| `components/SongProgressBar.tsx` | Create | Simple progress bar with beat drop marker (~40 lines)                                                          |
| `components/GameArea.tsx`        | Modify | Add `<SongProgressBar />` component                                                                            |

---

## Technical Notes

### Worklet Safety

Beat data must use `useSharedValue` because:

- Regular arrays don't transfer to UI thread worklets
- `Set` objects crash in worklets
- Shared values serialize correctly

### Time Signature Support

The JSON metadata includes `beats_per_measure`:

- **4** = 4/4 time (most common)
- **6** = 6/8 time (compound duple)
- **3** = 3/4 time (waltz)

Downbeat detection uses `beatIndex % beatsPerMeasure === 0` which works for all signatures.

### Fallback Behavior

If `beats[]` is empty or missing:

- Duration falls back to `60000 / bpm`
- Continues working like current implementation
- No crash or broken state

### Duration Validation

Beat-to-beat duration is clamped to prevent broken animations:

```typescript
duration = Math.max(100, Math.min(duration, 2000));
```

- Minimum: 100ms (600 BPM max)
- Maximum: 2000ms (30 BPM min)

---

## Acceptance Criteria

### Functional

- [ ] Ball bounces using actual beat timestamps from metadata
- [ ] Downbeats have larger bounce (works for 4/4, 6/8, 3/4)
- [ ] Progress bar shows playback position with beat drop marker
- [ ] Songs without beat data fall back to BPM timing
- [ ] Song switch cleanly cancels animation and starts new one

### Non-Functional

- [ ] Animation maintains 60fps
- [ ] No drift over 3+ minute song
- [ ] No TypeScript errors

---

## Test Plan

1. **Beat Sync**: Play each song, verify ball lands on audible beats
2. **Downbeat**: Watch for larger bounce at measure start
3. **Progress Bar**: Verify bar fills, star shows at beat drop
4. **Fallback**: Test with `beats: []` - should use BPM timing
5. **Song Switch**: Switch songs mid-playback - verify clean restart

---

## Implementation Order

1. Update `constants/songList.ts` with JSON imports and beat fields
2. Modify `MetronomeBall.tsx` to use `useSharedValue` and beat array
3. Add `SongProgressBar.tsx` component
4. Update `LocalMusicLayer.tsx` for position tracking
5. Add progress bar to `GameArea.tsx`
6. Test all 12 songs
