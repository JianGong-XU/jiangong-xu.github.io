// ====== Year ======
(() => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();

// ====== Theme (dark / light) ======
(() => {
  const KEY = 'theme';
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem(KEY);
  if (saved === 'dark') document.documentElement.classList.add('dark');

  btn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem(
      KEY,
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  });
})();

// ====== I18N ======
const I18N = {
  en: {
    'nav.about': 'About',
    'nav.news': 'News',
    'nav.selected': 'Selected',
    'nav.publications': 'Publications',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',

    'hero.lead':
      'Research on Machine Learning, Computer Vision, and Multimodal AI.',
    'hero.affil':
      'Currently at <em>Your Institute / Lab</em>, focusing on A, B, C.',

    'about.title': 'About',
    // ✅ 你的研究兴趣英文版（支持换行）
    'about.p1': `Based on multi-modal high spatio-temporal resolution remote sensing images, my research interests mainly include:
<br>• Intelligent processing of remote sensing data: All-in-one Image Restoration; Multimodal image registration
<br>• Real-time remote sensing processing in orbit: Target/Anomaly identification; Change detection; Semantic segmentation
<br>• Remote sensing monitoring of the environment: Inversion of terrestrial ecological parameters; Large-scale ecological impact analysis`,

    'news.title': 'News',
    'news.note': 'Edit data/news.json to update.',
    'selected.title': 'Selected Publications',
    'pubs.title': 'Publications',
    'projects.title': 'Projects',
    'contact.title': 'Contact'
  },

  zh: {
    'nav.about': '关于',
    'nav.news': '新闻',
    'nav.selected': '精选',
    'nav.publications': '论文',
    'nav.projects': '项目',
    'nav.contact': '联系',

    'hero.lead': '研究方向：机器学习、计算机视觉与多模态。',
    'hero.affil': '目前于 <em>你的单位/实验室</em>，关注 A、B、C 等课题。',

    'about.title': '关于我',
    // ✅ 你的研究兴趣中文版（支持换行）
    'about.p1': `基于多模态高时空分辨率遥感影像，研究兴趣主要包括：
<br>• 遥感数据智能处理：降质影像复原；多模态影像配准
<br>• 遥感在轨实时服务：语义分割；目标/异常识别；变化检测
<br>• 生态环境遥感监测：地表生态参数反演；大尺度生态影响分析`,

    'news.title': '新闻',
    'news.note': '编辑 data/news.json 更新。',
    'selected.title': '精选论文',
    'pubs.title': '全部论文',
    'projects.title': '项目',
    'contact.title': '联系方式'
  }
};

function applyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const dict = I18N[lang]?.[key];
    if (dict) el.innerHTML = dict; // 用 innerHTML 支持换行/强调
  });
}

(() => {
  const select = document.getElementById('langSwitch'); // 与 index.html 对应
  const saved = localStorage.getItem('lang') || 'en';
  applyLang(saved);
  if (select) {
    select.value = saved;
    select.addEventListener('change', (e) => applyLang(e.target.value));
  }
})();

// ====== Left TOC (auto) + Active highlight ======
(() => {
  const toc = document.getElementById('toc');
  if (!toc) return;

  const sections = [...document.querySelectorAll('section[id]')];
  toc.innerHTML = sections
    .map((s) => {
      const title = s.querySelector('h2')?.textContent || s.id;
      return `<a href="#${s.id}">${title}</a>`;
    })
    .join('');

  const links = toc.querySelectorAll('a');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) =>
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id)
          );
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => io.observe(s));
})();

// ====== Back to top ======
(() => {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  const toggle = () => (btn.style.display = window.scrollY > 300 ? 'block' : 'none');
  window.addEventListener('scroll', toggle);
  toggle();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ====== Data loaders (news / publications / projects) ======
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json();
}
const badgeLinks = (o) =>
  [
    o.pdf && `<a href="${o.pdf}" target="_blank">PDF</a>`,
    o.code && `<a href="${o.code}" target="_blank">Code</a>`,
    o.doi && `<a href="https://doi.org/${o.doi}" target="_blank">DOI</a>`
  ]
    .filter(Boolean)
    .join(' ');

// News
(async () => {
  const box = document.getElementById('newsList');
  if (!box) return;
  try {
    const data = await loadJSON('data/news.json');
    box.innerHTML = data
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((n) => `<li><span class="date">${n.date}</span> ${n.text}</li>`)
      .join('');
  } catch (e) {
    // 非致命
    console.warn('news.json not found or invalid', e);
  }
})();

// Publications: selected + all (group by year)
(async () => {
  const sel = document.getElementById('selGrid');
  const all = document.getElementById('pubList');
  if (!sel && !all) return;
  try {
    const pubs = await loadJSON('data/publications.json');

    // Selected
    if (sel) {
      const selected = pubs.filter((p) => p.selected);
      sel.innerHTML = selected
        .map(
          (p) => `
        <article class="card">
          ${p.thumb ? `<img src="${p.thumb}" alt="${p.title}">` : ''}
          <h3>${p.title}</h3>
          <p class="meta">${p.authors} · <em>${p.venue || ''}</em> ${p.year || ''}</p>
          ${p.abs ? `<p>${p.abs}</p>` : ''}
          <p class="links">${badgeLinks(p)}</p>
        </article>`
        )
        .join('');
    }

    // All (by year)
    if (all) {
      const byYear = {};
      pubs.forEach((p) => ((byYear[p.year] ||= []).push(p)));
      const years = Object.keys(byYear).sort((a, b) => b - a);
      all.innerHTML = years
        .map(
          (y) => `
        <div class="year">${y}</div>
        ${byYear[y]
          .map(
            (p) => `
          <div class="pub">
            <div><strong>${p.title}</strong></div>
            <div class="meta">${p.authors} · <em>${p.venue || ''}</em></div>
            <div class="links">${badgeLinks(p)}</div>
          </div>`
          )
          .join('')}`
        )
        .join('');
    }
  } catch (e) {
    console.warn('publications.json not found or invalid', e);
  }
})();

// Projects
(async () => {
  const grid = document.getElementById('projGrid');
  if (!grid) return;
  try {
    const projs = await loadJSON('data/projects.json');
    grid.innerHTML = projs
      .map(
        (p) => `
      <article class="card">
        ${p.thumb ? `<img src="${p.thumb}" alt="${p.name}">` : ''}
        <h3><a href="${p.link}" target="_blank" rel="noopener">${p.name}</a></h3>
        <p>${p.desc || ''}</p>
      </article>`
      )
      .join('');
  } catch (e) {
    console.warn('projects.json not found or invalid', e);
  }
})();
