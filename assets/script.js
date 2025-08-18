/* assets/script.js
 * JianGong XU · site scripts
 * - Theme toggle (persisted)
 * - Smooth anchors + Back to top
 * - Auto TOC build + scroll spy
 * - Load & render: News / Publications / Service / Dataset (from /data/*.json)
 * - Award carousel: build from JSON -> init (buttons, dots, swipe, autoplay)
 */
(function () {
  'use strict';

  /* -------------------- utils -------------------- */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  function cacheBust(url) {
    if (!url) return url;
    const t = 't=' + Date.now();
    return url + (url.includes('?') ? '&' : '?') + t;
  }

  async function fetchJSON(url) {
    try {
      const res = await fetch(cacheBust(url), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.error('[fetchJSON] failed:', url, e);
      return null;
    }
  }

  function ensureArray(data, key) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (key && Array.isArray(data[key])) return data[key];
    const firstArray = Object.values(data).find(Array.isArray);
    return Array.isArray(firstArray) ? firstArray : [];
  }

  /* =====================================================
   *  THEME TOGGLE
   * ===================================================== */
  function initThemeToggle() {
    const KEY = 'pref-theme';
    const html = document.documentElement;
    const btn = $('#themeToggle');
    const saved = localStorage.getItem(KEY);
    if (saved === 'light') html.classList.remove('dark');
    else html.classList.add('dark');
    btn && btn.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem(KEY, html.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  /* =====================================================
   *  SMOOTH ANCHORS + BACK TO TOP
   * ===================================================== */
  function initSmoothAnchors() {
    const headerH = 64;
    function to(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        const id = href.slice(1);
        if (!id) return;
        if (document.getElementById(id)) {
          e.preventDefault();
          to(id);
          history.replaceState(null, '', `#${id}`);
        }
      });
    });
    const back = $('#backTop');
    const onScroll = () => { if (back) back.style.display = window.scrollY > 400 ? 'flex' : 'none'; };
    window.addEventListener('scroll', onScroll, { passive: true });
    back && back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  /* =====================================================
   *  AUTO TOC + SCROLL SPY
   * ===================================================== */
  function initTOC() {
    const wrap = $('#toc');
    if (!wrap) return;
    const sections = [
      { id: 'top', title: 'top' },
      ...$$('.section').map((sec) => {
        const h2 = $('h2', sec);
        return { id: sec.id, title: h2 ? h2.textContent.trim() : sec.id };
      }),
    ].filter((x) => x.id);
    wrap.innerHTML = sections.map((s) => `<a href="#${s.id}" data-id="${s.id}">${s.title}</a>`).join('');
    const tocLinks = $$('a', wrap);
    const map = Object.fromEntries(tocLinks.map((a) => [a.dataset.id, a]));
    const headerH = 70;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const id = en.target.id;
          if (!id || !map[id]) return;
          if (en.isIntersecting) {
            tocLinks.forEach((x) => x.classList.remove('active'));
            map[id].classList.add('active');
          }
        });
      },
      { rootMargin: `-${headerH}px 0px -70% 0px`, threshold: 0.01 }
    );
    sections.forEach((s) => { const el = document.getElementById(s.id); el && io.observe(el); });
  }

  /* =====================================================
   *  YEAR FOOTER
   * ===================================================== */
  function initYear() {
    const y = $('#y');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* =====================================================
   *  NEWS: data/news.json -> #newsList
   * ===================================================== */
  async function loadNews() {
    const list = $('#newsList');
    if (!list) return;
    const src = list.getAttribute('data-src') || 'data/news.json';
    const data = await fetchJSON(src);
    const items = ensureArray(data, 'news');
    if (!items.length) { list.innerHTML = ''; return; }
    list.innerHTML = items
      .map((n) => {
        const date = n.date || n.time || '';
        const text = n.text || n.title || n.desc || '';
        const link = n.link || n.href;
        const html = n.html; // 支持直接传入一整段 HTML
        if (html) return `<li>${html}</li>`;
        const body = link ? `<a href="${link}" target="_blank" rel="noopener">${text}</a>` : text;
        return `<li><span class="date">${date}</span>${body}</li>`;
      })
      .join('');
  }

  /* =====================================================
   *  PUBLICATIONS: data/pubs.json -> #pubList
   *  兼容字段：title, authors(array|string), venue/journal, year, thumb, badge, links{pdf,code,project,doi,...}, tags[]
   * ===================================================== */
  function authorsToHTML(a) {
    if (!a) return '';
    if (Array.isArray(a)) return a.map(x => (x.bold ? `<b>${x.name||x}</b>` : x.name||x)).join(', ');
    return String(a);
  }
  function linksToHTML(links) {
    if (!links) return '';
    const out = [];
    const map = {
      pdf: 'PDF', arxiv: 'arXiv', doi: 'DOI', code: 'Code', data: 'Data',
      project: 'Project', video: 'Video', slides: 'Slides', poster: 'Poster', bibtex: 'BibTeX'
    };
    Object.keys(map).forEach(k => {
      const v = links[k];
      if (v) out.push(`<a href="${v}" target="_blank" rel="noopener">${map[k]}</a>`);
    });
    return out.join(' ');
  }
  async function loadPubs() {
    const box = $('#pubList');
    if (!box) return;
    const src = box.getAttribute('data-src') || 'data/pubs.json';
    const data = await fetchJSON(src);
    const items = ensureArray(data, 'pubs');
    if (!items.length) { box.innerHTML = ''; return; }
    box.innerHTML = items
      .map((p) => {
        const thumb = p.thumb ? `
          <div class="thumb"><img src="${p.thumb}" alt="${(p.title||'publication') + ' thumbnail'}"></div>` : '';
        const badge = p.badge ? `<span class="badge">${p.badge}</span>` : '';
        const venue = p.venue || p.journal || '';
        const year = p.year ? `<span class="sep">·</span>${p.year}` : '';
        const meta = venue ? `<div class="meta">${venue}${year}</div>` : '';
        const authors = p.authors ? `<p class="authors">${authorsToHTML(p.authors)}</p>` : '';
        const title = p.link
          ? `<h3><a href="${p.link}" target="_blank" rel="noopener">${p.title||''}</a></h3>`
          : `<h3>${p.title||''}</h3>`;
        const links = p.links ? `<div class="links">${linksToHTML(p.links)}</div>` : '';
        const tags = Array.isArray(p.tags) && p.tags.length
          ? `<div class="kw">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : '';
        return `
          <article class="pub-item">
            ${thumb}
            <div class="content">
              ${badge}
              ${title}
              ${authors}
              ${meta}
              ${links}
              ${tags}
            </div>
          </article>`;
      })
      .join('');
  }

  /* =====================================================
   *  SERVICE: data/service.json -> #serviceList
   *  兼容：数组字符串 / {year, items[]} 分组
   * ===================================================== */
  async function loadService() {
    const list = $('#serviceList');
    if (!list) return;
    const src = list.getAttribute('data-src') || 'data/service.json';
    const data = await fetchJSON(src);
    const arr = ensureArray(data, 'service');
    if (!arr.length) { list.innerHTML = ''; return; }

    // 支持两种：纯字符串项；或分组 {year, items[]}
    const html = arr.map(it => {
      if (typeof it === 'string') return `<li>${it}</li>`;
      if (it && Array.isArray(it.items)) {
        const items = it.items.map(s => `<li>${s}</li>`).join('');
        return `<li><b>${it.year || ''}</b><ul>${items}</ul></li>`;
      }
      const text = it.text || it.title || it.desc || '';
      return `<li>${text}</li>`;
    }).join('');
    list.innerHTML = html;
  }

  /* =====================================================
   *  DATASET: data/dataset.json -> #datasetGrid
   *  兼容字段：title, thumb, href/link, desc
   * ===================================================== */
  async function loadDataset() {
    const grid = $('#datasetGrid');
    if (!grid) return;
    const src = grid.getAttribute('data-src') || 'data/dataset.json';
    const data = await fetchJSON(src);
    const items = ensureArray(data, 'datasets');
    if (!items.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = items.map(d => {
      const img = d.thumb ? `<img src="${d.thumb}" alt="${(d.title||'dataset') + ' cover'}">` : '';
      const title = d.href || d.link
        ? `<a href="${d.href||d.link}" target="_blank" rel="noopener">${d.title||''}</a>`
        : (d.title || '');
      const desc = d.desc ? `<p class="small muted">${d.desc}</p>` : '';
      return `<div class="card">${img}<h3>${title}</h3>${desc}</div>`;
    }).join('');
  }

  /* =====================================================
   *  AWARD CAROUSEL (JSON-DRIVEN)
   *  HTML placeholder:
   *  <div class="carousel" data-autoplay="5000" data-src="data/award.json"></div>
   * ===================================================== */

  function buildCarouselShell(wrap) {
    wrap.innerHTML = `
      <button class="carousel-btn prev" aria-label="Previous">‹</button>
      <div class="carousel-viewport"><ul class="carousel-track"></ul></div>
      <button class="carousel-btn next" aria-label="Next">›</button>
      <div class="carousel-dots" aria-label="Slides"></div>
    `;
    return {
      track: $('.carousel-track', wrap),
      dots: $('.carousel-dots', wrap),
      prev: $('.prev', wrap),
      next: $('.next', wrap),
    };
  }

  function renderAwardSlides(track, items) {
    const frag = document.createDocumentFragment();
    items.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'carousel-slide';
      const fig = document.createElement('figure');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = it.src;
      img.alt = it.alt || it.caption || 'award';

      if (it.href) {
        const a = document.createElement('a');
        a.href = it.href; a.target = '_blank'; a.rel = 'noopener';
        a.appendChild(img);
        fig.appendChild(a);
      } else {
        fig.appendChild(img);
      }

      if (it.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = it.caption;
        fig.appendChild(cap);
      }

      li.appendChild(fig);
      frag.appendChild(li);
    });
    track.appendChild(frag);
  }

  function initCarousel(wrap) {
    const track = $('.carousel-track', wrap);
    const slides = $$('.carousel-slide', wrap);
    const prev = $('.prev', wrap);
    const next = $('.next', wrap);
    const dotsWrap = $('.carousel-dots', wrap);
    const autoplayMs = parseInt(wrap.dataset.autoplay || '0', 10);

    if (!slides.length) return;

    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });

    let index = 0, timer = null, isDragging = false, startX = 0, currentX = 0;

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;
      $$('.carousel-dots button', wrap).forEach((b, i) =>
        b.setAttribute('aria-current', i === index ? 'true' : 'false')
      );
    }
    function go(i) { index = (i + slides.length) % slides.length; update(); restart(); }
    function nextSlide() { go(index + 1); }
    function prevSlide() { go(index - 1); }

    prev && prev.addEventListener('click', prevSlide);
    next && next.addEventListener('click', nextSlide);

    function restart() {
      if (!autoplayMs) return;
      clearInterval(timer);
      timer = setInterval(nextSlide, autoplayMs);
    }

    function onDown(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      currentX = startX;
      track.style.transition = 'none';
      clearInterval(timer);
    }
    function onMove(e) {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      currentX = x;
      track.style.transform = `translateX(${dx / wrap.clientWidth * 100 - index * 100}%)`;
    }
    function onUp() {
      if (!isDragging) return;
      const dx = currentX - startX;
      track.style.transition = '';
      if (Math.abs(dx) > wrap.clientWidth * 0.2) {
        dx < 0 ? nextSlide() : prevSlide();
      } else {
        update(); restart();
      }
      isDragging = false;
    }

    wrap.addEventListener('mousedown', onDown);
    wrap.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    wrap.addEventListener('touchstart', onDown, { passive: true });
    wrap.addEventListener('touchmove', onMove, { passive: true });
    wrap.addEventListener('touchend', onUp);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    update(); restart();
  }

  async function buildAwardCarouselsFromJSON() {
    const wraps = $$('#award .carousel[data-src]');
    if (!wraps.length) return;
    await Promise.all(
      wraps.map(async (wrap) => {
        const base = wrap.getAttribute('data-src');
        const url = cacheBust(base);
        try {
          const json = await fetchJSON(base);
          const items = ensureArray(json, 'awards');
          if (!items.length) throw new Error('Empty awards data');
          const { track } = buildCarouselShell(wrap);
          renderAwardSlides(track, items);
          initCarousel(wrap);
        } catch (e) {
          console.error('[award] failed to load:', url, e);
          wrap.innerHTML = '<p class="muted small">No awards to display.</p>';
        }
      })
    );
  }

  /* -------------------- boot -------------------- */
  ready(() => {
    initThemeToggle();
    initSmoothAnchors();
    initTOC();
    initYear();

    // 数据驱动区块
    loadNews();
    loadPubs();
    loadService();
    loadDataset();

    // Award 轮播
    buildAwardCarouselsFromJSON();
  });
})();
