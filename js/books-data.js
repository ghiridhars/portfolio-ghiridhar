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
 * - category: tech | fiction | business | personal | philosophy | other
 * - status: finished | currently-reading | want-to-read
 * - rating: 0-5 (0 for unrated/unfinished)
 * - year: Year you read/started it
 * - month: Month name (optional)
 * - review: Your thoughts/review
 * - favorite: true/false - Mark special books
 * - cover: Path to cover image (optional)
 */

const BOOKS_DATA = [
    {
        id: 1,
        title: "The Myth of Sisyphus",
        author: "Albert Camus",
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
