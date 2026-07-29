(() => {
  const cartKey = 'lemiski-checkout-cart';
  const money = value => `S/ ${Number(value || 0).toFixed(2)}`;
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const readCart = () => { try { return JSON.parse(localStorage.getItem(cartKey) || '[]'); } catch { return []; } };
  const writeCart = items => localStorage.setItem(cartKey, JSON.stringify(items));
  let catalog = [], categories = [], state = { category: '', product: '', quantity: 1, selected: {} };

  const activeProducts = () => catalog.filter(product => product.active);
  const selectedProduct = () => activeProducts().find(product => product.id === state.product);
  const updateBag = (animate = false) => {
    const link = document.querySelector('.bag-link');
    const amount = readCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
    document.querySelector('#cartCount').textContent = `(${amount})`;
    link.classList.toggle('is-filled', amount > 0);
    if (animate) { link.classList.remove('bag-added'); requestAnimationFrame(() => link.classList.add('bag-added')); setTimeout(() => link.classList.remove('bag-added'), 520); }
  };
  const choicesFor = option => {
    const selected = state.selected[option.id];
    if (option.type === 'text') return `<textarea data-option="${option.id}" maxlength="${option.maxLength || 240}" placeholder="Opcional">${escapeHtml(selected || '')}</textarea>`;
    return `<div class="config-choices">${option.values.map(value => {
      const checked = option.type === 'multiple' ? (selected || []).includes(value.id) : selected === value.id;
      return `<label class="config-choice${checked ? ' chosen' : ''}"><input data-option="${option.id}" type="${option.type === 'multiple' ? 'checkbox' : 'radio'}" value="${value.id}" ${checked ? 'checked' : ''}><span>${escapeHtml(value.label)}${value.price ? ` <em>+${money(value.price)}</em>` : ''}</span></label>`;
    }).join('')}</div>`;
  };
  const price = () => {
    const product = selectedProduct(); if (!product) return 0;
    const size = product.options.find(option => option.id === 'size')?.values.find(value => value.id === state.selected.size);
    const extras = product.options.find(option => option.id === 'extras')?.values.filter(value => (state.selected.extras || []).includes(value.id)) || [];
    return (Number(size?.price || product.priceFrom) + extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0)) * state.quantity;
  };
  const complete = () => {
    const product = selectedProduct();
    return Boolean(product && product.options.filter(option => option.required).every(option => option.type === 'multiple' ? (state.selected[option.id] || []).length : state.selected[option.id]));
  };
  const renderSummary = () => {
    const items = readCart(); const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    document.querySelector('#orderSummary').innerHTML = items.length ? items.map(item => `<div class="order-line"><div><b>${escapeHtml(item.name)}</b><small>${(item.selectedOptions || []).join(' · ')}</small><span>${item.qty} unidad${item.qty === 1 ? '' : 'es'}</span></div><strong>${money(item.price * item.qty)}</strong></div>`).join('') : '<p class="order-empty">Tu pedido todavía está por crear.</p>';
    document.querySelector('#orderSubtotal').textContent = money(subtotal);
    document.querySelector('#orderTotal').textContent = money(subtotal);
    document.querySelector('#checkoutButton').disabled = !items.length;
    updateBag();
  };
  const render = () => {
    const product = selectedProduct();
    const root = document.querySelector('#configurator');
    const available = activeProducts();
    const activeCategoryIds = new Set(available.map(item => item.category));
    root.innerHTML = `<section class="config-step"><span class="step-number">01</span><label>Categoría<select id="categorySelect">${categories.map(category => `<option value="${category.id}" ${category.id === state.category ? 'selected' : ''} ${!activeCategoryIds.has(category.id) ? 'disabled' : ''}>${escapeHtml(category.label)}${!activeCategoryIds.has(category.id) ? ' · Próximamente' : ''}</option>`).join('')}</select></label></section>
      <section class="config-step"><span class="step-number">02</span><label>Producto<select id="productSelect">${available.filter(item => item.category === state.category).map(item => `<option value="${item.id}" ${item.id === state.product ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label></section>
      ${product ? `<section class="config-step product-options"><span class="step-number">03</span><div><h2>${escapeHtml(product.name)}</h2><p>${escapeHtml(product.shortDescription)}</p>${product.options.map(option => `<fieldset class="config-option"><legend>${escapeHtml(option.label)}${option.required ? ' *' : ''}</legend>${choicesFor(option)}</fieldset>`).join('')}</div></section>
      <section class="config-step quantity-step"><span class="step-number">04</span><div><span class="field-label">Cantidad</span><div class="config-quantity"><button type="button" data-quantity="-1" aria-label="Reducir cantidad">−</button><strong>${state.quantity}</strong><button type="button" data-quantity="1" aria-label="Aumentar cantidad">+</button></div></div></section>
      <section class="config-total"><div><span>Precio del producto</span><strong>${money(price())}</strong></div><button class="create-button" id="addToOrder" ${complete() ? '' : 'disabled'}>Agregar al pedido</button></section>` : ''}`;
    root.querySelector('#categorySelect').onchange = event => { state.category = event.target.value; state.product = available.find(item => item.category === state.category)?.id || ''; state.quantity = 1; state.selected = {}; render(); };
    root.querySelector('#productSelect').onchange = event => { state.product = event.target.value; state.quantity = 1; state.selected = {}; render(); };
    root.querySelectorAll('[data-option]').forEach(input => input.oninput = event => {
      const option = selectedProduct().options.find(item => item.id === event.target.dataset.option);
      if (option.type === 'multiple') state.selected[option.id] = [...root.querySelectorAll(`[data-option="${option.id}"]:checked`)].map(element => element.value);
      else state.selected[option.id] = event.target.value;
      render();
    });
    root.querySelectorAll('[data-quantity]').forEach(button => button.onclick = () => { state.quantity = Math.max(1, state.quantity + Number(button.dataset.quantity)); render(); });
    root.querySelector('#addToOrder')?.addEventListener('click', addToOrder);
  };
  const addToOrder = () => {
    const product = selectedProduct(); if (!product || !complete()) return;
    if (product.simple) {
      const items = readCart(); const existing = items.find(item => item.id === product.id);
      if (existing) existing.qty += state.quantity;
      else items.push({ id: product.id, name: product.name, price: Number(product.priceFrom), qty: state.quantity, selectedOptions: [] });
      writeCart(items); renderSummary(); document.querySelector('#addedNotice').hidden = false; state.quantity = 1; render(); updateBag(true);
      return;
    }
    const size = state.selected.size, flavor = state.selected.flavor, presentation = state.selected.presentation || 'clasica';
    const extras = (state.selected.extras || []).slice().sort().join(',') || 'sin';
    const dedication = String(state.selected.dedication || '').replaceAll('|', ' ');
    const notes = String(state.selected.notes || '').replaceAll('|', ' ');
    const id = [product.id, size, flavor, presentation, extras, dedication, notes].join('|');
    const selectedOptions = product.options.flatMap(option => {
      const value = state.selected[option.id];
      if (!value || option.type === 'text') return value ? [`${option.label}: ${value}`] : [];
      const ids = option.type === 'multiple' ? value : [value];
      return ids.map(id => `${option.label}: ${option.values.find(item => item.id === id)?.label}`).filter(Boolean);
    });
    const unit = price() / state.quantity; const items = readCart(); const existing = items.find(item => item.id === id);
    if (existing) existing.qty += state.quantity; else items.push({ id, name: product.name, price: unit, qty: state.quantity, selectedOptions });
    writeCart(items); renderSummary(); document.querySelector('#addedNotice').hidden = false; state.quantity = 1; state.selected = {}; render(); updateBag(true);
  };
  const boot = async () => {
    const response = await fetch('/api/catalog'); const data = await response.json(); if (!response.ok) throw new Error('catalog');
    catalog = data.products; categories = data.categories;
    const params = new URLSearchParams(location.search); const requested = activeProducts().find(product => product.id === params.get('producto'));
    state.product = requested?.id || activeProducts()[0]?.id || ''; state.category = requested?.category || activeProducts()[0]?.category || '';
    render(); renderSummary();
    document.querySelector('#checkoutButton').onclick = () => { location.href = '/checkout'; };
    document.querySelector('#addAnother').onclick = () => { document.querySelector('#configurator').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  };
  document.addEventListener('DOMContentLoaded', () => boot().catch(() => { document.querySelector('#configurator').innerHTML = '<p>No pudimos cargar el configurador. Intenta nuevamente en unos minutos.</p>'; }));
})();
