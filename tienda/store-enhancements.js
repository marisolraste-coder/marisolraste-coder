(() => {
  const key = 'lemiski-checkout-cart';
  let catalog = [], categoryLabels = {};
  const readCart = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const writeCart = items => localStorage.setItem(key, JSON.stringify(items));
  const decorate = () => document.querySelectorAll('[data-product]').forEach(button => {
    if (button.textContent !== 'Personalizar') button.textContent = 'Personalizar';
  });
  const currentCategory = () => document.querySelector('.chip.active')?.dataset.category || 'all';
  const renderSearch = () => {
    const search = document.querySelector('#search'), term = search.value.trim().toLowerCase();
    if (!term || !catalog.length) return;
    const activeCategory = currentCategory();
    const matches = catalog.filter(product => product.active && (activeCategory === 'all' || product.category === activeCategory) && [product.name, product.shortDescription, product.fullDescription, categoryLabels[product.category]].join(' ').toLowerCase().includes(term));
    const visible = new Set(matches.map(product => product.id));
    document.querySelectorAll('[data-product]').forEach(button => { const card = button.closest('.product'); if (card) card.hidden = !visible.has(button.dataset.product); });
    if (!matches.length) document.querySelector('#catalog').innerHTML = '<div class="empty"><h2>No encontramos productos con esos criterios.</h2><p>Prueba otra búsqueda o vuelve a todas las creaciones disponibles.</p><button class="button" id="enhancedShowAll">Ver todos los productos</button></div>';
    document.querySelector('#enhancedShowAll')?.addEventListener('click', () => { search.value = ''; search.oninput?.(); });
  };
  const updateBag = (animate = false) => {
    const link = document.querySelector('.bag-link'), count = document.querySelector('#cartCount');
    const quantity = readCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
    if (count) count.textContent = `(${quantity})`;
    link?.classList.toggle('is-filled', quantity > 0);
    if (animate && link) { link.classList.remove('bag-added'); requestAnimationFrame(() => link.classList.add('bag-added')); setTimeout(() => link.classList.remove('bag-added'), 500); }
  };
  document.addEventListener('DOMContentLoaded', async () => {
    const intro = document.querySelector('.intro p'); if (intro) intro.textContent = 'Descubre nuestras creaciones, personaliza cada detalle y realiza tu pedido de forma simple y segura.';
    try { const data = await (await fetch('/api/catalog')).json(); catalog = data.products; categoryLabels = Object.fromEntries(data.categories.map(category => [category.id, category.label])); } catch {}
    const search = document.querySelector('#search'); const originalSearch = search?.oninput;
    if (search && originalSearch) search.oninput = () => { const term = search.value; search.value = ''; originalSearch(); search.value = term; decorate(); renderSearch(); };
    new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true }); decorate(); updateBag();
  });
  document.addEventListener('click', event => {
    const add = event.target.closest('#add'); if (!add || add.disabled) return;
    // The original product dialog handler writes to localStorage before this
    // bubbled listener runs, so the bag can respond to every successful add.
    setTimeout(() => updateBag(true), 0);
    const presentation = document.querySelector('input[name="presentation"]:checked'); const size = document.querySelector('input[name="size"]:checked'); const flavor = document.querySelector('input[name="flavor"]:checked');
    if (!presentation || !size || !flavor) return;
    const dialog = document.querySelector('#productDialog'), productName = dialog?.querySelector('h2')?.textContent;
    const product = catalog.find(item => item.name === productName); if (!product) return;
    const items = readCart(); const legacy = items.find(item => String(item.id).startsWith(`${product.id}|${size.value}|${flavor.value}|`) && String(item.id).split('|').length === 6); if (!legacy) return;
    const parts = legacy.id.split('|'); legacy.id = [parts[0], parts[1], parts[2], presentation.value, parts[3], parts[4], parts[5]].join('|');
    const label = presentation.parentElement.textContent.trim(); legacy.name += ` · Presentación: ${label}`; legacy.selectedOptions = [...(legacy.selectedOptions || []), `Presentación: ${label}`]; writeCart(items); updateBag(true);
  });
})();
