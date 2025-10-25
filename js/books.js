// ========================================
// BOOKS PAGE JAVASCRIPT
// Handles filtering and rating functionality
// ========================================

/**
 * Initialize Books Filtering
 * Allows users to filter books by category
 */
function initBooksFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const bookItems = document.querySelectorAll('.book-item');
    
    if (!filterButtons.length || !bookItems.length) {
        console.log('No filter buttons or book items found');
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
            
            // Filter book items
            bookItems.forEach(item => {
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
            
            console.log(`Filtered books by: ${filterValue}`);
        });
    });
}

/**
 * Update Reading Statistics
 * Calculates and displays reading stats
 */
function updateReadingStats() {
    const bookItems = document.querySelectorAll('.book-item');
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    
    if (!bookItems.length || !statCards.length) {
        return;
    }
    
    // Count books by category
    const categories = {};
    bookItems.forEach(item => {
        const category = item.getAttribute('data-category');
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // Update stat cards
    // You can customize this based on your needs
    if (statCards[0]) {
        statCards[0].textContent = bookItems.length;
    }
    if (statCards[1]) {
        statCards[1].textContent = '0'; // Currently reading - update manually
    }
    if (statCards[2]) {
        statCards[2].textContent = '0'; // Want to read - update manually
    }
    
    console.log('Reading stats updated!', categories);
}

/**
 * Calculate average rating
 * Gets the average rating of all books
 */
function calculateAverageRating() {
    const bookItems = document.querySelectorAll('.book-item');
    let totalRating = 0;
    let bookCount = 0;
    
    bookItems.forEach(item => {
        const filledStars = item.querySelectorAll('.star.filled');
        if (filledStars.length > 0) {
            totalRating += filledStars.length;
            bookCount++;
        }
    });
    
    const averageRating = bookCount > 0 ? (totalRating / bookCount).toFixed(1) : 0;
    console.log(`Average book rating: ${averageRating} ⭐`);
    
    return averageRating;
}

/**
 * Add animation to book covers on hover
 * Makes the UI more interactive
 */
function initBookAnimations() {
    const bookItems = document.querySelectorAll('.book-item');
    
    bookItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const cover = item.querySelector('.cover-placeholder');
            if (cover) {
                cover.style.transform = 'scale(1.05) rotate(2deg)';
                cover.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const cover = item.querySelector('.cover-placeholder');
            if (cover) {
                cover.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

/**
 * Initialize books page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    initBooksFilter();
    updateReadingStats();
    calculateAverageRating();
    initBookAnimations();
    
    console.log('Books page initialized! 📚');
});
