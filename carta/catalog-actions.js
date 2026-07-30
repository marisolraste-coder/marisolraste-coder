(() => {
  const cartKey = 'lemiski-checkout-cart';
  const actions = document.querySelector('#catalogActions');
  const pageCount = document.querySelector('#pageCount');
  if (!actions || !pageCount) return;

  const pageCategories = {
    3: 'alfajores', 4: 'crumbles', 5: 'pies', 7: 'cuchareables',
    8: 'tortas', 9: 'boutique', 10: 'bocaditos', 12: 'helados', 13: 'cheesecakes'
  };
  const money = value => `S/ ${Number(value || 0).toFixed(0)}`;
  const readCart = () => { try { return JSON.parse(localStorage.getItem(cartKey) || '[]'); } catch { return []; } };
  const writeCart = items => localStorage.setItem(cartKey, JSON.stringify(items));
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  let data = null;

  const refreshBag = () => {
    const bag = document.querySelector('#cartaBag');
    if (!bag) return;
    const quantity = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
    bag.textContent = quantity ? `Bolsa (${quantity})` : 'Bolsa';
  };

  const currentPage = () => Number(pageCount.textContent.match(/\d+/)?.[0] || 1);
  const categoryLabel = id => data.categories.find(category => category.id === id)?.label || 'Esta colección';

  const addSimple = product => {
    const items = readCart();
    const existing = items.find(item => item.id === product.id);
    if (existing) existing.qty += 1;
    else items.push({ id: product.id, name: product.name, price: Number(product.priceFrom), qty: 1, selectedOptions: [] });
    writeCart(items);
    refreshBag();
    render();
  };

  const productCard = product => {
    const action = product.simple
      ? `<button type="button" data-add="${escapeHtml(product.id)}">Agregar</button>`
      : `<a href="/tienda?producto=${encodeURIComponent(product.id)}">Personalizar</a>`;
    return `<article class="catalog-product"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}"><div><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.shortDescription)}</small><strong>Desde ${money(product.priceFrom)}</strong></div>${action}</article>`;
  };

  const render = () => {
    const category = pageCategories[currentPage()];
    const products = category ? data.products.filter(product => product.active && product.category === category) : [];
    if (!products.length) {
      actions.hidden = false;
      actions.innerHTML = `<p class="catalog-note">Esta página forma parte de nuestra carta editorial. Para crear un pedido personalizado, visita <a href="/tienda">Crear mi pedido</a>.</p>`;
      return;
    }
    actions.hidden = false;
    actions.innerHTML = `<div class="catalog-actions-head"><div><span class="eyebrow">Disponible para pedir</span><h2>${escapeHtml(categoryLabel(category))}</h2></div><a class="home-link" href="/tienda">Crear mi pedido →</a></div><div class="catalog-actions-grid">${products.map(productCard).join('')}</div>`;
    actions.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
      const product = data.products.find(item => item.id === button.dataset.add);
      if (product) addSimple(product);
    }));
  };

  fetch('/api/catalog').then(response => response.json()).then(response => {
    data = response;
    refreshBag();
    render();
    new MutationObserver(render).observe(pageCount, { childList: true, subtree: true, characterData: true });
  }).catch(() => { actions.hidden = true; });
})();
