(() => {
  const appendDeliveryAddress = () => {
    const link = document.querySelector('.layout a[href*="wa.me/"]');
    const form = document.querySelector('#checkoutForm');
    if (!link || !form || form.dataset.deliveryAddressIncluded === 'true') return;
    const delivery = document.querySelector('[data-mode="DELIVERY"]');
    if (!delivery?.classList.contains('active')) return;
    const address = `${form.address?.value || ''}${form.reference?.value ? ` · Ref. ${form.reference.value}` : ''}${form.district?.value ? ` · ${form.district.value}` : ''}`.trim();
    if (!address) return;
    link.href += `%0ADirección: ${encodeURIComponent(address)}`;
    form.dataset.deliveryAddressIncluded = 'true';
  };
  new MutationObserver(appendDeliveryAddress).observe(document.body, { childList: true, subtree: true });
})();
