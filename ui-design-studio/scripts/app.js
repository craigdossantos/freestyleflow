// FreestyleFlow UI Design Studio - Main Application

// State
let currentScreen = 'menu';
let currentTheme = 'sketch';
let currentTool = 'select';
let selectedElement = null;
let notes = [];
let noteIdCounter = 0;
let noteCategory = 'idea';
let isCompareMode = false;
let compareThemeA = 'sketch';
let compareThemeB = 'neon';

// DOM Elements
const phoneScreen = document.getElementById('phoneScreen');
const notesList = document.getElementById('notesList');
const noteModal = document.getElementById('noteModal');
const noteText = document.getElementById('noteText');
const comparisonView = document.getElementById('comparisonView');
const compareScreenA = document.getElementById('compareScreenA');
const compareScreenB = document.getElementById('compareScreenB');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initScreenButtons();
    initThemeButtons();
    initToolButtons();
    initNoteModal();
    initNavButtons();
    initActionButtons();
    initKeyboardShortcuts();
    initCompareDropdowns();

    // Load initial screen
    loadScreen(currentScreen);
    applyTheme(currentTheme);
    updateThemeInfo(currentTheme);
});

// Screen Navigation
function initScreenButtons() {
    document.querySelectorAll('.screen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            setActiveButton('.screen-btn', btn);
            loadScreen(screen);
            document.querySelector('.current-screen').textContent = SCREEN_TITLES[screen];
        });
    });
}

function loadScreen(screenName) {
    currentScreen = screenName;
    const html = SCREENS[screenName];
    if (html) {
        phoneScreen.innerHTML = html;
        applyTheme(currentTheme);
        initSelectableElements();
        renderNoteMarkers();
    }
}

// Theme System
function initThemeButtons() {
    document.querySelectorAll('.theme-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setActiveButton('.theme-swatch', btn);
            applyTheme(theme);
            updateThemeInfo(theme);
        });
    });
}

function applyTheme(themeName) {
    currentTheme = themeName;
    const screenElement = phoneScreen.querySelector('.mockup-screen');
    if (screenElement) {
        applyThemeToScreen(screenElement, themeName);
        phoneScreen.classList.add('transitioning');
        setTimeout(() => phoneScreen.classList.remove('transitioning'), 300);
    }
    document.querySelector('.current-theme').textContent = THEMES[themeName]?.name + ' Theme';
}

function updateThemeInfo(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    document.getElementById('themeName').textContent = theme.name;
    document.getElementById('themeFont').textContent = theme.font.split(',')[0].replace(/'/g, '');
    document.getElementById('themeVibe').textContent = theme.vibe;
    document.getElementById('inspirations').innerHTML = `<p>${theme.inspiration}</p>`;

    // Update color palette
    const palette = document.getElementById('colorPalette');
    const colors = theme.colors;
    palette.innerHTML = `
        <div class="color-chip" style="background: ${colors.bg}" title="Background"></div>
        <div class="color-chip" style="background: ${colors.text}" title="Text"></div>
        <div class="color-chip" style="background: ${colors.accent}" title="Accent"></div>
        <div class="color-chip" style="background: ${colors.cardBorder}" title="Border"></div>
        ${colors.secondary ? `<div class="color-chip" style="background: ${colors.secondary}" title="Secondary"></div>` : ''}
        ${colors.tertiary ? `<div class="color-chip" style="background: ${colors.tertiary}" title="Tertiary"></div>` : ''}
    `;
}

// Theme Navigation
function initNavButtons() {
    const themeKeys = Object.keys(THEMES);

    document.getElementById('prevTheme').addEventListener('click', () => {
        const currentIndex = themeKeys.indexOf(currentTheme);
        const prevIndex = (currentIndex - 1 + themeKeys.length) % themeKeys.length;
        const prevTheme = themeKeys[prevIndex];

        setActiveButton('.theme-swatch', document.querySelector(`[data-theme="${prevTheme}"]`));
        applyTheme(prevTheme);
        updateThemeInfo(prevTheme);
    });

    document.getElementById('nextTheme').addEventListener('click', () => {
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];

        setActiveButton('.theme-swatch', document.querySelector(`[data-theme="${nextTheme}"]`));
        applyTheme(nextTheme);
        updateThemeInfo(nextTheme);
    });
}

// Tool System
function initToolButtons() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;

            if (tool === 'compare') {
                toggleCompareMode();
                return;
            }

            setActiveButton('.tool-btn', btn);
            currentTool = tool;

            // Update cursor based on tool
            phoneScreen.style.cursor = tool === 'move' ? 'move' : 'default';
        });
    });
}

// Selectable Elements
function initSelectableElements() {
    phoneScreen.querySelectorAll('[data-selectable]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentTool === 'note') {
                openNoteModal(e);
                return;
            }

            if (currentTool === 'select') {
                selectElement(el);
            }
        });
    });

    // Click on screen background to deselect
    phoneScreen.addEventListener('click', (e) => {
        if (e.target === phoneScreen || e.target.classList.contains('mockup-screen')) {
            if (currentTool === 'note') {
                openNoteModal(e);
            } else {
                deselectElement();
            }
        }
    });
}

function selectElement(el) {
    deselectElement();
    el.classList.add('selected');
    selectedElement = el;

    // Show element info
    showElementInfo(el);
}

function deselectElement() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
    hideElementInfo();
}

function showElementInfo(el) {
    // Remove existing info
    hideElementInfo();

    const info = document.createElement('div');
    info.className = 'element-info';
    info.id = 'elementInfo';

    const tagName = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).filter(c => c !== 'selected').join(', ') || 'none';
    const text = el.textContent?.trim().substring(0, 30) || 'empty';

    info.innerHTML = `
        <span><span class="info-label">Element:</span> <span class="info-value">${tagName}</span></span>
        <span><span class="info-label">Classes:</span> <span class="info-value">${classes}</span></span>
        <span><span class="info-label">Content:</span> <span class="info-value">${text}${text.length >= 30 ? '...' : ''}</span></span>
    `;

    document.body.appendChild(info);
}

function hideElementInfo() {
    const existing = document.getElementById('elementInfo');
    if (existing) existing.remove();
}

// Notes System
function initNoteModal() {
    // Category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            noteCategory = btn.dataset.cat;
        });
    });

    // Cancel button
    document.getElementById('cancelNote').addEventListener('click', closeNoteModal);

    // Save button
    document.getElementById('saveNote').addEventListener('click', saveNote);

    // Clear notes button
    document.querySelector('.clear-notes-btn').addEventListener('click', clearNotes);
}

let pendingNotePosition = { x: 0, y: 0 };

function openNoteModal(e) {
    const rect = phoneScreen.getBoundingClientRect();
    pendingNotePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    noteModal.style.display = 'flex';
    noteText.value = '';
    noteText.focus();

    // Reset category selection
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.cat-btn.idea').classList.add('active');
    noteCategory = 'idea';
}

function closeNoteModal() {
    noteModal.style.display = 'none';
}

function saveNote() {
    const text = noteText.value.trim();
    if (!text) {
        closeNoteModal();
        return;
    }

    const note = {
        id: ++noteIdCounter,
        text: text,
        category: noteCategory,
        screen: currentScreen,
        theme: currentTheme,
        position: { ...pendingNotePosition },
        timestamp: new Date().toLocaleTimeString()
    };

    notes.push(note);
    renderNotesList();
    renderNoteMarkers();
    closeNoteModal();
}

function renderNotesList() {
    if (notes.length === 0) {
        notesList.innerHTML = '<p class="no-notes">Click "Add Note" then click on the screen to add feedback</p>';
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <div class="note-item ${note.category}" data-note-id="${note.id}">
            <div>${note.text}</div>
            <div class="note-meta">${SCREEN_TITLES[note.screen]} • ${THEMES[note.theme]?.name} • ${note.timestamp}</div>
        </div>
    `).join('');

    // Click to highlight note on screen
    notesList.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => {
            const noteId = parseInt(item.dataset.noteId);
            const note = notes.find(n => n.id === noteId);
            if (note && note.screen === currentScreen) {
                highlightNoteMarker(noteId);
            }
        });
    });
}

function renderNoteMarkers() {
    // Remove existing markers
    phoneScreen.querySelectorAll('.note-marker').forEach(m => m.remove());

    // Add markers for notes on current screen
    const screenNotes = notes.filter(n => n.screen === currentScreen);
    screenNotes.forEach((note, index) => {
        const marker = document.createElement('div');
        marker.className = `note-marker ${note.category}`;
        marker.dataset.noteId = note.id;
        marker.textContent = index + 1;
        marker.style.left = `${note.position.x}px`;
        marker.style.top = `${note.position.y}px`;

        marker.addEventListener('mouseenter', () => showNoteTooltip(note, marker));
        marker.addEventListener('mouseleave', hideNoteTooltip);
        marker.addEventListener('click', () => {
            // Delete on double-click? Or scroll to note in list
            highlightNoteInList(note.id);
        });

        phoneScreen.appendChild(marker);
    });
}

function showNoteTooltip(note, marker) {
    hideNoteTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'note-tooltip';
    tooltip.id = 'noteTooltip';
    tooltip.textContent = note.text;

    const rect = marker.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;

    document.body.appendChild(tooltip);
}

function hideNoteTooltip() {
    const existing = document.getElementById('noteTooltip');
    if (existing) existing.remove();
}

function highlightNoteMarker(noteId) {
    const marker = phoneScreen.querySelector(`[data-note-id="${noteId}"]`);
    if (marker) {
        marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
        setTimeout(() => {
            marker.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 500);
    }
}

function highlightNoteInList(noteId) {
    const item = notesList.querySelector(`[data-note-id="${noteId}"]`);
    if (item) {
        item.style.background = 'rgba(99, 102, 241, 0.3)';
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => {
            item.style.background = '';
        }, 1000);
    }
}

function clearNotes() {
    if (notes.length === 0) return;
    if (confirm('Clear all notes?')) {
        notes = [];
        renderNotesList();
        renderNoteMarkers();
    }
}

// Compare Mode
function toggleCompareMode() {
    isCompareMode = !isCompareMode;

    const compareBtn = document.querySelector('[data-tool="compare"]');
    compareBtn.classList.toggle('active', isCompareMode);

    const phoneContainer = document.querySelector('.phone-container');

    if (isCompareMode) {
        phoneContainer.style.display = 'none';
        comparisonView.style.display = 'flex';
        loadCompareScreens();
    } else {
        phoneContainer.style.display = 'flex';
        comparisonView.style.display = 'none';
    }
}

function initCompareDropdowns() {
    const selectA = document.getElementById('compareThemeA');
    const selectB = document.getElementById('compareThemeB');

    const options = getThemeOptions();

    options.forEach(opt => {
        selectA.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
        selectB.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
    });

    selectA.value = 'sketch';
    selectB.value = 'neon';

    selectA.addEventListener('change', () => {
        compareThemeA = selectA.value;
        loadCompareScreens();
    });

    selectB.addEventListener('change', () => {
        compareThemeB = selectB.value;
        loadCompareScreens();
    });
}

function loadCompareScreens() {
    const html = SCREENS[currentScreen];

    compareScreenA.innerHTML = html;
    compareScreenB.innerHTML = html;

    applyThemeToScreen(compareScreenA.querySelector('.mockup-screen'), compareThemeA);
    applyThemeToScreen(compareScreenB.querySelector('.mockup-screen'), compareThemeB);
}

// Action Buttons
function initActionButtons() {
    document.getElementById('exportBtn').addEventListener('click', exportConfig);
    document.getElementById('resetBtn').addEventListener('click', resetLayout);
}

function exportConfig() {
    const config = {
        exportDate: new Date().toISOString(),
        preferredTheme: currentTheme,
        themeDetails: THEMES[currentTheme],
        notes: notes,
        screens: Object.keys(SCREENS)
    };

    const preview = document.createElement('div');
    preview.className = 'export-preview';
    preview.innerHTML = `
        <h2>Export Configuration</h2>
        <pre>${JSON.stringify(config, null, 2)}</pre>
        <button class="close-btn" onclick="this.parentElement.remove()">Close</button>
        <button class="close-btn" style="margin-left: 10px;" onclick="copyExport()">Copy to Clipboard</button>
    `;
    document.body.appendChild(preview);

    window.copyExport = () => {
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        alert('Copied to clipboard!');
    };
}

function resetLayout() {
    if (confirm('Reset all selections and notes?')) {
        notes = [];
        currentTheme = 'sketch';
        currentScreen = 'menu';

        setActiveButton('.screen-btn', document.querySelector('[data-screen="menu"]'));
        setActiveButton('.theme-swatch', document.querySelector('[data-theme="sketch"]'));

        loadScreen('menu');
        applyTheme('sketch');
        updateThemeInfo('sketch');
        renderNotesList();

        document.querySelector('.current-screen').textContent = 'Menu';
    }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const screenKeys = ['menu', 'gameboard-yt', 'gameboard-local', 'mastery', 'record'];

        // Number keys for screens
        if (e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            const screen = screenKeys[index];
            if (screen) {
                setActiveButton('.screen-btn', document.querySelector(`[data-screen="${screen}"]`));
                loadScreen(screen);
                document.querySelector('.current-screen').textContent = SCREEN_TITLES[screen];
            }
        }

        // Arrow keys for themes
        if (e.key === 'ArrowLeft') {
            document.getElementById('prevTheme').click();
        }
        if (e.key === 'ArrowRight') {
            document.getElementById('nextTheme').click();
        }

        // N for note
        if (e.key === 'n' || e.key === 'N') {
            setActiveButton('.tool-btn', document.querySelector('[data-tool="note"]'));
            currentTool = 'note';
        }

        // C for compare
        if (e.key === 'c' || e.key === 'C') {
            toggleCompareMode();
        }

        // R for reset
        if (e.key === 'r' || e.key === 'R') {
            resetLayout();
        }

        // Escape to close modal or exit compare
        if (e.key === 'Escape') {
            if (noteModal.style.display === 'flex') {
                closeNoteModal();
            } else if (isCompareMode) {
                toggleCompareMode();
            } else {
                deselectElement();
            }
        }
    });
}

// Utility
function setActiveButton(selector, activeBtn) {
    document.querySelectorAll(selector).forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
}

// Make functions globally accessible for onclick handlers
window.copyExport = () => {};
