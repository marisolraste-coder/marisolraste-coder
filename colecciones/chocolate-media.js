(() => {
  const showChocolateFilm = () => {
    const product = new URLSearchParams(location.search).get('producto');
    const media = document.querySelector('.product-media');
    if (product !== 'torta-chocolate' || !media || media.dataset.chocolateFilm) return;
    media.dataset.chocolateFilm = 'true';
    media.innerHTML = '<video autoplay muted loop playsinline preload="metadata" aria-label="Video de la colección de chocolate"><source src="/assets/chocolate-collection.mp4" type="video/mp4"></video>';
    const video = media.querySelector('video');
    video.style.cssText = 'display:block;width:100%;aspect-ratio:4/5;object-fit:cover;background:#f7eee2';
    video.play().catch(() => {});
  };

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    if (!app) return;
    new MutationObserver(showChocolateFilm).observe(app, { childList: true });
    showChocolateFilm();
  });
})();
