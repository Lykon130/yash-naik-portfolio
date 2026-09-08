// Shared ambient starfield + magnetic cursor used on every page.

function initStarfield(canvasId, count) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: count || 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.3 + 0.3,
    s: Math.random() * 0.25 + 0.04,
    o: Math.random() * 0.6 + 0.25
  }));
  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((st) => {
      st.y += st.s;
      if (st.y > canvas.height) { st.y = 0; st.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${st.o})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };
  draw();
  return { canvas, stars };
}

function initCursorFx() {
  const el = document.getElementById('cursor-fx');
  if (!el || matchMedia('(hover: none)').matches) return;
  const label = el.querySelector('span');

  document.querySelectorAll('[data-cursor]').forEach((target) => {
    target.addEventListener('mouseenter', () => {
      const r = target.getBoundingClientRect();
      const text = target.getAttribute('data-cursor');
      el.style.left = (r.left + r.width / 2) + 'px';
      el.style.top = (r.top + r.height / 2) + 'px';
      label.textContent = text || '';
      el.classList.toggle('labeled', !!text);
      el.classList.add('visible');
    });
    target.addEventListener('mouseleave', () => {
      el.classList.remove('visible');
    });
  });
}

function initScrollProgress() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const denom = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.max(0, Math.min(100, (window.scrollY / denom) * 100));
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initCursorFx();
  initScrollProgress();
});
