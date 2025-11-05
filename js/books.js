// ========================================
// BOOKS PAGE JAVASCRIPT
// Dynamically generates and filters books from data
// ========================================

/**
 * Generate Star Rating HTML
 * @param {number} rating - Rating from 0-5
 * @returns {string} HTML string for star rating
 */
function generateStarRating(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? 'filled' : '';
        starsHTML += `<span class="star ${filled}">★</span>`;
    }
    return starsHTML;
}

/**
 * Generate Book Card HTML
 * @param {Object} book - Book data object
 * @returns {string} HTML string for book card
 */
function generateBookCard(book) {
    const categoryLabel = CATEGORY_LABELS[book.category] || book.category;
    const statusLabel = STATUS_LABELS[book.status] || book.status;
    const favoriteIcon = book.favorite ? ' ★' : '';
    
    // Use cover image if available, otherwise use placeholder
    const coverHTML = book.cover 
        ? `<img src="${book.cover}" alt="${book.title} cover">`
        : `<div class="cover-placeholder">□</div>`;
    
    return `
        <article class="book-item" data-category="${book.category}" data-status="${book.status}" data-year="${book.year}">
            <div class="book-cover">
                ${coverHTML}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}${favoriteIcon}</h3>
                <p class="book-author">by ${book.author}</p>
                ${book.rating > 0 ? `
                <div class="book-rating">
                    ${generateStarRating(book.rating)}
                </div>
                ` : ''}
                ${book.review ? `
                <p class="book-review">${book.review}</p>
                ` : ''}
                <div class="book-meta">
                    <span class="book-category">${categoryLabel}</span>
                    <span class="book-status">${statusLabel}</span>
                    ${book.month ? `<span class="book-date">${book.month} ${book.year}</span>` : `<span class="book-date">${book.year}</span>`}
                </div>
            </div>
        </article>
    `;
}

/**
 * Render All Books
 * Generates and displays all books from BOOKS_DATA
 */
function renderBooks() {
    const booksGrid = document.querySelector('.books-grid');
    
    if (!booksGrid) {
        console.error('Books grid container not found');
        return;
    }
    
    // Clear existing books
    booksGrid.innerHTML = '';
    
    // Generate and insert book cards
    BOOKS_DATA.forEach(book => {
        booksGrid.innerHTML += generateBookCard(book);
    });
    
    console.log(`✅ Rendered ${BOOKS_DATA.length} books`);
}

/**
 * Initialize Books Filtering
 * Handles category and status filtering
 */
function initBooksFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!filterButtons.length) {
        console.log('No filter buttons found');
        return;
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons in the same group
            const filterGroup = button.closest('.book-filters, .status-filters');
            if (filterGroup) {
                filterGroup.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            }
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Apply filters
            applyFilters();
        });
    });
}

/**
 * Apply Current Filters
 * Filters books based on active category and status
 */
function applyFilters() {
    const categoryFilter = document.querySelector('.book-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
    const statusFilter = document.querySelector('.status-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
    const bookItems = document.querySelectorAll('.book-item');
    
    let visibleCount = 0;
    
    bookItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const itemStatus = item.getAttribute('data-status');
        
        const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;
        const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
        
        if (matchesCategory && matchesStatus) {
            item.classList.remove('hidden');
            item.style.animation = 'fadeInUp 0.5s ease-out';
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    console.log(`Filtered: ${visibleCount} books visible`);
}

/**
 * Update Reading Statistics
 * Calculates and displays reading stats from BOOKS_DATA
 */
function updateReadingStats() {
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    
    if (!statCards.length) {
        return;
    }
    
    // Calculate stats from data
    const finishedBooks = BOOKS_DATA.filter(book => book.status === 'finished' && book.year === new Date().getFullYear());
    const currentlyReading = BOOKS_DATA.filter(book => book.status === 'currently-reading');
    const wantToRead = BOOKS_DATA.filter(book => book.status === 'want-to-read');
    
    // Update stat cards
    if (statCards[0]) {
        statCards[0].textContent = finishedBooks.length;
    }
    if (statCards[1]) {
        statCards[1].textContent = currentlyReading.length;
    }
    if (statCards[2]) {
        statCards[2].textContent = wantToRead.length;
    }
    
    console.log('📊 Reading stats updated:', {
        finished: finishedBooks.length,
        reading: currentlyReading.length,
        wantToRead: wantToRead.length
    });
}

/**
 * Calculate Average Rating
 * Gets the average rating of finished books
 */
function calculateAverageRating() {
    const ratedBooks = BOOKS_DATA.filter(book => book.rating > 0);
    
    if (ratedBooks.length === 0) {
        return 0;
    }
    
    const totalRating = ratedBooks.reduce((sum, book) => sum + book.rating, 0);
    const averageRating = (totalRating / ratedBooks.length).toFixed(1);
    
    console.log(`⭐ Average rating: ${averageRating} (from ${ratedBooks.length} books)`);
    return averageRating;
}

/**
 * Initialize Books Page
 * Main initialization function
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Initializing Books page...');
    
    // Render books from data
    renderBooks();
    
    // Update statistics
    updateReadingStats();
    
    // Calculate average rating
    calculateAverageRating();
    
    // Initialize filtering
    initBooksFilter();
    
    console.log('✅ Books page initialized!');
});
