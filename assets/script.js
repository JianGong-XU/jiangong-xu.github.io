/* assets/script.js
 * JianGong XU · site scripts
 * - Theme toggle (persisted)
 * - Smooth anchors + Back to top
 * - Auto TOC build + scroll spy
 * - Award carousel (build from JSON -> init)
 */
(function () {
  'use strict';

  /* -------------------- small utils -------------------- */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  /* =====================================================
   *  THEME TOGGLE
   * ===================================================== */
  function initThemeToggle() {
    const KEY = 'pref-theme';
    const html = document.documentElement;
    const btn = $('#themeToggle');

    // init from storage (default: dark)
    const saved = localStorage.getItem(KEY);
    if (saved === 'light') html.classList.remove('dark');
    else html.classList.add('dark');

    if (btn) {
      btn.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem(KEY, isDark ? 'dark' : 'light');
      });
    }
  }

  /* =====================================================
   *  SMOOTH ANCHORS + BACK TO TOP
   * ===================================================== */
  function initSmoothAnchors() {
    const headerH = 64; // approximate sticky header height

    function to(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // top nav + toc anchors
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

    // back-to-top
    const back = $('#backTop');
    const onScroll = () => {
      if (!back) return;
      back.style.display = window.scrollY > 400 ? 'flex' : 'none';
    };
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

    // render
    wrap.innerHTML = sections
      .map((s) => `<a href="#${s.id}" data-id="${s.id}">${s.title}</a>`)
      .join('');

    // spy
    const tocLinks = $$('a', wrap);
    const linkById = Object.fromEntries(tocLinks.map((a) => [a.dataset.id, a]));
    const headerH = 70;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const id = en.target.id;
          if (!id || !linkById[id]) return;
          if (en.isIntersecting) {
            tocLinks.forEach((x) => x.classList.remove('active'));
            linkById[id].classList.add('active');
          }
        });
      },
      { rootMargin: `-${headerH}px 0px -70% 0px`, threshold: 0.01 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
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
        a.href = it.href;
        a.target = '_blank';
        a.rel = 'noopener';
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

    // dots
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });

    let index = 0,
      timer = null,
      isDragging = false,
      startX = 0,
      currentX = 0;

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;
      $$('.carousel-dots button', wrap).forEach((b, i) =>
        b.setAttribute('aria-current', i === index ? 'true' : 'false')
      );
    }
    function go(i) {
      index = (i + slides.length) % slides.length;
      update();
      restart();
    }
    function nextSlide() {
      go(index + 1);
    }
    function prevSlide() {
      go(index - 1);
    }

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
        update();
        restart();
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

    update();
    restart();
  }

  async function buildAwardCarouselsFromJSON() {
    const wraps = $$('#award .carousel[data-src]');
    if (!wraps.length) return;

    await Promise.all(
      wraps.map(async (wrap) => {
        const base = wrap.getAttribute('data-src');
        // cache-bust for GitHub Pages
        const url = base + (base.includes('?') ? '&' : '?') + 't=' + Date.now();
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          const items = (json && (json.awards || json)) || [];
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
    buildAwardCarouselsFromJSON();
  });
})();
