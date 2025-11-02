# 🔧 Dynamic Tech Stack - How It Works

## Overview

The **"Technologies I Work With"** section on your Coding page is now **100% automated**! It reads your GitHub repositories and automatically displays the technologies you actually use.

## How It Detects Technologies

### 1. **Programming Languages**
Automatically detected from your repository's primary language:
- Java
- JavaScript
- Python
- TypeScript
- C++
- Go
- Rust
- And 10+ more...

**Example:**
```
If you have repos with these languages:
- Repository 1: Java
- Repository 2: JavaScript  
- Repository 3: Python
- Repository 4: Java

Your tech stack will show:
[Java] [JavaScript] [Python]
```

### 2. **GitHub Topics/Tags**
Reads the topics you've added to your repositories:
- Frameworks: `spring-boot`, `react`, `django`
- Databases: `postgresql`, `mongodb`, `mysql`
- Tools: `docker`, `kubernetes`, `aws`
- Concepts: `microservices`, `rest-api`, `ci-cd`

**Example:**
```
If your repos have these topics:
- Repo 1: spring-boot, mysql, docker
- Repo 2: react, nodejs, mongodb
- Repo 3: python, django, postgresql

Your tech stack will show:
[Spring Boot] [MySQL] [Docker] [React] 
[Node.js] [MongoDB] [Python] [Django] [PostgreSQL]
```

## 💡 How to Add Topics to Your GitHub Repos

### Step 1: Go to Your Repository
Visit any of your repositories on GitHub.com

### Step 2: Find the About Section
Look for the "About" section on the right side (below the green "Code" button)

### Step 3: Click "Add topics"
Click the ⚙️ settings icon or "Add topics" link

### Step 4: Add Relevant Technologies
Type and add topics like:
- `spring-boot`
- `docker`
- `postgresql`
- `rest-api`
- `microservices`
- `aws`
- `kubernetes`
- `react`
- `nodejs`

### Step 5: Save
Click "Done" to save your topics

### Step 6: Wait & Refresh
- Wait 24 hours (for cache to expire), OR
- Clear cache manually (see below)
- Refresh your portfolio page

## 🎨 Automatic Formatting

The system automatically formats your topics to look professional:

| GitHub Topic | Displays As |
|--------------|-------------|
| `javascript` | JavaScript |
| `spring-boot` | Spring Boot |
| `nodejs` | Node.js |
| `postgresql` | PostgreSQL |
| `rest-api` | REST API |
| `ci-cd` | CI/CD |
| `mongodb` | MongoDB |
| `docker` | Docker |
| `microservices` | Microservices |

## 🎯 Recommended Topics for Java Developers

Here are some good topics to add to your repositories:

### Languages & Frameworks
- `java`
- `spring-boot`
- `spring-framework`
- `hibernate`

### Databases
- `mysql`
- `postgresql`
- `mongodb`
- `redis`

### APIs & Architecture
- `rest-api`
- `microservices`
- `graphql`
- `grpc`

### Tools & DevOps
- `docker`
- `kubernetes`
- `aws`
- `jenkins`
- `ci-cd`
- `maven`
- `gradle`

### Testing & Quality
- `junit`
- `mockito`
- `testing`
- `tdd`

### Other
- `design-patterns`
- `clean-code`
- `security`

## 🔄 How to Force Refresh

If you've added new topics and want to see them immediately:

### Method 1: Clear Cache (Browser Console)
1. Open your portfolio's Coding page
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type and run:
```javascript
localStorage.removeItem('github_repos');
location.reload();
```

### Method 2: Clear All Cache
1. Press **F12**
2. Go to **Console** tab
3. Type and run:
```javascript
localStorage.clear();
location.reload();
```

### Method 3: Wait 24 Hours
The cache automatically refreshes every 24 hours, so just wait!

## 📊 What Gets Displayed

### Automatically Includes:
✅ All programming languages from your repos  
✅ All topics/tags from your repos  
✅ Sorted alphabetically  
✅ Duplicates removed  
✅ Properly formatted names  
✅ Matching icons  

### Automatically Excludes:
❌ Duplicate technologies  
❌ Invalid/unrecognized tags  
❌ Empty values  

## 🎨 Icon Mapping

Each technology gets a unique icon:

| Technology | Icon |
|------------|------|
| Java | ☕ coffee |
| JavaScript/TypeScript | 💻 code |
| Python | 🖥️ terminal |
| Spring Boot | ⚰️ deceased |
| Docker | 📦 deployed_code |
| Kubernetes | 🔄 hub |
| MySQL | 💾 storage |
| PostgreSQL | 🗄️ database |
| AWS/Azure/GCP | ☁️ cloud |
| REST API | 🔌 api |
| Git/GitHub | 🌳 account_tree |
| Testing | 🔬 science |

## 🚀 Best Practices

### 1. Be Specific with Topics
❌ Bad: `backend`  
✅ Good: `spring-boot`, `rest-api`, `microservices`

### 2. Use Industry-Standard Names
❌ Bad: `my-framework`, `custom-tool`  
✅ Good: `docker`, `kubernetes`, `postgresql`

### 3. Don't Overload
- Add 3-7 relevant topics per repository
- Focus on the main technologies used

### 4. Keep It Accurate
- Only add topics for technologies actually used in that repo
- Remove outdated topics when you refactor

### 5. Use Lowercase with Hyphens
❌ Bad: `SpringBoot`, `Spring_Boot`, `SPRINGBOOT`  
✅ Good: `spring-boot`

## 🎯 Example: Well-Tagged Repository

**Repository**: E-Commerce Microservice

**Good Topics**:
```
java
spring-boot
microservices
docker
kubernetes
postgresql
rest-api
aws
ci-cd
```

**Result on Portfolio**:
```
Technologies I Work With:
[Java] [Spring Boot] [Microservices] [Docker] 
[Kubernetes] [PostgreSQL] [REST API] [AWS] [CI/CD]
```

## 🔍 Troubleshooting

### Tech stack not updating?
1. Check if you've added topics to your repos on GitHub
2. Clear cache (see above)
3. Check browser console for errors

### Seeing weird technology names?
- Make sure topics are lowercase with hyphens
- Check `formatTechName()` function in `github.js` for supported formats

### Not seeing a technology you added?
- Verify the topic is saved on GitHub
- Clear cache and reload
- Check if the repository is public

### Too many technologies showing?
- Remove unnecessary topics from your repos
- Only add topics for main technologies

## 💡 Advanced: Add Custom Technologies

To add custom tech icons or formatting, edit `js/github.js`:

### Add Custom Icon
Find the `getTechIcon()` function and add:
```javascript
const iconMap = {
    'YourTech': 'icon_name',
    // ... existing mappings
};
```

### Add Custom Formatting
Find the `formatTechName()` function and add:
```javascript
const specialCases = {
    'your-tech': 'Your Tech',
    // ... existing cases
};
```

## 🎉 Benefits

- ✅ **Always Accurate**: Shows what you're actually working with
- ✅ **Auto-Updates**: Changes as you add new repos/topics
- ✅ **No Maintenance**: Set it once, forget it
- ✅ **Professional**: Clean, organized display
- ✅ **Discoverable**: Visitors see your real tech stack

---

**Pro Tip**: Spend 5 minutes adding topics to your top repositories, and your portfolio will automatically showcase your complete tech stack! 🚀
