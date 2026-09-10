// Cloudflare Worker: holds the GitHub token server-side and publishes
// blog content to the yash-naik-portfolio repo on behalf of the admin.
//
// The browser never sees the GitHub token. It only holds a separate
// ADMIN_KEY (set by you) that this Worker checks before doing anything.

const GH_OWNER = 'Lykon130';
const GH_REPO = 'yash-naik-portfolio';
const GH_BRANCH = 'master';
const DATA_PATH = 'data/posts.json';
const UPLOADS_DIR = 'assets/uploads';

function resolveOrigin(request, env) {
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin') || '';
  if (allowed.includes(origin)) return origin;
  return allowed[0] || '*';
}

function corsHeaders(request, env) {
  return {
    'Access-Control-Allow-Origin': resolveOrigin(request, env),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request, env) },
  });
}

async function ghRequest(env, path, options) {
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'yn-blog-worker',
      ...(options && options.headers),
    },
  });
  return res;
}

async function ghGetFile(env, path) {
  const res = await ghRequest(env, `contents/${path}?ref=${GH_BRANCH}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  return res.json();
}

async function ghPutFile(env, path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await ghRequest(env, `contents/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${detail.message || ''}`);
  }
  return res.json();
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return token && env.ADMIN_KEY && token === env.ADMIN_KEY;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);

    if (!checkAuth(request, env)) {
      return json({ error: 'Unauthorized' }, 401, request, env);
    }

    try {
      if (request.method === 'POST' && url.pathname === '/api/publish') {
        const { series, message } = await request.json();
        if (!Array.isArray(series)) return json({ error: 'series must be an array' }, 400, request, env);
        const existing = await ghGetFile(env, DATA_PATH);
        await ghPutFile(env, DATA_PATH, utf8ToBase64(JSON.stringify(series, null, 2)), message || 'Update blog content', existing ? existing.sha : undefined);
        return json({ ok: true }, 200, request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/upload') {
        const { id, dataUrl } = await request.json();
        if (!id || !dataUrl || !dataUrl.includes(',')) return json({ error: 'id and dataUrl required' }, 400, request, env);
        const base64 = dataUrl.split(',')[1];
        const path = `${UPLOADS_DIR}/${id}.jpg`;
        await ghPutFile(env, path, base64, `Add image for post ${id}`);
        return json({ path }, 200, request, env);
      }

      return json({ error: 'Not found' }, 404, request, env);
    } catch (err) {
      return json({ error: err.message || String(err) }, 500, request, env);
    }
  },
};
