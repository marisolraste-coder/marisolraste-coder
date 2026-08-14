const item=(id,label,checked=false)=>({id,label,checked});
const checklists=()=>({
  pending:[item('request-reviewed','Solicitud revisada',true)],
  scheduled:[item('schedule-confirmed','Horario confirmado',true),item('responsible-assigned','Responsable asignada',true)],
  in_preparation:[item('ingredients-weighed','Ingredientes pesados',true),item('molds-ready','Moldes preparados'),item('temperature-checked','Temperatura verificada'),item('responsible-confirms','Responsable confirma')],
  in_oven:[item('oven-preheated','Horno precalentado'),item('trays-loaded','Bandejas ingresadas'),item('timer-set','Cronómetro configurado')],
  resting:[item('cooling-area-ready','Área de enfriado preparada'),item('rest-time-recorded','Tiempo de reposo registrado')],
  decoration:[item('finish-reference-reviewed','Referencia visual revisada'),item('decoration-complete','Decoración uniforme')],
  quality_control:[item('appearance-approved','Apariencia aprobada'),item('texture-approved','Textura aprobada'),item('yield-confirmed','Rendimiento confirmado')],
  packing:[item('units-counted','Unidades contadas'),item('labels-ready','Etiquetas colocadas'),item('package-sealed','Empaque cerrado')],
  completed:[item('order-closed','Orden cerrada',true)]
});
const timeline=()=>[
  {time:'08:00',label:'Inicio'}, {time:'08:25',label:'Preparación'},
  {time:'08:50',label:'Horno'}, {time:'09:15',label:'Enfriado'},
  {time:'10:15',label:'Decoración'}, {time:'10:40',label:'Control de calidad'},
  {time:'11:00',label:'Empaque'}, {time:'11:15',label:'Finalizada'}
];
const order=(overrides={})=>({
  id:'op-demo-001',code:'OP-2026-0802-001',date:'2026-08-02',responsible:{id:'user-1',name:'Usuario 1'},status:'in_preparation',priority:'high',
  formula:{recipeId:'demo-brownies',internalCode:'FM-BRW-001',name:'Brownies',versionNumber:3},
  requestedQuantity:{value:48,unit:'unidades'},expectedYield:{value:48,unit:'unidades'},
  timeline:timeline(),checklists:checklists(),history:[{status:'pending',at:'2026-08-02T07:30:00-05:00'},{status:'scheduled',at:'2026-08-02T07:45:00-05:00'},{status:'in_preparation',at:'2026-08-02T08:00:00-05:00'}],
  createdAt:'2026-08-02T07:30:00-05:00',updatedAt:'2026-08-02T08:00:00-05:00',...overrides
});
export const createDemoProductionOrders=()=>[
  order(),
  order({id:'op-demo-002',code:'OP-2026-0802-002',responsible:{id:'user-1',name:'Usuario 1'},status:'scheduled',priority:'normal',formula:{recipeId:'demo-toffee',internalCode:'FM-TOF-001',name:'Toffee',versionNumber:2},requestedQuantity:{value:1.5,unit:'kg'},expectedYield:{value:1.5,unit:'kg'},history:[{status:'pending',at:'2026-08-02T07:35:00-05:00'},{status:'scheduled',at:'2026-08-02T07:50:00-05:00'}]}),
  order({id:'op-demo-003',code:'OP-2026-0802-003',responsible:{id:'user-1',name:'Usuario 1'},status:'pending',priority:'normal',formula:{recipeId:'demo-blondies',internalCode:'FM-BLD-001',name:'Blondies',versionNumber:1},requestedQuantity:{value:24,unit:'unidades'},expectedYield:{value:24,unit:'unidades'},history:[{status:'pending',at:'2026-08-02T07:40:00-05:00'}]})
];
