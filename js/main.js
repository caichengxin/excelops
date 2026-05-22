// ─── Dynamic Nav & Footer Injection ───────────────────────────────────────────
// 以后只改这里，全站所有页面自动更新 ✓
const NAV_HTML = `
<nav>
  <a class="logo" href="/index.html">
    <div class="logo-mark">EO</div>
    ExcelOps
  </a>
  <div class="nav-links">
    <a href="/pages/templates.html">Templates</a>
    <a href="/pages/sql.html">SQL Reports</a>
    <a href="/pages/excel-shortcut-finder.html">Excel Shortcuts</a>
    <a href="/pages/blog.html">Blog</a>
    <a href="/pages/about.html">About</a>
    <a href="/pages/contact.html">Contact</a>
  </div>
  <a class="nav-cta" href="/pages/templates.html">Free Templates ↗</a>
  <button class="hamburger" id="hamburger" aria-label="Open menu"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a href="/pages/templates.html">Templates</a>
  <a href="/pages/sql.html">SQL Reports</a>
  <a href="/pages/excel-shortcut-finder.html">Excel Shortcuts</a>
  <a href="/pages/blog.html">Blog</a>
  <a href="/pages/about.html">About</a>
  <a href="/pages/contact.html">Contact</a>
</div>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-col">
        <a class="logo" href="/index.html" style="margin-bottom:.75rem;display:inline-flex">
          <div class="logo-mark">EO</div> ExcelOps
        </a>
        <p>Practical Excel templates and tools for inventory, warehouse, and business operations teams.</p>
      </div>
      <div class="footer-col">
        <h4>Tools</h4>
        <a href="/pages/reorder.html">Reorder Calculator</a>
        <a href="/pages/sql.html">SQL to Excel Guide</a>
        <a href="/pages/excel-shortcut-finder.html">Shortcut Finder</a>
        <a href="/pages/templates.html">Template Library</a>
        <a href="/pages/blog.html">Formula Tutorials</a>
      </div>
      <div class="footer-col">
        <h4>Templates</h4>
        <a href="/templates/01_Inventory_Dashboard.xlsx" download>Inventory Dashboard</a>
        <a href="/templates/02_Warehouse_KPI_Dashboard.xlsx" download>Warehouse KPI</a>
        <a href="/templates/03_Purchase_Order_Tracker.xlsx" download>Purchase Order</a>
        <a href="/templates/04_Vendor_Scorecard.xlsx" download>Vendor Scorecard</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/pages/about.html">About</a>
        <a href="/pages/blog.html">Blog</a>
        <a href="/pages/contact.html">Contact</a>
        <a href="/pages/privacy.html">Privacy Policy</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
    <div class="footer-bottom">© 2025 ExcelOps · <a href="https://getexcelops.com" style="color:#475569">GetExcelOps.com</a> · Built for operations teams who get things done.</div>
  </div>
</footer>`;

// 替换页面中已有的 nav 和 footer
const existingNav = document.querySelector('nav');
const existingMobileMenu = document.querySelector('.mobile-menu');
if (existingNav) existingNav.remove();
if (existingMobileMenu) existingMobileMenu.remove();
document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

const existingFooter = document.querySelector('footer');
if (existingFooter) {
  existingFooter.outerHTML = FOOTER_HTML;
} else {
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
}

// 高亮当前页导航链接
document.querySelectorAll('nav .nav-links a, .mobile-menu a').forEach(link => {
  const linkPath = link.getAttribute('href');
  const currentPath = window.location.pathname;
  if (currentPath === linkPath || (linkPath !== '/index.html' && currentPath.startsWith(linkPath))) {
    link.style.color = 'var(--teal)';
    link.style.fontWeight = '600';
  }
});
// ──────────────────────────────────────────────────────────────────────────────


// Mobile menu toggle（注入后重新绑定）
document.addEventListener('click', e => {
  const btn = e.target.closest('#hamburger');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) menu.classList.toggle('open');
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
});

// Template filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.template-card[data-cat]').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.cat === filter) ? 'block' : 'none';
    });
  });
});

// Reorder calculator
function calcReorder() {
  const sales  = parseFloat(document.getElementById('rc-sales')?.value)  || 0;
  const lead   = parseFloat(document.getElementById('rc-lead')?.value)   || 0;
  const safety = parseFloat(document.getElementById('rc-safety')?.value) || 0;
  const maxS   = parseFloat(document.getElementById('rc-maxsales')?.value)|| 0;
  const result = document.getElementById('rc-result');
  if (!result) return;
  if (sales > 0 && lead > 0) {
    const useSafety = safety > 0 ? safety : (maxS > sales ? Math.ceil((maxS - sales) * lead) : 0);
    const rop = Math.ceil((sales * lead) + useSafety);
    result.style.display = 'block';
    document.getElementById('rc-value').textContent = rop;
    document.getElementById('rc-formula-text').textContent = `(${sales} × ${lead}) + ${useSafety} = ${rop} units`;
    document.getElementById('rc-excel').textContent = `=(B2*C2)+D2\n\nB2 = Avg Daily Sales, C2 = Lead Time, D2 = Safety Stock`;
    document.getElementById('rc-rec').textContent = rop + ' units';
  } else {
    result.style.display = 'none';
  }
}
