// ========================================
// MAIN JAVASCRIPT FILE
// This file contains common functionality used across all pages
// Requires: utils.js (for throttle, logger, prefersReducedMotion)
// ========================================

/**
 * Kinetic Sisyphus Logo - Micro-Physics & Slope Motion
 * Makes the mountain boulder reactive to cursor movement, hover, and clicks
 */
function initSisyphusLogo() {
    const logo = document.getElementById('sisyphusLogo');
    const svg = document.getElementById('sisyphusSvg');
    const pusher = document.getElementById('sisyphusPusher');
    const boulder = document.getElementById('sisyphusBoulderGroup');
    const arms = document.getElementById('sisyphusArms');
    const monogram = document.getElementById('revealedMonogram');
    const brandLink = document.getElementById('navBrandLink');
    
    if (!logo || !boulder || !pusher) return;
    
    // Check for reduced motion preference
    if (prefersReducedMotion()) {
        logger.log('🏔️ Sisyphus logo animations disabled (reduced motion)');
        return;
    }

    // Unit vector along the incline (dx = 82, dy = -27, L ≈ 86.33)
    const ux = 0.950;
    const uy = -0.313;
    const boulderRadius = 7;
    
    let currentS = 0;
    let targetS = 0;
    let isRolling = false;
    let isRevealed = false;
    let animFrame = null;

    function applyPosition(s, boulderExtraAngle = 0, pusherExtraLean = 0) {
        const tx = s * ux;
        const ty = s * uy;
        // Rotation of the boulder as it moves along the slope
        const rot = ((s / boulderRadius) * (180 / Math.PI)) + boulderExtraAngle;
        
        boulder.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
        pusher.style.transform = `translate(${tx}px, ${ty}px) skewX(${pusherExtraLean}deg)`;
    }

    // Cursor tracking - subtle slope ascent/descent based on mouse position
    const handleMouseMove = throttle((e) => {
        if (isRolling || isRevealed) return;
        const normX = (e.clientX / window.innerWidth) - 0.5;
        const normY = (e.clientY / window.innerHeight) - 0.5;
        targetS = (normX * 22) - (normY * 12);
        targetS = Math.max(-6, Math.min(26, targetS));
    }, 20);

    document.addEventListener('mousemove', handleMouseMove);

    // Smooth interpolation loop (lerp)
    function renderLoop() {
        if (!isRolling && !isRevealed) {
            currentS += (targetS - currentS) * 0.12;
            const lean = (currentS > 0) ? -Math.min(8, currentS * 0.35) : 0;
            applyPosition(currentS, 0, lean);
        }
        animFrame = requestAnimationFrame(renderLoop);
    }
    animFrame = requestAnimationFrame(renderLoop);

    // Hover effect: GS pushes the boulder near the summit peak
    logo.addEventListener('mouseenter', () => {
        if (isRolling || isRevealed) return;
        targetS = 32;
    });

    logo.addEventListener('mouseleave', () => {
        if (isRolling || isRevealed) return;
        targetS = 0;
    });

    function resetToSisyphus() {
        if (!isRevealed) return;
        if (monogram && svg) {
            monogram.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            monogram.style.opacity = '0';
            monogram.style.transform = 'scale(0.8)';
            setTimeout(() => {
                monogram.style.display = 'none';
                monogram.classList.remove('monogram-reveal-anim');
                svg.style.display = 'block';
                svg.style.opacity = '1';
                svg.style.transform = 'none';
                boulder.style.opacity = '1';
                boulder.style.transition = 'none';
                pusher.style.transition = 'none';
                applyPosition(0, 0, 0);
                currentS = 0;
                targetS = 0;
                isRolling = false;
                isRevealed = false;
            }, 200);
        }
    }

    // Click Handling:
    // First Click: Sisyphus pushes boulder to peak -> Boulder falls off cliff -> Reveals [ GS ] monogram (NO REDIRECT)
    // Second Click (on revealed GS): Redirects to home page (index.html) or scrolls to top
    if (brandLink) {
        brandLink.addEventListener('click', (e) => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const isHomePage = (currentPage === 'index.html' || currentPage === '');

            // Second Click: When [ GS ] monogram is revealed, perform navigation
            if (isRevealed) {
                if (isHomePage) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // If on another page, let normal href="index.html" execute
                return;
            }

            // First Click: Trigger summit push, cliff drop, and monogram reveal only
            e.preventDefault();
            if (isRolling) return;
            isRolling = true;

            // Stage 1: Sisyphus pushes boulder up to summit peak (s = 44)
            pusher.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)';
            boulder.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)';
            applyPosition(44, 0, -14);

            // Stage 2: Boulder falls off the cliff
            setTimeout(() => {
                if (arms) arms.style.transform = 'rotate(-10deg)';
                boulder.style.transition = 'transform 0.38s cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity 0.25s ease 0.15s';
                const tumbleTx = 44 * ux + 6;
                const tumbleTy = 44 * uy + 30; // Plummets down past the cliff base
                boulder.style.transform = `translate(${tumbleTx}px, ${tumbleTy}px) rotate(420deg)`;
                boulder.style.opacity = '0';

                // Stage 3: Reveal the [ GS ] monogram badge (stays visible until clicked)
                setTimeout(() => {
                    isRevealed = true;
                    isRolling = false;
                    brandLink.setAttribute('title', 'Go to Home (index.html)');

                    if (svg && monogram) {
                        svg.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
                        svg.style.opacity = '0';
                        svg.style.transform = 'scale(0.85)';
                        setTimeout(() => {
                            svg.style.display = 'none';
                            monogram.style.display = 'inline-flex';
                            monogram.style.opacity = '1';
                            monogram.style.transform = 'none';
                            monogram.classList.add('monogram-reveal-anim');
                        }, 160);
                    }
                }, 260);
            }, 320);
        });
    }

    logger.log('🏔️ Kinetic Sisyphus GS logo with Summit Drop & Home Landing initialized');
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
        });
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
 * Stoic Quote Integration
 * Displays random Stoic philosophy quotes
 */
const STOIC_QUOTES = [
    { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "It is not that we have a short time to live, but that we waste a great deal of it.", author: "Seneca" },
    { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
    { text: "No man is free who is not master of himself.", author: "Epictetus" },
    { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
    { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
    { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
    { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
    { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
    { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
    { text: "The soul becomes dyed with the colour of its thoughts.", author: "Marcus Aurelius" },
    { text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.", author: "Seneca" },
    { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
    { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius" },
    { text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.", author: "Seneca" },
];

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

    let lastIndex = -1;
    let typewriterTimeout = null;

    /**
     * Typewriter effect — types characters one by one
     */
    function typewriterReveal(element, text, speed = 28, onDone = null) {
        // Cancel any ongoing typewriter
        if (typewriterTimeout) clearTimeout(typewriterTimeout);
        element.textContent = '';
        let i = 0;
        function tick() {
            if (i < text.length) {
                element.textContent += text[i];
                i++;
                typewriterTimeout = setTimeout(tick, speed);
            } else {
                typewriterTimeout = null;
                if (onDone) onDone();
            }
        }
        tick();
    }

    function showRandomQuote() {
        let index;
        do {
            index = Math.floor(Math.random() * STOIC_QUOTES.length);
        } while (index === lastIndex && STOIC_QUOTES.length > 1);
        lastIndex = index;

        const data = STOIC_QUOTES[index];

        // Fade out
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        newQuoteBtn.disabled = true;

        setTimeout(() => {
            quoteText.style.opacity = '1';
            // Typewriter the quote text
            typewriterReveal(quoteText, `"${data.text}"`, 22, () => {
                // After quote is done, fade in the author
                quoteAuthor.textContent = `— ${data.author}`;
                quoteAuthor.style.opacity = '1';
                newQuoteBtn.disabled = false;
            });
        }, 180);
    }
    
    // Show quote on page load
    showRandomQuote();
    
    // Fetch new quote when button is clicked
    newQuoteBtn.addEventListener('click', () => {
        logger.log('🔄 New quote requested by user');
        showRandomQuote();
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
 * Scroll-Triggered Section Entrance Animations
 * Staggered translateY + opacity reveal as sections enter the viewport
 */
function initScrollAnimations() {
    if (prefersReducedMotion()) return;

    // Targets: section titles, cards, stat-cards, repo-cards, book items
    const animatableSelectors = [
        '.section-title',
        '.card',
        '.stat-card',
        '.repo-card',
        '.project-card',
        '.book-item',
        '.portfolio-item',
        '.stoic-quote-card',
        '.poetry-card',
        '.about-content',
        '.info-item',
        '.tech-item',
    ];

    const elements = document.querySelectorAll(animatableSelectors.join(', '));

    // Set initial hidden state
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Stagger siblings within the same parent
                const siblings = Array.from(el.parentElement.children).filter(
                    c => c.style.opacity === '0'
                );
                const myIndex = siblings.indexOf(el);
                const delay = Math.min(myIndex * 70, 350); // cap stagger at 350ms
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(el => observer.observe(el));

    logger.log('🎬 Scroll entrance animations initialized');
}

/**
 * Initialize all functions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();           // Initialize theme first
    initSisyphusLogo();          // Initialize kinetic Sisyphus logo microphysics
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
    initScrollAnimations();      // Scroll-triggered entrance animations
    
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
        initSisyphusLogo,
        initScrollAnimations
    };
}
