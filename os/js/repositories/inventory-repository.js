import {supabase} from '../auth/supabase-auth.js?v=17';

let snapshot=[],movements=[],orders=[],variance=[],loaded=false,loading=false,selectedOrderId='';
const item=row=>({id:row.id,internalCode:row.internal_code,name:row.name,type:row.item_type,unit:row.unit,stock:Number(row.current_stock),minimumStock:Number(row.minimum_stock),idealStock:Number(row.ideal_stock),lowStock:row.is_low_stock,lastMovementType:row.last_movement_type,lastMovementAt:row.last_movement_at});
const movement=row=>({id:row.id,itemId:row.item_id,itemName:row.item_name,type:row.movement_type,quantityDelta:Number(row.quantity_delta),unit:row.unit,productionOrderCode:row.production_order_code,recipeName:row.recipe_name,recipeVersionNumber:row.recipe_version_number,originType:row.origin_type,originReference:row.origin_reference,notes:row.notes,occurredAt:row.occurred_at,recordedBy:row.recorded_by_name});
const order=row=>({id:row.id,code:row.code,recipeId:row.recipe_id,recipeName:row.recipe_name,recipeVersionNumber:row.recipe_version_number,status:row.status,responsibleName:row.responsible_name});
const varianceRow=row=>({itemId:row.item_id,itemName:row.item_name,unit:row.unit,theoretical:Number(row.theoretical_quantity),consumption:Number(row.actual_consumption),waste:Number(row.waste_quantity),real:Number(row.total_real_quantity),difference:Number(row.variance_quantity),percentage:Number(row.variance_percentage)});

async function loadVariance(){if(!selectedOrderId){variance=[];return}const {data,error}=await supabase.rpc('inventory_consumption_variance',{target_production_order_id:selectedOrderId});if(error)throw error;variance=(data||[]).map(varianceRow)}

export const inventoryRepository=Object.freeze({
  get loaded(){return loaded},get loading(){return loading},get items(){return snapshot},get movements(){return movements},get orders(){return orders},get variance(){return variance},get selectedOrderId(){return selectedOrderId},
  async load(){loading=true;try{const [snapshotResult,movementResult,orderResult]=await Promise.all([supabase.rpc('inventory_snapshot'),supabase.rpc('inventory_movement_history',{result_limit:50}),supabase.rpc('inventory_production_orders')]);if(snapshotResult.error)throw snapshotResult.error;if(movementResult.error)throw movementResult.error;if(orderResult.error)throw orderResult.error;snapshot=(snapshotResult.data||[]).map(item);movements=(movementResult.data||[]).map(movement);orders=(orderResult.data||[]).map(order);selectedOrderId=orders.some(value=>value.id===selectedOrderId)?selectedOrderId:orders[0]?.id||'';await loadVariance();loaded=true;return snapshot}finally{loading=false}},
  async selectOrder(id){selectedOrderId=id;await loadVariance()},
  async register({itemId,type,quantity,productionOrderId,reference,notes}){const {error}=await supabase.rpc('inventory_register_movement',{item_uuid:itemId,movement_kind:type,quantity:Number(quantity),production_order_uuid:type==='PURCHASE'?null:productionOrderId||null,origin_reference_text:reference||null,notes_text:notes||null});if(error)throw error;await this.load()}
});
