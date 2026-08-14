export function validateRecipeCandidate(recipe){
  const issues=[];
  if(!recipe.name||recipe.name==='Receta sin nombre')issues.push({severity:'error',code:'missing_name',message:'No identificamos el nombre.'});
  if(!recipe.category||recipe.category==='Sin categoría')issues.push({severity:'warning',code:'missing_category',message:'La categoría necesita revisión.'});
  if(!recipe.ingredients.length)issues.push({severity:'error',code:'missing_ingredients',message:'No identificamos ingredientes.'});
  if(!recipe.steps.length)issues.push({severity:'warning',code:'missing_steps',message:'No identificamos pasos de preparación.'});
  recipe.ingredients.forEach((item,index)=>{if(item.quantity===undefined||!item.unit)issues.push({severity:'warning',code:'ambiguous_ingredient',message:`Ingrediente ${index+1}: conserva el texto original y revisa cantidad o unidad.`})});
  const errors=issues.filter(issue=>issue.severity==='error').length,warnings=issues.length-errors,status=errors?'incomplete':warnings?'requires_review':'detected';
  return {...recipe,issues,warnings:issues.map(issue=>issue.message),detectionStatus:status,confidence:errors?0.35:warnings?0.7:0.95};
}
