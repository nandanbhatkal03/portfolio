(() => {
  const body = document.body;
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const projectGrid = document.getElementById('projectGrid');
  const searchInput = document.getElementById('projectSearch');
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const emptyState = document.getElementById('emptyState');
  const repoStatus = document.getElementById('repoStatus');
  const initialCards = [...projectGrid.querySelectorAll('.project-card')];
  const featuredSlugs = new Set(['flimflex', 'vuln-scanner', 'openlearnx', 'slidecraft', 'ai-software-repair']);
  let activeFilter = 'all';
  let moreRepoCount = 0;

  // Dark mode is permanently enabled.
  body.classList.add('dark');

  // Mobile navigation.
  menuToggle.addEventListener('click', () => {
    const opened = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!opened));
    menuToggle.setAttribute('aria-label', opened ? 'Open navigation' : 'Close navigation');
    navLinks.classList.toggle('open', !opened);
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));

  // Compact sticky-header treatment after scrolling past the top hero.
  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 100);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Gentle reveal animation, with a no-IntersectionObserver fallback.
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else revealElements.forEach(element => element.classList.add('is-visible'));

  // Project cards use hand-written copy for the five featured repositories. Remaining
  // public repositories are loaded from GitHub metadata when network access is available.
  function slugify(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function classifyRepository(repo) {
    const text = `${repo.name || ''} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    if (/slide|desktop|wpf|c#|powerpoint/.test(text)) return 'desktop';
    if (/vuln|security|ai|machine learning|repair|anomaly|llm|detect/.test(text)) return 'ai';
    if (/react|node|mern|web|movie|learning|website|booking/.test(text)) return 'web';
    return 'other';
  }
  function categoryLabel(category) {
    return ({ web: 'Web project', ai: 'AI / Security', desktop: 'Desktop app', other: 'Repository' })[category] || 'Repository';
  }
  function cardDescription(repo) {
    const description = (repo.description || '').trim();
    if (description) {
      const clean = description.endsWith('.') ? description : `${description}.`;
      return `${escapeHtml(clean)} This repository contains the source code and supporting project files for the work.`;
    }
    const pretty = String(repo.name || 'This project').replace(/[-_]+/g, ' ');
    return `${escapeHtml(pretty)} is one of my public software repositories. Visit the repository to explore its implementation, code, and project files.`;
  }
  function makeAdditionalRepoCard(repo, index) {
    const category = classifyRepository(repo);
    const title = escapeHtml(repo.name || 'GitHub repository');
    const description = cardDescription(repo);
    const language = repo.language ? `<span>${escapeHtml(repo.language)}</span>` : '';
    const topics = (repo.topics || []).slice(0, 2).map(topic => `<span>${escapeHtml(topic)}</span>`).join('');
    const tags = language + topics;
    const article = document.createElement('article');
    article.className = `project-card project-${category} reveal is-visible`;
    article.dataset.category = category;
    article.dataset.name = `${repo.name || ''} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    article.dataset.repoSlug = slugify(repo.name);
    const palette = category === 'ai' ? 'visual-shield' : category === 'desktop' ? 'visual-slides' : category === 'web' ? 'visual-learning' : 'visual-repair';
    const visualSymbol = category === 'ai' ? '⌁' : category === 'desktop' ? '▱' : category === 'web' ? '✧' : '✦';
    article.innerHTML = `<div class="project-visual ${palette}"><span class="visual-label">${escapeHtml(categoryLabel(category).toUpperCase())}</span><div class="extra-repo-art">${visualSymbol}</div><span class="visual-orbit">✧</span></div><div class="project-content"><div class="project-meta"><span class="project-type type-tag-purple">${escapeHtml(categoryLabel(category))}</span><span class="project-number">#${String(index + 6).padStart(3, '0')}</span></div><h3>${title}</h3><p>${description}</p><div class="tech-tags">${tags || '<span>Open source</span><span>Development</span>'}</div><a class="project-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">Explore repository <span>↗</span></a></div>`;
    return article;
  }
  function applyFilters() {
    const query = (searchInput.value || '').trim().toLowerCase();
    let shown = 0;
    [...projectGrid.querySelectorAll('.project-card')].forEach(card => {
      const category = card.dataset.category || 'other';
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const matchesQuery = !query || `${card.dataset.name || ''} ${card.textContent || ''}`.toLowerCase().includes(query);
      const visible = matchesFilter && matchesQuery;
      card.hidden = !visible;
      if (visible) shown++;
    });
    emptyState.hidden = shown > 0;
    document.getElementById('allCount').textContent = String(projectGrid.querySelectorAll('.project-card').length).padStart(2, '0');
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }));
  searchInput.addEventListener('input', applyFilters);

  async function loadMoreRepositories() {
    const apiUrl = 'https://api.github.com/users/nandanbhatkal03/repos?type=owner&per_page=100&sort=updated';
    try {
      const response = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      const repos = await response.json();
      const additional = repos
        .filter(repo => !repo.fork && !featuredSlugs.has((repo.name || '').toLowerCase()) && (repo.name || '').toLowerCase() !== 'nandanbhatkal03')
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      const fragment = document.createDocumentFragment();
      additional.forEach((repo, index) => fragment.appendChild(makeAdditionalRepoCard(repo, index)));
      projectGrid.appendChild(fragment);
      moreRepoCount = additional.length;
      if (additional.length) {
        repoStatus.innerHTML = `<span class="status-dot"></span> Loaded ${additional.length} additional public ${additional.length === 1 ? 'repository' : 'repositories'} from GitHub. Descriptions for these extra projects use public repository metadata.`;
      } else {
        repoStatus.innerHTML = '<span class="status-dot"></span> All public repositories are represented in the featured collection. Visit GitHub for the latest updates.';
      }
      applyFilters();
    } catch (error) {
      repoStatus.innerHTML = '<span class="status-dot"></span> Showing the five verified featured projects. Open GitHub to see the complete and most current repository list.';
    }
  }
  void loadMoreRepositories();
  document.getElementById('year').textContent = String(new Date().getFullYear());
  // Keep the count immediately accurate when the page is opened offline.
  document.getElementById('allCount').textContent = String(initialCards.length).padStart(2, '0');

  // --- Smooth Background Scroll Animation ---
  (() => {
    const canvas = document.getElementById('bgScrollCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const heroSection = document.querySelector('.hero');
    const TOTAL_FRAMES = 120;
    const frames = new Array(TOTAL_FRAMES);
    let currentFrame = 0;
    let targetFrame = 0;
    let isTicking = false;
    let lastRenderedIndex = -1;

    // Active video content coordinates (1920x1080 with 60px top / bottom letterbox removed)
    const SRC_TOP = 60;
    const SRC_HEIGHT = 961;
    const SRC_WIDTH = 1920;
    const SRC_ASPECT = SRC_WIDTH / SRC_HEIGHT;
    const TARGET_CENTER_X = 1150; // Focus on Nandan across head turn

    function getFramePath(i) {
      const num = String(i + 1).padStart(3, '0');
      return `scroll_animation/ezgif-frame-${num}.jpg`;
    }

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const newWidth = Math.max(1, Math.round(w * dpr));
      const newHeight = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        lastRenderedIndex = -1; // force redraw
        renderFrame(Math.round(currentFrame));
      }
    }

    function drawImageCover(img) {
      if (!img || !img.naturalWidth || !ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;

      const canvasAspect = cw / ch;
      let sx, sy, sw, sh;

      if (canvasAspect >= SRC_ASPECT) {
        // Viewport is wider than the 2:1 active video
        sw = SRC_WIDTH;
        sh = sw / canvasAspect;
        sx = 0;
        sy = SRC_TOP + (SRC_HEIGHT - sh) / 2;
      } else {
        // Viewport is taller/narrower (desktop 16:9, tablet, phone)
        sh = SRC_HEIGHT;
        sw = sh * canvasAspect;
        sy = SRC_TOP;
        sx = TARGET_CENTER_X - sw / 2;
        if (sx < 0) sx = 0;
        if (sx + sw > SRC_WIDTH) sx = SRC_WIDTH - sw;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

      // Harmonious gradient overlays for dark theme:
      // 1. Bottom gradient dissolves smoothly into the dark background color
      const bgHex = '#10131c';
      const bgRgb = '16, 19, 28';

      const bottomGrad = ctx.createLinearGradient(0, ch * 0.7, 0, ch);
      bottomGrad.addColorStop(0, `rgba(${bgRgb}, 0)`);
      bottomGrad.addColorStop(1, bgHex);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, ch * 0.7, cw, ch * 0.3);

      // 2. Subtle left gradient ensures hero copy is effortlessly legible
      const leftGrad = ctx.createLinearGradient(0, 0, cw * 0.52, 0);
      leftGrad.addColorStop(0, `rgba(${bgRgb}, 0.65)`);
      leftGrad.addColorStop(1, `rgba(${bgRgb}, 0)`);
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, cw * 0.52, ch);
    }

    function renderFrame(index) {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, index));
      if (idx === lastRenderedIndex) return;

      const targetImg = frames[idx];
      if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
        drawImageCover(targetImg);
        lastRenderedIndex = idx;
        return;
      }

      // If target frame is still loading, seamlessly fallback to nearest loaded frame
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = frames[idx - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          drawImageCover(prev);
          lastRenderedIndex = idx - offset;
          return;
        }
        const next = frames[idx + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          drawImageCover(next);
          lastRenderedIndex = idx + offset;
          return;
        }
      }
    }

    function updateTargetFrame() {
      const heroHeight = heroSection ? heroSection.offsetHeight : 700;
      const scrollRange = Math.max(window.innerHeight * 0.85, heroHeight);
      const scrollY = window.scrollY;

      // Progress from 0 to 1 across hero section
      const progress = Math.min(1, Math.max(0, scrollY / scrollRange));
      targetFrame = progress * (TOTAL_FRAMES - 1);

      // Fade canvas opacity smoothly as user scrolls past the hero into About
      const baseOpacity = 0.9;
      const fadeStart = scrollRange * 0.75;
      const fadeEnd = scrollRange * 1.3;

      if (scrollY <= fadeStart) {
        canvas.style.opacity = String(baseOpacity);
      } else if (scrollY >= fadeEnd) {
        canvas.style.opacity = '0';
      } else {
        const fade = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
        canvas.style.opacity = (baseOpacity * fade).toFixed(3);
      }

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(smoothAnimationLoop);
      }
    }

    function smoothAnimationLoop() {
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) < 0.015) {
        currentFrame = targetFrame;
        renderFrame(Math.round(currentFrame));
        isTicking = false;
        return;
      }

      // Smooth linear interpolation (0.09 easing factor for silky responsiveness)
      currentFrame += diff * 0.09;
      renderFrame(Math.round(currentFrame));
      requestAnimationFrame(smoothAnimationLoop);
    }

    // Load initial frame immediately for zero-lag initial paint
    const initialImg = new Image();
    initialImg.src = getFramePath(0);
    frames[0] = initialImg;
    initialImg.onload = () => {
      resizeCanvas();
      renderFrame(0);
    };

    // Preload remaining frames in the background
    function preloadAllFrames() {
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          if (!isTicking && Math.round(currentFrame) === i) {
            renderFrame(i);
          }
        };
        frames[i] = img;
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadAllFrames, { timeout: 1000 });
    } else {
      setTimeout(preloadAllFrames, 150);
    }

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      window.addEventListener('scroll', updateTargetFrame, { passive: true });
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      updateTargetFrame();
    }, { passive: true });

    // Initial setup
    resizeCanvas();
    updateTargetFrame();
  })();
})();

