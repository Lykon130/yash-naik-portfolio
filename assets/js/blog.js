const STORAGE_KEY = 'yn_blog_series_v1';
const ADMIN_KEY = 'yn_blog_admin_v1';
const DEFAULT_SERIES = [
  { id: 's1', name: 'Boardroom AI: Monday Reality Check', posts: [] },
  { id: 's2', name: 'Under the Hood: AI Systems', posts: [] },
  { id: 's3', name: "Beginner's AI Blueprint", posts: [] },
  { id: 's4', name: 'The PsyBuddy Initiative', posts: [] }
];

function loadSeries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SERIES;
}

function persist(series) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(series));
  } catch (e) {
    window.alert('Could not save: browser storage is full (likely from a large image). Try a smaller image, or use Export Data to back up your posts.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let series = loadSeries();
  let isAdmin = (() => { try { return localStorage.getItem(ADMIN_KEY) === '1'; } catch (e) { return false; } })();
  let view = 'list';
  let activeSeriesId = null;
  let activePostId = null;
  let newPostImage = null;
  let stars = [];

  const canvas = document.getElementById('starfield');

  const listView = document.getElementById('list-view');
  const detailView = document.getElementById('detail-view');
  const postView = document.getElementById('post-view');
  const seriesGrid = document.getElementById('series-grid');
  const postsGrid = document.getElementById('posts-grid');
  const detailTitle = document.getElementById('detail-title');
  const newPostForm = document.getElementById('new-post-form');
  const openNewPostBtn = document.getElementById('open-new-post');
  const exportLink = document.getElementById('export-link');
  const adminStar = document.getElementById('admin-star');
  const loginOverlay = document.getElementById('login-overlay');
  const loginError = document.getElementById('login-error');

  function showView(v) {
    view = v;
    listView.style.display = v === 'list' ? '' : 'none';
    detailView.style.display = v === 'detail' ? '' : 'none';
    postView.style.display = v === 'post' ? '' : 'none';
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
    form.querySelector('#save-series').addEventListener('click', () => {
      const name = form.querySelector('#new-series-name').value.trim();
      if (!name) return;
      series = [...series, { id: 's' + Date.now(), name, posts: [] }];
      persist(series);
      renderList();
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
  document.getElementById('save-new-post').addEventListener('click', () => {
    if (!isAdmin) return;
    const title = document.getElementById('new-post-title').value.trim();
    const content = document.getElementById('new-post-content').value.trim();
    if (!title || !content) return;
    const post = { id: 'p' + Date.now(), title, content, image: newPostImage };
    series = series.map((s) => s.id === activeSeriesId ? { ...s, posts: [post, ...s.posts] } : s);
    persist(series);
    newPostForm.style.display = 'none';
    renderDetail();
  });

  document.getElementById('back-to-list').addEventListener('click', () => { showView('list'); renderList(); });
  document.getElementById('back-to-series').addEventListener('click', () => { showView('detail'); renderDetail(); });

  // Admin gate
  function updateAdminUI() {
    exportLink.style.display = isAdmin ? '' : 'none';
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
      window.alert('Blog data copied to clipboard. Paste it somewhere safe — for permanent storage, replace DEFAULT_SERIES in blog.js with this.');
    } catch (e) {
      window.prompt('Copy this JSON manually:', json);
    }
  });

  // Clicking a starfield particle also opens the admin login
  canvas.addEventListener('click', (e) => {
    if (!window.__starRef || !window.__starRef.stars) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const hit = window.__starRef.stars.some((st) => Math.hypot(st.x - x, st.y - y) < 9);
    if (hit) adminAction();
  });

  window.__starRef = initStarfield('starfield', 150);
  updateAdminUI();
  renderList();
});
