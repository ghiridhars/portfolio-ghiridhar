# Agent Guidelines: Portfolio Ghiridhar

Personal portfolio and interactive web playground built with vanilla HTML5, CSS3, and modern ES6+ JavaScript.

## Architecture & Project Structure

- **Core Pages**: `index.html` (Home), `portfolio.html` (Work & 3D Art Gallery), `books.html` (Librī), `coding.html` (Engineering), `contact.html` (Get in Touch).
- **Styles**: Modular CSS in `css/styles.css` (base & components), `css/home.css`, `css/books.css`, `css/coding.css`, `css/contact.css`, `css/physics.css`, `css/gallery3d.css`.
- **Scripts**: 
  - `js/space-background.js`: Custom 3D canvas starfield with depth projection and transient constellation vectors.
  - `js/components.js`: Reusable dynamic components (brand logo, navigation, ambient HUD).
  - `js/ambient.js`: Open-Meteo weather telemetry and offline Julian astronomical lunar calculator.
  - `js/main.js`: Core UI orchestrator (theme toggle, Sisyphus monogram micro-physics).
  - `js/gallery3d.js`: Three.js 3D wall art gallery.
  - `js/command-palette.js`: Retro terminal command palette (`Ctrl+K`).
- **Design Language**: Monochrome brutalist retro-tech aesthetic with light/dark theme persistence.

## Verification

Before finishing any task, verify JavaScript syntax across all files:
```bash
node -c js/*.js
```

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues (using the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to repository labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository. See `docs/agents/domain.md`.
