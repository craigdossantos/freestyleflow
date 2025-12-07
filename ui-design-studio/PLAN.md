# FreestyleFlow UI Design Studio

## Quick Start

Open the studio in your browser:

```bash
cd /Users/craigdossantos/Coding/freestyleflow/ui-design-studio

# Option 1: Python (most systems have this)
python3 -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: Just open directly (may have CORS issues)
open index.html
```

Then visit: **http://localhost:8080**

---

## Features

### 5 Screen Mockups (Based on your actual code)
1. **Menu** - Music source, rhyme scheme, imperfect toggle
2. **Gameboard (YouTube)** - Main game with YouTube player
3. **Gameboard (Songs)** - Main game with built-in song selector
4. **Mastery** - Rhyme family progress and selection
5. **Record Mode** - Camera view with compact game overlay

### 15 Theme Variations

| Theme | Style | Font | Inspiration |
|-------|-------|------|-------------|
| **Sketch** | Current design | Permanent Marker | Hand-drawn aesthetic |
| **Neon** | Dark + glow | Orbitron | Arcade games, Tron |
| **Hip-Hop** | Urban, bold | Bangers | Graffiti, street culture |
| **Spotify** | Dark, clean | System | Spotify app |
| **TikTok** | Trendy, social | Fredoka | TikTok app |
| **SoundCloud** | Light, orange | System | SoundCloud |
| **Streetwear** | Bold, minimal | Bebas Neue | Supreme, Off-White |
| **Retro** | Synthwave | Press Start 2P | 80s aesthetics |
| **Cyber** | Futuristic | Audiowide | Cyberpunk 2077 |
| **Gold** | Luxurious | Righteous | Hip-hop jewelry |
| **Pastel** | Soft, friendly | Fredoka | Wellness apps |
| **Fire** | Intense | Bungee | Energy, flames |
| **Ocean** | Cool, calm | Russo One | Waves, depth |
| **Minimal** | Clean, simple | System | Apple design |
| **Arcade** | Retro gaming | Press Start 2P | 8-bit games |

### Interactive Tools

- **Select Tool** - Click elements to see info
- **Note Tool** - Add feedback notes anywhere on screen
- **Compare Tool** - Side-by-side theme comparison
- **Export** - Save your preferences as JSON

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Switch screens |
| `←/→` | Cycle themes |
| `N` | Add note mode |
| `C` | Compare view |
| `R` | Reset |
| `Esc` | Close/cancel |

---

## File Structure

```
ui-design-studio/
├── index.html           # Main studio page
├── styles/
│   ├── base.css        # Studio layout
│   ├── themes.css      # All 15 themes + mockup styles
│   └── editor.css      # Modal, notes, interactions
├── scripts/
│   ├── screens.js      # HTML mockups of each screen
│   ├── themes.js       # Theme definitions & styling
│   └── app.js          # Main application logic
└── PLAN.md             # This file
```

---

## How to Use

1. **Browse Screens** - Click screen buttons or press 1-5
2. **Try Themes** - Click swatches or use arrow keys
3. **Add Notes** - Press N, click on screen, type feedback
4. **Compare** - Press C to see two themes side-by-side
5. **Export** - Click Export to save your preferences

---

## Next Steps

Once you pick your favorite theme(s), I can:

1. **Update the React Native theme** - Convert CSS to StyleSheet
2. **Change fonts** - Add new Google Font to the app
3. **Adjust colors** - Update `constants/theme.ts`
4. **Modify layouts** - Restructure components as needed

---

## Notes

- Mockups are HTML/CSS representations based on your actual React Native code
- Colors, fonts, and layouts match exactly what you have
- Some interactions (drag-drop) are simplified for preview purposes
- The final implementation will maintain React Native best practices
