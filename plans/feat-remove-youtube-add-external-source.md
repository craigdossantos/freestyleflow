# Plan: Remove YouTube & Add External Source Mode

## Summary

Remove YouTube functionality entirely, remove tap tempo button, make built-in songs the default, and add an "external source" option where users play music from Spotify/YouTube externally and use this app for visuals only.

## Files to Modify

### 1. `store.ts` - Update Music Mode Type

**Current state:**

```typescript
musicMode: "youtube" | "local"; // line 58
musicMode: "youtube"; // default at line 392
videoId: string; // YouTube-related state
```

**Changes:**

- Change type to `"local" | "external"`
- Change default to `"local"`
- Remove `videoId` and `setVideoId` state

### 2. `app/index.tsx` - Remove YouTube/TapButton Rendering

**Current state:**

- Imports YouTubeLayer (line 13) and TapButton (line 12)
- Renders YouTubeLayer when `musicMode === 'youtube'` (lines 235-237)
- Renders TapButton in two places (lines 179-182, 244-247)

**Changes:**

- Remove YouTubeLayer and TapButton imports
- Remove YouTubeLayer conditional rendering
- Remove TapButton rendering in both locations
- For `musicMode === 'external'`: render nothing in the music area (just a placeholder with instructions)

### 3. `app/menu.tsx` - Update Music Source Options

**Current state:**

- Two options: YOUTUBE and BUILT-IN SONGS (lines 96-128)
- YouTube URL input field (lines 130-144)
- `extractVideoId` function for parsing YouTube URLs

**Changes:**

- Remove YouTube option button
- Remove `extractVideoId` function and `handleLoadVideo`
- Remove `inputUrl` state and `setVideoId` usage
- Add EXTERNAL SOURCE option with description explaining users can play music from Spotify/YouTube app externally
- Built-in songs remain as-is

### 4. `components/YouTubeLayer.tsx` - DELETE

The entire file can be removed.

### 5. `components/TapButton.tsx` - DELETE

The entire file can be removed.

## Implementation Steps

1. **Update store.ts**
   - Change `musicMode` type from `"youtube" | "local"` to `"local" | "external"`
   - Change default `musicMode` from `"youtube"` to `"local"`
   - Remove `videoId`, `setVideoId` state

2. **Update app/menu.tsx**
   - Remove YouTube-related code (extractVideoId, inputUrl, handleLoadVideo)
   - Remove `setVideoId` import
   - Change YOUTUBE button to EXTERNAL SOURCE
   - Add description text for external source mode

3. **Update app/index.tsx**
   - Remove TapButton import and all TapButton JSX
   - Remove YouTubeLayer import and all YouTubeLayer JSX
   - Update external mode to show placeholder (no music layer needed)

4. **Delete component files**
   - Delete `components/YouTubeLayer.tsx`
   - Delete `components/TapButton.tsx`

5. **Test**
   - Verify built-in songs work as default
   - Verify external source mode shows appropriate UI
   - Verify no runtime errors

## External Source Mode Behavior

When user selects "External Source":

- No audio is played by the app
- The visual metronome/ball still works based on default BPM or selected song's BPM
- Bottom area shows a message: "Play music from Spotify, Apple Music, or YouTube app"
- User can still use play/stop and recording features
