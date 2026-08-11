(() => {
  const carousel = document.querySelector('.carousel');
  const track = document.querySelector('.carousel-track');
  if (!carousel || !track) return;

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const media = collection => collection.collectionVideo
    ? `<video class="home-collection-video" muted loop playsinline preload="none" poster="${escapeHtml(collection.collectionPoster)}" data-home-collection-video aria-label="Video de la colección ${escapeHtml(collection.collectionTitle)}"><source data-src="${escapeHtml(collection.collectionVideo)}" type="video/mp4"></video>`
    : `<img src="${escapeHtml(collection.collectionPoster)}" alt="Portada de la colección ${escapeHtml(collection.collectionTitle)}" loading="lazy" decoding="async">`;

  const activateVisibleVideos = () => {
    const videos = track.querySelectorAll('[data-home-collection-video]');
    const activate = video => {
      const source = video.querySelector('source[data-src]');
      if (source && !source.src) { source.src = source.dataset.src; video.load(); }
      video.play().catch(() => {});
    };
    if (!('IntersectionObserver' in window)) { videos.forEach(activate); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) activate(entry.target); else entry.target.pause();
    }), { root: track, rootMargin: '0px 180px', threshold: .2 });
    videos.forEach(video => observer.observe(video));
  };

  fetch('/api/catalog').then(response => response.ok ? response.json() : Promise.reject()).then(data => {
    const active = new Set((data.products || []).filter(product => product.active).map(product => product.category));
    const collections = (data.collectionEditorial || []).filter(collection => active.has(collection.id));
    if (!collections.length) return;
    track.innerHTML = collections.map(collection => `<a class="carousel-card" href="/colecciones?categoria=${encodeURIComponent(collection.id)}" aria-label="Colección ${escapeHtml(collection.collectionTitle)} · conocer colección y productos">${media(collection)}<div class="carousel-copy"><span class="eyebrow" style="color:#f6c6d5">Colección</span><h3>${escapeHtml(collection.collectionTitle)}</h3><p>${escapeHtml(collection.collectionCopy)}</p></div></a>`).join('');
    const hint = carousel.querySelector('.carousel-hint');
    if (hint) hint.textContent = 'Desliza para descubrir más · Toca una colección para conocer su historia y productos';
    activateVisibleVideos();
  }).catch(() => {});
})();
