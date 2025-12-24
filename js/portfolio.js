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
        
        // Image protection: Disable right-click context menu
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Disable drag and drop
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Add user-select: none to prevent text/image selection
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        img.style.mozUserSelect = 'none';
        img.style.msUserSelect = 'none';
        
        // Disable pointer events on long press (mobile)
        img.style.webkitTouchCallout = 'none';
    });
    
    console.log(`Portfolio gallery initialized with ${portfolioImages.length} images (protection enabled)`);
}

/**
 * Toggle Artes Gallery
 * Shows/hides the additional art items beyond the first 2
 */
function initArtesToggle() {
    const toggleBtn = document.getElementById('toggleArtesBtn');
    const hiddenItems = document.querySelectorAll('.portfolio-item-hidden');
    
    if (!toggleBtn || !hiddenItems.length) {
        console.log('Artes toggle elements not found');
        return;
    }
    
    let isExpanded = false;
    
    toggleBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            // Show all hidden items
            hiddenItems.forEach(item => {
                item.style.display = '';
            });
            toggleBtn.querySelector('.toggle-text').textContent = 'Show Less';
            toggleBtn.querySelector('.material-symbols-sharp').textContent = 'expand_less';
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            // Hide items again
            hiddenItems.forEach(item => {
                item.style.display = 'none';
            });
            toggleBtn.querySelector('.toggle-text').textContent = 'Show Full Gallery';
            toggleBtn.querySelector('.material-symbols-sharp').textContent = 'expand_more';
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    console.log('Artes toggle initialized');
}

/**
 * Initialize portfolio page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioGallery();
    initArtesToggle();
    
    console.log('Portfolio page initialized! 🎨');
});
