const ADMIN_KEY = 'yn_blog_admin_v1';
const WORKER_KEY = 'yn_worker_key';
const DATA_PATH = 'data/posts.json';

// Set this to your deployed Worker's URL (see worker/README.md), e.g.
// 'https://yn-blog-api.<your-subdomain>.workers.dev'
const WORKER_URL = 'https://yn-blog-api.lykon013.workers.dev';

const DEFAULT_SERIES = [
  { id: 's1', name: 'Boardroom AI: Monday Reality Check', posts: [] },
  { id: 's2', name: 'Under the Hood: AI Systems', posts: [] },
  { id: 's3', name: "Beginner's AI Blueprint", posts: [] },
  { id: 's4', name: 'The PsyBuddy Initiative', posts: [] }
];

// ---------- publish Worker helpers ----------
// The browser never talks to GitHub directly. It sends an admin password
// (WORKER_KEY, chosen by you when you deployed the Worker) to the Worker,
// which holds the real GitHub token server-side and makes the commit.

function workerKey() {
  try { return localStorage.getItem(WORKER_KEY) || ''; } catch (e) { return ''; }
}
function setWorkerKey(k) {
  try { localStorage.setItem(WORKER_KEY, k); } catch (e) {}
}
function clearWorkerKey() {
  try { localStorage.removeItem(WORKER_KEY); } catch (e) {}
}

async function workerRequest(path, body) {
  if (!WORKER_URL) throw new Error('WORKER_URL is not set in blog.js — deploy the Worker first (see worker/README.md).');
  const res = await fetch(WORKER_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerKey()}` },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

async function publishSeries(series, message) {
  await workerRequest('/api/publish', { series, message });
}

async function uploadImage(dataUrl, id) {
  const data = await workerRequest('/api/upload', { id, dataUrl });
  return data.path;
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
    if (!workerKey()) {
      const k = window.prompt('Enter the admin password you set when deploying the publish Worker:');
      if (!k) return false;
      setWorkerKey(k.trim());
    }
    setBusy(true);
    try {
      await action();
      return true;
    } catch (e) {
      console.error(e);
      window.alert('Publish failed: ' + e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  // Always re-fetch the latest published data right before merging in a
  // change, so a stale/long-open tab can't clobber posts added elsewhere
  // since this tab loaded (each publish overwrites the whole file).
  async function mutate(mutateFn, message) {
    return withPublish(async () => {
      const latest = await loadSeries();
      const updated = mutateFn(latest);
      await publishSeries(updated, message);
      series = updated;
    });
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
      if (isAdmin) {
        const del = document.createElement('button');
        del.className = 'card-delete';
        del.title = 'Delete series';
        del.textContent = '×';
        del.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (publishing) return;
          if (!window.confirm(`Delete the series "${sr.name}" and all its posts? This can't be undone.`)) return;
          const ok = await mutate((latest) => latest.filter((s) => s.id !== sr.id), `Delete series: ${sr.name}`);
          if (ok) renderList();
        });
        card.appendChild(del);
      }
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
      const ok = await mutate((latest) => [...latest, { id: 's' + Date.now(), name, posts: [] }], `Add series: ${name}`);
      if (ok) renderList();
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
        if (isAdmin) {
          const del = document.createElement('button');
          del.className = 'card-delete';
          del.title = 'Delete post';
          del.textContent = '×';
          del.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (publishing) return;
            if (!window.confirm(`Delete the post "${p.title}"? This can't be undone.`)) return;
            const ok = await mutate(
              (latest) => latest.map((s) => s.id === activeSeriesId ? { ...s, posts: s.posts.filter((post) => post.id !== p.id) } : s),
              `Delete post: ${p.title}`
            );
            if (ok) renderDetail();
          });
          card.appendChild(del);
        }
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
    document.getElementById('delete-post-btn').style.display = isAdmin ? '' : 'none';
  }

  document.getElementById('delete-post-btn').addEventListener('click', async () => {
    if (!isAdmin || publishing) return;
    const activeSeries = series.find((s) => s.id === activeSeriesId) || { name: '', posts: [] };
    const post = activeSeries.posts.find((p) => p.id === activePostId);
    if (!post) return;
    if (!window.confirm(`Delete the post "${post.title}"? This can't be undone.`)) return;
    const ok = await mutate(
      (latest) => latest.map((s) => s.id === activeSeriesId ? { ...s, posts: s.posts.filter((p) => p.id !== activePostId) } : s),
      `Delete post: ${post.title}`
    );
    if (ok) { showView('detail'); renderDetail(); }
  });

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
      const latest = await loadSeries();
      const updated = latest.map((s) => s.id === activeSeriesId ? { ...s, posts: [post, ...s.posts] } : s);
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
    if (workerKey()) {
      if (window.confirm('Clear the stored admin password from this browser?')) clearWorkerKey();
    } else {
      const k = window.prompt('Enter the admin password you set when deploying the publish Worker:');
      if (k) setWorkerKey(k.trim());
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
