const { IncomingForm } = require('formidable');
const { put } = require('@vercel/blob');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const ALLOWED = new Map([['image/jpeg', '.jpg'], ['image/png', '.png'], ['application/pdf', '.pdf']]);
const MAX_BYTES = 5 * 1024 * 1024;
const parseForm = req => new Promise((resolve, reject) => new IncomingForm({ maxFileSize: MAX_BYTES, multiples: false }).parse(req, (error, fields, files) => error ? reject(error) : resolve({ fields, files })));
const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'El almacenamiento seguro de comprobantes aún no está configurado.' });
  try {
    const { files } = await parseForm(req); const file = Array.isArray(files.receipt) ? files.receipt[0] : files.receipt;
    if (!file || !ALLOWED.has(file.mimetype) || file.size > MAX_BYTES) return res.status(400).json({ error: 'Adjunta un JPG, PNG o PDF de máximo 5 MB.' });
    const originalExtension = path.extname(file.originalFilename || '').toLowerCase();
    if (originalExtension && !['.jpg', '.jpeg', '.png', '.pdf'].includes(originalExtension)) return res.status(400).json({ error: 'El formato del comprobante no es válido.' });
    const buffer = await fs.readFile(file.filepath); const name = `receipts/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ALLOWED.get(file.mimetype)}`;
    const blob = await put(name, buffer, { access: 'private', contentType: file.mimetype, addRandomSuffix: false });
    return res.status(201).json({ receiptUrl: blob.url, pathname: blob.pathname });
  } catch (error) { return res.status(error?.httpCode === 413 ? 413 : 500).json({ error: error?.httpCode === 413 ? 'El comprobante supera el máximo de 5 MB.' : 'No se pudo guardar el comprobante.' }); }
};
handler.config = { api: { bodyParser: false } };
module.exports = handler;
