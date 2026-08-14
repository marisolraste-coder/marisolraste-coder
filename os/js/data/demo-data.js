const now = () => new Date().toISOString();
const timing = () => ({startedAt:null,finishedAt:null,pausedAt:null,totalPausedMs:0});
const result = (unit) => ({value:null,unit});
const incident = () => ({reported:false,description:'',createdAt:null});

export const DEPARTMENTS = Object.freeze({
  general_direction:'Dirección General',
  administration:'Administración',
  production:'Producción',
  sales_customer_service:'Ventas/Atención al Cliente',
  delivery_logistics:'Reparto/Logística'
});

export const SYSTEM_ROLES = Object.freeze({admin:'ADMIN',production:'PRODUCTION',sales:'SALES',delivery:'DELIVERY'});

export const DEVICE_TYPES = Object.freeze({personal:'PERSONAL',workshop_tablet:'WORKSHOP_TABLET',admin_device:'ADMIN_DEVICE'});

export const USERS = Object.freeze([
  {id:'marisol',name:'Marisol Rodríguez',area:'general_direction',role:'admin'},
  {id:'user-1',name:'Usuario 1',area:'production',role:'production',shift:'morning'}
]);

export const DEMO_DEVICE_CONTEXTS = Object.freeze({
  personal:Object.freeze({deviceType:'personal',devicePermissions:Object.freeze(['personal_schedule','personal_tasks','notices','training','personal_profile'])}),
  workshopTablet:Object.freeze({deviceType:'workshop_tablet',devicePermissions:Object.freeze(['personal_schedule','personal_tasks','notices','training','personal_profile','assigned_production_orders','operational_recipe'])}),
  adminDevice:Object.freeze({deviceType:'admin_device',devicePermissions:Object.freeze(['admin_full_access'])})
});

const task = (id, preparation, assigneeId, shift, quantity, plannedTime, expectedMinutes, value, unit, priority, instructions) => ({
  id, preparation, assigneeId, shift, quantity, plannedTime, expectedMinutes,
  expectedYield:{value,unit}, priority, instructions, status:'pending', progress:0,
  timing:timing(), actualYield:result(unit), waste:'', notes:'', incident:incident(), photo:null,
  createdAt:now(), updatedAt:now()
});

export const createDemoState = () => ({version:2,currentUserId:null,tasks:[
  task('demo-manjar','Manjar','user-1','morning','1 receta','08:00',90,2.5,'kg','high','Preparar la estación y verificar la textura antes de retirar.'),
  task('demo-toffee','Toffee','user-1','morning','1 receta','10:00',60,1.5,'kg','normal','Mantener el área despejada y registrar cualquier variación.'),
  task('demo-brownies','Brownies','user-1','afternoon','2 recetas','14:00',75,48,'unidades','high','Revisar el punto de cocción y dejar enfriar antes de contar.'),
  task('demo-blondies','Blondies','user-1','afternoon','2 recetas','15:30',75,48,'unidades','normal','Confirmar presentación uniforme antes de finalizar.')
]});
