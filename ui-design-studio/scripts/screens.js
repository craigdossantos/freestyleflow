// FreestyleFlow UI Design Studio - Screen Mockups
// Based on actual React Native component code

const SCREENS = {
    // ===== MENU SCREEN =====
    'menu': `
        <div class="mockup-screen" data-screen="menu">
            <div class="status-bar">
                <span>9:41</span>
                <span>100%</span>
            </div>

            <div class="scroll-content">
                <h1 class="mockup-title" data-selectable>MENU</h1>

                <div class="mockup-section" data-selectable>
                    <div class="mockup-label">MUSIC SOURCE</div>
                    <div class="mockup-button-row">
                        <button class="mockup-button active" data-selectable style="flex: 1;">YOUTUBE</button>
                        <button class="mockup-button" data-selectable style="flex: 1;">BUILT-IN SONGS</button>
                    </div>
                </div>

                <div class="mockup-section" data-selectable>
                    <div class="mockup-label">Select Background Video</div>
                    <input class="mockup-input" type="text" placeholder="Paste YouTube URL or Video ID" data-selectable>
                    <button class="mockup-button" data-selectable>LOAD VIDEO</button>
                </div>

                <div class="mockup-section" data-selectable>
                    <button class="toggle-btn active" data-selectable style="width: 100%; margin-bottom: 12px;">
                        IMPERFECT RHYMES: ON
                    </button>

                    <div class="mockup-label">RHYME SCHEME</div>
                    <div class="scheme-selector">
                        <button class="scheme-btn" data-selectable>AABB</button>
                        <button class="scheme-btn active" data-selectable>AAAA</button>
                        <button class="scheme-btn" data-selectable>ABAB</button>
                        <button class="scheme-btn" data-selectable>AXBX</button>
                        <button class="scheme-btn" data-selectable>XAXB</button>
                    </div>

                    <button class="mockup-button" data-selectable>RHYMING DICTIONARY</button>
                </div>

                <button class="mockup-button" data-selectable style="margin-top: 20px;">BACK TO GAME</button>
            </div>
        </div>
    `,

    // ===== GAMEBOARD WITH YOUTUBE =====
    'gameboard-yt': `
        <div class="mockup-screen" data-screen="gameboard-yt">
            <div class="status-bar">
                <span>9:41</span>
                <span>100%</span>
            </div>

            <div class="header-bar" data-selectable>
                <div class="header-left">
                    <button class="header-btn" data-selectable>☰ MENU</button>
                    <button class="header-btn" data-selectable>○ CAMERA</button>
                </div>
                <div class="header-right">
                    <button class="play-btn" data-selectable>PLAY</button>
                </div>
            </div>

            <div class="content-area">
                <div class="rhyme-grid" data-selectable>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>FLOW</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>SHOW</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>KNOW</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>GO</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                </div>
                <div class="metronome-ball" data-selectable></div>
            </div>

            <div class="bottom-panel" data-selectable>
                <div class="youtube-mock">▶</div>
                <div class="tap-button" data-selectable data-draggable>
                    <span class="tap-bpm">90</span>
                    <span class="tap-label">TAP</span>
                </div>
            </div>
        </div>
    `,

    // ===== GAMEBOARD WITH LOCAL SONGS =====
    'gameboard-local': `
        <div class="mockup-screen" data-screen="gameboard-local">
            <div class="status-bar">
                <span>9:41</span>
                <span>100%</span>
            </div>

            <div class="header-bar" data-selectable>
                <div class="header-left">
                    <button class="header-btn" data-selectable>☰ MENU</button>
                    <button class="header-btn" data-selectable>○ CAMERA</button>
                </div>
                <div class="header-right">
                    <button class="play-btn" data-selectable>PLAY</button>
                </div>
            </div>

            <div class="content-area">
                <div class="rhyme-grid" data-selectable>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>BEAT</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>STREET</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>HEAT</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                        <div class="rhyme-brick active" data-selectable>FEET</div>
                        <div class="rhyme-brick inactive" data-selectable></div>
                    </div>
                </div>
                <div class="metronome-ball" data-selectable></div>
            </div>

            <div class="bottom-panel" data-selectable style="background: #000;">
                <div class="song-list">
                    <div class="mockup-label" style="color: #666; padding: 0 0 8px 0;">SELECT TRACK</div>
                    <div class="song-item active" data-selectable>
                        <div class="song-title">Are We Cooked</div>
                        <div class="song-meta">96 BPM • Start: 20.1s</div>
                    </div>
                    <div class="song-item" data-selectable>
                        <div class="song-title">Beep Boo Boo Bop</div>
                        <div class="song-meta">140 BPM • Start: 13.9s</div>
                    </div>
                    <div class="song-item" data-selectable>
                        <div class="song-title">Bop Squad</div>
                        <div class="song-meta">87.5 BPM • Start: 11.4s</div>
                    </div>
                    <div class="song-item" data-selectable>
                        <div class="song-title">Chillaxin</div>
                        <div class="song-meta">91.4 BPM • Start: 21s</div>
                    </div>
                </div>
                <div class="tap-button" data-selectable data-draggable>
                    <span class="tap-bpm">96</span>
                    <span class="tap-label">TAP</span>
                </div>
            </div>
        </div>
    `,

    // ===== MASTERY / PROGRESS SCREEN =====
    'mastery': `
        <div class="mockup-screen" data-screen="mastery">
            <div class="status-bar">
                <span>9:41</span>
                <span>100%</span>
            </div>

            <div class="header-bar" data-selectable>
                <button class="back-btn" data-selectable>← BACK</button>
                <span class="header-title" data-selectable>RHYME MASTERY</span>
                <span style="width: 60px;"></span>
            </div>

            <div class="scroll-content" style="padding-top: 0;">
                <div class="stats-row" data-selectable>
                    <div class="stat-box" data-selectable>
                        <div class="stat-value">24 / 156</div>
                        <div class="stat-label">Families Seen</div>
                    </div>
                    <div class="stat-box" data-selectable>
                        <div class="stat-value">87</div>
                        <div class="stat-label">Total Practices</div>
                    </div>
                </div>

                <div class="action-card" data-selectable>
                    <div class="action-title">PLAY NEW FAMILY</div>
                    <div class="action-subtitle">Find something you haven't seen</div>
                </div>

                <div class="action-card accent" data-selectable>
                    <div class="action-title">PRACTICE WEAKEST</div>
                    <div class="action-subtitle">Improve your least played rhymes</div>
                </div>

                <div class="slider-section" data-selectable>
                    <div class="mockup-label">MASTERY LEVEL: 60%</div>
                    <div class="slider-description" style="font-size: 11px; opacity: 0.6; margin-bottom: 8px;">60% chance to use selected family</div>
                    <div class="slider-track">
                        <div class="slider-fill"></div>
                        <div class="slider-thumb"></div>
                    </div>
                </div>

                <div class="mockup-label">ALL FAMILIES (1-SYLLABLE)</div>
                <div class="family-list" data-selectable>
                    <div class="family-item seen" data-selectable>
                        <div>
                            <div class="family-label">-ACK</div>
                            <div class="family-examples">back, black, crack, hack...</div>
                        </div>
                        <span class="family-badge">12 plays</span>
                    </div>
                    <div class="family-item" data-selectable>
                        <div>
                            <div class="family-label">-ADE</div>
                            <div class="family-examples">fade, made, shade, trade...</div>
                        </div>
                        <span class="family-badge">0 plays</span>
                    </div>
                    <div class="family-item selected" data-selectable>
                        <div>
                            <div class="family-label">-AKE</div>
                            <div class="family-examples">break, fake, make, take...</div>
                        </div>
                        <span class="family-badge">5 plays</span>
                    </div>
                    <div class="family-item seen" data-selectable>
                        <div>
                            <div class="family-label">-ALL</div>
                            <div class="family-examples">ball, call, fall, hall...</div>
                        </div>
                        <span class="family-badge">8 plays</span>
                    </div>
                    <div class="family-item" data-selectable>
                        <div>
                            <div class="family-label">-AME</div>
                            <div class="family-examples">came, fame, game, name...</div>
                        </div>
                        <span class="family-badge">0 plays</span>
                    </div>
                </div>
            </div>

            <div class="fixed-bottom" data-selectable>
                <button class="start-button" data-selectable>START PRACTICE (1)</button>
            </div>
        </div>
    `,

    // ===== RECORD MODE WITH CAMERA =====
    'record': `
        <div class="mockup-screen" data-screen="record">
            <div class="status-bar">
                <span>9:41</span>
                <span>100%</span>
            </div>

            <div class="header-bar" data-selectable>
                <div class="header-left">
                    <button class="header-btn" data-selectable>☰ MENU</button>
                    <button class="header-btn active" data-selectable>📷 CAMERA</button>
                </div>
                <div class="header-right">
                    <button class="play-btn active" data-selectable>STOP</button>
                    <button class="record-btn recording" data-selectable>■ STOP</button>
                </div>
            </div>

            <div class="camera-view" data-selectable>
                <span class="camera-icon">📷</span>
                <div class="camera-overlay recording">● REC 0:12</div>
            </div>

            <div class="bottom-panel" data-selectable>
                <div class="rhyme-grid compact" data-selectable style="padding-top: 12px;">
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick active small" data-selectable>FIRE</div>
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick inactive small"></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick active small" data-selectable>HIGHER</div>
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick inactive small"></div>
                    </div>
                    <div class="rhyme-row">
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick active small" data-selectable>DESIRE</div>
                        <div class="rhyme-brick inactive small"></div>
                        <div class="rhyme-brick inactive small"></div>
                    </div>
                </div>
                <div class="metronome-ball" data-selectable></div>
                <div class="tap-button" data-selectable data-draggable>
                    <span class="tap-bpm">96</span>
                    <span class="tap-label">TAP</span>
                </div>
            </div>
        </div>
    `
};

// Screen titles for display
const SCREEN_TITLES = {
    'menu': 'Menu',
    'gameboard-yt': 'Game (YouTube)',
    'gameboard-local': 'Game (Songs)',
    'mastery': 'Mastery',
    'record': 'Record Mode'
};
