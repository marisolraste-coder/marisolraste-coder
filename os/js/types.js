/**
 * @typedef {'admin'|'production'|'sales'|'delivery'} UserRole
 * @typedef {'general_direction'|'administration'|'production'|'sales_customer_service'|'delivery_logistics'} Department
 * @typedef {'personal'|'workshop_tablet'|'admin_device'} DeviceType
 * @typedef {'personal_schedule'|'personal_tasks'|'notices'|'training'|'personal_profile'|'assigned_production_orders'|'operational_recipe'|'admin_full_access'} DevicePermission
 * @typedef {'morning'|'afternoon'} Shift
 * @typedef {'low'|'normal'|'high'|'urgent'} Priority
 * @typedef {'pending'|'ready'|'in_progress'|'paused'|'completed'|'incident'} TaskStatus
 * @typedef {{id:string,name:string,area:Department,role:UserRole,shift?:Shift}} User
 * @typedef {{deviceType:DeviceType,devicePermissions:DevicePermission[]}} DeviceContext
 * @typedef {{reported:boolean,description:string,createdAt:string|null}} Incident
 * @typedef {{value:number|null,unit:string}} YieldResult
 * @typedef {{startedAt:string|null,finishedAt:string|null,pausedAt:string|null,totalPausedMs:number}} Timing
 * @typedef {{id:string,preparation:string,assigneeId:string,shift:Shift,quantity:string,plannedTime:string,expectedMinutes:number,expectedYield:YieldResult,priority:Priority,instructions:string,status:TaskStatus,progress:number,timing:Timing,actualYield:YieldResult,waste:string,notes:string,incident:Incident,photo:string|null,createdAt:string,updatedAt:string}} ProductionTask
 * @typedef {{version:2,currentUserId:string|null,tasks:ProductionTask[]}} AppState
 * @typedef {{id:string,name:string,category:string,yield:string,estimatedMinutes:number,photo:string,isDemo:true,accessLevel:'admin',availableFields:string[]}} RecipeMetadata
 * @typedef {{id:string,name:string,quantity?:number,unit?:string,preparationNote?:string,section?:string,optional?:boolean,rawText?:string}} RecipeIngredient
 * @typedef {{id:string,order:number,instruction:string,notes?:string,section?:string,rawText?:string}} RecipeStep
 * @typedef {'preparation'|'cooking'|'cooling'|'resting'|'decoration'|'packing'} ProductionPhaseType
 * @typedef {{id:string,productionId:string,name:string,type:ProductionPhaseType,durationMinutes:number,resource:'worker'|'oven'|'stove'|'passive',dependsOn:string[],priority:Priority,assigneeId:string,status:'pending'|'in_progress'|'completed'}} ProductionPhase
 * @typedef {{id:string,name:string,category:string,subcategory?:string,description?:string,yield:{quantity?:number,unit?:string,notes?:string},ingredients:RecipeIngredient[],steps:RecipeStep[],preparationTimeMinutes?:number,cookingTimeMinutes?:number,restingTimeMinutes?:number,totalTimeMinutes?:number,temperature?:{value?:number,unit?:'C'|'F',notes?:string},equipment?:string[],criticalPoints?:string[],qualityCriteria?:string[],storageInstructions?:string[],allergens?:string[],notes?:string[],source:{type:'docx',fileName:string,importedAt:string},status:'draft'|'reviewed'|'approved'|'archived'}} Recipe
 * @typedef {'pending'|'scheduled'|'in_preparation'|'in_oven'|'resting'|'decoration'|'quality_control'|'packing'|'completed'} ProductionOrderStatus
 * @typedef {{id:string,label:string,checked:boolean}} ProductionOrderChecklistItem
 * @typedef {{id:string,code:string,date:string,responsible:{id:string,name:string},status:ProductionOrderStatus,priority:Priority,formula:{recipeId:string,internalCode:string,name:string,versionNumber:number},requestedQuantity:{value:number,unit:string},expectedYield:{value:number,unit:string},timeline:{time:string,label:string}[],checklists:Record<ProductionOrderStatus,ProductionOrderChecklistItem[]>,history:{status:ProductionOrderStatus,at:string}[],createdAt:string,updatedAt:string}} ProductionOrder
 * @typedef {'ingredient'|'work_in_progress'|'finished_good'|'packaging'|'utensil'|'equipment'} InventoryType
 * @typedef {'purchase'|'production'|'consumption'|'waste'|'adjustment'|'transfer'} InventoryEventType
 * @typedef {{id:string,name:string,type:InventoryType,unit:string,openingStock:number,minimumStock:number,idealStock:number,nextExpiry?:string,formulaVersion?:string}} InventoryItem
 * @typedef {{id:string,type:InventoryEventType,itemId:string,quantityDelta:number,unit:string,occurredAt:string,responsible?:string,productionOrderId?:string,formulaVersion?:string,expectedQuantity?:number,actualQuantity?:number,label?:string}} InventoryEvent
 * @typedef {'recipe'|'batch'|'production_order'|'client'|'channel'} CostSourceType
 * @typedef {{id:string,direction:'in'|'out',label:string,amount:number,dueDate:string,status:'planned'|'pending'|'settled'|'cancelled'}} CashMovement
 * @typedef {{id:string,product:string,client:string,channel:'rappi'|'web'|'store',date:string,amount:number,margin:number,units:number}} SaleFact
 */

export const STATUS = Object.freeze({
  pending: 'Pendiente', ready: 'Lista para iniciar', in_progress: 'En proceso',
  paused: 'Pausada', completed: 'Terminada', incident: 'Con incidencia'
});
export const PRIORITY = Object.freeze({low:'Baja',normal:'Normal',high:'Alta',urgent:'Urgente'});
export const SHIFT = Object.freeze({morning:'Mañana',afternoon:'Tarde'});
