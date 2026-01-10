// ========================================
// UTILITY FUNCTIONS
// Shared helper functions used across the portfolio
// ========================================

/**
 * Debug mode flag - set to false in production
 * Controls whether console.log statements are output
 */
const DEBUG_MODE = true;

/**
 * Console wrapper for development logging
 * Only outputs when DEBUG_MODE is true
 */
const logger = {
    log: (...args) => DEBUG_MODE && console.log(...args),
    warn: (...args) => DEBUG_MODE && console.warn(...args),
    error: (...args) => console.error(...args), // Always log errors
    info: (...args) => DEBUG_MODE && console.info(...args)
};

/**
 * Throttle function
 * Limits how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    
    return function(...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Debounce function
 * Delays function execution until after wait period of inactivity
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * Animate counting up to a number
 * Shared utility for stats animations
 * @param {HTMLElement} element - The element to animate
 * @param {number} target - Target number to count to
 * @param {number} duration - Animation duration in milliseconds (default 1000)
 */
function animateCount(element, target, duration = 1000) {
    if (!element) return;
    
    const start = 0;
    const increment = target / (duration / 16); // ~60fps
    let current = start;
    
    element.classList.add('counting');
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
            element.classList.remove('counting');
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Format large numbers with K/M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get current theme
 * @returns {string} 'dark' or 'light'
 */
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}

/**
 * Simple element selector with caching
 * Caches frequently accessed DOM elements
 */
const domCache = {
    _cache: new Map(),
    
    get(selector) {
        if (!this._cache.has(selector)) {
            this._cache.set(selector, document.querySelector(selector));
        }
        return this._cache.get(selector);
    },
    
    getAll(selector) {
        const key = `all:${selector}`;
        if (!this._cache.has(key)) {
            this._cache.set(key, document.querySelectorAll(selector));
        }
        return this._cache.get(key);
    },
    
    clear() {
        this._cache.clear();
    },
    
    // Refresh a specific selector
    refresh(selector) {
        this._cache.delete(selector);
        this._cache.delete(`all:${selector}`);
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        logger,
        throttle,
        debounce,
        animateCount,
        formatNumber,
        prefersReducedMotion,
        getCurrentTheme,
        domCache,
        DEBUG_MODE
    };
}
