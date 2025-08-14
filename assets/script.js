/* ================= Year ================= */
(() => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ================= Theme ================= */
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

/* ================= I18N ================= */
const I18N = {
  en: {
    // nav
    'nav.about': 'About',
    'nav.news': 'News',
    'nav.publications': 'Publications',
    'nav.dataset': 'Dataset',
    'nav.service': 'Academic Service',
    'nav.contact': 'Contact',
    // 兼容你已有的键（如果页面里还在用）
    'nav.selected': 'Selected',
    'nav.projects': 'Projects',

    // hero
    'hero.lead': `Welcome to my academic homepage.
<br>I am <strong>JianGong XU</strong>, a Ph.D. candidate at the <a href="https://liesmars.whu.edu.cn/" target="_blank" rel="noopener">State Key Laboratory of Information Engineering in Surveying, Mapping and Remote Sensing (LIESMARS), Wuhan University</a>.
<br>Currently conducting research under the guidance of Professors
<a href="http://rspip.whu.edu.cn/index" target="_blank" rel="noopener">Jun PAN</a> and
<a href="http://rsone.whu.edu.cn/" target="_blank" rel="noopener">Mi WANG</a>.`,
    'hero.affil': `I am open to collaboration and welcome inquiries from anyone interested in my research. Please feel free to <a href="#contact">contact</a>.`,

    // sections
    'about.title': 'About',
    'about.p1': `Based on multi-modal high spatio-temporal resolution remote sensing images, my research interests mainly include:
<br>  • Intelligent processing of remote sensing data: low-quality image restoration; multimodal image registration
<br>  • Real-time remote sensing processing in orbit: target/anomaly identification; change detection; semantic segmentation
<br>  • Remote sensing monitoring of the environment: inversion of terrestrial ecological parameters; large-scale ecological impact analysis`,

    'news.title': 'News',
    'news.note': 'Edit data/news.json to update.',

    'selected.title': 'Selected Publications',
    'pubs.title': 'Publications',

    'dataset.title': 'Dataset',
    'dataset.note': 'Edit data/datasets.json to update.',

    'service.title': 'Academic Service',
    'service.note': 'Edit data/service.json to update.',

    'projects.title': 'Projects',
    'contact.title': 'Contact'
  },

  zh: {
    // nav
    'nav.about': '关于我',
    'nav.news': '新闻',
    'nav.publications': '论文',
    'nav.dataset': '数据集',
    'nav.service': '学术服务',
    'nav.contact': '联系方式',
    // 兼容
    'nav.selected': '精选',
    'nav.projects': '项目',

    // hero
    'hero.lead': `欢迎来到我的主页。
<br>我是 <strong>徐建功</strong>，目前博士就读于 <a href="https://liesmars.whu.edu.cn/" target="_blank" rel="noopener">武汉大学测绘遥感信息工程国家重点实验室（LIESMARS）</a>。
<br>在 <a href="http://rspip.whu.edu.cn/index" target="_blank" rel="noopener">潘俊教授</a> 与
<a href="http://rsone.whu.edu.cn/" target="_blank" rel="noopener">王密教授</a> 指导下开展研究。`,
    'hero.affil': `欢迎与我交流合作，对我的研究感兴趣可<a href="#contact">联系我</a>。`,

    // sections
    'about.title': '关于我',
    'about.p1': `基于多模态高时空分辨率遥感影像，研究兴趣主要包括：
<br>  • 遥感数据智能处理：降质影像修复；多模态影像配准
<br>  • 遥感在轨实时服务：目标/异常识别；变化检测；语义分割
<br>  • 环境遥感监测：地表生态参数反演；大尺度生态影响分析`,

    'news.title': '新闻',
    'news.note': '编辑 data/news.json 更新。',

    'selected.title': '精选论文',
    'pubs.title': '全部论文',

    'dataset.title': '数据集',
    'dataset.note': '编辑 data/datasets.json 更新。',

    'service.title': '学术服务',
    'service.note': '编辑 data/service.json 更新。',

    'projects.title': '项目',
    'contact.title': '联系方式'
  }
};

function applyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const txt = I18N[lang]?.[key];
    if (txt != null) el.innerHTML = txt; // innerHTML 支持 <br>/<a>
  });
  buildTOC(); // 语言切换后，重建 TOC 保持标题一致
}

(() => {
  const select = document.getElementById('langSwitch');
  const saved = localStorage.getItem('lang') || 'en';
  applyLang(saved);
  if (select) {
    select.value = saved;
    select.addEventListener('change', (e) => applyLang(e.target.value));
  }
})();

/* ================= TOC ================= */
function buildTOC() {
  const toc = document.getElementById('toc');
  if (!toc) return;
  const sections = [...document.querySelectorAll('section[id]')];
  toc.innerHTML = sections
    .map((s) => `<a href="#${s.id}">${s.querySelector('h2')?.textContent || s.id}</a>`)
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
}
buildTOC();

/* ============== Back to top ============== */
(() => {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  const toggle = () => (btn.style.display = window.scrollY > 300 ? 'block' : 'none');
  window.addEventListener('scroll', toggle);
  toggle();
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

/* ============ Data loaders (JSON) ============ */
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

// ---- News ----
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
    console.warn('news.json not found or invalid', e);
  }
})();

// ---- Publications (Selected + All) ----
(async () => {
  const sel = document.getElementById('selGrid');
  const all = document.getElementById('pubList');
  if (!sel && !all) return;
  try {
    const pubs = await loadJSON('data/publications.json');

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

// ---- Projects (optional; only renders if container exists) ----
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

// ---- Dataset ----
(async () => {
  const box = document.getElementById('datasetGrid') || document.getElementById('datasetList');
  if (!box) return;
  try {
    const data = await loadJSON('data/datasets.json');
    const html = data
      .map((d) => `
        <article class="card">
          ${d.thumb ? `<img src="${d.thumb}" alt="${d.name}">` : ''}
          <h3>${d.name}</h3>
          <p class="meta">${d.year || ''} ${d.venue ? '· ' + d.venue : ''}</p>
          <p>${d.desc || ''}</p>
          <p class="links">
            ${[
              d.home && `<a href="${d.home}" target="_blank">Home</a>`,
              d.paper && `<a href="${d.paper}" target="_blank">Paper</a>`,
              d.code && `<a href="${d.code}" target="_blank">Code</a>`,
              d.data && `<a href="${d.data}" target="_blank">Data</a>`
            ].filter(Boolean).join(' ')}
          </p>
        </article>
      `)
      .join('');
    box.innerHTML = html;
  } catch (e) {
    console.warn('datasets.json not found or invalid', e);
  }
})();

// ---- Academic Service ----
(async () => {
  const box = document.getElementById('serviceList');
  if (!box) return;
  try {
    const items = await loadJSON('data/service.json');
    box.innerHTML = items
      .map((s) => `<li>• ${s.text || s}</li>`)
      .join('');
  } catch (e) {
    console.warn('service.json not found or invalid', e);
  }
})();
