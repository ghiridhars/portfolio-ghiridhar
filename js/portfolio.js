// ========================================
// PORTFOLIO PAGE JAVASCRIPT
// Handles art gallery interactions
// ========================================

/**
 * Initialize Portfolio Gallery
 * Adds image loading and interaction features
 */
function initPortfolioGallery() {
    const portfolioImages = document.querySelectorAll('.portfolio-item img');
    
    if (!portfolioImages.length) {
        console.log('No portfolio images found');
        return;
    }
    
    // Add smooth loading behavior to images
    portfolioImages.forEach(img => {
        // Only apply fade-in if image hasn't loaded yet
        if (!img.complete) {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in';
            
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            // Fallback: show image after 1 second if load event doesn't fire
            setTimeout(() => {
                img.style.opacity = '1';
            }, 1000);
        }
    });
    
    console.log(`Portfolio gallery initialized with ${portfolioImages.length} images`);
}

/**
 * Initialize Literature Items
 * Could add read more functionality in the future
 */
function initLiteratureSection() {
    const literatureItems = document.querySelectorAll('.literature-item');
    
    if (!literatureItems.length) {
        console.log('No literature items found');
        return;
    }
    
    console.log(`Literature section initialized with ${literatureItems.length} items`);
}

/**
 * Initialize portfolio page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioGallery();
    initLiteratureSection();
    
    console.log('Portfolio page initialized! 🎨');
});
