(() => {
  const videoMarkup = (className = '') => `<video class="${className}" autoplay muted loop playsinline preload="metadata" aria-label="Video de la colección de chocolate"><source src="/assets/chocolate-collection.mp4" type="video/mp4"></video>`;

  const replaceCover = (container, variant) => {
    if (!container || container.dataset.chocolateFilm) return;
    const image = container.querySelector('img');
    if (!image) return;
    container.dataset.chocolateFilm = 'true';
    image.insertAdjacentHTML('afterend', videoMarkup(`chocolate-film chocolate-film--${variant}`));
    image.remove();
  };

  const showChocolateFilm = () => {
    const query = new URLSearchParams(location.search);
    const product = query.get('producto');
    const category = query.get('categoria');

    if (product === 'torta-chocolate') {
      const media = document.querySelector('.product-media');
      if (media && !media.dataset.chocolateFilm) {
        media.dataset.chocolateFilm = 'true';
        media.innerHTML = videoMarkup('chocolate-film chocolate-film--detail');
      }
    } else if (category === 'tortas') {
      replaceCover(document.querySelector('.product-card'), 'gallery');
    } else if (!category) {
      replaceCover(document.querySelector('.collection-card:not(.disabled)'), 'collection');
    }

    document.querySelectorAll('.chocolate-film').forEach(video => video.play().catch(() => {}));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    if (!app) return;
    new MutationObserver(showChocolateFilm).observe(app, { childList: true });
    showChocolateFilm();
  });
})();
