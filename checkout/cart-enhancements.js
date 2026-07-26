(() => {
  const key = 'lemiski-checkout-cart';
  const getItems = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const save = items => localStorage.setItem(key, JSON.stringify(items));
  const refresh = () => location.reload();
  const enhance = () => {
    const rows = [...document.querySelectorAll('#summaryItems .summary-row')];
    const items = getItems();
    rows.forEach((row, index) => {
      if (!items[index] || row.querySelector('.cart-actions')) return;
      const actions = document.createElement('div'); actions.className = 'cart-actions';
      [['Editar', () => location.href = '/tienda'], ['−', () => { items[index].qty = Math.max(1, Number(items[index].qty) - 1); save(items); refresh(); }], ['+', () => { items[index].qty = Number(items[index].qty) + 1; save(items); refresh(); }], ['Duplicar', () => { items.push({ ...items[index] }); save(items); refresh(); }], ['Eliminar', () => { items.splice(index, 1); save(items); refresh(); }]].forEach(([label, action]) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.onclick = action; actions.append(button); });
      row.querySelector('span')?.append(actions);
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.querySelector('.intro');
    if (intro && !document.querySelector('.checkout-progress')) intro.insertAdjacentHTML('beforeend', '<div class="checkout-progress" aria-label="Progreso del pedido"><span>1 Datos</span><span>2 Entrega</span><span>3 Fecha</span><span>4 Pago</span><span>5 Confirmación</span></div>');
    new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true }); enhance();
  });
})();
