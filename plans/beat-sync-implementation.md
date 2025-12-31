# feat: Precise Beat Synchronization with AI-Analyzed Metadata

## Summary

Replace the current BPM-calculated ball bounce with precise beat-array synchronization using the AI-analyzed metadata from `aibeats/`. Add countdown before beat drop and emphasize downbeats visually.

## Current Problem

- Ball bounce uses calculated intervals: `beatDuration = 60000 / bpm`
- No sync to actual beat timestamps - just steady interval
- No awareness of when beat actually drops (intro vs main beat)
- Precise beat timestamps in JSON files are unused

## User Requirements

1. **Replace existing songs** with aibeats MP3s and metadata
2. **Countdown animation** before beat drop
3. **Sync to beat array** - use actual timestamps, not BPM calculation
4. **Emphasize downbeats** - larger bounce on beat 1 of each measure

---

## Implementation Plan (Simplified)

Based on reviewer feedback: Keep the existing `runLoop` pattern - just change the timing source.

### Phase 1: Data Setup

**Step 1.1: Update songList.ts with inline JSON imports**

File: `constants/songList.ts`

```typescript
// Import JSON directly - no separate beatData.ts needed
import areWeCookedBeats from "../aibeats/Are We Cooked (96 BPM - 00;20.1 - 03;21.0).json";
import beepBooBooBeats from "../aibeats/Beep Boo Boo Bop (140BPM 00;13.9 - 03;01.7).json";
// ... all 13 songs

export interface Song {
  id: string;
  title: string;
  source: any;
  // Beat data (from JSON)
  bpm: number;
  beats: number[];
  downbeats: Set<number>; // Pre-computed for O(1) lookup
  beatDropTime: number;
  duration: number;
}

export const SONGS: Song[] = [
  {
    id: "are_we_cooked",
    title: "Are We Cooked",
    source: require("../music/are_we_cooked.mp3"),
    bpm: areWeCookedBeats.bpm,
    beats: areWeCookedBeats.beats,
    downbeats: new Set(areWeCookedBeats.downbeats),
    beatDropTime: areWeCookedBeats.beat_drop_time,
    duration: areWeCookedBeats.duration,
  },
  // ... all 13 songs
];
```

**Step 1.2: Copy MP3 files**

- Copy from `aibeats/*.mp3` to `music/` with simple names
- e.g., `Are We Cooked (96 BPM - 00;20.1 - 03;21.0).mp3` → `are_we_cooked.mp3`

### Phase 2: Core Beat Sync

**Step 2.1: Modify MetronomeBall.tsx runLoop**

File: `components/MetronomeBall.tsx`

Keep the existing recursive `runLoop` pattern, but change timing from BPM-calculated to beat-array based:

```typescript
// Add to component - get beat data from current song
const currentSong = useGameStore((state) => state.currentSong);
const beats = currentSong?.beats ?? [];
const downbeats = currentSong?.downbeats ?? new Set();

// Track current beat index
const beatIndexRef = useRef(0);

function runLoop(beatIndex: number) {
  "worklet";

  // Get actual beat times from array
  const currentBeatTime = beats[beatIndex];
  const nextBeatTime = beats[beatIndex + 1];

  // Handle end of song
  if (!nextBeatTime) {
    runOnJS(setIsPlaying)(false);
    return;
  }

  // Calculate ACTUAL duration between these specific beats
  const duration = (nextBeatTime - currentBeatTime) * 1000; // ms

  const col = beatIndex % 4;
  const nextCol = (beatIndex + 1) % 4;

  // Bigger bounce on downbeats (every 4th beat / measure start)
  const isDownbeat = downbeats.has(currentBeatTime);
  const peakY = isDownbeat ? -60 : -40;

  // Trigger JS callbacks
  runOnJS(onBeatHit)(beatIndex);
  if (col === 3) {
    runOnJS(shiftBoard)();
  }

  // Animate to next position
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
      { duration: duration / 2, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) {
          runLoop(beatIndex + 1);
        }
      },
    ),
  );
}
```

**Step 2.2: Start from beat drop time**

File: `components/LocalMusicLayer.tsx`

When starting playback, find the beat index closest to `beatDropTime` and start the animation there:

```typescript
const startSong = async () => {
  const { beats, beatDropTime } = currentSong;

  // Find first beat at or after beat drop
  const startBeatIndex = beats.findIndex((b) => b >= beatDropTime);

  // Start audio
  const { sound } = await Audio.Sound.createAsync(currentSong.source, {
    shouldPlay: true,
    volume: musicVolume,
  });

  // Seek to beat drop (minus small buffer for countdown)
  const countdownBeats = 4;
  const countdownStartIndex = Math.max(0, startBeatIndex - countdownBeats);
  const seekPosition = beats[countdownStartIndex] * 1000;
  await sound.setPositionAsync(seekPosition);

  // Start animation from countdown beat
  triggerSync(countdownStartIndex);
};
```

### Phase 3: Countdown Display

**Step 3.1: Add countdown to GameArea (inline, not separate component)**

File: `components/GameArea.tsx`

```typescript
// Add state for countdown
const currentSong = useGameStore((state) => state.currentSong);
const currentBeat = useGameStore((state) => state.currentBeat);
const isPlaying = useGameStore((state) => state.isPlaying);

// Calculate beats until drop
const beatsUntilDrop = useMemo(() => {
  if (!currentSong || !isPlaying) return -1;
  const { beats, beatDropTime } = currentSong;
  const dropBeatIndex = beats.findIndex(b => b >= beatDropTime);
  return Math.max(0, dropBeatIndex - currentBeat);
}, [currentSong, currentBeat, isPlaying]);

// In render:
{beatsUntilDrop > 0 && beatsUntilDrop <= 4 && (
  <View style={styles.countdownOverlay}>
    <Text style={styles.countdownText}>
      {beatsUntilDrop}
    </Text>
  </View>
)}
{beatsUntilDrop === 0 && (
  <View style={styles.countdownOverlay}>
    <Text style={styles.dropText}>DROP!</Text>
  </View>
)}
```

### Phase 4: Store Updates (Minimal)

File: `store.ts`

Only add what's needed - no polling, no scheduling state:

```typescript
// Update syncTrigger to accept optional starting beat index
triggerSync: (startBeatIndex?: number) => set((state) => ({
  syncTrigger: state.syncTrigger + 1,
  currentBeat: startBeatIndex ?? 0,
})),
```

---

## Files to Modify

| File                             | Action | Changes                                                         |
| -------------------------------- | ------ | --------------------------------------------------------------- |
| `constants/songList.ts`          | Modify | Inline JSON imports, update Song interface, add all 13 songs    |
| `music/*.mp3`                    | Add    | Copy 13 MP3s from aibeats with simple names                     |
| `components/MetronomeBall.tsx`   | Modify | Change runLoop to use beats array timing, add downbeat emphasis |
| `components/LocalMusicLayer.tsx` | Modify | Start from beat drop, calculate countdown start                 |
| `components/GameArea.tsx`        | Modify | Add inline countdown display (~15 lines)                        |
| `store.ts`                       | Modify | Update triggerSync to accept start index                        |

**Files NOT created (per reviewer feedback):**

- ~~`constants/beatData.ts`~~ - Inline imports instead
- ~~`hooks/useBeatScheduler.ts`~~ - Not needed, keep runLoop pattern
- ~~`components/CountdownOverlay.tsx`~~ - Inline in GameArea

---

## Technical Notes

### Downbeat Detection

Pre-compute as Set for O(1) lookup:

```typescript
downbeats: new Set(jsonData.downbeats);
// Usage: downbeats.has(beatTime)
```

### Beat Timing

Each beat has its own timestamp, so timing is naturally variable:

```typescript
const duration = (beats[i + 1] - beats[i]) * 1000; // Actual ms between beats
```

### Audio Sync

Start animation and audio from same beat index. The recursive loop stays in sync because each beat triggers the next animation with the exact duration from the beat array.

---

## Implementation Order

1. Copy MP3 files to music/ folder
2. Update songList.ts with JSON imports and all songs
3. Modify MetronomeBall runLoop for beat-array timing
4. Modify LocalMusicLayer to start from countdown position
5. Add countdown display to GameArea
6. Update store.triggerSync

**Estimated time: 1-2 hours**
