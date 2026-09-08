document.addEventListener('DOMContentLoaded', () => {
  initStarfield('starfield', 130);

  // Hero title, letter-by-letter, word-grouped
  const titleEl = document.getElementById('hero-title');
  ['Yash', 'Naik'].forEach((word) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    word.split('').forEach((ch) => {
      const letterEl = document.createElement('span');
      letterEl.className = 'letter';
      letterEl.textContent = ch;
      wordEl.appendChild(letterEl);
    });
    titleEl.appendChild(wordEl);
  });

  // Section reveal on scroll
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add('revealed');
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObs.observe(el));

  // Count-up stats
  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid) {
    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          animateCounters();
          statsObs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    statsObs.observe(statsGrid);
  }
  function animateCounters() {
    const nums = document.querySelectorAll('.stat-num');
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      nums.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = Math.round(target * ease) + suffix;
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Active nav link tracking
  const navLinks = document.querySelectorAll('#nav-links a[href^="#"]');
  const sections = document.querySelectorAll('[data-section]');
  let ticking = false;
  const updateActive = () => {
    ticking = false;
    let active = 'home';
    let closestDist = Infinity;
    sections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.6) {
        const dist = Math.abs(r.top - 100);
        if (dist < closestDist) { closestDist = dist; active = sec.getAttribute('data-section'); }
      }
    });
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + active));
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateActive);
  }, { passive: true });
  updateActive();

  // Smooth scroll with header offset
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // 3D tilt on project cards
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = py * -9, ry = px * 12;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.boxShadow = '0 20px 40px var(--glow)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = 'none';
    });
  });
});
