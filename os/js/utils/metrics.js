import {actualMinutes} from './timer.js';
export function metrics(tasks){
  const total=tasks.length, completed=tasks.filter(t=>t.status==='completed').length;
  return {total,completed,pending:tasks.filter(t=>['pending','ready','paused'].includes(t.status)).length,
    active:tasks.filter(t=>t.status==='in_progress').length,incidents:tasks.filter(t=>t.incident.reported).length,
    progress:total?Math.round(tasks.reduce((n,t)=>n+(t.status==='completed'?100:t.progress||0),0)/total):0,
    expectedMinutes:tasks.reduce((n,t)=>n+Number(t.expectedMinutes||0),0),actualMinutes:tasks.reduce((n,t)=>n+actualMinutes(t),0),
    expectedYield:tasks.reduce((n,t)=>n+Number(t.expectedYield.value||0),0),actualYield:tasks.reduce((n,t)=>n+Number(t.actualYield.value||0),0)};
}

