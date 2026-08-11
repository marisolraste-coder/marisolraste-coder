const categories = [
  { id: 'tortas', label: 'Tortas' },
  { id: 'cheesecakes', label: 'Cheesecakes' },
  { id: 'pies', label: 'Pies y tartaletas' },
  { id: 'cuchareables', label: 'Cuchareables' },
  { id: 'alfajores', label: 'Alfajores' },
  { id: 'brownies', label: 'Brownies y blondies' },
  { id: 'profiteroles', label: 'Profiteroles' },
  { id: 'helados', label: 'Helados y sorbetes' },
  { id: 'crumbles', label: 'Crumbles' },
  { id: 'bocaditos', label: 'Bocaditos' },
  { id: 'boutique', label: 'La Boutique' },
  { id: 'boxes', label: 'Boxes y regalos' }
];

// Fuente única para las colecciones: conserva una portada editorial aunque el
// video definitivo aún no exista. Los videos se cargan bajo demanda en web.
const collectionEditorial = [
  { id: 'tortas', collectionTitle: 'Tortas', collectionCopy: 'Creaciones artesanales para celebrar momentos que permanecen.', collectionVideo: '/assets/tortas-collection.mp4', collectionPoster: '/public/carta/pagina-08.webp' },
  { id: 'cheesecakes', collectionTitle: 'Cheesecakes', collectionCopy: 'Texturas delicadas y acabados serenos para compartir.', collectionVideo: '/assets/cheesecakes-collection.mp4', collectionPoster: '/public/carta/pagina-13.webp' },
  { id: 'pies', collectionTitle: 'Pies y tartaletas', collectionCopy: 'Fruta, merengue y masas hechas con intención.', collectionVideo: '/assets/pies-tartaletas.mp4', collectionPoster: '/public/carta/pagina-05.webp' },
  { id: 'cuchareables', collectionTitle: 'Cuchareables', collectionCopy: 'Capas, cremas y recuerdos para disfrutar con calma.', collectionVideo: null, collectionPoster: '/public/carta/pagina-07.webp' },
  { id: 'alfajores', collectionTitle: 'Alfajores', collectionCopy: 'Pequeños clásicos de alma peruana y gesto artesanal.', collectionVideo: '/assets/alfajores.mp4', collectionPoster: '/public/carta/pagina-03.webp' },
  { id: 'brownies', collectionTitle: 'Brownies y blondies', collectionCopy: 'Chocolate, mantequilla y el punto justo de antojo.', collectionVideo: null, collectionPoster: '/public/carta/pagina-10.webp' },
  { id: 'profiteroles', collectionTitle: 'Profiteroles', collectionCopy: 'La delicadeza francesa en un bocado lleno de memoria.', collectionVideo: null, collectionPoster: '/profiterol-craquelin.png' },
  { id: 'helados', collectionTitle: 'Helados y sorbetes', collectionCopy: 'Sabores cremosos y frutales, hechos para refrescar el momento.', collectionVideo: '/assets/helados-collection.mp4', collectionPoster: '/public/carta/pagina-12.webp' },
  { id: 'crumbles', collectionTitle: 'Crumbles', collectionCopy: 'Texturas doradas y sabores que celebran la temporada.', collectionVideo: '/assets/crumbles.mp4', collectionPoster: '/public/carta/pagina-04.webp' },
  { id: 'bocaditos', collectionTitle: 'Bocaditos', collectionCopy: 'Dulces pequeños, delicados y perfectos para compartir.', collectionVideo: '/assets/bocaditos-collection.mp4', collectionPoster: '/public/carta/pagina-10.webp' },
  { id: 'boutique', collectionTitle: 'La Boutique', collectionCopy: 'Manjares, chocolate y detalles para regalar con intención.', collectionVideo: '/assets/boutique-collection.mp4', collectionPoster: '/public/carta/pagina-09.webp' },
  { id: 'boxes', collectionTitle: 'Boxes y regalos', collectionCopy: 'Una selección cuidada para convertir un gesto en recuerdo.', collectionVideo: null, collectionPoster: '/public/carta/pagina-09.webp' }
];

const recommendationOccasions = [
  { id: 'gift', label: '🎁 Quiero hacer un regalo', categoryPriority: ['boxes', 'boutique', 'profiteroles', 'alfajores', 'cheesecakes'], maxServings: 12, limit: 6, premiumGiftOnly: true, recommendationTitle: 'Una selección para sorprender', recommendationCopy: 'Sorprender nunca había sido tan dulce.' },
  { id: 'celebration', label: '🎉 Estoy organizando una celebración', categoryPriority: ['tortas', 'pies', 'cheesecakes', 'boxes', 'bocaditos'], minServings: 4 },
  { id: 'treat', label: '🍰 Quiero darme un gusto', categoryPriority: ['cuchareables', 'helados', 'crumbles', 'brownies', 'alfajores'], maxServings: 2, limit: 6 },
  { id: 'special', label: '✨ Necesito una propuesta especial', consultationOnly: true }
];

const celebrationTypes = [
  { id: 'cumpleanos-infantil', label: 'Cumpleaños infantil', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'profiteroles'] },
  { id: 'cumpleanos-adulto', label: 'Cumpleaños de adulto', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'profiteroles', 'helados'] },
  { id: 'baby-shower', label: 'Baby shower', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'profiteroles'] },
  { id: 'revelacion-genero', label: 'Revelación de género', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'profiteroles'] },
  { id: 'aniversario', label: 'Aniversario', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['alfajores', 'bocaditos', 'profiteroles'] },
  { id: 'pedida-mano', label: 'Pedida de mano', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['alfajores', 'bocaditos', 'profiteroles'] },
  { id: 'bautizo', label: 'Bautizo', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'alfajores', 'profiteroles'] },
  { id: 'primera-comunion', label: 'Primera comunión', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'alfajores', 'profiteroles'] },
  { id: 'graduacion', label: 'Graduación', mainCategories: ['tortas', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'profiteroles'] },
  { id: 'reunion-familiar', label: 'Reunión familiar', mainCategories: ['tortas', 'cheesecakes', 'pies'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'helados'] },
  { id: 'reunion-amigos', label: 'Reunión con amigos', mainCategories: ['tortas', 'pies', 'cheesecakes'], shareCategories: ['bocaditos', 'brownies', 'alfajores', 'helados'] },
  { id: 'te-brunch', label: 'Té o brunch', mainCategories: ['pies', 'cheesecakes', 'cuchareables'], shareCategories: ['alfajores', 'brownies', 'bocaditos'] },
  { id: 'evento-corporativo', label: 'Evento corporativo', mainCategories: ['bocaditos', 'boxes', 'tortas'], shareCategories: ['bocaditos', 'alfajores', 'brownies', 'profiteroles'] },
  { id: 'celebracion-mascotas', label: 'Celebración para mascotas', mainCategories: [], shareCategories: [] },
  { id: 'otro', label: 'Otro', mainCategories: ['tortas', 'cheesecakes', 'pies'], shareCategories: ['bocaditos', 'brownies', 'alfajores'] }
];

const celebrationGuestRanges = [
  { id: '1-4', label: '1–4 personas', min: 1, max: 4 },
  { id: '5-10', label: '5–10 personas', min: 5, max: 10 },
  { id: '11-20', label: '11–20 personas', min: 11, max: 20 },
  { id: '21-40', label: '21–40 personas', min: 21, max: 40 },
  { id: '41-80', label: '41–80 personas', min: 41, max: 80 },
  { id: '80-plus', label: 'Más de 80', min: 81, max: null }
];

const celebrationServices = [
  { id: 'mesa-dulce', label: 'Mesa dulce' }, { id: 'coffee-break', label: 'Coffee break' },
  { id: 'mozos', label: 'Servicio de mozos' }, { id: 'decoracion', label: 'Decoración' },
  { id: 'mobiliario', label: 'Mobiliario' }, { id: 'flores', label: 'Flores y detalles' },
  { id: 'regalos-personalizados', label: 'Regalos personalizados' }, { id: 'otros', label: 'Otros requerimientos' }
];

const giftIntentions = [
  { id: 'agradecimiento', label: 'Agradecimiento', collections: ['gourmet', 'personalizados', 'chocolate'] },
  { id: 'felicitaciones', label: 'Felicitaciones', collections: ['florales', 'chocolate', 'personalizados'] },
  { id: 'amor', label: 'Amor', collections: ['florales', 'chocolate', 'gourmet'] },
  { id: 'pensando-en-ti', label: 'Pensando en ti', collections: ['gourmet', 'chocolate', 'personalizados'] },
  { id: 'cumpleanos', label: 'Cumpleaños', collections: ['florales', 'chocolate', 'personalizados'] },
  { id: 'aniversario', label: 'Aniversario', collections: ['florales', 'chocolate', 'gourmet'] },
  { id: 'bienvenida', label: 'Bienvenida', collections: ['gourmet', 'personalizados', 'florales'] },
  { id: 'graduacion', label: 'Graduación', collections: ['chocolate', 'personalizados', 'gourmet'] },
  { id: 'navidad', label: 'Navidad', collections: ['chocolate', 'gourmet', 'personalizados'] },
  { id: 'detalle-elegante', label: 'Un detalle elegante', collections: ['gourmet', 'florales', 'chocolate'] },
  { id: 'otro', label: 'Otro', collections: ['gourmet', 'chocolate', 'personalizados'] }
];

const giftCollections = [
  { id: 'florales', label: 'Regalos florales', icon: '🌸', concept: 'Creaciones que florecen en cada detalle.', image: '/public/carta/pagina-08.webp', categoryPriority: ['tortas', 'cheesecakes'], available: false, availabilityNote: 'Diseños florales disponibles por encargo.' },
  { id: 'chocolate', label: 'Colección Chocolate', icon: '🍫', concept: 'Cacao, trufas y detalles que se recuerdan.', image: '/public/carta/pagina-06.webp', categoryPriority: ['tortas', 'boutique', 'alfajores'], available: true },
  { id: 'gourmet', label: 'Colección Gourmet', icon: '☕', concept: 'Pequeños placeres para regalar con intención.', image: '/public/carta/pagina-09.webp', categoryPriority: ['boutique', 'cuchareables', 'alfajores'], available: true },
  { id: 'personalizados', label: 'Regalos personalizados', icon: '🎁', concept: 'Un detalle único, pensado para esa persona.', image: '/public/carta/pagina-11.webp', categoryPriority: ['boxes', 'tortas', 'boutique'], available: false, availabilityNote: 'Personalización y empaque premium por encargo.' }
];

const giftServices = [
  { id: 'tarjeta-mano', label: 'Tarjeta escrita a mano' }, { id: 'mensaje-personalizado', label: 'Mensaje personalizado' },
  { id: 'empaque-premium', label: 'Empaque premium' }, { id: 'entrega-programada', label: 'Entrega en fecha específica' },
  { id: 'dedicatoria-especial', label: 'Dedicatoria especial' }
];

const cakeOptions = {
  size: [
    { id: 'mini', label: 'Mini · 6 porciones', price: 70 },
    { id: 'mediana', label: 'Mediana · 15 porciones', price: 130 },
    { id: 'grande', label: 'Grande · 25 porciones', price: 180 }
  ],
  extras: [
    { id: 'vela', label: 'Vela', price: 3 },
    { id: 'topper', label: 'Topper sencillo', price: 8 },
    { id: 'tarjeta', label: 'Tarjeta especial', price: 5 }
  ]
};

const simpleProduct = ({ id, name, category, description, image, price, preparationTimeHours = 24, servings = { min: 1, max: 1 }, occasions = [], featured = 0, giftCollections = [], giftIntentions = [], premiumGift = false, premiumGiftRank = 0 }) => ({
  id, slug: id, name, category,
  shortDescription: description, fullDescription: description,
  images: [image], basePrice: price, priceFrom: price,
  stock: 'programado', active: true, preparationTimeHours,
  allergens: [], servingInformation: '', options: [], simple: true,
  servings, occasions, featured, giftCollections, giftIntentions, premiumGift, premiumGiftRank
});

const products = [
  {
    id: 'torta-chocolate', slug: 'torta-chocolate', name: 'Torta de chocolate', category: 'tortas',
    shortDescription: 'Bizcocho intenso, ganache sedosa y acabados artesanales.',
    fullDescription: 'Una torta de celebración con bizcocho húmedo de chocolate y ganache de cacao. Elige la variedad y los detalles que harán único el momento.',
    images: ['/public/carta/pagina-08.webp'], basePrice: 70, priceFrom: 70, stock: 'programado', active: true, preparationTimeHours: 48,
    allergens: ['Gluten', 'Lácteos', 'Huevo'], servingInformation: 'Mini 6 · Mediana 15 · Grande 25 porciones', servings: { min: 6, max: 25 }, occasions: ['celebration', 'share', 'company'], featured: 5, giftCollections: ['chocolate', 'florales', 'personalizados'], giftIntentions: ['cumpleanos', 'aniversario', 'felicitaciones'],
    options: [
      { id: 'size', label: 'Tamaño', type: 'single', required: true, values: cakeOptions.size },
      { id: 'flavor', label: 'Variedad', type: 'single', required: true, values: [{ id: 'clasica', label: 'Chocolate clásico' }, { id: 'doble', label: 'Doble chocolate' }, { id: 'bosque', label: 'Frutos del bosque' }] },
      { id: 'presentation', label: 'Presentación', type: 'single', required: true, values: [{ id: 'clasica', label: 'Presentación clásica' }, { id: 'signature', label: 'Caja signature Le Miski' }] },
      { id: 'extras', label: 'Detalles', type: 'multiple', required: false, values: cakeOptions.extras },
      { id: 'dedication', label: 'Dedicatoria', type: 'text', required: false, maxLength: 120 },
      { id: 'notes', label: 'Indicaciones especiales', type: 'text', required: false, maxLength: 240 }
    ]
  },
  {
    id: 'torta-red-velvet', slug: 'torta-red-velvet', name: 'Torta Red Velvet', category: 'tortas',
    shortDescription: 'Bizcocho de cacao rojo con crema de queso y vainilla.',
    fullDescription: 'Nuestra interpretación delicada del clásico Red Velvet: bizcocho suave de cacao rojo, crema de queso y una presentación pensada para compartir.',
    images: ['/public/carta/pagina-08.webp'], basePrice: 78, priceFrom: 78, stock: 'programado', active: true, preparationTimeHours: 48,
    allergens: ['Gluten', 'Lácteos', 'Huevo'], servingInformation: 'Mini 6 · Mediana 15 · Grande 25 porciones', servings: { min: 6, max: 25 }, occasions: ['celebration', 'share', 'elegantGift'], featured: 4, giftCollections: ['florales', 'personalizados'], giftIntentions: ['amor', 'aniversario', 'cumpleanos'],
    options: [
      { id: 'size', label: 'Tamaño', type: 'single', required: true, values: [{ id: 'mini', label: 'Mini · 6 porciones', price: 78 }, { id: 'mediana', label: 'Mediana · 15 porciones', price: 138 }, { id: 'grande', label: 'Grande · 25 porciones', price: 188 }] },
      { id: 'flavor', label: 'Acabado', type: 'single', required: true, values: [{ id: 'clasico', label: 'Clásico' }, { id: 'frutos', label: 'Frutos rojos' }] },
      { id: 'presentation', label: 'Presentación', type: 'single', required: true, values: [{ id: 'clasica', label: 'Presentación clásica' }, { id: 'signature', label: 'Caja signature Le Miski' }] },
      { id: 'extras', label: 'Detalles', type: 'multiple', required: false, values: cakeOptions.extras },
      { id: 'dedication', label: 'Dedicatoria', type: 'text', required: false, maxLength: 120 },
      { id: 'notes', label: 'Indicaciones especiales', type: 'text', required: false, maxLength: 240 }
    ]
  },
  simpleProduct({ id: 'alfajores', name: 'Mini alfajores · caja 6', category: 'alfajores', description: 'El complemento clásico para un regalo especial.', image: '/public/carta/pagina-10.webp', price: 18, servings: { min: 1, max: 2 }, occasions: ['gift', 'treat', 'share', 'elegantGift'], featured: 4, giftCollections: ['chocolate', 'gourmet', 'personalizados'], giftIntentions: ['agradecimiento', 'pensando-en-ti', 'bienvenida', 'navidad'], premiumGift: true, premiumGiftRank: 50 }),
  simpleProduct({ id: 'crumble-maiz-morado', name: 'Crumble de maíz morado', category: 'crumbles', description: 'Mazamorra de maíz morado y piña caramelizada.', image: '/crumble-maiz-morado.png', price: 25, servings: { min: 1, max: 1 }, occasions: ['treat'], featured: 6 }),
  simpleProduct({ id: 'blondies-vainilla', name: 'Mini blondies', category: 'brownies', description: 'Mantequilla dorada y chocolate blanco en cada bocado.', image: '/public/carta/pagina-10.webp', price: 24, servings: { min: 1, max: 2 }, occasions: ['treat', 'share'], featured: 4 }),
  simpleProduct({ id: 'caja-degustacion-signature', name: 'Caja de degustación signature', category: 'boxes', description: 'Una selección de trufas y bocaditos para regalar.', image: '/public/carta/pagina-09.webp', price: 58, servings: { min: 6, max: 12 }, occasions: ['gift', 'celebration', 'company'], featured: 6, giftCollections: ['gourmet', 'personalizados'], giftIntentions: ['agradecimiento', 'felicitaciones', 'navidad', 'detalle-elegante'], premiumGift: true, premiumGiftRank: 100 }),
  simpleProduct({ id: 'trufas-dubai', name: 'Trufas Dubai · caja 12', category: 'boutique', description: 'Chocolate relleno de pistacho y kataifi, para impresionar.', image: '/public/carta/pagina-10.webp', price: 36, servings: { min: 6, max: 12 }, occasions: ['gift', 'elegantGift'], featured: 6, giftCollections: ['chocolate', 'gourmet'], giftIntentions: ['felicitaciones', 'amor', 'detalle-elegante'], premiumGift: true, premiumGiftRank: 95 }),
  simpleProduct({ id: 'trufas-pistacho', name: 'Trufas de pistacho · caja 6', category: 'boutique', description: 'Pistacho intenso y chocolate fino en cada bocado.', image: '/public/carta/pagina-09.webp', price: 34, servings: { min: 6, max: 6 }, occasions: ['gift', 'elegantGift'], featured: 5, giftCollections: ['chocolate', 'gourmet'], giftIntentions: ['agradecimiento', 'aniversario', 'detalle-elegante'], premiumGift: true, premiumGiftRank: 90 }),
  simpleProduct({ id: 'trufas-clasicas-premium', name: 'Trufas clásicas premium · caja 6', category: 'boutique', description: 'Ganache sedosa de chocolate, hecha para regalar.', image: '/public/carta/pagina-09.webp', price: 30, servings: { min: 6, max: 6 }, occasions: ['gift', 'elegantGift'], featured: 5, giftCollections: ['chocolate', 'gourmet'], giftIntentions: ['agradecimiento', 'pensando-en-ti', 'bienvenida'], premiumGift: true, premiumGiftRank: 85 }),
  simpleProduct({ id: 'profiteroles-regalo', name: 'Profiteroles · caja 12', category: 'profiteroles', description: 'Bocados franceses rellenos de crema diplomática.', image: '/profiterol-craquelin.png', price: 36, servings: { min: 6, max: 12 }, occasions: ['gift', 'share', 'elegantGift'], featured: 5, giftCollections: ['gourmet', 'personalizados'], giftIntentions: ['felicitaciones', 'cumpleanos', 'pensando-en-ti'], premiumGift: true, premiumGiftRank: 80 }),
  simpleProduct({ id: 'brownies', name: 'Brownies artesanales', category: 'brownies', description: 'Chocolate intenso y centro melcochudo.', image: '/crumble-maiz-morado.png', price: 24, servings: { min: 1, max: 2 }, occasions: ['treat', 'share', 'surprise'], featured: 5 }),
  simpleProduct({ id: 'cheesecake-aguaymanto', name: 'Cheesecake de aguaymanto', category: 'cheesecakes', description: 'Queso crema y ganache de caramelo.', image: '/public/carta/pagina-13.webp', price: 78, preparationTimeHours: 48, servings: { min: 6, max: 8 }, occasions: ['celebration', 'share', 'elegantGift'], featured: 4, giftCollections: ['florales', 'personalizados'], giftIntentions: ['amor', 'aniversario', 'felicitaciones'] }),
  simpleProduct({ id: 'helado-pistacho', name: 'Helado de pistacho', category: 'helados', description: 'Cremoso, intenso y artesanal.', image: '/public/carta/pagina-12.webp', price: 25, servings: { min: 1, max: 2 }, occasions: ['treat', 'surprise'], featured: 5 }),
  simpleProduct({ id: 'pie', name: 'Pie de limón', category: 'pies', description: 'Sablé francesa y merengue italiano.', image: '/public/carta/pagina-05.webp', price: 20, servings: { min: 1, max: 2 }, occasions: ['treat', 'share', 'celebration'], featured: 3 }),
  simpleProduct({ id: 'cuchareable', name: 'Alfajor cuchareable tradicional', category: 'cuchareables', description: 'Cremoso y listo para disfrutar.', image: '/public/carta/pagina-07.webp', price: 20, servings: { min: 1, max: 1 }, occasions: ['treat', 'surprise'], featured: 6, giftCollections: ['gourmet'], giftIntentions: ['pensando-en-ti', 'agradecimiento'] }),
  simpleProduct({ id: 'bocaditos', name: 'Bocaditos clásicos · caja 12', category: 'bocaditos', description: 'Pequeños detalles para compartir.', image: '/public/carta/pagina-10.webp', price: 30, servings: { min: 6, max: 12 }, occasions: ['share', 'celebration', 'company', 'surprise'], featured: 5 }),
  simpleProduct({ id: 'boutique-manjar', name: 'Manjar artesanal', category: 'boutique', description: 'Un pequeño placer para regalar.', image: '/public/carta/pagina-09.webp', price: 30, servings: { min: 1, max: 2 }, occasions: ['surprise', 'treat', 'elegantGift'], featured: 4, giftCollections: ['gourmet', 'chocolate', 'personalizados'], giftIntentions: ['agradecimiento', 'detalle-elegante', 'navidad'] })
];

const legacyProducts = {
  bocaditos: { name: 'Bocaditos clásicos · caja 12', price: 30 }, especiales: { name: 'Bocaditos especiales · caja 12', price: 36 },
  alfajores: { name: 'Mini alfajores · caja 6', price: 18 }, cuchareable: { name: 'Alfajor cuchareable tradicional', price: 20 },
  crumble: { name: 'Crumble individual (12 oz)', price: 25 }, pie: { name: 'Pie o tartaleta individual (12 oz)', price: 20 }, torta: { name: 'Torta vainilla mini (6 porciones)', price: 78 },
  brownies: { name: 'Brownies artesanales', price: 24 }, 'cheesecake-aguaymanto': { name: 'Cheesecake de aguaymanto', price: 78 },
  'helado-pistacho': { name: 'Helado de pistacho', price: 25 }, 'boutique-manjar': { name: 'Manjar artesanal', price: 30 }
};

const clean = value => String(value || '').replace(/[<>|]/g, '').trim().slice(0, 240);
const lookup = (values, id) => values.find(value => value.id === id);

function resolveCartItem(input) {
  const id = String(input.id || '');
  const quantity = Number(input.qty);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new Error('La cantidad seleccionada no es válida.');
  const simple = products.find(item => item.id === id && item.active && item.simple);
  if (simple) return { id, name: simple.name, qty: quantity, price: simple.priceFrom, selectedOptions: [] };
  if (legacyProducts[id]) return { id, name: legacyProducts[id].name, qty: quantity, price: legacyProducts[id].price, selectedOptions: [] };
  const [productId, sizeId, flavorId, fourth = 'sin', fifth = '', sixth = '', seventh = ''] = id.split('|');
  const product = products.find(item => item.id === productId && item.active);
  if (!product) throw new Error('El producto seleccionado no está disponible.');
  const size = lookup(product.options.find(option => option.id === 'size').values, sizeId);
  const flavor = lookup(product.options.find(option => option.id === 'flavor').values, flavorId);
  if (!size || !flavor) throw new Error('Completa el tamaño y la variedad del producto.');
  const presentationOption = product.options.find(option => option.id === 'presentation');
  const presentation = presentationOption && lookup(presentationOption.values, fourth);
  const extrasCode = presentation ? fifth || 'sin' : fourth;
  const dedication = presentation ? sixth : fifth;
  const notes = presentation ? seventh : sixth;
  const extras = extrasCode === 'sin' ? [] : extrasCode.split(',').map(extraId => lookup(product.options.find(option => option.id === 'extras').values, extraId)).filter(Boolean);
  const price = Number(size.price) + extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  const selectedOptions = [`Tamaño: ${size.label}`, `${product.options.find(option => option.id === 'flavor').label}: ${flavor.label}`, ...(presentation ? [`Presentación: ${presentation.label}`] : []), ...extras.map(extra => extra.label)];
  if (clean(dedication)) selectedOptions.push(`Dedicatoria: ${clean(dedication)}`);
  return { id, name: product.name, qty: quantity, price, selectedOptions, configuration: { size: size.id, flavor: flavor.id, presentation: presentation?.id || 'clasica', extras: extras.map(extra => extra.id), dedication: clean(dedication), notes: clean(notes) } };
}

module.exports = { categories, collectionEditorial, products, recommendationOccasions, celebrationTypes, celebrationGuestRanges, celebrationServices, giftIntentions, giftCollections, giftServices, resolveCartItem };
