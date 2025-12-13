// ========================================
// COMMAND PALETTE (Ctrl+K)
// Brutalist keyboard-first navigation
// ========================================

const COMMAND_PALETTE_CONFIG = {
    pages: [
        { name: 'Home', url: 'index.html', shortcut: '1', description: 'Go to homepage' },
        { name: 'Work', url: 'portfolio.html', shortcut: '2', description: 'View portfolio & art' },
        { name: 'Librī', url: 'books.html', shortcut: '3', description: 'Browse book library' },
        { name: 'Coding', url: 'coding.html', shortcut: '4', description: 'GitHub projects & stats' },
        { name: 'Contact', url: 'contact.html', shortcut: '5', description: 'Get in touch' },
    ],
    actions: [
        { name: 'Toggle Theme', action: 'toggleTheme', shortcut: 'T', description: 'Switch dark/light mode' },
        { name: 'GitHub Profile', action: 'openGitHub', shortcut: 'G', description: 'Open GitHub in new tab' },
        { name: 'LinkedIn', action: 'openLinkedIn', shortcut: 'L', description: 'Open LinkedIn in new tab' },
        { name: 'Email', action: 'openEmail', shortcut: 'E', description: 'Send an email' },
    ]
};

let commandPaletteOpen = false;
let selectedIndex = 0;
let filteredItems = [];

/**
 * Create Command Palette HTML structure
 */
function createCommandPalette() {
    // Check if already exists
    if (document.getElementById('commandPalette')) return;

    const palette = document.createElement('div');
    palette.id = 'commandPalette';
    palette.className = 'command-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Command palette');
    palette.innerHTML = `
        <div class="command-palette-backdrop"></div>
        <div class="command-palette-modal">
            <div class="command-palette-header">
                <input 
                    type="text" 
                    id="commandInput" 
                    class="command-input" 
                    placeholder="Type a command or search..."
                    autocomplete="off"
                    spellcheck="false"
                >
                <span class="command-hint">ESC to close</span>
            </div>
            <div class="command-palette-body">
                <div class="command-group">
                    <div class="command-group-title">PAGES</div>
                    <ul class="command-list" id="commandListPages"></ul>
                </div>
                <div class="command-group">
                    <div class="command-group-title">ACTIONS</div>
                    <ul class="command-list" id="commandListActions"></ul>
                </div>
            </div>
            <div class="command-palette-footer">
                <span class="footer-hint"><kbd>↑↓</kbd> Navigate</span>
                <span class="footer-hint"><kbd>Enter</kbd> Select</span>
                <span class="footer-hint"><kbd>Ctrl+K</kbd> Toggle</span>
            </div>
        </div>
    `;

    document.body.appendChild(palette);

    // Bind events
    const backdrop = palette.querySelector('.command-palette-backdrop');
    const input = document.getElementById('commandInput');

    backdrop.addEventListener('click', closeCommandPalette);
    input.addEventListener('input', handleCommandInput);
    input.addEventListener('keydown', handleCommandKeydown);

    // Populate initial list
    populateCommandList();
}

/**
 * Populate command list with items
 */
function populateCommandList(filter = '') {
    const pagesContainer = document.getElementById('commandListPages');
    const actionsContainer = document.getElementById('commandListActions');
    
    if (!pagesContainer || !actionsContainer) return;

    const filterLower = filter.toLowerCase();
    filteredItems = [];

    // Filter and render pages
    const filteredPages = COMMAND_PALETTE_CONFIG.pages.filter(item => 
        item.name.toLowerCase().includes(filterLower) || 
        item.description.toLowerCase().includes(filterLower)
    );

    pagesContainer.innerHTML = filteredPages.map((item, index) => {
        filteredItems.push({ ...item, type: 'page' });
        return `
            <li class="command-item ${index === selectedIndex ? 'selected' : ''}" data-index="${filteredItems.length - 1}">
                <span class="command-name">${highlightMatch(item.name, filter)}</span>
                <span class="command-description">${item.description}</span>
                <kbd class="command-shortcut">${item.shortcut}</kbd>
            </li>
        `;
    }).join('');

    // Filter and render actions
    const filteredActions = COMMAND_PALETTE_CONFIG.actions.filter(item => 
        item.name.toLowerCase().includes(filterLower) || 
        item.description.toLowerCase().includes(filterLower)
    );

    const pagesCount = filteredPages.length;
    actionsContainer.innerHTML = filteredActions.map((item, index) => {
        filteredItems.push({ ...item, type: 'action' });
        const globalIndex = pagesCount + index;
        return `
            <li class="command-item ${globalIndex === selectedIndex ? 'selected' : ''}" data-index="${filteredItems.length - 1}">
                <span class="command-name">${highlightMatch(item.name, filter)}</span>
                <span class="command-description">${item.description}</span>
                <kbd class="command-shortcut">${item.shortcut}</kbd>
            </li>
        `;
    }).join('');

    // Hide empty groups
    pagesContainer.parentElement.style.display = filteredPages.length ? 'block' : 'none';
    actionsContainer.parentElement.style.display = filteredActions.length ? 'block' : 'none';

    // Add click handlers
    document.querySelectorAll('.command-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            executeCommand(filteredItems[index]);
        });
        item.addEventListener('mouseenter', () => {
            selectedIndex = parseInt(item.dataset.index);
            updateSelection();
        });
    });

    // Reset selection if out of bounds
    if (selectedIndex >= filteredItems.length) {
        selectedIndex = 0;
        updateSelection();
    }
}

/**
 * Highlight matching text
 */
function highlightMatch(text, filter) {
    if (!filter) return text;
    const regex = new RegExp(`(${filter})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Handle input changes
 */
function handleCommandInput(e) {
    selectedIndex = 0;
    populateCommandList(e.target.value);
}

/**
 * Handle keyboard navigation
 */
function handleCommandKeydown(e) {
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredItems.length;
            updateSelection();
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
            updateSelection();
            break;
        case 'Enter':
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                executeCommand(filteredItems[selectedIndex]);
            }
            break;
        case 'Escape':
            e.preventDefault();
            closeCommandPalette();
            break;
    }
}

/**
 * Update visual selection
 */
function updateSelection() {
    document.querySelectorAll('.command-item').forEach((item, index) => {
        item.classList.toggle('selected', parseInt(item.dataset.index) === selectedIndex);
    });

    // Scroll into view
    const selected = document.querySelector('.command-item.selected');
    if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Execute selected command
 */
function executeCommand(item) {
    if (item.type === 'page') {
        window.location.href = item.url;
    } else if (item.type === 'action') {
        switch (item.action) {
            case 'toggleTheme':
                const themeToggle = document.querySelector('.theme-toggle');
                if (themeToggle) themeToggle.click();
                closeCommandPalette();
                break;
            case 'openGitHub':
                window.open('https://github.com/ghiridhars', '_blank');
                closeCommandPalette();
                break;
            case 'openLinkedIn':
                window.open('https://linkedin.com/in/ghiridhars', '_blank');
                closeCommandPalette();
                break;
            case 'openEmail':
                window.location.href = 'mailto:officialghiridhar@gmail.com';
                closeCommandPalette();
                break;
        }
    }
}

/**
 * Open command palette
 */
function openCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (!palette) return;

    commandPaletteOpen = true;
    selectedIndex = 0;
    palette.classList.add('open');
    document.body.style.overflow = 'hidden';

    const input = document.getElementById('commandInput');
    input.value = '';
    input.focus();
    populateCommandList();
}

/**
 * Close command palette
 */
function closeCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (!palette) return;

    commandPaletteOpen = false;
    palette.classList.remove('open');
    document.body.style.overflow = '';
}

/**
 * Toggle command palette
 */
function toggleCommandPalette() {
    if (commandPaletteOpen) {
        closeCommandPalette();
    } else {
        openCommandPalette();
    }
}

/**
 * Initialize command palette
 */
function initCommandPalette() {
    createCommandPalette();

    // Global keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to toggle
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
            return;
        }

        // Direct shortcuts when palette is open
        if (commandPaletteOpen) {
            // Number shortcuts for pages
            if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
                const input = document.getElementById('commandInput');
                if (document.activeElement === input && input.value === '') {
                    const page = COMMAND_PALETTE_CONFIG.pages.find(p => p.shortcut === e.key);
                    if (page) {
                        e.preventDefault();
                        window.location.href = page.url;
                    }
                }
            }

            // Letter shortcuts for actions
            const key = e.key.toUpperCase();
            if (['T', 'G', 'L', 'E'].includes(key) && !e.ctrlKey && !e.metaKey) {
                const input = document.getElementById('commandInput');
                if (document.activeElement === input && input.value === '') {
                    const action = COMMAND_PALETTE_CONFIG.actions.find(a => a.shortcut === key);
                    if (action) {
                        e.preventDefault();
                        executeCommand({ ...action, type: 'action' });
                    }
                }
            }
        }
    });

    console.log('⌨️ Command Palette initialized (Ctrl+K to open)');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
} else {
    initCommandPalette();
}
