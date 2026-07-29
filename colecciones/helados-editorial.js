(() => {
  const collections = [
    {
      match: 'helados',
      title: 'Helados y sorbetes',
      copy: 'Helados de crema y sorbetes artesanales, creados para disfrutar con calma.',
      page: 12
    },
    {
      match: 'cheesecakes',
      title: 'Cheesecakes',
      copy: 'Seis interpretaciones artesanales de cheesecake, creadas para compartir y recordar.',
      page: 13
    }
  ];

  const updateEditorialCards = () => {
    collections.forEach(collection => {
      const card = [...document.querySelectorAll('.collection-card.disabled')].find(item =>
        item.querySelector('h2')?.textContent.trim().toLowerCase().startsWith(collection.match)
      );
      if (!card) return;

      const link = document.createElement('a');
      link.className = 'collection-card';
      link.href = `/carta?pagina=${collection.page}`;
      link.setAttribute('aria-label', `${collection.title} · ver colección en la carta`);
      link.innerHTML = card.innerHTML;

      const image = link.querySelector('img');
      if (image) {
        image.src = `/public/carta/pagina-${String(collection.page).padStart(2, '0')}.webp`;
        image.alt = `Colección ${collection.title} Le Miski`;
      }

      const status = link.querySelector('.soon');
      if (status) {
        status.className = 'eyebrow';
        status.style.color = '#f6d596';
        status.textContent = collection.title;
      }

      const title = link.querySelector('h2');
      if (title) title.textContent = collection.title;

      const copy = link.querySelector('p');
      if (copy) copy.textContent = collection.copy;

      card.replaceWith(link);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    if (!app) return;
    new MutationObserver(updateEditorialCards).observe(app, { childList: true });
    updateEditorialCards();
  });
})();
