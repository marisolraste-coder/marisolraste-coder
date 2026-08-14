export const DEMO_INVENTORY_ITEMS=[
  {id:'butter',name:'Mantequilla',type:'ingredient',unit:'kg',openingStock:1.1,minimumStock:2,idealStock:5,nextExpiry:'2026-08-08'},
  {id:'chocolate',name:'Chocolate bitter',type:'ingredient',unit:'kg',openingStock:5,minimumStock:2,idealStock:7,nextExpiry:'2026-10-20'},
  {id:'fudge',name:'Fudge',type:'work_in_progress',unit:'g',openingStock:0,minimumStock:600,idealStock:1800,nextExpiry:'2026-08-05',formulaVersion:'FM-FDG-001 · v2'},
  {id:'ganache',name:'Ganache',type:'work_in_progress',unit:'g',openingStock:400,minimumStock:300,idealStock:1200,nextExpiry:'2026-08-04',formulaVersion:'FM-GAN-001 · v1'},
  {id:'brownie-finished',name:'Brownie terminado',type:'finished_good',unit:'unidades',openingStock:12,minimumStock:12,idealStock:48,nextExpiry:'2026-08-06'},
  {id:'box-small',name:'Caja pequeña',type:'packaging',unit:'unidades',openingStock:38,minimumStock:20,idealStock:80},
  {id:'spatula',name:'Espátula angular',type:'utensil',unit:'unidades',openingStock:4,minimumStock:2,idealStock:5},
  {id:'oven',name:'Horno 1',type:'equipment',unit:'unidad',openingStock:1,minimumStock:1,idealStock:1}
];
export const createDemoInventoryEvents=()=>[
  {id:'evt-001',type:'purchase',itemId:'butter',quantityDelta:2,unit:'kg',occurredAt:'2026-08-02T07:20:00-05:00',responsible:'Marisol Rodríguez',label:'Recepción local'},
  {id:'evt-002',type:'consumption',itemId:'butter',quantityDelta:-1.1,unit:'kg',occurredAt:'2026-08-02T08:10:00-05:00',responsible:'Usuario 1',productionOrderId:'OP-2026-0802-001',label:'Consumo OP'},
  {id:'evt-003',type:'production',itemId:'fudge',quantityDelta:337,unit:'g',occurredAt:'2026-08-02T09:00:00-05:00',responsible:'Marisol Rodríguez',productionOrderId:'OP-2026-0802-004',formulaVersion:'FM-FDG-001 · v2',expectedQuantity:337,actualQuantity:329,label:'Rendimiento esperado'},
  {id:'evt-004',type:'waste',itemId:'fudge',quantityDelta:-8,unit:'g',occurredAt:'2026-08-02T09:01:00-05:00',responsible:'Marisol Rodríguez',productionOrderId:'OP-2026-0802-004',formulaVersion:'FM-FDG-001 · v2',expectedQuantity:337,label:'Fudge'},
  {id:'evt-005',type:'consumption',itemId:'ganache',quantityDelta:-150,unit:'g',occurredAt:'2026-08-02T09:25:00-05:00',responsible:'Usuario 1',productionOrderId:'OP-2026-0802-002',label:'Relleno de lote'},
  {id:'evt-006',type:'production',itemId:'brownie-finished',quantityDelta:24,unit:'unidades',occurredAt:'2026-08-02T11:15:00-05:00',responsible:'Usuario 1',productionOrderId:'OP-2026-0802-001',label:'Lote terminado'}
];
export const DEMO_INTERMEDIATE_BATCHES=[
  {id:'batch-fudge-001',itemId:'fudge',expectedYield:337,actualYield:329,weight:329,unit:'g',formulaVersion:'FM-FDG-001 · v2',productionDate:'2026-08-02',responsible:'Marisol Rodríguez',expiryDate:'2026-08-05'},
  {id:'batch-ganache-001',itemId:'ganache',expectedYield:400,actualYield:400,weight:400,unit:'g',formulaVersion:'FM-GAN-001 · v1',productionDate:'2026-08-01',responsible:'Usuario 1',expiryDate:'2026-08-04'}
];
