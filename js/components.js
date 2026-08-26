// ========================================
// SHARED COMPONENTS
// Dynamically injected navigation and footer
// Eliminates HTML duplication across pages
// ========================================

/**
 * Navigation Configuration
 */
const NAV_CONFIG = {
    pages: [
        { name: 'Work', href: 'portfolio.html', id: 'work' },
        { name: 'Librī', href: 'books.html', id: 'books' },
        { name: 'Coding', href: 'coding.html', id: 'coding' },
        { name: 'Contact', href: 'contact.html', id: 'contact' }
    ],
    social: {
        github: 'https://github.com/ghiridhars',
        linkedin: 'https://linkedin.com/in/ghiridhars',
        twitter: 'https://x.com/SGhiridhar',
        email: 'mailto:officialghiridhar@gmail.com'
    }
};

/**
 * Generate the brand logo HTML
 * Kinetic Sisyphus Monogram emblem: GS character physically pushing the boulder up the slope
 */
function generateBrandLogo() {
    return `
        <a href="index.html" class="nav-brand-link" id="navBrandLink" aria-label="Ghiridhar S - Home" title="Ghiridhar S · Click to reveal GS">
            <div class="sisyphus-logo" id="sisyphusLogo" aria-hidden="true">
                <svg class="sisyphus-svg" id="sisyphusSvg" viewBox="0 0 114 40" width="114" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Mountain Slope Incline & Base -->
                    <polygon class="slope-fill" points="8,35 90,8 90,35" />
                    <line class="slope-incline" x1="8" y1="35" x2="90" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <line class="slope-base" x1="4" y1="35" x2="108" y2="35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <line class="slope-cliff" x1="90" y1="8" x2="90" y2="35" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.35" />
                    
                    <!-- Kinetic Sisyphus & Boulder Group -->
                    <g class="sisyphus-kinetic-group" id="sisyphusKineticGroup">
                        <!-- Sisyphus Character -->
                        <g class="sisyphus-pusher" id="sisyphusPusher">
                            <circle class="sisyphus-head" cx="21" cy="18" r="3.2" fill="currentColor" />
                            <path class="sisyphus-torso" d="M22 21 L27 27" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                            <path class="sisyphus-back-leg" d="M22 27 L16 33.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                            <path class="sisyphus-front-leg" d="M22 27 L24 31 L28 31.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                            <path class="sisyphus-arms" id="sisyphusArms" d="M23.5 22 L31 18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </g>
                        
                        <!-- Rolling Boulder -->
                        <g class="boulder-group" id="sisyphusBoulderGroup">
                            <circle class="boulder-body" cx="37.5" cy="18" r="7" fill="currentColor" />
                            <circle class="boulder-core" cx="37.5" cy="18" r="4.8" stroke="var(--bg-white)" stroke-width="1" stroke-dasharray="3 2" fill="none" opacity="0.7" />
                            <line class="boulder-axis" x1="33" y1="18" x2="42" y2="18" stroke="var(--bg-white)" stroke-width="1" opacity="0.6" />
                        </g>
                    </g>
                </svg>

                <!-- Revealed GS Monogram Badge -->
                <div class="revealed-monogram" id="revealedMonogram" style="display: none;">
                    <span class="monogram-bracket">[</span>
                    <span class="monogram-text">GS</span>
                    <span class="monogram-bracket">]</span>
                </div>
            </div>
        </a>
    `;
}

/**
 * Generate navigation HTML
 * @param {string} activePage - ID of the current active page
 */
function generateNavigation(activePage = '') {
    const navItems = NAV_CONFIG.pages.map(page => {
        const isActive = page.id === activePage ? ' class="active"' : '';
        return `<li><a href="${page.href}"${isActive}>${page.name}</a></li>`;
    }).join('\n                ');

    return `
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                ${generateBrandLogo()}
            </div>
            <button class="nav-toggle" aria-label="Toggle navigation">
                <span class="hamburger"></span>
            </button>
            <ul class="nav-menu">
                ${navItems}
                <li>
                    <button class="theme-toggle" aria-label="Toggle dark mode">
                        <span class="material-symbols-sharp theme-icon sun">light_mode</span>
                        <span class="material-symbols-sharp theme-icon moon">dark_mode</span>
                    </button>
                </li>
            </ul>
        </div>
    </nav>
    `;
}

/**
 * Generate Ambient Cockpit HUD HTML (Floating Corner Dock)
 */
function generateAmbientHUD() {
    return `
    <aside class="ambient-hud" id="ambientHud" aria-label="Ambient weather and lunar telemetry">
        <div class="hud-pill" id="hudPill">
            <span class="hud-item hud-location" title="Detected Location">
                <span class="material-symbols-sharp" aria-hidden="true">location_on</span>
                <span id="weather-city">—</span>
            </span>
            <span class="hud-sep" aria-hidden="true">·</span>
            <button class="hud-item hud-temp-btn" id="weather-temp-btn" aria-label="Toggle temperature unit" title="Click to toggle °C / °F">
                <span id="weather-temp">—</span>
            </button>
            <span class="hud-sep" aria-hidden="true">·</span>
            <span class="hud-item hud-cond" id="weather-condition" title="Sky condition">—</span>
            <span class="hud-sep" aria-hidden="true">·</span>
            <span class="hud-item hud-lunar" id="weather-lunar" title="Lunar phase & illumination">—</span>
            <button class="hud-expand-btn" id="hudExpandBtn" aria-expanded="false" aria-label="Toggle telemetry details" title="Open Cockpit Telemetry">
                <span class="material-symbols-sharp" aria-hidden="true">keyboard_arrow_up</span>
            </button>
        </div>
        <div class="hud-panel" id="hudPanel">
            <div class="hud-panel-header">
                <span>Telemetry Status</span>
                <span id="hudStatusDot">● LIVE</span>
            </div>
            <div class="hud-panel-grid">
                <div class="hud-stat-row">
                    <span class="hud-stat-label">Feels Like:</span>
                    <span class="hud-stat-val" id="weather-apparent">—</span>
                </div>
                <div class="hud-stat-row">
                    <span class="hud-stat-label">Humidity:</span>
                    <span class="hud-stat-val" id="weather-humidity">—</span>
                </div>
                <div class="hud-stat-row">
                    <span class="hud-stat-label">Wind Velocity:</span>
                    <span class="hud-stat-val" id="weather-wind">—</span>
                </div>
                <div class="hud-stat-row">
                    <span class="hud-stat-label">Lunar Cycle:</span>
                    <span class="hud-stat-val" id="weather-lunar-age">—</span>
                </div>
            </div>
        </div>
    </aside>
    `;
}

/**
 * Generate footer HTML
 */
function generateFooter() {
    const currentYear = new Date().getFullYear();
    
    return `
    <footer class="footer animated-footer">
        <div class="footer-wave">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                <path class="wave wave-back" d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,90 1440,60 L1440,120 L0,120 Z"/>
                <path class="wave wave-mid" d="M0,80 C180,40 360,100 540,80 C720,60 900,100 1080,80 C1260,60 1380,100 1440,80 L1440,120 L0,120 Z"/>
                <path class="wave wave-front" d="M0,90 C240,110 480,70 720,90 C960,110 1200,70 1440,90 L1440,120 L0,120 Z"/>
            </svg>
        </div>
        <div class="container footer-content">
            <div class="footer-stats">
                <div class="stat-item">
                    <span class="stat-value" id="footer-visitors">--</span>
                    <span class="stat-label">Visitors</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="footer-pageviews">--</span>
                    <span class="stat-label">Page Views</span>
                </div>
            </div>
            <div class="footer-links">
                <a href="${NAV_CONFIG.social.github}" aria-label="GitHub" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
                <a href="${NAV_CONFIG.social.linkedin}" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" class="footer-link">LinkedIn</a>
                <a href="${NAV_CONFIG.social.twitter}" aria-label="Twitter" target="_blank" rel="noopener noreferrer" class="footer-link">Twitter</a>
                <a href="${NAV_CONFIG.social.email}" aria-label="Email" class="footer-link">Email</a>
            </div>
            <p class="footer-copyright">&copy; ${currentYear} Ghiridhar S</p>
        </div>
    </footer>
    `;
}

/**
 * Initialize shared components
 * Call this at the start of page load
 */
function initComponents() {
    // Determine which page is active based on current URL
    const currentPath = window.location.pathname;
    let activePage = '';
    
    if (currentPath.includes('portfolio')) activePage = 'work';
    else if (currentPath.includes('books')) activePage = 'books';
    else if (currentPath.includes('coding')) activePage = 'coding';
    else if (currentPath.includes('contact')) activePage = 'contact';
    
    // Insert navigation
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.outerHTML = generateNavigation(activePage);
        logger.log('✅ Navigation component injected');
    }
    
    // Insert footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = generateFooter();
        logger.log('✅ Footer component injected');
    }
}

/**
 * Initialize Google Analytics 4
 */
function initGoogleAnalytics() {
    const GA_ID = 'G-F97RE0Y9J2';
    
    // Create and inject the GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_ID);
    
    logger.log('📊 Google Analytics initialized');
}

/**
 * Initialize GoatCounter Analytics
 */
function initGoatCounter() {
    const script = document.createElement('script');
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    script.setAttribute('data-goatcounter', 'https://your-site.goatcounter.com/count');
    document.head.appendChild(script);
    
    logger.log('🐐 GoatCounter initialized');
}

/**
 * Initialize all analytics
 */
function initAnalytics() {
    initGoogleAnalytics();
    initGoatCounter();
}

// Auto-initialize when DOM is ready if placeholders exist
document.addEventListener('DOMContentLoaded', () => {
    // Check if using placeholder system
    if (document.getElementById('nav-placeholder') || document.getElementById('footer-placeholder')) {
        initComponents();
    }
    
    // Always initialize analytics
    initAnalytics();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateNavigation,
        generateFooter,
        initComponents,
        initAnalytics,
        NAV_CONFIG
    };
}
