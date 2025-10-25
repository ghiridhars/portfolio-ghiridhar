# 🎨 My Portfolio Website

A clean, modern portfolio website built with plain HTML, CSS, and JavaScript. Perfect for showcasing your work, book library, and coding projects.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Customization Guide](#customization-guide)
- [Deployment to Netlify](#deployment-to-netlify)
- [Learning Resources](#learning-resources)
- [Browser Support](#browser-support)

## ✨ Features

- **5 Responsive Pages**: Home, Work Portfolio, Books, Coding Projects, and Contact
- **Mobile-First Design**: Fully responsive and looks great on all devices
- **Modern UI**: Clean, professional design with smooth animations
- **Interactive Features**: 
  - Portfolio filtering
  - Book categorization
  - Contact form validation
  - Mobile navigation menu
- **SEO-Friendly**: Semantic HTML and meta tags
- **Performance Optimized**: Lazy loading and efficient CSS
- **Well-Commented Code**: Perfect for learning frontend development

## 📁 Project Structure

```
portfolio/
├── index.html           # Home page
├── portfolio.html       # Work portfolio showcase
├── books.html          # Book library
├── coding.html         # Coding projects
├── contact.html        # Contact form
├── css/
│   ├── styles.css      # Global styles
│   ├── home.css        # Home page styles
│   ├── portfolio.css   # Portfolio page styles
│   ├── books.css       # Books page styles
│   ├── coding.css      # Coding page styles
│   └── contact.css     # Contact page styles
├── js/
│   ├── main.js         # Common functionality
│   ├── portfolio.js    # Portfolio filtering
│   ├── books.js        # Books filtering
│   └── contact.js      # Form validation
├── assets/
│   └── images/         # Your images go here
├── netlify.toml        # Netlify configuration
├── _redirects          # URL redirects
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

You only need a web browser and a text editor!

- **Browser**: Chrome, Firefox, Safari, or Edge
- **Text Editor**: VS Code (recommended), Sublime Text, or any code editor

### Local Development

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Open in your browser**
   - Simply open `index.html` in your web browser
   - Or use VS Code's Live Server extension for auto-reload

3. **Start customizing!**
   - Edit HTML files to add your content
   - Modify CSS for styling
   - Update JavaScript for functionality

## 🎨 Customization Guide

### 1. Update Personal Information

**In all HTML files**, update:
- Your name in `<h1>` tags
- Page titles in `<title>` tags
- Meta descriptions
- Social media links in the footer

### 2. Add Your Content

**Home Page (`index.html`)**
- Update hero section with your introduction
- Modify the About section
- Update skills list

**Portfolio (`portfolio.html`)**
- Replace placeholder projects with your work
- Add project images to `assets/images/`
- Update project descriptions and links

**Books (`books.html`)**
- Add books you've read
- Update ratings and reviews
- Change book categories as needed

**Coding (`coding.html`)**
- Add your GitHub projects
- Update technology stack
- Link to live demos and repositories

**Contact (`contact.html`)**
- Update your email and location
- Customize social media links
- Configure form submission (see below)

### 3. Customize Colors and Styling

In `css/styles.css`, modify CSS variables:

```css
:root {
    --primary-color: #2563eb;      /* Your brand color */
    --secondary-color: #7c3aed;    /* Accent color */
    --text-dark: #1f2937;          /* Main text color */
    /* ... and more */
}
```

### 4. Add Images

1. Add your images to `assets/images/`
2. Replace image placeholders in HTML:
   ```html
   <!-- Replace this: -->
   <div class="image-placeholder">Your Photo Here</div>
   
   <!-- With this: -->
   <img src="assets/images/your-photo.jpg" alt="Description">
   ```

### 5. Configure Contact Form

The contact form currently shows a demo message. To actually send emails:

**Option 1: Netlify Forms** (Easiest - Recommended)
```html
<!-- Add to your form tag in contact.html -->
<form name="contact" method="POST" data-netlify="true">
```

**Option 2: Formspree**
1. Sign up at [formspree.io](https://formspree.io)
2. Get your form endpoint
3. Update `js/contact.js` with the provided code example

**Option 3: EmailJS**
1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Follow their setup guide
3. Add EmailJS SDK to contact.html

## 🌐 Deployment to Netlify

### Method 1: Drag and Drop (Easiest)

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up or log in
3. Drag the entire `portfolio` folder to the Netlify drop zone
4. Your site is live! 🎉

### Method 2: Connect to GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Log in to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Choose "GitHub" and select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.` (dot)
   - Click "Deploy site"

3. **Your site is live!**
   - Netlify gives you a random URL (e.g., `random-name-123.netlify.app`)
   - You can customize it in Site settings > Domain management

### Custom Domain (Optional)

1. In Netlify, go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## 📚 Learning Resources

This project is perfect for learning frontend development! Here are key concepts demonstrated:

### HTML Concepts
- Semantic HTML5 elements (`<nav>`, `<section>`, `<article>`, `<footer>`)
- Forms and input validation
- Meta tags for SEO
- Accessibility attributes (ARIA labels)

### CSS Concepts
- CSS Variables (Custom Properties)
- Flexbox and Grid layouts
- Responsive design with media queries
- Animations and transitions
- Mobile-first approach

### JavaScript Concepts
- DOM manipulation
- Event listeners
- Form validation
- Array methods (filter, forEach, map)
- ES6+ features (arrow functions, const/let)

### Recommended Next Steps
1. **Learn Git**: Version control your code
2. **Add animations**: Explore libraries like AOS (Animate On Scroll)
3. **Improve accessibility**: Learn about WCAG guidelines
4. **Optimize performance**: Use Lighthouse in Chrome DevTools
5. **Add a blog**: Learn about static site generators

## 🌍 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

**Problem**: Styles not loading
- Check that CSS file paths are correct
- Clear browser cache (Ctrl/Cmd + Shift + R)

**Problem**: JavaScript not working
- Open browser console (F12) to check for errors
- Verify JS file paths in HTML

**Problem**: Contact form not sending emails
- Remember: The form needs a backend service
- See the "Configure Contact Form" section above

## 📝 To-Do List for Customization

- [ ] Update personal information in all pages
- [ ] Add your profile photo
- [ ] Replace portfolio projects with your work
- [ ] Add your book reviews
- [ ] Update coding projects
- [ ] Configure contact form
- [ ] Customize colors to match your brand
- [ ] Add your social media links
- [ ] Push to GitHub
- [ ] Deploy to Netlify
- [ ] (Optional) Add custom domain

## 🤝 Contributing

This is a personal portfolio template. Feel free to:
- Fork and customize for your own use
- Share improvements or suggestions
- Use as a learning resource

## 📄 License

This project is free to use for personal and commercial purposes. No attribution required, but appreciated!

## 💡 Tips for Success

1. **Start Simple**: Don't try to customize everything at once
2. **Test Frequently**: Check your changes in the browser often
3. **Use DevTools**: Learn to use browser developer tools (F12)
4. **Read the Code**: Comments explain how everything works
5. **Experiment**: Try changing values to see what happens
6. **Git Commit Often**: Save your progress regularly

## 🎓 Additional Resources

- [MDN Web Docs](https://developer.mozilla.org/) - Best web development documentation
- [CSS-Tricks](https://css-tricks.com/) - Great CSS tutorials
- [JavaScript.info](https://javascript.info/) - Comprehensive JS guide
- [Web.dev](https://web.dev/) - Google's web development best practices

---

**Built with ❤️ using HTML, CSS, and JavaScript**

Need help? Feel free to reach out or check the browser console for helpful messages!
