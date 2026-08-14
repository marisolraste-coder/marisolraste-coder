import {createDemoState} from '../data/demo-data.js';

const KEY = 'lemiski-os:v2';
let state = load();
const listeners = new Set();

function valid(value){ return value && value.version === 2 && Array.isArray(value.tasks); }
function load(){
  try { const parsed = JSON.parse(localStorage.getItem(KEY)); return valid(parsed) ? parsed : createDemoState(); }
  catch { return createDemoState(); }
}
function persist(){
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (error) { console.warn('Le Miski OS no pudo guardar los datos.', error); }
}
function emit(){ persist(); listeners.forEach(fn => fn(state)); }

export const store = {
  get: () => state,
  subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); },
  selectUser(id){ state = {...state,currentUserId:id}; emit(); },
  logout(){ state = {...state,currentUserId:null}; emit(); },
  addTask(task){ state = {...state,tasks:[...state.tasks,task]}; emit(); },
  updateTask(id, patch){ state = {...state,tasks:state.tasks.map(t => t.id === id ? {...t,...patch,updatedAt:new Date().toISOString()} : t)}; emit(); },
  reset(){ state = createDemoState(); emit(); }
};
