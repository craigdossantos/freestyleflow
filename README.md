# FreestyleFlow

A mobile practice tool that helps rappers improve their freestyle improvisation skills. The app provides a visual rhyming cue system synchronized to music via a manual "Tap Tempo" engine, with a bouncing ball metronome that guides your flow.

## Features

### Core Gameplay
- **Visual Metronome** - A bouncing ball moves across 4 rows of beat markers (16 beats total), helping you stay on rhythm
- **Rhyme Grid** - Displays rhyming words synchronized to beats, showing you target rhymes to hit
- **Tap Tempo** - Tap 4 times to set the BPM and sync the metronome to any beat
- **Rhyme Schemes** - Supports AABB, ABAB, and AAAA patterns

### Game Modes
| Mode | Description |
|------|-------------|
| Fully Filled | All rhymes visible - standard practice |
| Setup Punchline | Setup hidden, punchline shown - invent your setup |
| Off The Cliff | Setup shown, punchline hidden - land your own rhyme |
| No Words | Pure structure practice with no word prompts |

### Music Options
- **Local Music** - 4 built-in instrumental tracks (boom bap style)
- **YouTube** - Paste any YouTube link to practice over your favorite beats

### Recording & Camera
- **Screen Recording** - Record your practice sessions with audio
- **Camera Overlay** - Show yourself while recording
- **GL Shader Filters** - Apply visual effects (Cartoon, Pastel, Noir, Chrome, Thermal)
- **Volume Control** - Adjust music volume for better recording balance

### Additional Features
- **Rhyme Dictionary** - Browse the rhyme database by family
- **Progress Tracking** - Track your mastery of different rhyme families
- **84MB Rhyme Database** - Extensive collection of rhyming words

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Animation**: react-native-reanimated (for 60fps ball physics)
- **State Management**: Zustand
- **Recording**: react-native-nitro-screen-recorder
- **Camera Effects**: expo-gl (OpenGL shaders)
- **Video**: react-native-youtube-iframe
- **Navigation**: expo-router

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode 15+ and CocoaPods
- For Android: Android Studio with SDK 34+

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd freestyleflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS pods (iOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

**Development build required** - This app uses native modules (camera, screen recording, GL) and cannot run in Expo Go.

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Web (limited functionality)
```bash
npm run web
```

### First Run

1. Launch the app - you'll see the main menu
2. Select **Camera Mode** or **YouTube Mode**
3. If using Camera Mode, grant camera and microphone permissions
4. Tap the **TAP** button 4 times in rhythm with the beat
5. The metronome ball will start bouncing - freestyle along with the rhymes!

## Project Structure

```
freestyleflow/
├── app/                    # Screens (expo-router)
│   ├── index.tsx          # Main game screen
│   ├── menu.tsx           # Mode selection menu
│   ├── dictionary.tsx     # Rhyme dictionary browser
│   └── progress.tsx       # Progress tracking
├── components/
│   ├── MetronomeBall.tsx  # Animated bouncing ball
│   ├── RhymeGrid.tsx      # 4-row rhyme display
│   ├── TapButton.tsx      # Tap tempo input
│   ├── CameraLayer.tsx    # Camera preview
│   ├── GLCameraLayer.tsx  # Camera with shader effects
│   ├── LocalMusicLayer.tsx# Local audio player
│   └── YouTubeLayer.tsx   # YouTube embed
├── music/                  # Built-in instrumental tracks
├── store.ts               # Zustand global state
└── rhymes.db              # SQLite rhyme database
```

## Permissions

The app requires the following permissions:
- **Camera** - For recording yourself while practicing
- **Microphone** - For recording audio
- **Media Library** - For saving recorded videos

## Known Limitations

- Web version has limited functionality (no camera, no screen recording)
- YouTube mode requires internet connection
- Screen recording may have slight audio sync variations on some devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not yet licensed for public distribution.
