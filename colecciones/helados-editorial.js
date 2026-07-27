(() => {
  const updateHeladosCard = () => {
    const card = [...document.querySelectorAll('.collection-card.disabled')].find(item =>
      item.querySelector('h2')?.textContent.trim().toLowerCase().startsWith('helados')
    );

    if (!card) return;

    const link = document.createElement('a');
    link.className = 'collection-card';
    link.href = '/carta?pagina=12';
    link.setAttribute('aria-label', 'Helados y sorbetes · ver colección en la carta');
    link.innerHTML = card.innerHTML;

    const image = link.querySelector('img');
    if (image) {
      image.src = '/public/carta/pagina-12.webp';
      image.alt = 'Colección Helados y sorbetes Le Miski';
    }

    const status = link.querySelector('.soon');
    if (status) {
      status.className = 'eyebrow';
      status.style.color = '#f6d596';
      status.textContent = 'Helados y sorbetes';
    }

    const title = link.querySelector('h2');
    if (title) title.textContent = 'Helados y sorbetes';

    const copy = link.querySelector('p');
    if (copy) copy.textContent = 'Helados de crema y sorbetes artesanales, creados para disfrutar con calma.';

    card.replaceWith(link);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    if (!app) return;
    new MutationObserver(updateHeladosCard).observe(app, { childList: true });
    updateHeladosCard();
  });
})();
