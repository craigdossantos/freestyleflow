/**
 * Design Switcher Logic
 * Handles switching between design variants, feedback collection, and persistence.
 */

const CONFIG = {
    storageKey: 'freestyleflow_prototype_v2',
    designs: [
        { id: 1, name: '1. Neon Flow (Cyberpunk)', class: 'theme-neon' },
        { id: 2, name: '2. Studio Zen (Minimalist)', class: 'theme-zen' },
        { id: 3, name: '3. Golden Era (90s Hip Hop)', class: 'theme-golden' },
        { id: 4, name: '4. Vaporwave', class: 'theme-vapor' },
        { id: 5, name: '5. Terminal', class: 'theme-terminal' },
        { id: 6, name: '6. Paper', class: 'theme-paper' },
        { id: 7, name: '7. Glassmorphism', class: 'theme-glass' },
        { id: 8, name: '8. Neumorphism', class: 'theme-neu' },
        { id: 9, name: '9. Brutalism', class: 'theme-brutal' },
        { id: 10, name: '10. Nature', class: 'theme-nature' },
        { id: 11, name: '11. Space', class: 'theme-space' },
        { id: 12, name: '12. Arcade', class: 'theme-arcade' },
        { id: 13, name: '13. Luxury', class: 'theme-luxury' },
        { id: 14, name: '14. Blueprint', class: 'theme-blueprint' },
        { id: 15, name: '15. Chalkboard', class: 'theme-chalk' },
        { id: 16, name: '16. Comic Book', class: 'theme-comic' },
        { id: 17, name: '17. Watercolor', class: 'theme-water' },
        { id: 18, name: '18. High Contrast', class: 'theme-contrast' }
    ]
};

class DesignSwitcher {
    constructor() {
        this.state = {
            currentDesign: 1,
            designFeedback: {},
            toolbarCollapsed: false,
            toolbarPosition: { x: 20, y: 20 }
        };

        this.init();
    }

    init() {
        this.loadState();
        this.injectToolbar();
        this.bindEvents();
        this.render();
    }

    loadState() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
                // Ensure currentDesign is valid
                if (!CONFIG.designs.find(d => d.id === this.state.currentDesign)) {
                    this.state.currentDesign = 1;
                }
            } catch (e) {
                console.error('Failed to load state', e);
            }
        }
    }

    saveState() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.state));
    }

    injectToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'design-switcher-toolbar';
        toolbar.className = 'ds-toolbar';
        toolbar.style.left = `${this.state.toolbarPosition.x}px`;
        toolbar.style.top = `${this.state.toolbarPosition.y}px`;

        toolbar.innerHTML = `
            <div class="ds-header" id="ds-drag-handle">
                <span>🎨 Design Switcher</span>
                <button id="ds-toggle-btn">${this.state.toolbarCollapsed ? '+' : '-'}</button>
            </div>
            <div class="ds-content ${this.state.toolbarCollapsed ? 'hidden' : ''}" id="ds-content">
                <div class="ds-row">
                    <label>Current Design:</label>
                    <select id="ds-selector">
                        ${CONFIG.designs.map(d =>
            `<option value="${d.id}" ${d.id === this.state.currentDesign ? 'selected' : ''}>
                                ${d.name}
                            </option>`
        ).join('')}
                    </select>
                </div>
                <div class="ds-row">
                    <label>Feedback:</label>
                    <textarea id="ds-feedback" placeholder="Thoughts on this design..."></textarea>
                </div>
                <div class="ds-actions">
                    <button id="ds-export-btn">Export Feedback</button>
                    <button id="ds-reset-btn">Reset State</button>
                </div>
            </div>
        `;

        document.body.appendChild(toolbar);

        // Set initial feedback value
        const feedbackInput = document.getElementById('ds-feedback');
        if (feedbackInput) {
            feedbackInput.value = this.state.designFeedback[this.state.currentDesign] || '';
        }
    }

    bindEvents() {
        // Dragging
        const toolbar = document.getElementById('design-switcher-toolbar');
        const handle = document.getElementById('ds-drag-handle');
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        handle.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offset.x = e.clientX - toolbar.offsetLeft;
            offset.y = e.clientY - toolbar.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;
            toolbar.style.left = `${x}px`;
            toolbar.style.top = `${y}px`;
            this.state.toolbarPosition = { x, y };
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.saveState();
            }
        });

        // Toggle Collapse
        document.getElementById('ds-toggle-btn').addEventListener('click', () => {
            this.state.toolbarCollapsed = !this.state.toolbarCollapsed;
            const content = document.getElementById('ds-content');
            const btn = document.getElementById('ds-toggle-btn');

            if (this.state.toolbarCollapsed) {
                content.classList.add('hidden');
                btn.textContent = '+';
            } else {
                content.classList.remove('hidden');
                btn.textContent = '-';
            }
            this.saveState();
        });

        // Design Selection
        document.getElementById('ds-selector').addEventListener('change', (e) => {
            this.state.currentDesign = parseInt(e.target.value);
            this.render();

            // Update feedback textarea for new design
            const feedbackInput = document.getElementById('ds-feedback');
            feedbackInput.value = this.state.designFeedback[this.state.currentDesign] || '';

            this.saveState();
        });

        // Feedback Input
        document.getElementById('ds-feedback').addEventListener('input', (e) => {
            this.state.designFeedback[this.state.currentDesign] = e.target.value;
            this.saveState();
        });

        // Export
        document.getElementById('ds-export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Reset
        document.getElementById('ds-reset-btn').addEventListener('click', () => {
            if (confirm('Reset all feedback and state?')) {
                localStorage.removeItem(CONFIG.storageKey);
                location.reload();
            }
        });
    }

    render() {
        const container = document.getElementById('game-container');
        const design = CONFIG.designs.find(d => d.id === this.state.currentDesign);

        if (container && design) {
            // Remove all theme classes
            CONFIG.designs.forEach(d => container.classList.remove(d.class));
            // Add current theme class
            container.classList.add(design.class);
        }
    }

    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            ...this.state,
            formattedFeedback: Object.entries(this.state.designFeedback).map(([id, text]) => ({
                design: CONFIG.designs.find(d => d.id === parseInt(id))?.name || id,
                feedback: text
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freestyle-feedback-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new DesignSwitcher();
});
