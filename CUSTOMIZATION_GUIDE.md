# 🎨 Portfolio Customization Guide

## Quick Customization Checklist

### 1. Personal Information

#### **index.html - Home Page**
```html
<!-- Line 39: Update your name -->
<h1 class="hero-title">Hello, I'm <span class="highlight">Your Name</span></h1>

<!-- Line 40: Update your role/title -->
<p class="hero-subtitle">Frontend Developer | Reader | Lifelong Learner</p>

<!-- Lines 41-44: Update your introduction -->
<p class="hero-description">
    Welcome to my portfolio! I'm passionate about...
</p>

<!-- Lines 57-66: Update About Me section -->
<p>
    I'm a frontend developer with a passion for...
</p>

<!-- Lines 71-74: Update your skills -->
<ul class="skills-list">
    <li>Your Skill 1</li>
    <li>Your Skill 2</li>
    <!-- Add more skills -->
</ul>
```

#### **All Pages - Footer**
```html
<!-- Update copyright year and name -->
<p>&copy; 2025 Your Name. Built with HTML, CSS, and JavaScript.</p>

<!-- Update social links -->
<a href="https://github.com/yourusername">GitHub</a>
<a href="https://linkedin.com/in/yourusername">LinkedIn</a>
<a href="https://twitter.com/yourusername">Twitter</a>
```

---

### 2. Add Your Projects (portfolio.html)

```html
<!-- Replace the placeholder project items (starting around line 45) -->
<article class="portfolio-item" data-category="web">
    <div class="portfolio-image">
        <!-- Add your project image -->
        <img src="assets/images/project1.jpg" alt="Project 1">
    </div>
    <div class="portfolio-content">
        <h3>Your Project Title</h3>
        <p class="portfolio-category">Web Design</p>
        <p class="portfolio-description">
            Description of your project, what you built, and technologies used.
        </p>
        <div class="portfolio-tags">
            <span class="tag">React</span>
            <span class="tag">Node.js</span>
            <span class="tag">MongoDB</span>
        </div>
        <a href="https://your-project-link.com" class="btn btn-small">View Project</a>
    </div>
</article>
```

**Categories for filtering:**
- `data-category="web"` - Web Design
- `data-category="dev"` - Development
- `data-category="other"` - Other

---

### 3. Add Your Books (books.html)

```html
<!-- Replace book items (starting around line 52) -->
<article class="book-item" data-category="tech">
    <div class="book-cover">
        <!-- Option 1: Use emoji placeholder -->
        <div class="cover-placeholder">📘</div>
        
        <!-- Option 2: Use actual book cover image -->
        <!-- <img src="assets/images/book-cover.jpg" alt="Book Title"> -->
    </div>
    <div class="book-info">
        <h3 class="book-title">Book Title</h3>
        <p class="book-author">by Author Name</p>
        <div class="book-rating">
            <span class="star filled">★</span>
            <span class="star filled">★</span>
            <span class="star filled">★</span>
            <span class="star filled">★</span>
            <span class="star">★</span> <!-- 4 out of 5 stars -->
        </div>
        <p class="book-review">
            Your review or key takeaways from the book.
        </p>
        <span class="book-category">Technology</span>
    </div>
</article>
```

**Book Categories:**
- `data-category="tech"` - Technology
- `data-category="fiction"` - Fiction
- `data-category="business"` - Business
- `data-category="personal"` - Personal Development

**Update Reading Stats (lines 29-43):**
```html
<h3 class="stat-number">12</h3> <!-- Number of books read this year -->
<h3 class="stat-number">2</h3>  <!-- Currently reading -->
<h3 class="stat-number">5</h3>  <!-- Want to read -->
```

---

### 4. Add Coding Projects (coding.html)

```html
<!-- Replace project cards (starting around line 61) -->
<article class="project-card">
    <div class="project-header">
        <h3 class="project-title">
            <span class="folder-icon">📁</span>
            Your Project Name
        </h3>
        <div class="project-links">
            <a href="https://github.com/yourusername/repo" class="icon-link">
                <span>Code</span>
            </a>
            <a href="https://your-demo-link.com" class="icon-link">
                <span>Demo</span>
            </a>
        </div>
    </div>
    <p class="project-description">
        Detailed description of what your project does and the technologies used.
    </p>
    <div class="project-tech">
        <span class="tech-tag">JavaScript</span>
        <span class="tech-tag">React</span>
        <span class="tech-tag">API</span>
    </div>
</article>
```

**Update Tech Stack (lines 33-56):**
```html
<div class="tech-item">
    <span class="tech-icon">⚛️</span>
    <h4>React</h4>
</div>
<!-- Add more technologies you use -->
```

---

### 5. Update Contact Information (contact.html)

```html
<!-- Update contact info (lines 64-90) -->
<div class="info-item">
    <div class="info-icon">📧</div>
    <div class="info-content">
        <h3>Email</h3>
        <p>your.email@example.com</p>
    </div>
</div>

<div class="info-item">
    <div class="info-icon">📍</div>
    <div class="info-content">
        <h3>Location</h3>
        <p>Your City, Country</p>
    </div>
</div>

<!-- Update social media links (lines 92-109) -->
<a href="https://github.com/yourusername" class="social-link">
    <span class="social-icon">🐙</span>
    <span>GitHub</span>
</a>
```

---

### 6. Add Your Photos/Images

1. **Save your images to `assets/images/` folder**

2. **Profile Photo (index.html):**
```html
<!-- Replace line 80-84 -->
<div class="about-image">
    <img src="assets/images/profile.jpg" alt="Your Name">
</div>
```

3. **Project Images (portfolio.html):**
```html
<!-- Replace image placeholders -->
<div class="portfolio-image">
    <img src="assets/images/project1.jpg" alt="Project Name">
</div>
```

4. **Book Covers (books.html):**
```html
<div class="book-cover">
    <img src="assets/images/book-cover.jpg" alt="Book Title" style="width: 150px; height: 220px; object-fit: cover; border-radius: 8px;">
</div>
```

---

### 7. Customize Colors (Optional)

The site now uses a **Black & Maroon** theme with **Dark Mode** support!

**To adjust colors, edit `css/styles.css` (lines 7-45):**

```css
:root {
    /* Light Mode Colors */
    --primary-color: #8B0000;        /* Main maroon color */
    --primary-dark: #660000;         /* Darker maroon */
    --accent-color: #DC143C;         /* Bright crimson */
    /* ... adjust as needed */
}

[data-theme="dark"] {
    /* Dark Mode Colors */
    --primary-color: #DC143C;        /* Brighter for dark mode */
    --bg-white: #0a0a0a;             /* Almost black background */
    /* ... adjust as needed */
}
```

**Popular Maroon Variations:**
- `#800000` - Classic Maroon
- `#8B0000` - Dark Red (current)
- `#A52A2A` - Brown Maroon
- `#DC143C` - Crimson (current accent)
- `#C41E3A` - Cardinal Red

---

### 8. Configure Contact Form

**Option 1: Netlify Forms (Recommended - Easiest)**

In `contact.html`, update the form tag (line 41):
```html
<form id="contactForm" name="contact" method="POST" data-netlify="true" class="contact-form">
    <!-- Add this hidden field -->
    <input type="hidden" name="form-name" value="contact">
    <!-- Rest of form fields... -->
</form>
```

Then in Netlify dashboard:
- Go to Forms section
- You'll see submissions automatically

**Option 2: Formspree**

1. Sign up at [formspree.io](https://formspree.io)
2. Get your form endpoint
3. Update `js/contact.js` (around line 82):

```javascript
fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => {
    showFormMessage('Message sent successfully!', 'success');
    form.reset();
})
.catch(error => {
    showFormMessage('Error sending message.', 'error');
});
```

---

### 9. Meta Tags & SEO

**Update meta descriptions in ALL HTML files:**

```html
<head>
    <meta name="description" content="Your custom description about your portfolio">
    <title>Your Name - Portfolio</title>
    
    <!-- Add these for better SEO -->
    <meta name="author" content="Your Name">
    <meta name="keywords" content="web developer, frontend, your skills">
    
    <!-- Open Graph for social sharing -->
    <meta property="og:title" content="Your Name - Portfolio">
    <meta property="og:description" content="Your portfolio description">
    <meta property="og:image" content="https://your-site.com/assets/images/og-image.jpg">
    <meta property="og:url" content="https://your-site.com">
</head>
```

---

### 10. Favicon (Website Icon)

1. Create a favicon (16x16 or 32x32 px) - use [favicon.io](https://favicon.io)
2. Save as `favicon.ico` in root folder
3. Add to `<head>` in all HTML files:

```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

---

## 🎯 Quick Testing Checklist

Before deploying updates:

- [ ] Test on Chrome
- [ ] Test on Firefox  
- [ ] Test on mobile (Chrome DevTools → Toggle device toolbar)
- [ ] Click all navigation links
- [ ] Test dark mode toggle
- [ ] Test portfolio filtering
- [ ] Test books filtering
- [ ] Test contact form
- [ ] Check all images load
- [ ] Verify social links work

---

## 📱 Responsive Design Tips

The site is already mobile-responsive, but test these breakpoints:

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

To test in browser:
1. Press F12 (DevTools)
2. Click device toggle icon
3. Test different screen sizes

---

## 🚀 Deploy Updates to Netlify

### If connected to GitHub:
```bash
git add .
git commit -m "Update portfolio content"
git push
```
Netlify will auto-deploy! ✅

### If using drag & drop:
1. Update your local files
2. Go to Netlify dashboard
3. Drag the updated `portfolio` folder
4. Wait for deployment

---

## 💡 Pro Tips

1. **Keep it updated**: Add new projects regularly
2. **Compress images**: Use [TinyPNG](https://tinypng.com) before uploading
3. **Write good descriptions**: Help visitors understand your work
4. **Test frequently**: Check after each change
5. **Get feedback**: Ask friends to review your portfolio
6. **Analytics**: Add Google Analytics to track visitors
7. **Custom domain**: Make it professional (yourname.com)

---

## 🆘 Need Help?

- Check browser console (F12) for errors
- Read the main README.md for detailed info
- All code has comments explaining what it does
- Google is your friend for specific CSS/JS questions

---

**Happy customizing! 🎨**
