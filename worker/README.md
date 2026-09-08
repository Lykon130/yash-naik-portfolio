# yn-blog-api (Cloudflare Worker)

Holds the GitHub token server-side so the browser never sees it. The blog's
admin UI talks to this Worker instead of GitHub directly, sending a separate
`ADMIN_KEY` (a password you make up) that only unlocks *this* Worker — not
your GitHub account.

## One-time setup

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up) (no
domain required — Workers get a free `*.workers.dev` subdomain).

1. **Install Wrangler** (Cloudflare's CLI), from this `worker/` folder:
   ```
   npm install -g wrangler
   ```

2. **Log in** (opens a browser to authorize):
   ```
   wrangler login
   ```

3. **Create a GitHub token for the Worker to use** — this one stays server-side,
   it's never exposed to any browser:
   - [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
   - Repository access → only `yash-naik-portfolio`
   - Permissions → Contents: Read and write
   - Generate, copy it.

4. **Invent an admin password** — this is what *you* type into the blog's
   admin login, not the GitHub token. Pick anything long and random.

5. **Set both as Worker secrets** (from this `worker/` folder):
   ```
   wrangler secret put GITHUB_TOKEN
   wrangler secret put ADMIN_KEY
   ```
   Paste the respective value when prompted for each.

6. **Deploy:**
   ```
   wrangler deploy
   ```
   This prints your Worker's URL, something like:
   `https://yn-blog-api.<your-subdomain>.workers.dev`

7. **Wire it into the site**: put that URL into `WORKER_URL` at the top of
   `../assets/js/blog.js`, commit, and push.

## Using it

On the live blog, sign in as admin (`lykon` / `lykon` — just a UI gate) and
the first time you publish, you'll be asked for the **admin password** from
step 4 (not the GitHub token). It's stored in that browser's `localStorage`
so you won't be asked again on that device. Publishing a post now goes:

browser → Worker (checks admin password) → GitHub (using the token only the Worker holds) → repo commit → GitHub Pages rebuild

## Updating the Worker later

Edit `src/index.js`, then `wrangler deploy` again from this folder.
