export const DEMO_COST_COMPONENTS=[
  {id:'c1',label:'Chocolate y mantequilla',driver:'material',amount:86,units:48},
  {id:'c2',label:'Preparación manual',driver:'labor_minutes',amount:24,units:48},
  {id:'c3',label:'Uso del horno',driver:'oven_minutes',amount:18,units:48},
  {id:'c4',label:'Control y empaque',driver:'batch',amount:16,units:48}
];
export const DEMO_CASH_MOVEMENTS=[
  {id:'cash1',direction:'in',label:'Cobro pedido web',amount:780,dueDate:'2026-08-03',status:'pending'},
  {id:'cash2',direction:'out',label:'Pago de insumos',amount:310,dueDate:'2026-08-04',status:'pending'},
  {id:'cash3',direction:'in',label:'Cobro evento corporativo',amount:1850,dueDate:'2026-08-15',status:'pending'},
  {id:'cash4',direction:'out',label:'Empaques y etiquetas',amount:420,dueDate:'2026-08-20',status:'pending'},
  {id:'cash5',direction:'out',label:'Mantenimiento preventivo',amount:650,dueDate:'2026-09-18',status:'planned'}
];
export const DEMO_SALES=[
  {id:'s1',product:'Brownies',client:'Empresa Andina',channel:'web',date:'2026-08-02',amount:720,margin:310,units:48},
  {id:'s2',product:'Cuchareables',client:'Venta directa',channel:'store',date:'2026-08-02',amount:360,margin:118,units:18},
  {id:'s3',product:'Blondies',client:'Cliente Rappi',channel:'rappi',date:'2026-08-01',amount:240,margin:42,units:16}
];
export const DEMO_MANAGEMENT_CONTEXT={production:{planned:4,completed:3,lostMinutes:18,ovenBusyMinutes:100,shiftMinutes:480},inventory:{consumed:1450,waste:36},oven:{from:'8:30',to:'10:10'}};
