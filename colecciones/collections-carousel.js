(() => {
  const app = document.querySelector('#app');
  if (!app) return;
  const bag = document.querySelector('#bagToggle');
  const bagLabel = document.querySelector('#bagLabel');
  const readCart = () => { try { return JSON.parse(localStorage.getItem('lemiski-checkout-cart') || '[]'); } catch { return []; } };
  const quantity = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
  if (bagLabel) bagLabel.textContent = `Mi pedido (${quantity})`;
  if (bag) bag.addEventListener('click', () => { location.href = '/checkout'; });

  const collections = [
    { title: 'Chocolate', copy: 'Cinco interpretaciones artesanales para los amantes del cacao.', page: 6, video: '/assets/chocolate-collection.mp4' },
    { title: 'Cheesecakes', copy: 'Seis interpretaciones artesanales con ingredientes seleccionados y acabados de inspiración francesa.', page: 13, video: '/assets/cheesecakes-collection.mp4' },
    { title: 'Vainilla', copy: 'Delicadeza francesa, alma peruana y acabados premium.', page: 1, image: '/public/carta/pagina-01.webp' },
    { title: 'Alfajores', copy: 'Elige galleta, relleno y presentación para un antojo único.', page: 3, image: '/public/carta/pagina-03.webp' },
    { title: 'Crumbles', copy: 'Texturas doradas y sabores que celebran lo mejor de la temporada.', page: 4, image: '/public/carta/pagina-04.webp' },
    { title: 'Pies & tartaletas', copy: 'Merengue italiano, frutas y bases con inspiración francesa.', page: 5, image: '/public/carta/pagina-05.webp' },
    { title: 'Postres', copy: 'Postres peruanos y franceses hechos para recordar.', page: 7, video: '/assets/postres-collection.mp4' },
    { title: 'Tortas', copy: 'Creaciones artesanales para compartir momentos especiales.', page: 8, video: '/assets/tortas-collection.mp4' },
    { title: 'Helados y sorbetes', copy: 'Sabores cremosos, frutales y hechos con ingredientes de la más alta calidad.', page: 12, video: '/assets/helados-collection.mp4' },
    { title: 'La Boutique', copy: 'Manjares, chocolate y detalles artesanales para regalar.', page: 9, video: '/assets/boutique-collection.mp4' },
    { title: 'Bocaditos', copy: 'Dulces pequeños, delicados y perfectos para compartir.', page: 10, video: '/assets/bocaditos-collection.mp4' }
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  const card = ({ title, copy, page, image, video }) => {
    const media = video
      ? `<video autoplay muted loop playsinline preload="metadata" aria-label="Video de la colección ${escapeHtml(title)}"><source src="${video}" type="video/mp4"></video>`
      : `<img src="${image}" alt="Colección ${escapeHtml(title)} de Le Miski">`;
    return `<a class="collection-card" href="/carta?pagina=${page}">${media}<div><span class="eyebrow" style="color:#f6d596">Colección</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div></a>`;
  };

  app.innerHTML = `<section class="intro"><span class="eyebrow">La carta de Le Miski</span><h1>Explora cada antojo con calma.</h1><p>Una colección para recorrer con los ojos, descubrir con el corazón y hacer parte de tu próxima celebración.</p></section><section class="collection-grid">${collections.map(card).join('')}</section><p class="catalogue-link"><a href="/carta">📖 Explorar carta completa <span>→</span></a></p>`;
})();
