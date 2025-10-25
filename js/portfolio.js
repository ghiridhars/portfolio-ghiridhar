// ========================================
// PORTFOLIO PAGE JAVASCRIPT
// Handles filtering of portfolio items
// ========================================

/**
 * Initialize Portfolio Filtering
 * Allows users to filter portfolio items by category
 */
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (!filterButtons.length || !portfolioItems.length) {
        console.log('No filter buttons or portfolio items found');
        return;
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the filter category
            const filterValue = button.getAttribute('data-filter');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    // Show item with animation
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    // Hide item
                    item.classList.add('hidden');
                }
            });
            
            // Log for learning purposes
            console.log(`Filtered by: ${filterValue}`);
        });
    });
}

/**
 * Count items in each category
 * Optional: Display count next to filter buttons
 */
function countPortfolioItems() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const categories = {};
    
    // Count items in each category
    portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // Log counts for learning
    console.log('Portfolio items by category:', categories);
    
    return categories;
}

/**
 * Initialize portfolio page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioFilter();
    countPortfolioItems();
    
    console.log('Portfolio page initialized! 🎨');
});
