# Portfolio Website

A clean, responsive portfolio website built with vanilla HTML, CSS, and JavaScript. Features dynamic GitHub integration, dark/light theme toggle, and EmailJS contact form.

## Features

### Pages
- **Home** - Introduction with profile and quick links
- **Work** - Portfolio showcase for art and literature
- **Books** - Categorized book library with filtering
- **Coding** - GitHub-powered projects display with tech stack analysis
- **Contact** - Working contact form with EmailJS integration

### Functionality
- **Dark/Light Theme Toggle** - Persistent theme preference using localStorage
- **Mobile-Responsive Navigation** - Hamburger menu with smooth animations
- **GitHub Integration** - Automatically fetches and displays:
  - Repository data and statistics
  - Tech stack analysis from all repos
  - Coding activity metrics
- **Email Integration** - Contact form powered by EmailJS
- **Interactive Filtering** - Category-based filtering for books and projects

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: GitHub API, EmailJS
- **Deployment**: GitHub Pages
- **Design**: Mobile-first responsive design, CSS custom properties

## Project Structure

```
portfolio/
├── index.html          # Home page
├── portfolio.html      # Work showcase
├── books.html         # Book library
├── coding.html        # GitHub projects
├── contact.html       # Contact form
├── css/
│   ├── styles.css     # Global styles & theme variables
│   ├── home.css       # Home page styles
│   ├── portfolio.css  # Portfolio styles
│   ├── books.css      # Book library styles
│   ├── coding.css     # Coding page styles
│   └── contact.css    # Contact form styles
├── js/
│   ├── main.js        # Theme toggle, mobile nav, smooth scroll
│   ├── portfolio.js   # Portfolio gallery interactions
│   ├── books.js       # Book filtering and display
│   ├── github.js      # GitHub API integration
│   └── contact.js     # Form validation & EmailJS
└── assets/
    └── images/        # Images and media
```

## Configuration

### GitHub Integration
Update `GITHUB_CONFIG` in `js/github.js`:
```javascript
const GITHUB_CONFIG = {
    username: 'your-username',
    maxRepos: 8
};
```

### EmailJS Setup
Update `EMAILJS_CONFIG` in `js/contact.js`:
```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceID: 'YOUR_SERVICE_ID',
    templateID: 'YOUR_TEMPLATE_ID'
};
```

Get your credentials from [EmailJS Dashboard](https://dashboard.emailjs.com/).

## Local Development

1. Clone the repository
2. Open `index.html` in a browser or use a local server
3. Edit content in HTML files
4. Modify styles in CSS files
5. Update configuration as needed

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to your repository settings
3. Navigate to **Pages** section
4. Under **Source**, select `main` branch
5. Click **Save**
6. Your site will be live at `https://yourusername.github.io/repository-name`

The site is automatically deployed on every push to the main branch.

## License

Free to use for personal and commercial purposes.

