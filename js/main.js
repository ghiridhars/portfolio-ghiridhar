// ========================================
// MAIN JAVASCRIPT FILE
// This file contains common functionality used across all pages
// Requires: utils.js (for throttle, logger, prefersReducedMotion)
// ========================================

/**
 * Dot Matrix Face - Eye Tracking & Blink
 * Makes the face logo interactive and lively
 */
function initDotFace() {
    const dotFace = document.querySelector('.dot-face');
    const eyes = document.querySelectorAll('.dot-face .d.ey');
    
    if (!dotFace || eyes.length === 0) return;
    
    // Check for reduced motion preference
    if (prefersReducedMotion()) {
        logger.log('👁️ Face animations disabled (reduced motion)');
        return;
    }
    
    // Eye tracking - follow mouse cursor (throttled to 60fps for performance)
    const handleMouseMove = throttle((e) => {
        const faceRect = dotFace.getBoundingClientRect();
        const faceCenterX = faceRect.left + faceRect.width / 2;
        const faceCenterY = faceRect.top + faceRect.height / 2;
        
        // Calculate direction from face to mouse
        const deltaX = e.clientX - faceCenterX;
        const deltaY = e.clientY - faceCenterY;
        
        // Normalize and limit movement (max 1.5px in any direction)
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxMove = 1.5;
        
        let moveX = 0;
        let moveY = 0;
        
        if (distance > 10) { // Only move if mouse is far enough
            moveX = (deltaX / distance) * maxMove;
            moveY = (deltaY / distance) * maxMove;
        }
        
        // Apply to both eyes
        eyes.forEach(eye => {
            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }, 16); // ~60fps
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Random blink
    function triggerBlink() {
        eyes.forEach(eye => {
            eye.classList.add('blink');
            setTimeout(() => eye.classList.remove('blink'), 150);
        });
        
        // Schedule next blink (random 2-6 seconds)
        const nextBlink = 2000 + Math.random() * 4000;
        setTimeout(triggerBlink, nextBlink);
    }
    
    // Start blinking after initial delay
    setTimeout(triggerBlink, 1500);
    
    logger.log('👓 Dot face initialized with eye tracking & blink');
}

/**
 * Dark/Light Theme Toggle
 * Handles theme switching and persistence
 */
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Get saved theme from localStorage or default to DARK
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Get current theme
            const theme = document.documentElement.getAttribute('data-theme');
            
            // Toggle theme
            const newTheme = theme === 'light' ? 'dark' : 'light';
            
            // Set new theme
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save to localStorage
            localStorage.setItem('theme', newTheme);
            
            // Log for learning
            logger.log(`Theme switched to: ${newTheme} 🎨`);
            
            // Update particles background colors when theme changes
            updateParticlesColors(newTheme);
        });
    }
}

/**
 * tsParticles Animated Background
 * Creates floating connected particles behind all content
 */
let particlesInstance = null;

async function initParticlesBackground() {
    const particlesEl = document.getElementById('particles-background');
    
    // Only initialize if element exists and tsParticles is loaded
    if (!particlesEl || typeof tsParticles === 'undefined') {
        logger.log('⚠️ tsParticles not available or element not found');
        return;
    }
    
    // Check for reduced motion preference
    if (prefersReducedMotion()) {
        logger.log('⚠️ Reduced motion preferred, skipping particles animation');
        return;
    }
    
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colors = getParticlesColors(currentTheme);
    
    try {
        particlesInstance = await tsParticles.load("particles-background", {
            fullScreen: false,
            background: {
                color: {
                    value: colors.background
                }
            },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onHover: {
                        enable: false,
                        mode: "grab"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 1
                        }
                    }
                }
            },
            particles: {
                color: {
                    value: colors.particles
                },
                links: {
                    color: colors.particles,
                    distance: 150,
                    enable: true,
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: false,
                    straight: false,
                    outModes: {
                        default: "out"
                    }
                },
                number: {
                    density: {
                        enable: true,
                        area: 800
                    },
                    value: 60
                },
                opacity: {
                    value: 0.4
                },
                shape: {
                    type: "circle"
                },
                size: {
                    value: { min: 1, max: 3 }
                }
            },
            detectRetina: true
        });
        
        logger.log('✨ tsParticles background initialized');
    } catch (error) {
        logger.error('Error initializing particles:', error);
    }
}

/**
 * Get particles colors based on theme
 */
function getParticlesColors(theme) {
    if (theme === 'dark') {
        return {
            background: '#000000',  // Pure black background
            particles: '#ffffff'     // Pure white particles
        };
    } else {
        return {
            background: '#ffffff',  // Pure white background
            particles: '#000000'     // Pure black particles
        };
    }
}

/**
 * Update particles colors when theme changes
 */
async function updateParticlesColors(theme) {
    if (!particlesInstance) return;
    
    const colors = getParticlesColors(theme);
    
    try {
        // Destroy and recreate with new colors
        particlesInstance.destroy();
        await initParticlesBackground();
        logger.log('✨ Particles colors updated for', theme, 'theme');
    } catch (error) {
        logger.error('Error updating particles colors:', error);
    }
}

/**
 * Mobile Navigation Toggle
 * Handles opening and closing the mobile menu
 */
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Optional: Update aria-expanded for accessibility
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Smooth Scrolling for Anchor Links
 * Adds smooth scrolling behavior to internal anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Glitch Effect on Hover
 * Auto-applies to headings, nav links, and buttons
 */
function initGlitchEffect() {
    // Selectors for elements that should have glitch effect
    const selectors = [
        'h1',
        'h2', 
        'h3',
        '.nav-menu a',
        '.btn',
        '.section-title'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(el => {
        // Skip if already processed or has child elements we shouldn't wrap
        if (el.classList.contains('glitch-hover')) return;
        
        // Get the text content - handle elements with mixed content
        const text = el.textContent.trim();
        if (!text) return;
        
        // Add glitch class and data attribute
        el.classList.add('glitch-hover');
        el.setAttribute('data-text', text);
    });
    
    logger.log('✨ Glitch effect initialized on hover');
}

/**
 * Poetry API Integration
 * Fetches and displays random classic poems from PoetryDB
 */
function initPoetry() {
    const poemTitle = document.getElementById('poem-title');
    const poemLines = document.getElementById('poem-lines');
    const poemAuthor = document.getElementById('poem-author');
    const newPoemBtn = document.getElementById('new-poem-btn');
    
    // Only run if elements exist (on homepage)
    if (!poemTitle || !poemLines || !poemAuthor || !newPoemBtn) {
        logger.log('⚠️ Poetry elements not found on this page');
        return;
    }
    
    logger.log('✅ Poetry elements found, initializing...');
    
    /**
     * Fetch a random poem from PoetryDB
     */
    async function fetchPoem() {
        try {
            logger.log('📖 Fetching poem from PoetryDB...');
            
            // Add loading state
            poemTitle.style.opacity = '0.5';
            poemLines.style.opacity = '0.5';
            poemAuthor.style.opacity = '0.5';
            newPoemBtn.disabled = true;
            
            // Fetch random poem (PoetryDB returns array of poems)
            const response = await fetch('https://poetrydb.org/random/1');
            
            logger.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            logger.log('✅ Poem received:', data);
            
            if (!data || data.length === 0) {
                throw new Error('No poem data received');
            }
            
            const poem = data[0];
            
            // Animate poem change
            setTimeout(() => {
                poemTitle.textContent = poem.title;
                
                // Format poem lines (limit to first 12 lines for readability)
                const linesToShow = poem.lines.slice(0, 12);
                poemLines.innerHTML = `<p>${linesToShow.join('\n')}</p>`;
                
                // Add "..." if poem was truncated
                if (poem.lines.length > 12) {
                    poemLines.innerHTML += '<p style="text-align: center; margin-top: 1em;">...</p>';
                }
                
                poemAuthor.textContent = `— ${poem.author}`;
                
                poemTitle.style.opacity = '1';
                poemLines.style.opacity = '1';
                poemAuthor.style.opacity = '1';
                newPoemBtn.disabled = false;
            }, 200);
            
        } catch (error) {
            logger.error('❌ Error fetching poem:', error);
            logger.error('Error details:', error.message);
            
            // Show error in the UI
            poemTitle.textContent = 'Failed to load poem';
            poemLines.innerHTML = '<p>Please try again.</p>';
            poemAuthor.textContent = `— Error: ${error.message}`;
            
            poemTitle.style.opacity = '1';
            poemLines.style.opacity = '1';
            poemAuthor.style.opacity = '1';
            newPoemBtn.disabled = false;
        }
    }
    
    // Fetch poem on page load
    logger.log('🚀 Fetching initial poem...');
    fetchPoem();
    
    // Fetch new poem when button is clicked
    newPoemBtn.addEventListener('click', () => {
        logger.log('📖 New poem requested by user');
        fetchPoem();
    });
}

/**
 * Stoic Quote API Integration
 * Fetches and displays random Stoic philosophy quotes
 */
function initStoicQuote() {
    const quoteText = document.getElementById('stoic-quote-text');
    const quoteAuthor = document.getElementById('stoic-quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    
    // Only run if elements exist (on homepage)
    if (!quoteText || !quoteAuthor || !newQuoteBtn) {
        logger.log('⚠️ Stoic quote elements not found on this page');
        return;
    }
    
    logger.log('✅ Stoic quote elements found, initializing...');
    
    /**
     * Fetch a random Stoic quote from the API
     */
    async function fetchStoicQuote() {
        try {
            logger.log('🔄 Fetching quote from API...');
            
            // Add loading state
            quoteText.style.opacity = '0.5';
            quoteAuthor.style.opacity = '0.5';
            newQuoteBtn.disabled = true;
            
            const response = await fetch('https://stoic-quotes.com/api/quote');
            
            logger.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            logger.log('✅ Quote received:', data);
            
            // Animate quote change
            setTimeout(() => {
                quoteText.textContent = `"${data.text}"`;
                quoteAuthor.textContent = `— ${data.author}`;
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
                newQuoteBtn.disabled = false;
            }, 200);
            
        } catch (error) {
            logger.error('❌ Error fetching Stoic quote:', error);
            logger.error('Error details:', error.message);
            
            // Show error in the UI
            quoteText.textContent = 'Failed to load quote. Please try again.';
            quoteAuthor.textContent = `— Error: ${error.message}`;
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
            newQuoteBtn.disabled = false;
        }
    }
    
    // Fetch quote on page load
    logger.log('🚀 Fetching initial quote...');
    fetchStoicQuote();
    
    // Fetch new quote when button is clicked
    newQuoteBtn.addEventListener('click', () => {
        logger.log('🔄 New quote requested by user');
        fetchStoicQuote();
    });
}

/**
 * Add Active Class to Current Page Nav Link
 * Highlights the current page in the navigation
 */
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * Lazy Loading Images
 * Improves performance by loading images only when needed
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Show/Hide Scroll to Top Button
 * Displays a button to scroll back to top when user scrolls down
 */
function initScrollToTop() {
    // Create scroll to top button if it doesn't exist
    let scrollBtn = document.getElementById('scrollToTop');
    
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTop';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(scrollBtn);
        
        // Scroll to top when clicked
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Show/hide button based on scroll position (throttled)
    const handleScroll = throttle(() => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Scroll Progress Bar
 * Shows reading progress at the top of the page
 */
function initScrollProgress() {
    // Create progress bar if it doesn't exist
    let progressBar = document.querySelector('.scroll-progress');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.prepend(progressBar);
    }
    
    // Update progress on scroll (throttled for performance)
    const updateProgress = throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }, 16); // ~60fps
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call
    
    logger.log('📊 Scroll progress bar initialized');
}

/**
 * Fetch Site Stats from GoatCounter
 * Displays visitor count and page views in the footer
 */
async function initSiteStats() {
    const visitorsEl = document.getElementById('footer-visitors');
    const pageviewsEl = document.getElementById('footer-pageviews');
    
    if (!visitorsEl || !pageviewsEl) return;
    
    // GoatCounter site code - update this to your actual GoatCounter site code
    const GOATCOUNTER_SITE = 'ghiridhars'; // Replace with your GoatCounter site code
    
    try {
        // Fetch stats from GoatCounter API
        // Note: GoatCounter provides a public stats endpoint
        const response = await fetch(`https://${GOATCOUNTER_SITE}.goatcounter.com/counter/.json`);
        
        if (response.ok) {
            const data = await response.json();
            
            // Update the stats display (using shared formatNumber from utils.js)
            visitorsEl.textContent = formatNumber(data.count_unique || 0);
            pageviewsEl.textContent = formatNumber(data.count || 0);
            
            logger.log('📈 Site stats loaded from GoatCounter');
        } else {
            // Fallback: Show placeholder or use localStorage estimate
            showFallbackStats(visitorsEl, pageviewsEl);
        }
    } catch (error) {
        logger.log('📈 Using fallback stats (GoatCounter not configured)');
        showFallbackStats(visitorsEl, pageviewsEl);
    }
}

/**
 * Show fallback stats when GoatCounter is unavailable
 * Uses localStorage to track basic visit count
 */
function showFallbackStats(visitorsEl, pageviewsEl) {
    // Simple localStorage-based counter as fallback
    let visits = parseInt(localStorage.getItem('site_visits') || '0');
    let pageviews = parseInt(localStorage.getItem('site_pageviews') || '0');
    
    // Increment on each page load
    pageviews++;
    localStorage.setItem('site_pageviews', pageviews.toString());
    
    // Check if this is a new session (simplified)
    if (!sessionStorage.getItem('visited')) {
        visits++;
        localStorage.setItem('site_visits', visits.toString());
        sessionStorage.setItem('visited', 'true');
    }
    
    visitorsEl.textContent = formatNumber(visits);
    pageviewsEl.textContent = formatNumber(pageviews);
}

// Note: formatNumber is now imported from utils.js

/**
 * Initialize all functions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();           // Initialize theme first
    initParticlesBackground();   // Initialize particles background
    initDotFace();               // Initialize dot face eye tracking & expressions
    initMobileNav();
    initSmoothScroll();
    initGlitchEffect();          // Initialize glitch effect on hover
    initPoetry();                // Initialize Poetry API
    initStoicQuote();            // Initialize Stoic quote API
    highlightCurrentPage();
    initLazyLoading();
    initScrollToTop();
    initScrollProgress();        // Initialize scroll progress bar
    initSiteStats();             // Initialize footer site stats
    
    // Log message for learning purposes
    logger.log('Portfolio website loaded successfully! 🚀');
    logger.log('Current theme:', document.documentElement.getAttribute('data-theme'));
    logger.log('Press Ctrl+K to open command palette');
});

// Export functions if using modules (optional for learning)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileNav,
        initSmoothScroll,
        highlightCurrentPage,
        initLazyLoading,
        initScrollToTop,
        initSiteStats,
        initDotFace
    };
}
