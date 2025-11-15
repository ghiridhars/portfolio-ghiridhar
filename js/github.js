// ========================================
// GITHUB API INTEGRATION
// Fetches and displays GitHub profile and repository data
// ========================================

const GITHUB_CONFIG = {
    username: 'ghiridhars',
    apiBase: 'https://api.github.com',
    maxRepos: 8, // Number of repositories to display as projects
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    // Note: Tech stack is built from ALL repositories, not just the displayed ones
};

/**
 * Fetch GitHub user profile data
 * @returns {Promise<Object>} User profile data
 */
async function fetchGitHubProfile() {
    try {
        const response = await fetch(`${GITHUB_CONFIG.apiBase}/users/${GITHUB_CONFIG.username}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ GitHub profile data fetched:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching GitHub profile:', error);
        return null;
    }
}

/**
 * Fetch GitHub events for contribution calendar
 * @returns {Promise<Array>} Array of event objects
 */
async function fetchGitHubEvents() {
    try {
        const response = await fetch(`${GITHUB_CONFIG.apiBase}/users/${GITHUB_CONFIG.username}/events/public`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const events = await response.json();
        console.log('✅ GitHub events fetched:', events.length);
        return events;
    } catch (error) {
        console.error('❌ Error fetching GitHub events:', error);
        return [];
    }
}

/**
 * Fetch GitHub repositories
 * @param {number} limit - Number of repos to fetch (optional)
 * @returns {Promise<Array>} Array of repository objects
 */
async function fetchGitHubRepos(limit = GITHUB_CONFIG.maxRepos) {
    try {
        // Fetch repos sorted by last updated
        const response = await fetch(
            `${GITHUB_CONFIG.apiBase}/users/${GITHUB_CONFIG.username}/repos?sort=updated&per_page=${limit}&type=owner`
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        console.log(`✅ GitHub repositories fetched: ${repos.length}`);
        console.log('📦 Repository data:', repos);
        return repos;
    } catch (error) {
        console.error('❌ Error fetching GitHub repos:', error);
        return [];
    }
}

/**
 * Fetch ALL GitHub repositories for tech stack analysis
 * @returns {Promise<Array>} Array of all repository objects
 */
async function fetchAllGitHubRepos() {
    try {
        // Fetch up to 100 repos (GitHub API max per page)
        const response = await fetch(
            `${GITHUB_CONFIG.apiBase}/users/${GITHUB_CONFIG.username}/repos?sort=updated&per_page=100&type=owner`
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        console.log(`✅ All repositories fetched for tech stack: ${repos.length}`);
        return repos;
    } catch (error) {
        console.error('❌ Error fetching all GitHub repos:', error);
        return [];
    }
}

/**
 * Get cached data from localStorage
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null if expired/missing
 */
function getCachedData(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > GITHUB_CONFIG.cacheTime;
        
        if (isExpired) {
            localStorage.removeItem(key);
            return null;
        }
        
        console.log(`📦 Using cached data for: ${key}`);
        return data;
    } catch (error) {
        console.error('❌ Error reading cache:', error);
        return null;
    }
}

/**
 * Save data to localStorage cache
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 */
function setCachedData(key, data) {
    try {
        const cacheObject = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheObject));
        console.log(`💾 Data cached for: ${key}`);
    } catch (error) {
        console.error('❌ Error saving to cache:', error);
    }
}

/**
 * Display GitHub profile statistics
 * @param {Object} profileData - GitHub profile data
 */
function displayGitHubStats(profileData) {
    if (!profileData) {
        console.warn('⚠️ No profile data to display');
        return;
    }
    
    // Update repository count
    const reposElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (reposElement) {
        animateNumber(reposElement, profileData.public_repos || 0);
    }
    
    // Update followers count (using as "Contributions This Year" placeholder)
    const followersElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
    if (followersElement) {
        animateNumber(followersElement, profileData.followers || 0);
        // Update label to reflect actual data
        const labelElement = document.querySelector('.stat-card:nth-child(2) .stat-label');
        if (labelElement) {
            labelElement.textContent = 'Followers';
        }
    }
    
    // Calculate total stars across all repos (will update after fetching repos)
    const starsElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (starsElement) {
        starsElement.textContent = '...';
        const labelElement = document.querySelector('.stat-card:nth-child(3) .stat-label');
        if (labelElement) {
            labelElement.textContent = 'Total Stars';
        }
    }
    
    console.log('📊 GitHub stats updated');
}

/**
 * Animate number counting up
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 */
function animateNumber(element, target) {
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

/**
 * Display GitHub repositories as project cards
 * @param {Array} repos - Array of repository objects
 */
function displayGitHubProjects(repos) {
    if (!repos || repos.length === 0) {
        console.warn('⚠️ No repositories to display');
        return;
    }
    
    const projectsList = document.querySelector('.projects-list');
    if (!projectsList) {
        console.error('❌ Projects list container not found');
        return;
    }
    
    // Calculate total stars
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const starsElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (starsElement) {
        animateNumber(starsElement, totalStars);
    }
    
    // Clear existing placeholder projects
    projectsList.innerHTML = '';
    
    // Create project cards from repositories
    repos.forEach(repo => {
        const projectCard = createProjectCard(repo);
        projectsList.appendChild(projectCard);
    });
    
    console.log(`✅ ${repos.length} projects displayed`);
}

/**
 * Create a project card element from repository data
 * @param {Object} repo - Repository object from GitHub API
 * @returns {HTMLElement} Project card element
 */
function createProjectCard(repo) {
    const article = document.createElement('article');
    article.className = 'project-card';
    
    // Get primary language or default
    const language = repo.language || 'Code';
    
    // Format description
    const description = repo.description || 'No description available';
    
    // Create topics/tags
    const topics = repo.topics || [];
    const techTags = topics.length > 0 ? topics : [language];
    
    article.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">
                <span class="folder-icon"><span class="material-symbols-sharp">folder</span></span>
                ${repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <div class="project-links">
                <a href="${repo.html_url}" class="icon-link" aria-label="View code" target="_blank" rel="noopener">
                    <span>Code</span>
                </a>
                ${repo.homepage ? `
                    <a href="${repo.homepage}" class="icon-link" aria-label="View live demo" target="_blank" rel="noopener">
                        <span>Demo</span>
                    </a>
                ` : ''}
            </div>
        </div>
        <p class="project-description">
            ${description}
        </p>
        <div class="project-tech">
            ${techTags.slice(0, 5).map(tag => 
                `<span class="tech-tag">${tag}</span>`
            ).join('')}
        </div>
        <div class="project-stats">
            <span class="stat">
                <span class="material-symbols-sharp">star</span>
                ${repo.stargazers_count || 0}
            </span>
            <span class="stat">
                <span class="material-symbols-sharp">fork_right</span>
                ${repo.forks_count || 0}
            </span>
            ${repo.language ? `
                <span class="stat">
                    <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                    ${repo.language}
                </span>
            ` : ''}
        </div>
    `;
    
    return article;
}

/**
 * Get color for programming language
 * @param {string} language - Programming language name
 * @returns {string} Hex color code
 */
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'C++': '#f34b7d',
        'C': '#555555',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'Vue': '#41b883',
        'React': '#61dafb',
    };
    return colors[language] || '#8257e5';
}

/**
 * Get icon for technology
 * @param {string} tech - Technology name
 * @returns {string} Material Symbol icon name
 */
function getTechIcon(tech) {
    const iconMap = {
        // Languages
        'Java': 'coffee',
        'JavaScript': 'code',
        'TypeScript': 'code',
        'Python': 'terminal',
        'C++': 'memory',
        'C': 'memory',
        'Go': 'speed',
        'Rust': 'shield',
        'Ruby': 'diamond',
        'PHP': 'code',
        'Swift': 'phone_iphone',
        'Kotlin': 'android',
        'Dart': 'flutter',
        'HTML': 'html',
        'CSS': 'css',
        'Shell': 'terminal',
        
        // Frameworks & Libraries
        'Spring': 'deceased',
        'Spring Boot': 'deceased',
        'React': 'settings_ethernet',
        'Vue': 'settings_ethernet',
        'Angular': 'settings_ethernet',
        'Django': 'terminal',
        'Flask': 'science',
        'Express': 'api',
        'Node.js': 'hexagon',
        'Next.js': 'settings_ethernet',
        
        // Databases
        'MySQL': 'storage',
        'PostgreSQL': 'database',
        'MongoDB': 'storage',
        'Redis': 'speed',
        'SQLite': 'database',
        
        // Tools & Platforms
        'Docker': 'deployed_code',
        'Kubernetes': 'hub',
        'AWS': 'cloud',
        'Azure': 'cloud',
        'GCP': 'cloud',
        'Git': 'account_tree',
        'GitHub': 'account_tree',
        'CI/CD': 'integration_instructions',
        'REST API': 'api',
        'GraphQL': 'api',
        'Microservices': 'hub',
        'Testing': 'science',
        'JUnit': 'science',
        'Jest': 'science',
        'Hibernate': 'transform',
        'JPA': 'transform',
    };
    
    return iconMap[tech] || 'code';
}

/**
 * Update tech stack section based on repository data
 * @param {Array} repos - Array of repository objects
 */
function updateTechStack(repos) {
    const techGrid = document.querySelector('.tech-grid');
    if (!techGrid) {
        console.warn('⚠️ Tech grid not found');
        return;
    }
    
    // Collect all technologies from repos
    const techSet = new Set();
    
    repos.forEach(repo => {
        // Add primary language
        if (repo.language) {
            techSet.add(repo.language);
            console.log(`📌 Language from ${repo.name}:`, repo.language);
        }
        
        // Add topics (GitHub tags)
        if (repo.topics && Array.isArray(repo.topics)) {
            console.log(`📌 Topics from ${repo.name}:`, repo.topics);
            repo.topics.forEach(topic => {
                // Capitalize first letter and convert to readable format
                const formattedTopic = formatTechName(topic);
                techSet.add(formattedTopic);
            });
        }
    });
    
    // Convert to array and sort alphabetically
    const technologies = Array.from(techSet).sort();
    
    console.log(`🔧 Total unique technologies found:`, technologies.length);
    console.log(`🔧 Technologies:`, technologies);
    
    if (technologies.length === 0) {
        console.warn('⚠️ No technologies found in repositories');
        return;
    }
    
    // Clear existing tech items
    techGrid.innerHTML = '';
    
    // Create tech items from detected technologies
    technologies.forEach(tech => {
        const techItem = createTechItem(tech);
        techGrid.appendChild(techItem);
    });
    
    console.log(`✅ ${technologies.length} technologies displayed in tech grid`);
}

/**
 * Format technology name for display
 * @param {string} name - Raw technology name
 * @returns {string} Formatted name
 */
function formatTechName(name) {
    // Handle special cases
    const specialCases = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'nodejs': 'Node.js',
        'nextjs': 'Next.js',
        'postgresql': 'PostgreSQL',
        'mongodb': 'MongoDB',
        'graphql': 'GraphQL',
        'rest-api': 'REST API',
        'restful-api': 'REST API',
        'springboot': 'Spring Boot',
        'spring-boot': 'Spring Boot',
        'microservices': 'Microservices',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'aws': 'AWS',
        'gcp': 'GCP',
        'azure': 'Azure',
        'ci-cd': 'CI/CD',
        'mysql': 'MySQL',
        'html5': 'HTML',
        'css3': 'CSS',
    };
    
    const lowerName = name.toLowerCase();
    
    if (specialCases[lowerName]) {
        return specialCases[lowerName];
    }
    
    // Capitalize first letter of each word
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Create a tech item element
 * @param {string} tech - Technology name
 * @returns {HTMLElement} Tech item element
 */
function createTechItem(tech) {
    const div = document.createElement('div');
    div.className = 'tech-item';
    
    const icon = getTechIcon(tech);
    
    div.innerHTML = `
        <span class="tech-icon">
            <span class="material-symbols-sharp">${icon}</span>
        </span>
        <h4>${tech}</h4>
    `;
    
    return div;
}

/**
 * Build contribution calendar from GitHub events
 * @param {Array} events - Array of GitHub event objects
 */
function buildContributionCalendar(events) {
    const calendarGrid = document.getElementById('contributionGrid');
    if (!calendarGrid) {
        console.error('❌ Calendar grid not found');
        return;
    }
    
    // Calculate last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29); // 30 days including today
    
    // Initialize contribution map
    const contributionMap = new Map();
    
    // Count contributions per day from events
    events.forEach(event => {
        // Only count certain event types as contributions
        const contributionTypes = ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'];
        if (!contributionTypes.includes(event.type)) return;
        
        const eventDate = new Date(event.created_at);
        const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Count multiple commits in a single push event
        let count = 1;
        if (event.type === 'PushEvent' && event.payload.commits) {
            count = event.payload.commits.length;
        }
        
        contributionMap.set(dateKey, (contributionMap.get(dateKey) || 0) + count);
    });
    
    console.log('📊 Contribution map:', contributionMap);
    
    // Clear loading state
    calendarGrid.innerHTML = '';
    
    // Generate calendar for last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const contributions = contributionMap.get(dateKey) || 0;
        const level = getContributionLevel(contributions);
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day level-${level}`;
        dayElement.setAttribute('data-date', dateKey);
        dayElement.setAttribute('data-count', contributions);
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'calendar-tooltip';
        tooltip.textContent = formatTooltip(date, contributions);
        dayElement.appendChild(tooltip);
        
        calendarGrid.appendChild(dayElement);
    }
    
    console.log('✅ Contribution calendar built');
}

/**
 * Get contribution level based on count
 * @param {number} count - Number of contributions
 * @returns {number} Level from 0-2
 */
function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    return 2;
}

/**
 * Format tooltip text for calendar day
 * @param {Date} date - Date object
 * @param {number} count - Number of contributions
 * @returns {string} Formatted tooltip text
 */
function formatTooltip(date, count) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    const plural = count === 1 ? '' : 's';
    return `${count} contribution${plural} on ${dateStr}`;
}

/**
 * Show loading state
 */
function showLoadingState() {
    const projectsList = document.querySelector('.projects-list');
    if (projectsList) {
        projectsList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading projects from GitHub...</p>
            </div>
        `;
    }
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showErrorState(message) {
    const projectsList = document.querySelector('.projects-list');
    if (projectsList) {
        projectsList.innerHTML = `
            <div class="error-state">
                <span class="material-symbols-sharp" style="font-size: 3rem; color: var(--error-color, #dc2626)">error</span>
                <p>${message}</p>
                <p class="error-hint">Showing cached data or please try refreshing the page.</p>
            </div>
        `;
    }
}

/**
 * Initialize GitHub integration
 */
async function initGitHub() {
    console.log('🚀 Initializing GitHub integration...');
    
    // Show loading state
    showLoadingState();
    
    try {
        // Try to get cached data first
        let profileData = getCachedData('github_profile');
        let reposData = getCachedData('github_repos');
        let allReposData = getCachedData('github_all_repos');
        let eventsData = getCachedData('github_events');
        
        // If no cache, fetch fresh data
        if (!profileData || !reposData || !allReposData || !eventsData) {
            console.log('🔄 Fetching fresh data from GitHub API...');
            
            // Fetch data in parallel
            [profileData, reposData, allReposData, eventsData] = await Promise.all([
                fetchGitHubProfile(),
                fetchGitHubRepos(GITHUB_CONFIG.maxRepos), // Limited repos for display
                fetchAllGitHubRepos(), // All repos for tech stack
                fetchGitHubEvents() // Events for contribution calendar
            ]);
            
            // Cache the data
            if (profileData) setCachedData('github_profile', profileData);
            if (reposData) setCachedData('github_repos', reposData);
            if (allReposData) setCachedData('github_all_repos', allReposData);
            if (eventsData) setCachedData('github_events', eventsData);
        }
        
        // Display the data
        if (profileData) {
            displayGitHubStats(profileData);
        }
        
        // Build contribution calendar
        if (eventsData && eventsData.length > 0) {
            buildContributionCalendar(eventsData);
        } else {
            console.warn('⚠️ No events data for contribution calendar');
            const calendarGrid = document.getElementById('contributionGrid');
            if (calendarGrid) {
                calendarGrid.innerHTML = '<p style="text-align: center; padding: 2rem; opacity: 0.7;">No recent activity data available</p>';
            }
        }
        
        // Update tech stack based on ALL repositories
        if (allReposData && allReposData.length > 0) {
            updateTechStack(allReposData);
        }
        
        // Display limited projects
        if (reposData && reposData.length > 0) {
            displayGitHubProjects(reposData);
        } else {
            showErrorState('No repositories found');
        }
        
        // Update GitHub link in CTA section
        const githubLink = document.querySelector('.cta-section .btn-primary');
        if (githubLink && profileData) {
            githubLink.href = profileData.html_url;
        }
        
    } catch (error) {
        console.error('❌ Error initializing GitHub:', error);
        showErrorState('Failed to load GitHub data');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGitHub);
} else {
    initGitHub();
}
