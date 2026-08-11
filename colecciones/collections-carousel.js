(() => {
  const app = document.querySelector('#app');
  if (!app) return;

  const bag = document.querySelector('#bagToggle');
  const bagLabel = document.querySelector('#bagLabel');
  const cartKey = 'lemiski-checkout-cart';
  const readCart = () => { try { return JSON.parse(localStorage.getItem(cartKey) || '[]'); } catch { return []; } };
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const money = value => `S/ ${Number(value || 0).toFixed(0)}`;
  const query = () => new URLSearchParams(location.search);
  let data = { categories: [], collectionEditorial: [], products: [] };

  const refreshBag = () => {
    const quantity = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
    if (bagLabel) bagLabel.textContent = `Mi pedido (${quantity})`;
  };

  const categoryLabel = id => data.categories.find(category => category.id === id)?.label || 'Colección';
  const collectionFor = id => data.collectionEditorial.find(collection => collection.id === id);
  const activeProducts = id => data.products.filter(product => product.active && product.category === id);
  const media = (collection, className = '') => collection.collectionVideo
    ? `<video class="${className}" muted loop playsinline preload="none" poster="${escapeHtml(collection.collectionPoster)}" data-collection-video aria-label="Video de la colección ${escapeHtml(collection.collectionTitle)}"><source data-src="${escapeHtml(collection.collectionVideo)}" type="video/mp4"></video>`
    : `<img class="${className}" src="${escapeHtml(collection.collectionPoster)}" alt="Portada de la colección ${escapeHtml(collection.collectionTitle)}" loading="lazy" decoding="async">`;

  const observeVideos = () => {
    const videos = app.querySelectorAll('[data-collection-video]');
    if (!videos.length) return;
    const activate = video => {
      const source = video.querySelector('source[data-src]');
      if (source && !source.src) { source.src = source.dataset.src; video.load(); }
      video.play().catch(() => {});
    };
    if (!('IntersectionObserver' in window)) { videos.forEach(activate); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) activate(video);
      else video.pause();
    }), { rootMargin: '180px 0px', threshold: .15 });
    videos.forEach(video => observer.observe(video));
  };

  const collectionNavigation = current => `<nav class="collection-nav" aria-label="Todas las colecciones">${data.collectionEditorial.map(collection => `<a href="/colecciones?categoria=${encodeURIComponent(collection.id)}" class="${collection.id === current ? 'is-current' : ''}">${escapeHtml(collection.collectionTitle)}</a>`).join('')}</nav>`;

  const collectionCard = collection => `<a class="collection-card" href="/colecciones?categoria=${encodeURIComponent(collection.id)}" aria-label="${escapeHtml(collection.collectionTitle)} · ver colección">${media(collection, 'collection-card-media')}<div><span class="eyebrow">Colección</span><h2>${escapeHtml(collection.collectionTitle)}</h2><p>${escapeHtml(collection.collectionCopy)}</p><span class="collection-card-cta">Explorar colección →</span></div></a>`;

  const productCard = product => `<article class="product-card"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async"><div><span class="eyebrow">Desde ${money(product.priceFrom)}</span><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.shortDescription)}</p><a class="button" href="/tienda?producto=${encodeURIComponent(product.id)}">Ver producto</a></div></article>`;

  const renderHome = () => {
    app.innerHTML = `<section class="intro"><span class="eyebrow">Colecciones Le Miski</span><h1>Un viaje que comienza en Lima y París.</h1><p>Dos culturas fueron nuestro punto de partida. Cada colección continúa el recorrido: descubre ingredientes, técnicas e historias del mundo, interpretadas desde la mirada de Le Miski.</p></section>${collectionNavigation()}<section class="collection-grid">${data.collectionEditorial.map(collectionCard).join('')}</section><p class="catalogue-link"><a href="/carta">Explorar carta completa <span>→</span></a></p>`;
    observeVideos();
  };

  const renderCollection = id => {
    const collection = collectionFor(id);
    const products = activeProducts(id);
    if (!collection) return renderHome();
    app.innerHTML = `<a class="back" href="/colecciones">← Todas las colecciones</a>${collectionNavigation(id)}<section class="collection-hero"><div class="collection-hero-media">${media(collection, 'collection-hero-video')}</div><div class="collection-hero-copy"><span class="eyebrow">Colección Le Miski</span><h1>${escapeHtml(collection.collectionTitle)}</h1><p>${escapeHtml(collection.collectionCopy)}</p><a class="button" href="#productos">Ver productos</a></div></section><section class="collection-products" id="productos"><div class="gallery-head"><div><span class="eyebrow">Para descubrir</span><h2 class="page-title">Productos de la colección</h2></div><p class="collection-copy">Elige una creación y personaliza tu pedido con calma.</p></div>${products.length ? `<div class="gallery">${products.map(productCard).join('')}</div>` : `<p class="empty">Esta colección está preparándose para recibir nuevas creaciones.</p>`}</section><p class="catalogue-link"><a href="/colecciones">Ver todas las colecciones <span>→</span></a></p>`;
    observeVideos();
  };

  const route = () => {
    const category = query().get('categoria');
    if (category) renderCollection(category); else renderHome();
  };

  if (bag) bag.addEventListener('click', () => { location.href = '/checkout'; });
  fetch('/api/catalog').then(response => response.ok ? response.json() : Promise.reject()).then(response => {
    data = response;
    data.collectionEditorial = (response.collectionEditorial || []).filter(collection => activeProducts(collection.id).length);
    refreshBag();
    route();
  }).catch(() => { app.innerHTML = '<p class="empty">No pudimos cargar las colecciones. Intenta nuevamente en unos minutos.</p>'; });
})();
