// 年份
document.getElementById('y').textContent = new Date().getFullYear();

// 主题
const tbtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.documentElement.classList.add('dark');
tbtn?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// 多语言（默认 EN）
const i18n = {
  en: {
    'nav.about':'About','nav.news':'News','nav.selected':'Selected',
    'nav.publications':'Publications','nav.projects':'Projects','nav.contact':'Contact',
    'hero.lead':'Research on Machine Learning, Computer Vision, and Multimodal AI.',
    'hero.affil':'Currently at Your Institute / Lab, focusing on A, B, C.',
    'about.title':'About','about.p1':'I am an X-year researcher/student. My interests include representation learning, vision-language models, and efficient training.',
    'news.title':'News','news.note':'Edit data/news.json to update.',
    'selected.title':'Selected Publications',
    'pubs.title':'Publications','projects.title':'Projects','contact.title':'Contact'
  },
  zh: {
    'nav.about':'关于','nav.news':'新闻','nav.selected':'精选',
    'nav.publications':'论文','nav.projects':'项目','nav.contact':'联系',
    'hero.lead':'研究方向：机器学习、计算机视觉与多模态。','hero.affil':'目前于你的单位/实验室，关注 A、B、C 等课题。',
    'about.title':'关于我','about.p1':'我是一名研究者/学生，兴趣包括表征学习、视觉-语言模型与高效训练。',
    'news.title':'新闻','news.note':'编辑 data/news.json 更新列表。',
    'selected.title':'精选论文',
    'pubs.title':'论文发表','projects.title':'项目','contact.title':'联系方式'
  }
};
const langSel = document.getElementById('langSwitch');
const savedLang = localStorage.getItem('lang') || 'en';
document.documentElement.setAttribute('data-lang', savedLang);
langSel.value = savedLang;
function applyLang(l){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = i18n[l][el.getAttribute('data-i18n')] || el.textContent;
  });
  localStorage.setItem('lang', l);
  document.documentElement.setAttribute('data-lang', l);
}
applyLang(savedLang);
langSel.addEventListener('change', e=>applyLang(e.target.value));

// 返回顶部
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', ()=>{
  backTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});
backTop.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'}));

// TOC（自动抓取 section 生成）
const toc = document.getElementById('toc');
const sections = [...document.querySelectorAll('section[id]')];
toc.innerHTML = sections.map(s=>`<a href="#${s.id}">${s.querySelector('h2')?.textContent||s.id}</a>`).join('');
const tocLinks = toc.querySelectorAll('a');
const obs = new IntersectionObserver(entries=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      tocLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+ent.target.id));
    }
  });
},{rootMargin:'-40% 0px -50% 0px', threshold:0});
sections.forEach(s=>obs.observe(s));

// 数据加载
async function loadJSON(p){ const r = await fetch(p); return r.json(); }

function badgeLinks(obj){
  return [
    obj.pdf && `<a href="${obj.pdf}" target="_blank">PDF</a>`,
    obj.code && `<a href="${obj.code}" target="_blank">Code</a>`,
    obj.doi && `<a href="https://doi.org/${obj.doi}" target="_blank">DOI</a>`
  ].filter(Boolean).join(' ');
}

// 新闻
(async ()=>{
  try{
    const news = await loadJSON('data/news.json');
    document.getElementById('newsList').innerHTML = news
      .sort((a,b)=>new Date(b.date)-new Date(a.date))
      .map(n=>`<li><span class="date">${n.date}</span> ${n.text}</li>`).join('');
  }catch{ /* ignore */ }
})();

// 论文（精选 + 全部）
(async ()=>{
  try{
    const pubs = await loadJSON('data/publications.json');
    // 精选
    const selected = pubs.filter(p=>p.selected);
    document.getElementById('selGrid').innerHTML = selected.map(p=>`
      <article class="card">
        ${p.thumb ? `<img src="${p.thumb}" alt="${p.title}">` : ''}
        <h3>${p.title}</h3>
        <p class="meta">${p.authors} · <em>${p.venue||''}</em> ${p.year||''}</p>
        <p>${p.abs||''}</p>
        <p class="links">${badgeLinks(p)}</p>
      </article>`).join('');

    // 全部（按年分组）
    const byYear = {};
    pubs.forEach(p => { (byYear[p.year] ||= []).push(p); });
    const years = Object.keys(byYear).sort((a,b)=>b-a);
    document.getElementById('pubList').innerHTML = years.map(y => `
      <div class="year">${y}</div>
      ${byYear[y].map(p=>`
        <div class="pub">
          <div><strong>${p.title}</strong></div>
          <div class="meta">${p.authors} · <em>${p.venue||''}</em></div>
          <div class="links">${badgeLinks(p)}</div>
        </div>`).join('')}
    `).join('');
  }catch{ /* ignore */ }
})();

// 项目
(async ()=>{
  try{
    const projs = await loadJSON('data/projects.json');
    document.getElementById('projGrid').innerHTML =
      projs.map(p=>`
        <article class="card">
          ${p.thumb?`<img src="${p.thumb}" alt="${p.name}">`:''}
          <h3><a href="${p.link}" target="_blank" rel="noopener">${p.name}</a></h3>
          <p>${p.desc||''}</p>
        </article>`).join('');
  }catch{ /* ignore */ }
})();
