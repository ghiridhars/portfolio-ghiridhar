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
 * Generate the dot-face logo HTML
 * The 17x9 pixel art face grid
 */
function generateDotFaceLogo() {
    return `
        <a href="index.html" class="nav-logo" aria-label="Go to homepage">
            <div class="dot-face" aria-hidden="true">
                <!-- Row 1: Hair top -->
                <span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span>
                <!-- Row 2: Hair -->
                <span class="d"></span><span class="d"></span><span class="d"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d h"></span><span class="d h"></span><span class="d h"></span><span class="d"></span><span class="d"></span><span class="d"></span>
                <!-- Row 3: Forehead top -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d h"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d h"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 4: Forehead -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 5: Glasses top -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 6: Eyes with glasses -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d gl"></span><span class="d"></span><span class="d ey" data-eye="left"></span><span class="d"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d"></span><span class="d ey" data-eye="right"></span><span class="d"></span><span class="d gl"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 7: Glasses bottom -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d gl"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 8: Nose -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
                <!-- Row 9: Nose bottom -->
                <span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d"></span><span class="d o"></span><span class="d"></span><span class="d"></span>
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
                ${generateDotFaceLogo()}
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
