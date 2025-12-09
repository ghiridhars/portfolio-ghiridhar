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
    
    // Use Open Library cover if ISBN is available, otherwise use manual cover or placeholder
    let coverHTML;
    if (book.isbn && !book.cover) {
        const coverUrl = getOpenLibraryCover(book.isbn, 'L');
        coverHTML = `<img src="${coverUrl}" alt="${book.title} cover" onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'>📖</div>'">`;
    } else if (book.cover) {
        coverHTML = `<img src="${book.cover}" alt="${book.title} cover" onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'>📖</div>'">`;
    } else {
        coverHTML = `<div class="cover-placeholder">📖</div>`;
    }
    
    // Add page count if available from Open Library
    const pageInfo = book.openLibraryData?.numberOfPages 
        ? `<span class="book-pages">${book.openLibraryData.numberOfPages} pages</span>`
        : '';
    
    // Add link to Open Library if ISBN is available
    const openLibraryLink = book.isbn 
        ? `<a href="https://openlibrary.org/isbn/${book.isbn}" target="_blank" rel="noopener noreferrer" class="book-link">View on Open Library →</a>`
        : '';
    
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
                    ${pageInfo}
                </div>
                ${openLibraryLink}
            </div>
        </article>
    `;
}

/**
 * Render All Books
 * Generates and displays all books from BOOKS_DATA with Open Library integration
 */
async function renderBooks() {
    const booksGrid = document.querySelector('.books-grid');
    
    if (!booksGrid) {
        console.error('Books grid container not found');
        return;
    }
    
    try {
        // Enrich books with Open Library data (only if needed)
        const enrichedBooks = await Promise.all(
            BOOKS_DATA.map(book => enrichBookWithOpenLibrary(book))
        );
        
        // Clear skeleton loaders
        booksGrid.innerHTML = '';
        
        // Generate and insert book cards
        enrichedBooks.forEach(book => {
            booksGrid.innerHTML += generateBookCard(book);
        });
        
        console.log(`✅ Rendered ${enrichedBooks.length} books with Open Library integration`);
        
        // Initialize scroll animations after rendering
        initScrollAnimations();
    } catch (error) {
        console.error('Error rendering books:', error);
        booksGrid.innerHTML = '<p class="error-message">Error loading books. Please refresh the page.</p>';
    }
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
 * Filters books based on active category, status, and search term
 */
function applyFilters() {
    const categoryFilter = document.querySelector('.book-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
    const statusFilter = document.querySelector('.status-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
    const searchInput = document.getElementById('bookSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const bookItems = document.querySelectorAll('.book-item');
    
    let visibleCount = 0;
    
    bookItems.forEach((item, index) => {
        const itemCategory = item.getAttribute('data-category');
        const itemStatus = item.getAttribute('data-status');
        const title = item.querySelector('.book-title')?.textContent.toLowerCase() || '';
        const author = item.querySelector('.book-author')?.textContent.toLowerCase() || '';
        
        const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;
        const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
        const matchesSearch = !searchTerm || title.includes(searchTerm) || author.includes(searchTerm);
        
        if (matchesCategory && matchesStatus && matchesSearch) {
            item.classList.remove('hidden');
            item.classList.add('visible');
            // Stagger animation
            item.style.transitionDelay = `${index * 0.05}s`;
            visibleCount++;
        } else {
            item.classList.add('hidden');
            item.classList.remove('visible');
            item.style.transitionDelay = '0s';
        }
    });
    
    console.log(`Filtered: ${visibleCount} books visible`);
}

/**
 * Update Reading Statistics
 * Calculates and displays reading stats from BOOKS_DATA with animated counting
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
    
    // Animate counting for each stat
    animateCount(statCards[0], finishedBooks.length);
    animateCount(statCards[1], currentlyReading.length);
    animateCount(statCards[2], wantToRead.length);
    
    console.log('📊 Reading stats updated:', {
        finished: finishedBooks.length,
        reading: currentlyReading.length,
        wantToRead: wantToRead.length
    });
}

/**
 * Animate counting up to a number
 * @param {HTMLElement} element - The element to animate
 * @param {number} target - Target number to count to
 */
function animateCount(element, target) {
    if (!element) return;
    
    const duration = 1000; // 1 second
    const start = 0;
    const increment = target / (duration / 16); // 60fps
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
    
    // Initialize reading progress bar
    initReadingProgress();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize view toggle
    initViewToggle();
    
    // Initialize books library toggle
    initBooksToggle();
    
    // Initialize trivia quiz
    initTrivia();
    
    console.log('✅ Books page initialized!');
});

/**
 * Initialize Reading Progress Bar
 * Shows scroll progress at the top of the page
 */
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

/**
 * Initialize Search Functionality
 * Real-time search for books by title or author
 */
function initSearch() {
    const searchInput = document.getElementById('bookSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const bookItems = document.querySelectorAll('.book-item');
        let visibleCount = 0;
        
        bookItems.forEach(item => {
            const title = item.querySelector('.book-title').textContent.toLowerCase();
            const author = item.querySelector('.book-author').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm) || author.includes(searchTerm);
            
            // Also check active filters
            const categoryFilter = document.querySelector('.book-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
            const statusFilter = document.querySelector('.status-filters .filter-btn.active')?.getAttribute('data-filter') || 'all';
            const itemCategory = item.getAttribute('data-category');
            const itemStatus = item.getAttribute('data-status');
            const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;
            const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
            
            if (matches && matchesCategory && matchesStatus) {
                item.classList.remove('hidden');
                item.classList.add('visible');
                visibleCount++;
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
            }
        });
        
        console.log(`🔍 Search: "${searchTerm}" - ${visibleCount} results`);
    });
}

/**
 * Initialize View Toggle
 * Switch between grid and list view
 */
function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const booksGrid = document.querySelector('.books-grid');
    
    if (!viewButtons.length || !booksGrid) return;
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to clicked button
            button.classList.add('active');
            
            const view = button.getAttribute('data-view');
            
            if (view === 'list') {
                booksGrid.classList.add('list-view');
            } else {
                booksGrid.classList.remove('list-view');
            }
            
            console.log(`📱 View changed to: ${view}`);
        });
    });
}

/**
 * Initialize Scroll Animations
 * Animate book cards as they enter viewport using Intersection Observer
 */
function initScrollAnimations() {
    const bookItems = document.querySelectorAll('.book-item');
    
    if (!bookItems.length) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    bookItems.forEach(item => {
        observer.observe(item);
    });
    
    console.log('🎬 Scroll animations initialized for', bookItems.length, 'books');
}

/**
 * ========================================
 * BOOK TRIVIA QUIZ
 * Uses Open Trivia Database API for book-related questions
 * ========================================
 */

let triviaQuestions = [];
let currentQuestionIndex = 0;
let triviaScore = 0;

/**
 * Initialize Books Toggle
 * Collapse/expand books library similar to Artes gallery
 */
function initBooksToggle() {
    const toggleBtn = document.getElementById('toggleBooksBtn');
    const booksGrid = document.getElementById('booksGrid');
    
    if (!toggleBtn || !booksGrid) {
        console.log('Books toggle elements not found');
        return;
    }
    
    toggleBtn.addEventListener('click', () => {
        const isExpanded = booksGrid.style.display !== 'none';
        
        if (isExpanded) {
            // Collapse
            booksGrid.style.display = 'none';
            toggleBtn.querySelector('.toggle-text').textContent = 'Show Library';
            toggleBtn.classList.remove('expanded');
            toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            // Expand
            booksGrid.style.display = 'grid';
            toggleBtn.querySelector('.toggle-text').textContent = 'Hide Library';
            toggleBtn.classList.add('expanded');
            toggleBtn.setAttribute('aria-expanded', 'true');
            
            // Smooth scroll to library after expanding
            setTimeout(() => {
                booksGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });
    
    console.log('📚 Books toggle initialized');
}

/**
 * Initialize Trivia Quiz
 */
function initTrivia() {
    const startBtn = document.getElementById('startTriviaBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    
    if (!startBtn || !playAgainBtn) return;
    
    startBtn.addEventListener('click', startTrivia);
    playAgainBtn.addEventListener('click', resetTrivia);
    
    console.log('🎯 Trivia quiz initialized');
}

/**
 * Start the Trivia Quiz
 */
async function startTrivia() {
    console.log('🚀 Starting trivia quiz...');
    
    const loadingText = document.querySelector('.trivia-description');
    if (loadingText) {
        loadingText.textContent = 'Loading questions...';
    }
    
    try {
        // Fetch 10 book-related questions from Open Trivia DB
        // Category 10 = Books
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=10&type=multiple');
        
        if (!response.ok) {
            throw new Error('Failed to fetch trivia questions');
        }
        
        const data = await response.json();
        
        if (data.response_code !== 0) {
            throw new Error('No questions available');
        }
        
        // Decode HTML entities in questions and answers
        triviaQuestions = data.results.map(q => ({
            question: decodeHTML(q.question),
            correctAnswer: decodeHTML(q.correct_answer),
            incorrectAnswers: q.incorrect_answers.map(a => decodeHTML(a)),
            difficulty: q.difficulty,
            allAnswers: shuffleArray([
                decodeHTML(q.correct_answer),
                ...q.incorrect_answers.map(a => decodeHTML(a))
            ])
        }));
        
        currentQuestionIndex = 0;
        triviaScore = 0;
        
        // Show quiz screen
        showScreen('quiz');
        displayQuestion();
        
        console.log('✅ Trivia questions loaded:', triviaQuestions.length);
        
    } catch (error) {
        console.error('❌ Error loading trivia:', error);
        if (loadingText) {
            loadingText.textContent = 'Failed to load questions. Please try again.';
        }
    }
}

/**
 * Display Current Question
 */
function displayQuestion() {
    const question = triviaQuestions[currentQuestionIndex];
    
    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = triviaQuestions.length;
    
    // Update score
    document.getElementById('triviaScore').textContent = triviaScore;
    
    // Update difficulty
    const difficultyBadge = document.querySelector('.trivia-difficulty');
    if (difficultyBadge) {
        difficultyBadge.textContent = question.difficulty;
        difficultyBadge.className = `trivia-difficulty difficulty-${question.difficulty}`;
    }
    
    // Update question text
    document.getElementById('triviaQuestion').textContent = question.question;
    
    // Clear and populate answers
    const answersContainer = document.getElementById('triviaAnswers');
    answersContainer.innerHTML = '';
    
    question.allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer, button));
        answersContainer.appendChild(button);
    });
    
    // Hide feedback
    document.getElementById('triviaFeedback').classList.add('hidden');
}

/**
 * Check Answer
 */
function checkAnswer(selectedAnswer, button) {
    const question = triviaQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Disable all answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.disabled = true;
        
        // Highlight correct answer
        if (btn.textContent === question.correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    // Mark selected answer as incorrect if wrong
    if (!isCorrect) {
        button.classList.add('incorrect');
    } else {
        triviaScore++;
        document.getElementById('triviaScore').textContent = triviaScore;
    }
    
    // Show feedback
    const feedbackDiv = document.getElementById('triviaFeedback');
    const feedbackText = feedbackDiv.querySelector('.feedback-text');
    const nextBtn = feedbackDiv.querySelector('.trivia-btn-secondary');
    
    feedbackText.textContent = isCorrect ? '✓ Correct!' : `✗ Wrong! The answer was: ${question.correctAnswer}`;
    feedbackText.className = `feedback-text ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.classList.remove('hidden');
    
    // Handle next question or finish
    if (nextBtn) {
        nextBtn.replaceWith(nextBtn.cloneNode(true)); // Remove old listeners
    }
    
    const newNextBtn = feedbackDiv.querySelector('.trivia-btn-secondary');
    if (currentQuestionIndex < triviaQuestions.length - 1) {
        newNextBtn.textContent = 'Next Question →';
        newNextBtn.addEventListener('click', nextQuestion);
    } else {
        newNextBtn.textContent = 'See Results →';
        newNextBtn.addEventListener('click', showResults);
    }
}

/**
 * Go to Next Question
 */
function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

/**
 * Show Results Screen
 */
function showResults() {
    const percentage = Math.round((triviaScore / triviaQuestions.length) * 100);
    let message = '';
    
    if (percentage === 100) {
        message = '🏆 Perfect score! You\'re a literary genius!';
    } else if (percentage >= 80) {
        message = '📚 Excellent work! You really know your books!';
    } else if (percentage >= 60) {
        message = '👍 Good job! Keep reading!';
    } else if (percentage >= 40) {
        message = '📖 Not bad! Time to hit the books!';
    } else {
        message = '💪 Keep learning! Every book is a new adventure!';
    }
    
    document.getElementById('finalScore').textContent = triviaScore;
    document.getElementById('totalScore').textContent = triviaQuestions.length;
    document.getElementById('resultsMessage').textContent = message;
    
    showScreen('results');
}

/**
 * Reset Trivia Quiz
 */
function resetTrivia() {
    triviaQuestions = [];
    currentQuestionIndex = 0;
    triviaScore = 0;
    
    const loadingText = document.querySelector('.trivia-description');
    if (loadingText) {
        loadingText.textContent = 'Test your knowledge of books and literature! Answer 10 multiple-choice questions and see how well you know the literary world.';
    }
    
    showScreen('start');
}

/**
 * Show Specific Screen
 */
function showScreen(screen) {
    const startScreen = document.getElementById('triviaStart');
    const quizScreen = document.getElementById('triviaQuiz');
    const resultsScreen = document.getElementById('triviaResults');
    
    // Hide all screens
    if (startScreen) startScreen.classList.add('hidden');
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.add('hidden');
    
    // Show the requested screen
    if (screen === 'start' && startScreen) {
        startScreen.classList.remove('hidden');
    } else if (screen === 'quiz' && quizScreen) {
        quizScreen.classList.remove('hidden');
    } else if (screen === 'results' && resultsScreen) {
        resultsScreen.classList.remove('hidden');
    }
    
    console.log('🎬 Showing screen:', screen);
}

/**
 * Decode HTML Entities
 */
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

/**
 * Shuffle Array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


