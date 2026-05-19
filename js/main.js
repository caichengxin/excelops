// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

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
