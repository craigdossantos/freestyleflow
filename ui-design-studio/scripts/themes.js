// FreestyleFlow UI Design Studio - Theme Definitions & Styling

const THEMES = {
    // ===== SKETCH (Current Design) =====
    'sketch': {
        name: 'Sketch (Current)',
        font: 'Permanent Marker',
        vibe: 'Hand-drawn, playful, artistic',
        inspiration: 'Current app design with hand-drawn aesthetic',
        colors: {
            bg: '#fffdf0',
            text: '#2c3e50',
            accent: '#e74c3c',
            cardBorder: '#2c3e50',
            cardBg: 'transparent',
            dimmed: 'rgba(44, 62, 80, 0.5)'
        },
        styles: {
            borderRadius: '4px',
            borderWidth: '2px'
        }
    },

    // ===== NEON ARCADE =====
    'neon': {
        name: 'Neon Arcade',
        font: 'Orbitron',
        vibe: 'Futuristic, glowing, electric',
        inspiration: 'Arcade games, cyberpunk aesthetics, Tron',
        colors: {
            bg: '#0a0a0a',
            text: '#00ff88',
            accent: '#ff00ff',
            cardBorder: '#00ff88',
            cardBg: 'rgba(0, 255, 136, 0.05)',
            dimmed: 'rgba(0, 255, 136, 0.4)',
            secondary: '#00ffff'
        },
        styles: {
            borderRadius: '0',
            borderWidth: '2px',
            glow: '0 0 20px'
        }
    },

    // ===== HIP-HOP GRAFFITI =====
    'hiphop': {
        name: 'Hip-Hop Graffiti',
        font: 'Bangers',
        vibe: 'Urban, bold, street culture',
        inspiration: 'Graffiti art, hip-hop culture, street style',
        colors: {
            bg: '#1a1a2e',
            text: '#ffffff',
            accent: '#ff2e63',
            cardBorder: '#ff2e63',
            cardBg: 'rgba(255, 46, 99, 0.1)',
            dimmed: 'rgba(255, 255, 255, 0.5)',
            secondary: '#08d9d6',
            tertiary: '#eeff00'
        },
        styles: {
            borderRadius: '8px',
            borderWidth: '3px'
        }
    },

    // ===== SPOTIFY DARK =====
    'spotify': {
        name: 'Spotify Dark',
        font: '-apple-system, BlinkMacSystemFont, sans-serif',
        vibe: 'Clean, professional, music-focused',
        inspiration: 'Spotify app design',
        colors: {
            bg: '#121212',
            text: '#ffffff',
            accent: '#1DB954',
            cardBorder: '#282828',
            cardBg: '#181818',
            dimmed: '#b3b3b3',
            secondary: '#535353'
        },
        styles: {
            borderRadius: '8px',
            borderWidth: '0'
        }
    },

    // ===== TIKTOK VIBE =====
    'tiktok': {
        name: 'TikTok Vibe',
        font: 'Fredoka',
        vibe: 'Trendy, young, social',
        inspiration: 'TikTok app UI, Gen-Z aesthetics',
        colors: {
            bg: '#000000',
            text: '#ffffff',
            accent: '#fe2c55',
            cardBorder: '#2f2f2f',
            cardBg: '#121212',
            dimmed: '#8a8a8a',
            secondary: '#25f4ee'
        },
        styles: {
            borderRadius: '12px',
            borderWidth: '1px'
        }
    },

    // ===== SOUNDCLOUD ORANGE =====
    'soundcloud': {
        name: 'SoundCloud',
        font: '-apple-system, BlinkMacSystemFont, sans-serif',
        vibe: 'Creative, music producer, indie',
        inspiration: 'SoundCloud app design',
        colors: {
            bg: '#f2f2f2',
            text: '#333333',
            accent: '#ff5500',
            cardBorder: '#e5e5e5',
            cardBg: '#ffffff',
            dimmed: '#999999',
            secondary: '#ff7700'
        },
        styles: {
            borderRadius: '4px',
            borderWidth: '1px'
        }
    },

    // ===== STREETWEAR =====
    'streetwear': {
        name: 'Streetwear',
        font: 'Bebas Neue',
        vibe: 'Bold, minimal, fashion-forward',
        inspiration: 'Supreme, Off-White, streetwear brands',
        colors: {
            bg: '#000000',
            text: '#ffffff',
            accent: '#ffffff',
            cardBorder: '#ffffff',
            cardBg: 'transparent',
            dimmed: '#666666',
            secondary: '#ff0000'
        },
        styles: {
            borderRadius: '0',
            borderWidth: '3px'
        }
    },

    // ===== RETRO 80s =====
    'retro': {
        name: 'Retro 80s',
        font: 'Press Start 2P',
        vibe: 'Nostalgic, synthwave, vaporwave',
        inspiration: '80s aesthetics, synthwave, retrowave',
        colors: {
            bg: '#2b1055',
            text: '#ffffff',
            accent: '#ff00ff',
            cardBorder: '#ff00ff',
            cardBg: 'rgba(0, 0, 0, 0.3)',
            dimmed: 'rgba(255, 255, 255, 0.6)',
            secondary: '#00ffff',
            tertiary: '#ffff00'
        },
        styles: {
            borderRadius: '0',
            borderWidth: '2px',
            glow: '0 0 30px'
        }
    },

    // ===== CYBERPUNK =====
    'cyber': {
        name: 'Cyberpunk',
        font: 'Audiowide',
        vibe: 'Futuristic, tech, edgy',
        inspiration: 'Cyberpunk 2077, Blade Runner',
        colors: {
            bg: '#0d0d0d',
            text: '#00f0ff',
            accent: '#ff003c',
            cardBorder: '#00f0ff',
            cardBg: 'rgba(0, 240, 255, 0.05)',
            dimmed: 'rgba(0, 240, 255, 0.5)',
            secondary: '#f0f000'
        },
        styles: {
            borderRadius: '2px',
            borderWidth: '2px',
            glow: '0 0 15px'
        }
    },

    // ===== BLING & GOLD =====
    'gold': {
        name: 'Bling & Gold',
        font: 'Righteous',
        vibe: 'Luxurious, flashy, prestigious',
        inspiration: 'Hip-hop jewelry, luxury brands',
        colors: {
            bg: '#1a1a1a',
            text: '#ffffff',
            accent: '#ffd700',
            cardBorder: '#ffd700',
            cardBg: 'rgba(255, 215, 0, 0.08)',
            dimmed: '#8b8000',
            secondary: '#c0c0c0'
        },
        styles: {
            borderRadius: '8px',
            borderWidth: '2px',
            glow: '0 0 20px rgba(255, 215, 0, 0.3)'
        }
    },

    // ===== PASTEL SOFT =====
    'pastel': {
        name: 'Pastel Soft',
        font: 'Fredoka',
        vibe: 'Gentle, friendly, approachable',
        inspiration: 'Headspace, Calm, wellness apps',
        colors: {
            bg: '#ffeef8',
            text: '#4a4a6a',
            accent: '#a855f7',
            cardBorder: '#e9d5ff',
            cardBg: '#ffffff',
            dimmed: '#9ca3af',
            secondary: '#34d399',
            tertiary: '#fbbf24'
        },
        styles: {
            borderRadius: '20px',
            borderWidth: '2px'
        }
    },

    // ===== FIRE & FLAME =====
    'fire': {
        name: 'Fire & Flame',
        font: 'Bungee',
        vibe: 'Intense, energetic, powerful',
        inspiration: 'Fire, heat, intensity',
        colors: {
            bg: '#1a0a00',
            text: '#ffffff',
            accent: '#ff4500',
            cardBorder: '#ff4500',
            cardBg: 'rgba(255, 69, 0, 0.15)',
            dimmed: '#ff8c00',
            secondary: '#ffd700'
        },
        styles: {
            borderRadius: '4px',
            borderWidth: '2px',
            glow: '0 0 30px rgba(255, 69, 0, 0.5)'
        }
    },

    // ===== OCEAN WAVE =====
    'ocean': {
        name: 'Ocean Wave',
        font: 'Russo One',
        vibe: 'Cool, calm, flowing',
        inspiration: 'Ocean, waves, depth',
        colors: {
            bg: '#0a192f',
            text: '#ccd6f6',
            accent: '#00d9ff',
            cardBorder: '#233554',
            cardBg: '#112240',
            dimmed: '#8892b0',
            secondary: '#64ffda'
        },
        styles: {
            borderRadius: '12px',
            borderWidth: '1px'
        }
    },

    // ===== MINIMAL CLEAN =====
    'minimal': {
        name: 'Minimal Clean',
        font: '-apple-system, BlinkMacSystemFont, sans-serif',
        vibe: 'Simple, elegant, focused',
        inspiration: 'Apple design, minimal interfaces',
        colors: {
            bg: '#ffffff',
            text: '#1a1a1a',
            accent: '#000000',
            cardBorder: '#e0e0e0',
            cardBg: '#f5f5f5',
            dimmed: '#757575'
        },
        styles: {
            borderRadius: '12px',
            borderWidth: '1px'
        }
    },

    // ===== ARCADE GAME =====
    'arcade': {
        name: 'Arcade Game',
        font: 'Press Start 2P',
        vibe: 'Retro gaming, pixel art, fun',
        inspiration: 'Classic arcade games, 8-bit era',
        colors: {
            bg: '#000033',
            text: '#ffffff',
            accent: '#ffff00',
            cardBorder: '#ffff00',
            cardBg: 'rgba(255, 255, 0, 0.05)',
            dimmed: '#9999ff',
            secondary: '#ff0000',
            tertiary: '#00ff00'
        },
        styles: {
            borderRadius: '0',
            borderWidth: '2px'
        }
    }
};

// Apply theme styles to a screen
function applyThemeToScreen(screenElement, themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    const colors = theme.colors;
    const styles = theme.styles;

    // Apply base styles
    screenElement.style.cssText = `
        background: ${colors.bg};
        color: ${colors.text};
        font-family: ${theme.font};
    `;

    // Status bar
    const statusBar = screenElement.querySelector('.status-bar');
    if (statusBar) {
        statusBar.style.color = colors.text;
    }

    // Titles
    screenElement.querySelectorAll('.mockup-title, .header-title').forEach(el => {
        el.style.color = colors.text;
    });

    // Labels
    screenElement.querySelectorAll('.mockup-label').forEach(el => {
        el.style.color = colors.dimmed;
    });

    // Buttons
    screenElement.querySelectorAll('.mockup-button, .header-btn, .scheme-btn, .back-btn').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg};
            border: ${styles.borderWidth} solid ${colors.cardBorder};
            border-radius: ${styles.borderRadius};
            color: ${colors.text};
            font-family: ${theme.font};
        `;
    });

    // Active buttons
    screenElement.querySelectorAll('.mockup-button.active, .scheme-btn.active, .header-btn.active').forEach(el => {
        el.style.cssText = `
            background: ${colors.accent};
            border: ${styles.borderWidth} solid ${colors.accent};
            border-radius: ${styles.borderRadius};
            color: ${colors.bg === '#000000' || colors.bg === '#0a0a0a' || colors.bg === '#121212' || colors.bg === '#1a1a1a' || colors.bg === '#0d0d0d' || colors.bg === '#1a1a2e' || colors.bg === '#2b1055' || colors.bg === '#000033' || colors.bg === '#0a192f' || colors.bg === '#1a0a00' ? '#000' : '#fff'};
            font-family: ${theme.font};
        `;
    });

    // Inputs
    screenElement.querySelectorAll('.mockup-input').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg};
            border: ${styles.borderWidth} solid ${colors.cardBorder};
            border-radius: ${styles.borderRadius};
            color: ${colors.text};
            font-family: ${theme.font};
        `;
    });

    // Toggle button
    screenElement.querySelectorAll('.toggle-btn').forEach(el => {
        const isActive = el.classList.contains('active');
        el.style.cssText = `
            background: ${isActive ? '#00FF00' : colors.cardBg};
            border: ${styles.borderWidth} solid ${isActive ? '#00FF00' : colors.cardBorder};
            border-radius: ${styles.borderRadius};
            color: ${isActive ? '#000' : colors.text};
            font-family: ${theme.font};
        `;
    });

    // Rhyme bricks
    screenElement.querySelectorAll('.rhyme-brick').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg};
            border: ${styles.borderWidth} solid ${colors.cardBorder};
            border-radius: ${styles.borderRadius};
            color: ${colors.text};
            font-family: ${theme.font};
            ${styles.glow ? `box-shadow: ${styles.glow} ${colors.cardBorder};` : ''}
        `;
    });

    // Metronome ball
    screenElement.querySelectorAll('.metronome-ball').forEach(el => {
        el.style.cssText = `
            background: ${colors.accent};
            ${styles.glow ? `box-shadow: ${styles.glow} ${colors.accent};` : ''}
        `;
    });

    // Bottom panel
    screenElement.querySelectorAll('.bottom-panel').forEach(el => {
        el.style.cssText = `
            border-top: ${styles.borderWidth} solid ${colors.cardBorder};
            background: ${colors.cardBg || colors.bg};
        `;
    });

    // YouTube mock
    screenElement.querySelectorAll('.youtube-mock').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg || 'rgba(0,0,0,0.3)'};
            color: ${colors.dimmed};
        `;
    });

    // Song list (dark background)
    screenElement.querySelectorAll('.song-list').forEach(el => {
        el.style.background = '#000';
    });

    // Song items
    screenElement.querySelectorAll('.song-item').forEach(el => {
        const isActive = el.classList.contains('active');
        el.style.cssText = `
            border-bottom: 1px solid #333;
            ${isActive ? `background: ${colors.accent}20; border: 1px solid ${colors.accent}; border-radius: ${styles.borderRadius};` : ''}
        `;
    });

    screenElement.querySelectorAll('.song-title').forEach(el => {
        const isActive = el.closest('.song-item')?.classList.contains('active');
        el.style.color = isActive ? colors.accent : '#fff';
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.song-meta').forEach(el => {
        el.style.color = '#888';
        el.style.fontFamily = theme.font;
    });

    // Tap button
    screenElement.querySelectorAll('.tap-button').forEach(el => {
        el.style.cssText = `
            background: ${colors.bg};
            border: ${styles.borderWidth} solid ${colors.accent};
            color: ${colors.text};
            font-family: ${theme.font};
            ${styles.glow ? `box-shadow: ${styles.glow} ${colors.accent};` : ''}
        `;
    });

    screenElement.querySelectorAll('.tap-bpm').forEach(el => {
        el.style.color = colors.text;
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.tap-label').forEach(el => {
        el.style.color = colors.dimmed;
        el.style.fontFamily = theme.font;
    });

    // Play button
    screenElement.querySelectorAll('.play-btn').forEach(el => {
        const isActive = el.classList.contains('active');
        el.style.cssText = `
            background: ${isActive ? 'rgba(255, 170, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)'};
            border: ${styles.borderWidth} solid ${isActive ? '#FFAA00' : '#00FF00'};
            border-radius: ${styles.borderRadius};
            color: ${colors.text};
            font-family: ${theme.font};
        `;
    });

    // Record button
    screenElement.querySelectorAll('.record-btn').forEach(el => {
        const isRecording = el.classList.contains('recording');
        el.style.cssText = `
            background: ${isRecording ? '#FF0000' : 'rgba(255, 0, 0, 0.1)'};
            border: ${styles.borderWidth} solid #FF0000;
            border-radius: ${styles.borderRadius};
            color: ${isRecording ? '#fff' : colors.text};
            font-family: ${theme.font};
        `;
    });

    // Camera view
    screenElement.querySelectorAll('.camera-view').forEach(el => {
        el.style.background = 'linear-gradient(135deg, #333 0%, #111 100%)';
    });

    screenElement.querySelectorAll('.camera-overlay').forEach(el => {
        el.style.cssText = `
            background: #FF0000;
            color: #fff;
            font-family: ${theme.font};
        `;
    });

    // Stats
    screenElement.querySelectorAll('.stat-box').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg};
            border: ${styles.borderWidth} solid ${colors.cardBorder};
            border-radius: ${styles.borderRadius};
        `;
    });

    screenElement.querySelectorAll('.stat-value').forEach(el => {
        el.style.color = colors.accent;
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.stat-label').forEach(el => {
        el.style.color = colors.dimmed;
        el.style.fontFamily = theme.font;
    });

    // Action cards
    screenElement.querySelectorAll('.action-card').forEach(el => {
        const isAccent = el.classList.contains('accent');
        el.style.cssText = `
            background: ${colors.cardBg};
            border: ${styles.borderWidth} solid ${isAccent ? colors.accent : colors.cardBorder};
            border-radius: ${styles.borderRadius};
        `;
    });

    screenElement.querySelectorAll('.action-title').forEach(el => {
        el.style.color = colors.text;
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.action-subtitle').forEach(el => {
        el.style.color = colors.dimmed;
        el.style.fontFamily = theme.font;
    });

    // Slider
    screenElement.querySelectorAll('.slider-track').forEach(el => {
        el.style.background = colors.cardBorder;
    });

    screenElement.querySelectorAll('.slider-fill').forEach(el => {
        el.style.background = colors.accent;
    });

    screenElement.querySelectorAll('.slider-thumb').forEach(el => {
        el.style.background = colors.accent;
        if (styles.glow) {
            el.style.boxShadow = `${styles.glow} ${colors.accent}`;
        }
    });

    // Family list
    screenElement.querySelectorAll('.family-item').forEach(el => {
        const isSeen = el.classList.contains('seen');
        const isSelected = el.classList.contains('selected');
        el.style.cssText = `
            background: ${isSelected ? colors.accent : colors.cardBg};
            border: ${styles.borderWidth} ${isSeen && !isSelected ? 'dashed' : 'solid'} ${isSelected ? colors.accent : (isSeen ? colors.accent : colors.cardBorder)};
            border-radius: ${styles.borderRadius};
        `;
    });

    screenElement.querySelectorAll('.family-label').forEach(el => {
        const isSelected = el.closest('.family-item')?.classList.contains('selected');
        el.style.color = isSelected ? '#fff' : colors.text;
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.family-examples').forEach(el => {
        const isSelected = el.closest('.family-item')?.classList.contains('selected');
        el.style.color = isSelected ? 'rgba(255,255,255,0.7)' : colors.dimmed;
        el.style.fontFamily = theme.font;
    });

    screenElement.querySelectorAll('.family-badge').forEach(el => {
        el.style.cssText = `
            background: ${colors.cardBg};
            border: 1px solid ${colors.cardBorder};
            color: ${colors.dimmed};
            font-family: ${theme.font};
        `;
    });

    // Start button
    screenElement.querySelectorAll('.start-button').forEach(el => {
        el.style.cssText = `
            background: ${colors.accent};
            color: #fff;
            border-radius: ${styles.borderRadius};
            font-family: ${theme.font};
            ${styles.glow ? `box-shadow: ${styles.glow} ${colors.accent};` : ''}
        `;
    });
}

// Get theme list for select dropdowns
function getThemeOptions() {
    return Object.entries(THEMES).map(([key, theme]) => ({
        value: key,
        label: theme.name
    }));
}
