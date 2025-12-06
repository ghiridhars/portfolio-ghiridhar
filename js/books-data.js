// ========================================
// BOOKS DATA
// Centralized book library data
// ========================================

/**
 * Book Library Data Structure
 * 
 * Fields:
 * - id: Unique identifier
 * - title: Book title
 * - author: Author name
 * - isbn: ISBN-10 or ISBN-13 (optional but recommended for Open Library API)
 * - openLibraryId: Open Library ID like "OL123456M" (optional)
 * - category: tech | fiction | business | personal | philosophy | other
 * - status: finished | currently-reading | want-to-read
 * - rating: 0-5 (0 for unrated/unfinished)
 * - year: Year you read/started it
 * - month: Month name (optional)
 * - review: Your thoughts/review
 * - favorite: true/false - Mark special books
 * - cover: Path to cover image (optional - auto-fetched from Open Library if isbn provided)
 */

const BOOKS_DATA = [
    {
        id: 1,
        title: "The Myth of Sisyphus",
        author: "Albert Camus",
        isbn: "9780525564454",
        category: "philosophy",
        status: "finished",
        rating: 5,
        year: 2024,
        month: "October",
        review: "A profound exploration of absurdism and the human condition. Camus questions whether life is worth living in an absurd world. His answer - we must imagine Sisyphus happy.",
        favorite: true,
        cover: ""
    },
    {
        id: 2,
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        category: "tech",
        status: "currently-reading",
        rating: 0,
        year: 2024,
        month: "November",
        review: "",
        favorite: false,
        cover: ""
    },
    {
        id: 3,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        isbn: "9780374533557",
        category: "business",
        status: "finished",
        rating: 5,
        year: 2024,
        month: "September",
        review: "Fascinating insight into how we make decisions. The two systems of thinking - fast and intuitive vs slow and deliberate - explain so much about human behavior.",
        favorite: true,
        cover: ""
    },
    {
        id: 4,
        title: "1984",
        author: "George Orwell",
        isbn: "9780451524935",
        category: "fiction",
        status: "finished",
        rating: 5,
        year: 2023,
        month: "December",
        review: "A chilling dystopian masterpiece that feels increasingly relevant. Big Brother is watching, and doublethink is real.",
        favorite: true,
        cover: ""
    },
    {
        id: 5,
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9780735211292",
        category: "personal",
        status: "finished",
        rating: 4,
        year: 2024,
        month: "August",
        review: "Practical strategies for building good habits and breaking bad ones. The 1% improvement philosophy is powerful and actionable.",
        favorite: false,
        cover: ""
    },
    {
        id: 6,
        title: "The Stranger",
        author: "Albert Camus",
        isbn: "9780679720201",
        category: "fiction",
        status: "finished",
        rating: 5,
        year: 2024,
        month: "October",
        review: "Meursault's emotional detachment and the absurdity of his trial create a haunting narrative about society's expectations and existential freedom.",
        favorite: true,
        cover: ""
    },
    {
        id: 7,
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        isbn: "9781449373320",
        category: "tech",
        status: "want-to-read",
        rating: 0,
        year: 2024,
        month: "",
        review: "",
        favorite: false,
        cover: ""
    },
    {
        id: 8,
        title: "Deep Work",
        author: "Cal Newport",
        isbn: "9781455586691",
        category: "personal",
        status: "finished",
        rating: 4,
        year: 2024,
        month: "July",
        review: "Compelling argument for focused work in a distracted world. The strategies for cultivating deep work habits are immediately applicable.",
        favorite: false,
        cover: ""
    }
    
    // ADD MORE BOOKS HERE - just copy the structure above
    // Remember to increment the id number
    // Find ISBNs at: https://openlibrary.org or on the book's back cover
];

/**
 * Category Display Names
 * Maps internal category names to display labels
 */
const CATEGORY_LABELS = {
    tech: "Technology",
    fiction: "Fiction",
    business: "Business",
    personal: "Personal Development",
    philosophy: "Philosophy",
    other: "Other"
};

/**
 * Status Display Names
 * Maps internal status names to display labels
 */
const STATUS_LABELS = {
    "finished": "Finished",
    "currently-reading": "Currently Reading",
    "want-to-read": "Want to Read"
};

/**
 * Open Library API Integration
 * Fetches book cover and metadata from Open Library
 */

/**
 * Get book cover URL from Open Library using ISBN
 * @param {string} isbn - Book ISBN (10 or 13 digits)
 * @param {string} size - Size of cover image: S, M, L
 * @returns {string} Cover image URL
 */
function getOpenLibraryCover(isbn, size = 'M') {
    if (!isbn) return null;
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Fetch book data from Open Library API
 * @param {string} isbn - Book ISBN
 * @returns {Promise<Object>} Book data from API
 */
async function fetchBookFromOpenLibrary(isbn) {
    if (!isbn) return null;
    
    try {
        const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn(`Failed to fetch book data for ISBN ${isbn}:`, error);
        return null;
    }
}

/**
 * Enrich book data with Open Library information
 * @param {Object} book - Book data object
 * @returns {Promise<Object>} Enriched book data
 */
async function enrichBookWithOpenLibrary(book) {
    if (!book.isbn) return book;
    
    // If cover is not manually set, fetch from Open Library
    if (!book.cover) {
        book.cover = getOpenLibraryCover(book.isbn, 'L');
    }
    
    // Optionally fetch additional metadata
    const apiData = await fetchBookFromOpenLibrary(book.isbn);
    if (apiData) {
        // Add any additional data you want from the API
        book.openLibraryData = {
            numberOfPages: apiData.number_of_pages,
            publishDate: apiData.publish_date,
            publishers: apiData.publishers
        };
    }
    
    return book;
}
