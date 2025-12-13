// ========================================
// MAIN JAVASCRIPT FILE
// This file contains common functionality used across all pages
// ========================================

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
            console.log(`Theme switched to: ${newTheme} 🎨`);
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
        console.log('⚠️ Poetry elements not found on this page');
        return;
    }
    
    console.log('✅ Poetry elements found, initializing...');
    
    /**
     * Fetch a random poem from PoetryDB
     */
    async function fetchPoem() {
        try {
            console.log('📖 Fetching poem from PoetryDB...');
            
            // Add loading state
            poemTitle.style.opacity = '0.5';
            poemLines.style.opacity = '0.5';
            poemAuthor.style.opacity = '0.5';
            newPoemBtn.disabled = true;
            
            // Fetch random poem (PoetryDB returns array of poems)
            const response = await fetch('https://poetrydb.org/random/1');
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Poem received:', data);
            
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
            console.error('❌ Error fetching poem:', error);
            console.error('Error details:', error.message);
            
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
    console.log('🚀 Fetching initial poem...');
    fetchPoem();
    
    // Fetch new poem when button is clicked
    newPoemBtn.addEventListener('click', () => {
        console.log('📖 New poem requested by user');
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
        console.log('⚠️ Stoic quote elements not found on this page');
        return;
    }
    
    console.log('✅ Stoic quote elements found, initializing...');
    
    /**
     * Fetch a random Stoic quote from the API
     */
    async function fetchStoicQuote() {
        try {
            console.log('🔄 Fetching quote from API...');
            
            // Add loading state
            quoteText.style.opacity = '0.5';
            quoteAuthor.style.opacity = '0.5';
            newQuoteBtn.disabled = true;
            
            const response = await fetch('https://stoic-quotes.com/api/quote');
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Quote received:', data);
            
            // Animate quote change
            setTimeout(() => {
                quoteText.textContent = `"${data.text}"`;
                quoteAuthor.textContent = `— ${data.author}`;
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
                newQuoteBtn.disabled = false;
            }, 200);
            
        } catch (error) {
            console.error('❌ Error fetching Stoic quote:', error);
            console.error('Error details:', error.message);
            
            // Show error in the UI
            quoteText.textContent = 'Failed to load quote. Please try again.';
            quoteAuthor.textContent = `— Error: ${error.message}`;
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
            newQuoteBtn.disabled = false;
        }
    }
    
    // Fetch quote on page load
    console.log('🚀 Fetching initial quote...');
    fetchStoicQuote();
    
    // Fetch new quote when button is clicked
    newQuoteBtn.addEventListener('click', () => {
        console.log('🔄 New quote requested by user');
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
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
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
    
    // Update progress on scroll
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call
    
    console.log('📊 Scroll progress bar initialized');
}

/**
 * Initialize all functions when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();      // Initialize theme first
    initMobileNav();
    initSmoothScroll();
    initPoetry();           // Initialize Poetry API
    initStoicQuote();       // Initialize Stoic quote API
    highlightCurrentPage();
    initLazyLoading();
    initScrollToTop();
    initScrollProgress();   // Initialize scroll progress bar
    
    // Log message for learning purposes
    console.log('Portfolio website loaded successfully! 🚀');
    console.log('Current theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Press Ctrl+K to open command palette');
});

// Export functions if using modules (optional for learning)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileNav,
        initSmoothScroll,
        highlightCurrentPage,
        initLazyLoading,
        initScrollToTop
    };
}
