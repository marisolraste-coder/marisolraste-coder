const paths={
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/>',
  production:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  summary:'<path d="M5 20V10M12 20V4M19 20v-7"/><path d="M3 20h18"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="m9 18 6-6-6-6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  alert:'<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
  team:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.4.8 4 3 4 6"/>',
  orders:'<path d="M6 3h12l1 18H5L6 3Z"/><path d="M9 7a3 3 0 0 0 6 0"/>',
  inventory:'<path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z"/><path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5"/>',
  spark:'<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  reset:'<path d="M4 4v6h6"/><path d="M5.5 16a8 8 0 1 0 1-9L4 10"/>',
  logout:'<path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/>',
  pause:'<path d="M9 5v14M15 5v14"/>',
  play:'<path d="m8 5 11 7-11 7V5Z"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  camera:'<path d="M4 8h4l2-3h4l2 3h4v11H4V8Z"/><circle cx="12" cy="13" r="3"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  chevron:'<path d="m8 10 4 4 4-4"/>'
};
export const icon=(name,size=18)=>`<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
export const avatar=(name,size='md')=>`<span class="avatar avatar-${size}" aria-hidden="true">${name.split(' ').map(x=>x[0]).join('').slice(0,2)}</span>`;
export const button=({label,variant='primary',iconName='',attrs='',type='button'})=>`<button type="${type}" class="button button-${variant}" ${attrs}>${iconName?icon(iconName):''}<span>${label}</span></button>`;
export const statusChip=(status,label)=>`<span class="chip chip-status chip-${status}"><span class="chip-dot"></span>${label}</span>`;
export const priorityChip=(priority,label)=>`<span class="chip priority-${priority}">${label}</span>`;
export const progressBar=(value,label='Progreso')=>`<div class="progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width:${value}%"></span></div>`;
export const sectionTitle=(eyebrow,title,action='')=>`<div class="section-title"><div>${eyebrow?`<span class="eyebrow">${eyebrow}</span>`:''}<h2>${title}</h2></div>${action}</div>`;
export const emptyState=(title,copy,iconName='spark')=>`<div class="empty-state">${icon(iconName,24)}<h3>${title}</h3><p>${copy}</p></div>`;

export function openModal({title,description='',body='',confirmLabel='Confirmar',variant='primary',onConfirm}){
  const root=document.querySelector('#modal-root');
  root.innerHTML=`<div class="modal-backdrop" data-modal-close><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><span class="eyebrow">Tomemos un momento</span><h2 id="modal-title">${title}</h2>${description?`<p>${description}</p>`:''}</div><button class="icon-button" data-modal-close aria-label="Cerrar">${icon('close')}</button></header><div class="modal-body">${body}</div><footer class="modal-footer">${button({label:'Ahora no',variant:'secondary',attrs:'data-modal-close'})}${button({label:confirmLabel,variant,attrs:'data-modal-confirm'})}</footer></section></div>`;
  const modal=root.querySelector('.modal'); const prior=document.activeElement;
  const close=()=>{root.innerHTML='';prior?.focus?.()};
  root.querySelectorAll('[data-modal-close]').forEach(el=>el.addEventListener('click',e=>{if(e.target===el||el.matches('button'))close()}));
  root.querySelector('[data-modal-confirm]').addEventListener('click',async event=>{const control=event.currentTarget;control.disabled=true;control.setAttribute('aria-busy','true');try{const result=await onConfirm?.(root);if(result!==false)close()}finally{if(root.contains(control)){control.disabled=false;control.removeAttribute('aria-busy')}}});
  modal.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  root.querySelector('input,textarea,select,[data-modal-confirm]')?.focus();
}

export function showToast(message,type='success'){
  const el=document.querySelector('#toast');el.className=`toast toast-${type}`;el.innerHTML=`${icon(type==='success'?'check':'alert')}<span>${message}</span>`;requestAnimationFrame(()=>el.classList.add('show'));clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove('show'),2800);
}
