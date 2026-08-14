const UNIT_ALIASES=new Map([
  ['g','g'],['gr','g'],['gr.','g'],['gramo','g'],['gramos','g'],['kg','kg'],['kilo','kg'],['kilos','kg'],['ml','ml'],['mililitro','ml'],['mililitros','ml'],['l','l'],['lt','l'],['litro','l'],['litros','l'],['cda','cda'],['cda.','cda'],['cucharada','cda'],['cucharadas','cda'],['cdta','cdta'],['cdta.','cdta'],['cucharadita','cdta'],['cucharaditas','cdta'],['und','unidad'],['unidad','unidad'],['unidades','unidad'],['tz','taza'],['tza','taza'],['taza','taza'],['tazas','taza']
]);
const FRACTIONS={'¼':.25,'½':.5,'¾':.75,'⅓':1/3,'⅔':2/3};
export const normalizeUnit=value=>UNIT_ALIASES.get(value.trim().toLocaleLowerCase('es'))||null;
export function parseQuantity(value){
  if(!value)return undefined;if(value.includes('/')){const [a,b]=value.split('/').map(Number);return b?a/b:undefined}
  const fraction=Object.entries(FRACTIONS).find(([symbol])=>value.includes(symbol)),whole=Number(value.replace(/[¼½¾⅓⅔]/g,'').trim().replace(',','.'))||0,result=whole+(fraction?.[1]||0);return Number.isFinite(result)?result:undefined;
}
export const normalizeRecipeName=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().toLocaleLowerCase('es');
