const ADMIN_KEY = 'yn_blog_admin_v1';
const TOKEN_KEY = 'yn_gh_token';
const GH_OWNER = 'Lykon130';
const GH_REPO = 'yash-naik-portfolio';
const GH_BRANCH = 'master';
const DATA_PATH = 'data/posts.json';
const UPLOADS_DIR = 'assets/uploads';

const DEFAULT_SERIES = [
  { id: 's1', name: 'Boardroom AI: Monday Reality Check', posts: [] },
  { id: 's2', name: 'Under the Hood: AI Systems', posts: [] },
  { id: 's3', name: "Beginner's AI Blueprint", posts: [] },
  { id: 's4', name: 'The PsyBuddy Initiative', posts: [] }
];

// ---------- GitHub Contents API helpers ----------

function ghToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
}
function setGhToken(t) {
  try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {}
}
function clearGhToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
}

async function ghGetFile(path) {
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`, {
    headers: { Authorization: `Bearer ${ghToken()}`, Accept: 'application/vnd.github+json' }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  return res.json();
}

async function ghPutFile(path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${ghToken()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${detail.message || ''}`);
  }
  return res.json();
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function publishSeries(series, message) {
  const existing = await ghGetFile(DATA_PATH).catch(() => null);
  const sha = existing ? existing.sha : undefined;
  await ghPutFile(DATA_PATH, utf8ToBase64(JSON.stringify(series, null, 2)), message, sha);
}

async function uploadImage(dataUrl, id) {
  const base64 = dataUrl.split(',')[1];
  const path = `${UPLOADS_DIR}/${id}.jpg`;
  await ghPutFile(path, base64, `Add image for post ${id}`);
  return path;
}

async function loadSeries() {
  try {
    const res = await fetch(DATA_PATH + '?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return DEFAULT_SERIES;
}

document.addEventListener('DOMContentLoaded', async () => {
  let series = await loadSeries();
  let isAdmin = (() => { try { return localStorage.getItem(ADMIN_KEY) === '1'; } catch (e) { return false; } })();
  let view = 'list';
  let activeSeriesId = null;
  let activePostId = null;
  let newPostImage = null;
  let publishing = false;

  const listView = document.getElementById('list-view');
  const detailView = document.getElementById('detail-view');
  const postView = document.getElementById('post-view');
  const seriesGrid = document.getElementById('series-grid');
  const postsGrid = document.getElementById('posts-grid');
  const detailTitle = document.getElementById('detail-title');
  const newPostForm = document.getElementById('new-post-form');
  const openNewPostBtn = document.getElementById('open-new-post');
  const exportLink = document.getElementById('export-link');
  const tokenLink = document.getElementById('token-link');
  const adminStar = document.getElementById('admin-star');
  const loginOverlay = document.getElementById('login-overlay');
  const loginError = document.getElementById('login-error');

  function showView(v) {
    view = v;
    listView.style.display = v === 'list' ? '' : 'none';
    detailView.style.display = v === 'detail' ? '' : 'none';
    postView.style.display = v === 'post' ? '' : 'none';
  }

  function setBusy(b) {
    publishing = b;
    document.querySelectorAll('.btn-solid').forEach((btn) => { btn.disabled = b; btn.style.opacity = b ? 0.6 : ''; });
  }

  async function withPublish(action, successMsg) {
    if (!ghToken()) {
      const t = window.prompt('Enter a GitHub Personal Access Token (fine-grained, scoped to this repo, Contents: read & write):');
      if (!t) return false;
      setGhToken(t.trim());
    }
    setBusy(true);
    try {
      await action();
      return true;
    } catch (e) {
      console.error(e);
      window.alert('Publish failed: ' + e.message + '\n\nCheck that your token is valid and has Contents write access to this repo.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function renderList() {
    seriesGrid.innerHTML = '';
    series.forEach((sr) => {
      const card = document.createElement('div');
      card.className = 'series-card';
      const count = sr.posts.length + (sr.posts.length === 1 ? ' post' : ' posts');
      card.innerHTML = `<div class="series-count">${count}</div><h3 class="series-name"></h3>`;
      card.querySelector('.series-name').textContent = sr.name;
      card.addEventListener('click', () => openSeries(sr.id));
      seriesGrid.appendChild(card);
    });
    if (isAdmin) {
      const addBtn = document.createElement('button');
      addBtn.className = 'add-series-btn';
      addBtn.textContent = '+ New Series';
      addBtn.addEventListener('click', openNewSeriesForm);
      seriesGrid.appendChild(addBtn);
    }
  }

  function openNewSeriesForm() {
    const form = document.createElement('div');
    form.className = 'form-card series-form';
    form.innerHTML = `
      <input type="text" id="new-series-name" placeholder="Series name">
      <div class="form-actions">
        <button class="btn-solid" id="save-series">Create</button>
        <button class="btn-outline" id="cancel-series">Cancel</button>
      </div>`;
    seriesGrid.appendChild(form);
    const addBtn = seriesGrid.querySelector('.add-series-btn');
    if (addBtn) addBtn.style.display = 'none';
    form.querySelector('#cancel-series').addEventListener('click', () => renderList());
    form.querySelector('#save-series').addEventListener('click', async () => {
      const name = form.querySelector('#new-series-name').value.trim();
      if (!name || publishing) return;
      const updated = [...series, { id: 's' + Date.now(), name, posts: [] }];
      const ok = await withPublish(() => publishSeries(updated, `Add series: ${name}`));
      if (ok) { series = updated; renderList(); }
    });
  }

  function openSeries(id) {
    activeSeriesId = id;
    showView('detail');
    renderDetail();
  }

  function renderDetail() {
    const activeSeries = series.find((s) => s.id === activeSeriesId) || { name: '', posts: [] };
    detailTitle.textContent = activeSeries.name;
    postsGrid.innerHTML = '';
    if (activeSeries.posts.length === 0) {
      postsGrid.innerHTML = '<div class="empty-state">No posts yet in this series.</div>';
    } else {
      activeSeries.posts.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        const excerpt = p.content.length > 140 ? p.content.slice(0, 140) + '…' : p.content;
        card.innerHTML = `
          <div class="post-media ${p.image ? 'has-img' : ''}" style="${p.image ? `background-image:url(${p.image})` : ''}"></div>
          <div class="post-body"><h3></h3><p></p></div>`;
        card.querySelector('h3').textContent = p.title;
        card.querySelector('p').textContent = excerpt;
        card.addEventListener('click', () => openPost(p.id));
        postsGrid.appendChild(card);
      });
    }
    newPostForm.style.display = 'none';
    openNewPostBtn.style.display = isAdmin ? '' : 'none';
    resetNewPostForm();
  }

  function openPost(id) {
    activePostId = id;
    showView('post');
    renderPost();
  }

  function renderPost() {
    const activeSeries = series.find((s) => s.id === activeSeriesId) || { name: '', posts: [] };
    const post = activeSeries.posts.find((p) => p.id === activePostId) || { title: '', content: '', image: null };
    document.getElementById('post-view-title').textContent = post.title;
    const imgEl = document.getElementById('post-view-image');
    imgEl.className = 'post-view-image' + (post.image ? ' has-img' : '');
    imgEl.style.backgroundImage = post.image ? `url(${post.image})` : '';
    document.getElementById('post-view-content').textContent = post.content;
  }

  function resetNewPostForm() {
    document.getElementById('new-post-title').value = '';
    document.getElementById('new-post-content').value = '';
    document.getElementById('new-post-image').value = '';
    newPostImage = null;
    const preview = document.getElementById('new-post-preview');
    preview.className = 'form-preview';
    preview.style.backgroundImage = '';
  }

  document.getElementById('open-new-post').addEventListener('click', () => {
    newPostForm.style.display = '';
  });
  document.getElementById('cancel-new-post').addEventListener('click', () => {
    newPostForm.style.display = 'none';
    resetNewPostForm();
  });
  document.getElementById('new-post-image').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1000;
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement('canvas');
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        newPostImage = c.toDataURL('image/jpeg', 0.75);
        const preview = document.getElementById('new-post-preview');
        preview.className = 'form-preview has-img';
        preview.style.backgroundImage = `url(${newPostImage})`;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('save-new-post').addEventListener('click', async () => {
    if (!isAdmin || publishing) return;
    const title = document.getElementById('new-post-title').value.trim();
    const content = document.getElementById('new-post-content').value.trim();
    if (!title || !content) return;
    const id = 'p' + Date.now();

    const ok = await withPublish(async () => {
      let imagePath = null;
      if (newPostImage) imagePath = await uploadImage(newPostImage, id);
      const post = { id, title, content, image: imagePath };
      const updated = series.map((s) => s.id === activeSeriesId ? { ...s, posts: [post, ...s.posts] } : s);
      await publishSeries(updated, `Add post: ${title}`);
      series = updated;
    });
    if (ok) {
      newPostForm.style.display = 'none';
      renderDetail();
    }
  });

  document.getElementById('back-to-list').addEventListener('click', () => { showView('list'); renderList(); });
  document.getElementById('back-to-series').addEventListener('click', () => { showView('detail'); renderDetail(); });

  // ---------- Admin gate ----------
  function updateAdminUI() {
    exportLink.style.display = isAdmin ? '' : 'none';
    tokenLink.style.display = isAdmin ? '' : 'none';
  }
  function openLogin() {
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    loginError.style.display = 'none';
    loginOverlay.classList.add('open');
  }
  function closeLogin() { loginOverlay.classList.remove('open'); }
  function adminAction() {
    if (isAdmin) {
      try { localStorage.removeItem(ADMIN_KEY); } catch (e) {}
      isAdmin = false;
      updateAdminUI();
      if (view === 'list') renderList(); else if (view === 'detail') renderDetail();
    } else {
      openLogin();
    }
  }
  adminStar.addEventListener('click', adminAction);
  document.getElementById('login-cancel').addEventListener('click', closeLogin);
  document.getElementById('login-submit').addEventListener('click', () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    if (user === 'lykon' && pass === 'lykon') {
      try { localStorage.setItem(ADMIN_KEY, '1'); } catch (e) {}
      isAdmin = true;
      closeLogin();
      updateAdminUI();
      if (view === 'list') renderList(); else if (view === 'detail') renderDetail();
    } else {
      loginError.textContent = 'Incorrect credentials.';
      loginError.style.display = '';
    }
  });
  exportLink.addEventListener('click', () => {
    const json = JSON.stringify(series, null, 2);
    try {
      navigator.clipboard.writeText(json);
      window.alert('Blog data copied to clipboard.');
    } catch (e) {
      window.prompt('Copy this JSON manually:', json);
    }
  });
  tokenLink.addEventListener('click', () => {
    if (ghToken()) {
      if (window.confirm('Clear the stored GitHub token from this browser?')) clearGhToken();
    } else {
      const t = window.prompt('Enter a GitHub Personal Access Token (fine-grained, scoped to this repo, Contents: read & write):');
      if (t) setGhToken(t.trim());
    }
  });

  // Clicking a starfield particle also opens the admin login
  let starRef = null;
  document.getElementById('starfield').addEventListener('click', (e) => {
    if (!starRef || !starRef.stars) return;
    const canvas = starRef.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const hit = starRef.stars.some((st) => Math.hypot(st.x - x, st.y - y) < 9);
    if (hit) adminAction();
  });

  starRef = initStarfield('starfield', 150);
  updateAdminUI();
  renderList();
});
