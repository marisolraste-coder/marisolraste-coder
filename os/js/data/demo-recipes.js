/** Metadatos públicos de demostración. No contiene fórmulas, costos ni procedimientos. */
export const DEMO_RECIPES = Object.freeze([
  {id:'helado-pistacho',name:'Helado de pistacho',category:'Helados',yield:'2.5 kg',estimatedMinutes:90,photo:'../amour-pistache.jpeg',featured:true},
  {id:'helado-lucuma',name:'Helado de lúcuma',category:'Helados',yield:'2.5 kg',estimatedMinutes:90,photo:'../roll-canela.jpeg'},
  {id:'sorbete-maracuya',name:'Sorbete de maracuyá',category:'Sorbetes',yield:'2 litros',estimatedMinutes:70,photo:'../amour-pistache.jpeg'},
  {id:'trufas-pistacho',name:'Trufas de pistacho',category:'Trufas',yield:'36 unidades',estimatedMinutes:60,photo:'../amour-pistache.jpeg'},
  {id:'pie-limon',name:'Pie de limón',category:'Pies',yield:'12 porciones',estimatedMinutes:110,photo:'../roll-canela.jpeg'},
  {id:'muffin-chocolate',name:'Muffin de chocolate',category:'Muffins',yield:'12 unidades',estimatedMinutes:50,photo:'../amour-pistache.jpeg'},
  {id:'muffin-chicha',name:'Muffin de chicha morada',category:'Muffins',yield:'12 unidades',estimatedMinutes:55,photo:'../roll-canela.jpeg'},
  {id:'torta-zanahoria',name:'Torta de zanahoria',category:'Tortas',yield:'16 porciones',estimatedMinutes:150,photo:'../roll-canela.jpeg'},
  {id:'torta-vainilla',name:'Torta de vainilla',category:'Tortas',yield:'16 porciones',estimatedMinutes:140,photo:'../amour-pistache.jpeg'},
  {id:'blondies',name:'Blondies',category:'Tortas',yield:'24 unidades',estimatedMinutes:75,photo:'../roll-canela.jpeg',featured:true},
  {id:'cheesecake-lucuma',name:'Cheesecake de lúcuma',category:'Cheesecakes',yield:'14 porciones',estimatedMinutes:160,photo:'../amour-pistache.jpeg'},
  {id:'profiteroles',name:'Profiteroles',category:'Postres',yield:'30 unidades',estimatedMinutes:95,photo:'../roll-canela.jpeg'}
].map(recipe=>Object.freeze({...recipe,isDemo:true,accessLevel:'admin',availableFields:['name','category','photo','yield','estimatedMinutes']})));

