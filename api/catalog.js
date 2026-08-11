const { categories, collectionEditorial, products, recommendationOccasions, celebrationTypes, celebrationGuestRanges, celebrationServices, giftIntentions, giftCollections, giftServices } = require('../lib/catalog');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return res.status(200).json({ categories, collectionEditorial, products, recommendationOccasions, celebrationTypes, celebrationGuestRanges, celebrationServices, giftIntentions, giftCollections, giftServices });
};
