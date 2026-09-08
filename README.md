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
- `worker/` — a small Cloudflare Worker that publishes blog posts to this repo on the admin's behalf (see below)

## Local preview

Serve the folder with any static server, e.g.:

```
npx serve .
```

or open `index.html` directly in a browser.

## Blog storage: GitHub as the backend, via a Worker

There's no traditional server. The blog reads its content from [`data/posts.json`](data/posts.json), which is just a file in this repo. Every visitor's browser fetches that file directly from GitHub Pages, so everyone sees the same content — no per-visitor `localStorage` drift, no manual export/paste step.

Publishing a post does **not** talk to GitHub directly from the browser (that would mean shipping a GitHub token in public client-side code). Instead it goes through the small Cloudflare Worker in [`worker/`](worker/), which holds the real GitHub token server-side:

```
browser → Worker (checks an admin password) → GitHub API (Worker's token) → commit → Pages rebuild
```

**Setup (one-time):** follow [`worker/README.md`](worker/README.md) to deploy the Worker and get its URL, then paste that URL into `WORKER_URL` near the top of `assets/js/blog.js` and push.

**Using it:** open the blog, click the small glowing dot next to "Projects" (or click a background star), sign in with `lykon` / `lykon` — this is just a UI gate, not real security. The first time you publish something, you'll be asked for the **admin password** you chose while deploying the Worker (not a GitHub token). It's stored in that browser's `localStorage` so you're not asked again on that device. From then on, creating a series/post commits straight to `data/posts.json` (and uploads images to `assets/uploads/`); GitHub Pages rebuilds automatically and the change is live for everyone within roughly a minute.

**Security note:** the admin password lives in that browser's `localStorage` in plaintext. Anyone with access to that browser/profile could use it to publish through the Worker — but the Worker only exposes two narrow actions (update `data/posts.json`, add a file under `assets/uploads/`), so even a leaked password can't do anything beyond that, and the real GitHub token never leaves the Worker. Only sign in on devices you trust, and you can clear the stored password any time via the "Admin Password" link in the admin header, or rotate it by re-running `wrangler secret put ADMIN_KEY`.

## Credits

Recreated from a Claude-generated design handoff (`design_handoff_ai_architect_portfolio/`).
