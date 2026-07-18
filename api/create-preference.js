module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return res.status(503).json({ error: 'El pago online aún no está configurado. Podés enviar tu pedido por WhatsApp.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const items = (body.items || []).map(item => ({ title: item.name, quantity: Number(item.qty), currency_id: 'PEN', unit_price: Number(item.price) }));
    if (!items.length) return res.status(400).json({ error: 'El carrito está vacío' });
    const host = req.headers.origin || `https://${req.headers.host}`;
    const preference = { items, external_reference: `lemiski-${Date.now()}`, back_urls: { success: host + '/?payment=success', failure: host + '/?payment=failure', pending: host + '/?payment=pending' }, metadata: { buyer: body.buyer || {} } };
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', { method: 'POST', headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(preference) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Mercado Pago no pudo crear el pago');
    res.status(200).json({ init_point: data.init_point });
  } catch (error) { res.status(500).json({ error: error.message || 'No se pudo iniciar el pago' }); }
};
