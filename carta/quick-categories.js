(() => {
  const root = document.querySelector('#quickCategories');
  if (!root) return;
  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  fetch('/api/catalog')
    .then(response => response.ok ? response.json() : Promise.reject(new Error('catalog')))
    .then(data => {
      const available = new Set((data.products || []).filter(product => product.active).map(product => product.category));
      const links = (data.categories || []).filter(category => available.has(category.id)).map(category => `<a href="/tienda?categoria=${encodeURIComponent(category.id)}">${escapeHtml(category.label)}</a>`).join('');
      if (!links) throw new Error('empty');
      root.innerHTML = `<span>Comprar por categoría</span>${links}`;
    })
    .catch(() => { root.hidden = true; });
})();
