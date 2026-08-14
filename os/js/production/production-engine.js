const PRIORITY_WEIGHT={urgent:4,high:3,normal:2,low:1};
const resourceKey=phase=>phase.resource==='worker'?`worker:${phase.assigneeId}`:phase.resource==='passive'?null:phase.resource;
const overlaps=(a,b)=>a.startMinute<b.endMinute&&b.startMinute<a.endMinute;

export function buildProductionPlan(phases,{startHour=8,startMinute=0}={}){
  const byId=new Map(phases.map(phase=>[phase.id,phase])),scheduled=new Map(),resourceAvailable=new Map(),remaining=new Set(phases.map(phase=>phase.id)),conflicts=[];
  phases.forEach(phase=>phase.dependsOn.forEach(dependency=>{if(!byId.has(dependency))conflicts.push({type:'missing_dependency',phaseId:phase.id,dependency})}));
  while(remaining.size){
    const ready=[...remaining].map(id=>byId.get(id)).filter(phase=>phase.dependsOn.every(id=>scheduled.has(id)||!byId.has(id))).sort((a,b)=>(PRIORITY_WEIGHT[b.priority]||0)-(PRIORITY_WEIGHT[a.priority]||0)||a.id.localeCompare(b.id));
    if(!ready.length){conflicts.push({type:'dependency_cycle',phaseIds:[...remaining]});break}
    for(const phase of ready){
      const dependencyEnd=Math.max(0,...phase.dependsOn.map(id=>scheduled.get(id)?.endMinute||0)),key=resourceKey(phase),resourceStart=key?resourceAvailable.get(key)||0:0,start=Math.max(dependencyEnd,resourceStart),end=start+phase.durationMinutes,item={...phase,startMinute:start,endMinute:end,resourceKey:key};
      scheduled.set(phase.id,item);remaining.delete(phase.id);if(key)resourceAvailable.set(key,end);
    }
  }
  const timeline=[...scheduled.values()].sort((a,b)=>a.startMinute-b.startMinute||b.priority.localeCompare(a.priority)),totalMinutes=Math.max(0,...timeline.map(item=>item.endMinute)),resources={};
  timeline.forEach(item=>{if(item.resourceKey)resources[item.resourceKey]=(resources[item.resourceKey]||0)+item.durationMinutes});
  const equipment=Object.entries(resources).filter(([key])=>!key.startsWith('worker:')).sort((a,b)=>b[1]-a[1]),bottleneck=equipment[0]?{resource:equipment[0][0],minutes:equipment[0][1],utilization:Math.round(equipment[0][1]/Math.max(totalMinutes,1)*100)}:null;
  const parallelPairs=[];for(let i=0;i<timeline.length;i++)for(let j=i+1;j<timeline.length;j++)if(overlaps(timeline[i],timeline[j])&&timeline[i].resourceKey!==timeline[j].resourceKey)parallelPairs.push([timeline[i],timeline[j]]);
  const waits=timeline.filter(item=>['cooling','resting'].includes(item.type)),suggestions=[];
  for(const wait of waits){const parallel=timeline.find(item=>item.productionId!==wait.productionId&&overlaps(wait,item)&&!['cooling','resting'].includes(item.type));if(parallel){const waiting=wait.type==='cooling'?`termina el enfriado de ${wait.name.replace(/^Enfriar\s+/i,'').toLocaleLowerCase('es')}`:`reposa ${wait.name.replace(/^Dejar reposar\s+/i,'').toLocaleLowerCase('es')}`;suggestions.push(`Mientras ${waiting}, puedes avanzar con ${parallel.name.toLocaleLowerCase('es')}.`);break}}
  if(bottleneck)suggestions.push(`Hoy ${bottleneck.resource==='oven'?'el horno':bottleneck.resource==='stove'?'la cocina':`el recurso ${bottleneck.resource}`} será el principal cuello de botella.`);
  suggestions.push(`Con este orden, la producción terminaría aproximadamente a las ${formatClock(totalMinutes,{startHour,startMinute})}.`);
  return {timeline,totalMinutes,finishMinute:totalMinutes,bottleneck,parallelPairs,waits,conflicts,suggestions,startHour,startMinute};
}

export function formatClock(offset,{startHour=8,startMinute=0}={}){const total=startHour*60+startMinute+offset,hour=Math.floor(total/60)%24,minute=total%60;return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`}
export function canStartPhase(phase,phases){return phase.status==='pending'&&phase.dependsOn.every(id=>phases.find(item=>item.id===id)?.status==='completed')}
export function blockedBy(phase,phases){return phase.dependsOn.map(id=>phases.find(item=>item.id===id)).filter(item=>item&&item.status!=='completed')}
