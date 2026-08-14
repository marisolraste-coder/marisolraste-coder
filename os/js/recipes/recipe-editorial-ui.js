const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const dateLabel=value=>value?new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'Pendiente';
const statusLabel={DRAFT:'Borrador',REVIEWED:'Revisada',APPROVED:'Aprobada',ARCHIVED:'Archivada'};

function editorialAction(recipe){
  if(recipe.status==='DRAFT')return `<button class="button tertiary" data-recipe-status="REVIEWED" data-recipe-id="${recipe.id}"><span>Enviar a revisión</span></button>`;
  if(recipe.status==='REVIEWED')return `<button class="button primary" data-recipe-status="APPROVED" data-recipe-id="${recipe.id}"><span>Aprobar versión</span></button>`;
  if(recipe.status==='APPROVED')return `<button class="button tertiary" data-recipe-version="${recipe.id}"><span>Crear nueva versión</span></button>`;
  return '';
}

export function recipeEditorialPanel(recipe){
  const history=recipe.history||[];
  return `<section class="recipe-editorial panel" aria-labelledby="editorial-title">
    <div class="recipe-editorial-head"><div><span class="eyebrow">Control editorial privado</span><h2 id="editorial-title">Historial de versiones</h2><p>Versión actual: <strong>v${recipe.versionNumber} · ${statusLabel[recipe.status]||escapeHtml(recipe.status)}</strong>. La versión publicada nunca se sobrescribe.</p></div>${editorialAction(recipe)}</div>
    <ol class="recipe-version-history">${history.length?history.map(entry=>`<li><span class="version-marker"></span><div><div class="version-title"><strong>v${entry.versionNumber}</strong><span class="chip">${statusLabel[entry.status]||escapeHtml(entry.status)}</span></div><p>Creada por <strong>${escapeHtml(entry.authorName)}</strong> · ${dateLabel(entry.createdAt)}</p>${entry.reviewedAt?`<small>Revisada por ${escapeHtml(entry.reviewerName||'Administración')} · ${dateLabel(entry.reviewedAt)}</small>`:''}${entry.approvedAt?`<small>Aprobada por ${escapeHtml(entry.approverName||'Administración')} · ${dateLabel(entry.approvedAt)}</small>`:''}</div></li>`).join(''):'<li><div><strong>Historial no disponible</strong><p>Vuelve a abrir la ficha para cargar la trazabilidad.</p></div></li>'}</ol>
    <div class="recipe-editorial-security"><span aria-hidden="true">🔒</span><p>Este historial contiene únicamente metadatos administrativos. La Fórmula Maestra no forma parte de esta consulta.</p></div>
  </section>`;
}
