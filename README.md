# Dev Portfolio (`dev-portfolio`)

Personal developer portfolio built with **React**, **Vite**, and **Three.js**, featuring vertical scroll-snapping, an interactive 3D iridescent cross emblem, ambient aurora motion, and a swipeable project card deck.

## Tech Stack

- **Framework & Tooling:** React, Vite
- **3D & Motion:** Three.js (`IridescentCross3D`), CSS scroll-snap, cursor & scroll-linked parallax
- **Styling:** Custom CSS (`src/App.css`, `src/index.css`)
- **Featured Integrations:** TMDB API (for Spark Movies), GitHub repositories

## Project Structure

```text
dev-portfolio/
├── public/
│   ├── vb-logo.svg          # Custom SVG monogram & favicon
│   └── profile.JPG          # Profile image asset
├── src/
│   ├── components/
│   │   └── IridescentCross3D.jsx
│   ├── data/
│   │   └── projects.js      # Profile info & featured project cards
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
└── package.json