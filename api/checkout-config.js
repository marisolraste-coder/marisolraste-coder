const bool = (value, fallback = false) => value == null ? fallback : String(value).toLowerCase() === 'true';
const json = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    paymentMode: process.env.NEXT_PUBLIC_PAYMENT_MODE || 'manual',
    minimumNoticeHours: Number(process.env.MIN_ORDER_NOTICE_HOURS || 24),
    timeSlots: json(process.env.ORDER_TIME_SLOTS_JSON, ['8–10 am', '10 am–1 pm', '2–4 pm', '4–6 pm']),
    deliveryFees: json(process.env.DELIVERY_FEES_JSON, {}),
    whatsapp: process.env.BUSINESS_WHATSAPP || '',
    payments: {
      yape: { enabled: bool(process.env.NEXT_PUBLIC_YAPE_ENABLED, true), phone: process.env.YAPE_PHONE || '', holder: process.env.YAPE_HOLDER || '', qrUrl: process.env.YAPE_QR_URL || '' },
      plin: { enabled: bool(process.env.NEXT_PUBLIC_PLIN_ENABLED, true), phone: process.env.PLIN_PHONE || '', holder: process.env.PLIN_HOLDER || '', qrUrl: process.env.PLIN_QR_URL || '' },
      transfer: { enabled: bool(process.env.NEXT_PUBLIC_TRANSFER_ENABLED, true), bank: process.env.BANK_NAME || '', holder: process.env.BANK_HOLDER || '', account: process.env.BANK_ACCOUNT || '', cci: process.env.BANK_CCI || '' },
      card: { enabled: bool(process.env.NEXT_PUBLIC_CARD_ENABLED || process.env.PAYMENTS_CARD_ENABLED, false) },
      pagoEfectivo: { enabled: bool(process.env.NEXT_PUBLIC_PAGOEFECTIVO_ENABLED, false) }
    }
  });
};
