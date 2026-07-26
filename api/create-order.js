const { kv } = require('@vercel/kv');
const { ManualPaymentProvider, IzipayPaymentProvider } = require('../lib/payment-providers');
const { resolveCartItem } = require('../lib/catalog');

const text = value => String(value || '').trim().replace(/[<>]/g, '').slice(0, 500);
const parseJson = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const deliveryFees = () => parseJson(process.env.DELIVERY_FEES_JSON, {});
const limit = async req => {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = `rate:order:${ip}:${Math.floor(Date.now() / 60000)}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, 60);
  return count <= 8;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return res.status(503).json({ error: 'El registro seguro de pedidos aún no está configurado.' });
  try {
    if (!await limit(req)) return res.status(429).json({ error: 'Demasiados intentos. Intenta nuevamente en un minuto.' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const customer = body.customer || {}, delivery = body.delivery || {}, idempotencyKey = text(body.idempotencyKey);
    if (!idempotencyKey || idempotencyKey.length < 20) return res.status(400).json({ error: 'No se pudo validar el pedido. Actualiza la página e inténtalo nuevamente.' });
    const existing = await kv.get(`idempotency:${idempotencyKey}`);
    if (existing && existing !== 'processing') return res.status(200).json({ orderId: existing, duplicate: true, paymentStatus: 'PAYMENT_PENDING_VALIDATION' });
    const locked = await kv.set(`idempotency:${idempotencyKey}`, 'processing', { nx: true, ex: 120 });
    if (!locked) return res.status(409).json({ error: 'Tu pedido se está procesando. Espera unos segundos.' });
    if (!text(customer.name) || !text(customer.phone) || !/^\S+@\S+\.\S+$/.test(text(customer.email))) throw new Error('Completa nombre, celular y correo electrónico.');
    const items = (body.items || []).map(resolveCartItem);
    if (!items.length) throw new Error('El carrito está vacío.');
    const requestedDate = text(body.requestedDate), requestedTime = text(body.requestedTime);
    const minDate = new Date(Date.now() + Number(process.env.MIN_ORDER_NOTICE_HOURS || 24) * 3600000);
    if (!requestedDate || new Date(`${requestedDate}T23:59:59`) < new Date(minDate.toDateString())) throw new Error('Elige una fecha con la anticipación mínima requerida.');
    const timeSlots = parseJson(process.env.ORDER_TIME_SLOTS_JSON, ['8–10 am', '10 am–1 pm', '2–4 pm', '4–6 pm']);
    if (!timeSlots.includes(requestedTime)) throw new Error('El rango horario no es válido.');
    const deliveryMethod = text(delivery.method);
    if (!['DELIVERY', 'PICKUP'].includes(deliveryMethod)) throw new Error('Elige delivery o recojo.');
    const district = text(delivery.district).toLowerCase(), fees = deliveryFees();
    if (deliveryMethod === 'DELIVERY' && (!text(delivery.address) || !district || fees[district] == null)) throw new Error('No contamos con tarifa automática para ese distrito. Escríbenos por WhatsApp para cotizarlo.');
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const deliveryFee = deliveryMethod === 'DELIVERY' ? Number(fees[district]) : 0, total = subtotal + deliveryFee;
    const method = text(body.paymentMethod), receiptUrl = text(body.paymentReceiptUrl);
    let payment;
    if (['YAPE', 'PLIN', 'TRANSFER'].includes(method)) payment = await new ManualPaymentProvider().createPayment({ method, amount: total, receiptUrl });
    else if (method === 'CARD' && String(process.env.NEXT_PUBLIC_CARD_ENABLED).toLowerCase() === 'true') payment = await new IzipayPaymentProvider().createPayment({ amount: total });
    else throw new Error('Selecciona un método de pago disponible.');
    if (body.acceptedTerms !== true) throw new Error('Debes aceptar las condiciones de compra.');
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = await kv.incr(`order-sequence:${dateCode}`), orderId = `LM-${dateCode}-${String(sequence).padStart(4, '0')}`;
    const order = { orderId, createdAt: new Date().toISOString(), customer: { name: text(customer.name), phone: text(customer.phone), email: text(customer.email), document: text(customer.document) }, items, subtotal, deliveryFee, discount: 0, total, deliveryMethod, deliveryAddress: deliveryMethod === 'DELIVERY' ? { address: text(delivery.address), reference: text(delivery.reference), district, location: text(delivery.location) } : null, requestedDate, requestedTime, paymentMethod: method, paymentStatus: payment.paymentStatus, paymentReceiptUrl: payment.receiptUrl || null, orderStatus: 'RECEIVED', message: text(body.message), notes: text(body.notes) };
    await kv.set(`order:${orderId}`, order);
    await kv.set(`idempotency:${idempotencyKey}`, orderId, { ex: 86400 });
    return res.status(201).json({ orderId, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo registrar el pedido.' });
  }
};
