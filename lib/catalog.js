const categories = [
  { id: 'tortas', label: 'Tortas' },
  { id: 'cheesecakes', label: 'Cheesecakes' },
  { id: 'pies', label: 'Pies y tartaletas' },
  { id: 'cuchareables', label: 'Cuchareables' },
  { id: 'alfajores', label: 'Alfajores' },
  { id: 'profiteroles', label: 'Profiteroles' },
  { id: 'helados', label: 'Helados y sorbetes' },
  { id: 'boxes', label: 'Boxes y regalos' }
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

const products = [
  {
    id: 'torta-chocolate', slug: 'torta-chocolate', name: 'Torta de chocolate', category: 'tortas',
    shortDescription: 'Bizcocho intenso, ganache sedosa y acabados artesanales.',
    fullDescription: 'Una torta de celebración con bizcocho húmedo de chocolate y ganache de cacao. Elige la variedad y los detalles que harán único el momento.',
    images: ['/public/carta/pagina-08.webp'], basePrice: 70, priceFrom: 70, stock: 'programado', active: true, preparationTimeHours: 48,
    allergens: ['Gluten', 'Lácteos', 'Huevo'], servingInformation: 'Mini 6 · Mediana 15 · Grande 25 porciones',
    options: [
      { id: 'size', label: 'Tamaño', type: 'single', required: true, values: cakeOptions.size },
      { id: 'flavor', label: 'Variedad', type: 'single', required: true, values: [{ id: 'clasica', label: 'Chocolate clásico' }, { id: 'doble', label: 'Doble chocolate' }, { id: 'bosque', label: 'Frutos del bosque' }] },
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
    allergens: ['Gluten', 'Lácteos', 'Huevo'], servingInformation: 'Mini 6 · Mediana 15 · Grande 25 porciones',
    options: [
      { id: 'size', label: 'Tamaño', type: 'single', required: true, values: [{ id: 'mini', label: 'Mini · 6 porciones', price: 78 }, { id: 'mediana', label: 'Mediana · 15 porciones', price: 138 }, { id: 'grande', label: 'Grande · 25 porciones', price: 188 }] },
      { id: 'flavor', label: 'Acabado', type: 'single', required: true, values: [{ id: 'clasico', label: 'Clásico' }, { id: 'frutos', label: 'Frutos rojos' }] },
      { id: 'extras', label: 'Detalles', type: 'multiple', required: false, values: cakeOptions.extras },
      { id: 'dedication', label: 'Dedicatoria', type: 'text', required: false, maxLength: 120 },
      { id: 'notes', label: 'Indicaciones especiales', type: 'text', required: false, maxLength: 240 }
    ]
  }
];

const legacyProducts = {
  bocaditos: { name: 'Bocaditos clásicos · caja 12', price: 30 }, especiales: { name: 'Bocaditos especiales · caja 12', price: 36 },
  alfajores: { name: 'Mini alfajores · caja 6', price: 18 }, cuchareable: { name: 'Alfajor cuchareable tradicional', price: 20 },
  crumble: { name: 'Crumble individual (12 oz)', price: 25 }, pie: { name: 'Pie o tartaleta individual (12 oz)', price: 20 }, torta: { name: 'Torta vainilla mini (6 porciones)', price: 78 }
};

const clean = value => String(value || '').replace(/[<>|]/g, '').trim().slice(0, 240);
const lookup = (values, id) => values.find(value => value.id === id);

function resolveCartItem(input) {
  const id = String(input.id || '');
  const quantity = Number(input.qty);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new Error('La cantidad seleccionada no es válida.');
  if (legacyProducts[id]) return { id, name: legacyProducts[id].name, qty: quantity, price: legacyProducts[id].price, selectedOptions: [] };
  const [productId, sizeId, flavorId, extrasCode = 'sin', dedication = '', notes = ''] = id.split('|');
  const product = products.find(item => item.id === productId && item.active);
  if (!product) throw new Error('El producto seleccionado no está disponible.');
  const size = lookup(product.options.find(option => option.id === 'size').values, sizeId);
  const flavor = lookup(product.options.find(option => option.id === 'flavor').values, flavorId);
  if (!size || !flavor) throw new Error('Completa el tamaño y la variedad del producto.');
  const extras = extrasCode === 'sin' ? [] : extrasCode.split(',').map(extraId => lookup(product.options.find(option => option.id === 'extras').values, extraId)).filter(Boolean);
  const price = Number(size.price) + extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  const selectedOptions = [`Tamaño: ${size.label}`, `${product.options.find(option => option.id === 'flavor').label}: ${flavor.label}`, ...extras.map(extra => extra.label)];
  if (clean(dedication)) selectedOptions.push(`Dedicatoria: ${clean(dedication)}`);
  return { id, name: product.name, qty: quantity, price, selectedOptions, configuration: { size: size.id, flavor: flavor.id, extras: extras.map(extra => extra.id), dedication: clean(dedication), notes: clean(notes) } };
}

module.exports = { categories, products, resolveCartItem };
