// 年份渲染
document.getElementById('y').textContent = new Date().getFullYear();

// 暗色/浅色开关（记忆在 localStorage）
const tbtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if (saved === 'dark') document.documentElement.classList.add('dark');
tbtn?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// 加载 JSON 数据
async function loadJSON(path){ const r = await fetch(path); return r.json(); }

function pubItemHTML(p){
  const badges = [
    p.pdf ? `<a href="${p.pdf}" target="_blank">PDF</a>` : '',
    p.code ? `<a href="${p.code}" target="_blank">Code</a>` : '',
    p.doi ?  `<a href="https://doi.org/${p.doi}" target="_blank">DOI</a>` : '',
  ].filter(Boolean).join(' ');
  return `
    <div class="pub">
      <div><strong>${p.title}</strong></div>
      <div class="meta">${p.authors} · <em>${p.venue || ''}</em> ${p.year ? '· '+p.year : ''}</div>
      <div class="links">${badges}</div>
    </div>`;
}

function projectCardHTML(p){
  return `
  <article class="card">
    ${p.thumb ? `<img src="${p.thumb}" alt="${p.name}">` : ''}
    <h3><a href="${p.link}" target="_blank" rel="noopener">${p.name}</a></h3>
    <p>${p.desc || ''}</p>
  </article>`;
}

(async () => {
  // 论文：按年份分组渲染
  try{
    const pubs = await loadJSON('data/publications.json');
    const byYear = {};
    pubs.forEach(p => { (byYear[p.year] ||= []).push(p); });
    const years = Object.keys(byYear).sort((a,b)=>b-a);
    const container = document.getElementById('pubList');
    container.innerHTML = years.map(y => `
      <div class="year">${y}</div>
      ${byYear[y].map(pubItemHTML).join('')}
    `).join('');
  }catch(e){ console.warn('Publications not found', e); }

  // 项目
  try{
    const projs = await loadJSON('data/projects.json');
    document.getElementById('projGrid').innerHTML =
      projs.map(projectCardHTML).join('');
  }catch(e){ console.warn('Projects not found', e); }
})();
