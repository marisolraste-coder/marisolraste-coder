export const ORDER_STATUSES=Object.freeze([
  {id:'pending',label:'Pendiente'},
  {id:'scheduled',label:'Programada'},
  {id:'in_preparation',label:'En preparación'},
  {id:'in_oven',label:'En horno'},
  {id:'resting',label:'Reposando'},
  {id:'decoration',label:'Decoración'},
  {id:'quality_control',label:'Control de calidad'},
  {id:'packing',label:'Empaque'},
  {id:'completed',label:'Terminada'}
]);
export const orderStatus=id=>ORDER_STATUSES.find(status=>status.id===id);
export const orderProgress=id=>{const index=ORDER_STATUSES.findIndex(status=>status.id===id);return index<0?0:Math.round(index/(ORDER_STATUSES.length-1)*100)};
export const nextOrderStatus=id=>ORDER_STATUSES[ORDER_STATUSES.findIndex(status=>status.id===id)+1]||null;
export const currentChecklist=order=>order.checklists[order.status]||[];
export const canAdvanceOrder=order=>order.status!=='completed'&&currentChecklist(order).length>0&&currentChecklist(order).every(item=>item.checked);
export function advanceOrder(order,at=new Date().toISOString()){
  if(!canAdvanceOrder(order))return false;const next=nextOrderStatus(order.status);if(!next)return false;order.status=next.id;order.updatedAt=at;order.history.push({status:next.id,at});return true;
}
