# Yash Naik — Portfolio

Personal portfolio site: a scrolling home page, an animated project-network visualization, and a small blog/series CMS. Cosmic dark theme, built as static HTML/CSS/JS (no build step) so it can be served directly by GitHub Pages.

## Structure

- `index.html` — home page (hero, about, experience, skills, work, education, contact)
- `network.html` — animated node/edge project network
- `blog.html` — series/posts blog with a hidden admin gate (client-side only, `localStorage`)
- `assets/css/style.css` — all styling
- `assets/js/common.js` — shared starfield + cursor fx + scroll progress
- `assets/js/home.js`, `assets/js/network.js`, `assets/js/blog.js` — per-page logic

## Local preview

Serve the folder with any static server, e.g.:

```
npx serve .
```

or open `index.html` directly in a browser.

## Notes

- The blog's series/posts are stored in the visitor's browser `localStorage` only — there's no backend. The admin panel (small glowing dot next to "Projects" in the blog header, or click a background star; login `lykon`/`lykon`) lets you add series/posts and export the current data as JSON to hardcode back into `DEFAULT_SERIES` in `assets/js/blog.js` for permanent seeding.
- Recreated from a Claude-generated design handoff (`design_handoff_ai_architect_portfolio/`).
