# Yash Naik — Portfolio

Personal portfolio site: a scrolling home page, an animated project-network visualization, and a small blog/series CMS. Cosmic dark theme, built as static HTML/CSS/JS (no build step) so it can be served directly by GitHub Pages.

## Structure

- `index.html` — home page (hero, about, experience, skills, work, education, contact)
- `network.html` — animated node/edge project network
- `blog.html` — series/posts blog with a hidden admin gate that publishes straight to this repo
- `data/posts.json` — the blog's content, committed to the repo (this is the "database")
- `assets/uploads/` — post images, uploaded to the repo alongside posts
- `assets/css/style.css` — all styling
- `assets/js/common.js` — shared starfield + cursor fx + scroll progress
- `assets/js/home.js`, `assets/js/network.js`, `assets/js/blog.js` — per-page logic

## Local preview

Serve the folder with any static server, e.g.:

```
npx serve .
```

or open `index.html` directly in a browser.

## Blog storage: GitHub as the backend

There's no server. The blog reads its content from [`data/posts.json`](data/posts.json), which is just a file in this repo. Every visitor's browser fetches that file directly from GitHub Pages, so everyone sees the same content — no per-visitor `localStorage` drift, no manual export/paste step.

Publishing a post writes directly back into the repo via the GitHub REST API:

1. Open the blog, click the small glowing dot next to "Projects" (or click a background star), sign in with `lykon` / `lykon`. This is just a UI gate, not real security — see below.
2. The first time you create a series or post, you'll be asked for a **GitHub Personal Access Token**. Create one at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new):
   - **Repository access**: only this repository (`yash-naik-portfolio`)
   - **Permissions**: Contents → Read and write
   - Nothing else needed.
3. Paste the token when prompted. It's stored in that browser's `localStorage` (key `yn_gh_token`) so you're not asked again on that device.
4. From then on, creating a series/post commits directly to `data/posts.json` (and uploads images to `assets/uploads/`) on the `master` branch. GitHub Pages rebuilds automatically — the change is live for everyone within roughly a minute.

**Security note:** the token lives in that browser's `localStorage`, in plaintext, for as long as it's there. Anyone with access to that browser/profile could use it to push commits to this repo. Because the token is scoped to only this one repository with only Contents read/write, the worst case is limited to this repo (not your whole GitHub account) — but still, only do this on a device you trust, and revoke/regenerate the token from GitHub settings if that ever changes. You can also clear the stored token any time via the "GitHub Token" link in the admin header.

## Credits

Recreated from a Claude-generated design handoff (`design_handoff_ai_architect_portfolio/`).
