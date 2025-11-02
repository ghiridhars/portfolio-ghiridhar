# GitHub Integration Documentation

## Overview

The portfolio now features a dynamic GitHub integration on the **Coding Projects** page that fetches and displays your real GitHub data.

## Features

### 1. **GitHub Statistics**
- **Public Repositories Count**: Shows total number of public repos
- **Followers**: Displays your GitHub followers count
- **Total Stars**: Calculates and shows total stars across all repositories

### 2. **Dynamic Project Cards**
Each repository is displayed as a project card showing:
- Repository name (formatted nicely)
- Description
- Primary programming language with color-coded indicator
- Topics/tags from the repository
- Stars count
- Forks count
- Links to code and live demo (if homepage URL exists)

### 3. **Dynamic Tech Stack**
The "Technologies I Work With" section is automatically populated based on:
- **Languages**: Detected from **ALL your repositories** (not just displayed ones)
- **Topics**: GitHub repository topics/tags from **ALL your repositories**
- **Auto-formatted**: Converts tags like "spring-boot" to "Spring Boot"
- **Smart Icons**: Automatically matches appropriate icons to each technology
- **Sorted**: Alphabetically arranged for easy scanning

This means:
- ✅ No manual updates needed
- ✅ Always shows what you're actually using **across all projects**
- ✅ Reflects your complete tech stack accurately
- ✅ Updates automatically as you add new repos/topics
- ✅ Not limited to just the 8 displayed projects

**Important**: While only 8 projects are displayed, the tech stack shows technologies from up to 100 of your repositories!

### 4. **Smart Caching**
- Data is cached in browser's localStorage for 24 hours
- Reduces API calls and improves loading speed
- Falls back to cached data if API is unavailable

### 5. **User Experience**
- Loading spinner while fetching data
- Smooth number animations for statistics
- Error handling with helpful messages
- Responsive design for all screen sizes

## How It Works

### API Endpoints Used

1. **User Profile**: `https://api.github.com/users/ghiridhars`
   - Fetches profile stats (repos, followers, etc.)

2. **Repositories**: `https://api.github.com/users/ghiridhars/repos`
   - Fetches your public repositories
   - Sorted by recently updated
   - Limited to top 6 repositories

### Rate Limits

GitHub API rate limits for unauthenticated requests:
- **60 requests per hour** from the same IP address
- Cached data helps avoid hitting this limit

### Files Modified

1. **`js/github.js`** (New file)
   - Main integration logic
   - API fetching functions
   - DOM manipulation
   - Caching system

2. **`coding.html`**
   - Added script reference to `github.js`

3. **`css/coding.css`**
   - Added stats grid styles
   - Project stats display
   - Loading and error states
   - Language color indicators
   - Responsive design updates

## Customization

### Maximize Your Tech Stack Display

To get the most out of the dynamic tech stack, **add topics to your GitHub repositories**:

1. Go to any of your repositories on GitHub
2. Click "Add topics" (under the About section)
3. Add relevant technologies: `spring-boot`, `docker`, `postgresql`, `rest-api`, etc.
4. Your portfolio will automatically show these technologies!

**Pro Tip**: Use lowercase with hyphens (e.g., `spring-boot`, `rest-api`) - they'll be auto-formatted to look nice (Spring Boot, REST API).

### Change Number of Displayed Repos

In `js/github.js`, modify the `maxRepos` value:

```javascript
const GITHUB_CONFIG = {
    username: 'ghiridhars',
    apiBase: 'https://api.github.com',
    maxRepos: 8, // Change this number
    cacheTime: 24 * 60 * 60 * 1000,
};
```

### Change Cache Duration

Modify `cacheTime` (in milliseconds):

```javascript
cacheTime: 24 * 60 * 60 * 1000, // 24 hours (default)
// Examples:
// 1 hour: 60 * 60 * 1000
// 12 hours: 12 * 60 * 60 * 1000
// 7 days: 7 * 24 * 60 * 60 * 1000
```

### Add More Language Colors

In the `getLanguageColor()` function in `js/github.js`, add more languages:

```javascript
const colors = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'YourLanguage': '#hexcolor',
    // Add more...
};
```

### Filter Repositories

To show only specific repositories, modify the `fetchGitHubRepos()` function:

```javascript
// Example: Filter to only show repos with specific topics
const filteredRepos = repos.filter(repo => 
    repo.topics && repo.topics.includes('portfolio')
);
```

## Troubleshooting

### No Data Showing

1. **Check Console**: Open browser DevTools (F12) and look for errors
2. **Clear Cache**: 
   ```javascript
   localStorage.removeItem('github_profile');
   localStorage.removeItem('github_repos');
   ```
3. **Check Username**: Verify the username in `GITHUB_CONFIG` is correct
4. **API Rate Limit**: Wait an hour if you've exceeded the rate limit

### Outdated Data

Clear the cache manually:
1. Open browser console (F12)
2. Run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Slow Loading

- Data is cached after first load
- Initial load depends on GitHub API response time
- Subsequent visits use cached data (much faster)

## Future Enhancements

Possible improvements you could add:

1. **GitHub Authentication**
   - Use personal access token for higher rate limits (5000/hour)
   - Access private repositories

2. **More Statistics**
   - Contribution graph
   - Language breakdown pie chart
   - Most starred repository

3. **Repository Filtering**
   - Filter by language
   - Filter by topics
   - Search functionality

4. **Advanced Features**
   - Show recent commits
   - Display README preview
   - Show collaborators

## Testing

To test the integration:

1. Open `coding.html` in your browser
2. Check that stats show real numbers (not 0)
3. Verify project cards appear with your repositories
4. Click links to ensure they work
5. Test on mobile devices for responsiveness

## Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires:
- JavaScript enabled
- localStorage support
- Fetch API support

---

**Note**: This is a static integration using client-side JavaScript. For production use with high traffic, consider implementing server-side caching or using GitHub's GraphQL API for more efficient queries.
