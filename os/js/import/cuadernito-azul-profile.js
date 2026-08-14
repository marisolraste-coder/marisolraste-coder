export const CUADERNITO_CATEGORIES=Object.freeze(['HELADOS','SORBETES','TRUFAS','PIES','MUFFINS','TORTAS','CHEESECAKES','POSTRES']);
const SECTION_NAMES=new Map([
  ['ingrediente','Ingredientes'],['ingredientes','Ingredientes'],['base','Base'],['masa','Masa'],['masa hojaldre','Masa'],['bizcocho','Bizcocho'],['bizcotelas','Bizcotelas'],['seco','Secos'],['secos','Secos'],['líquido','Líquidos'],['líquidos','Líquidos'],['liquido','Líquidos'],['liquidos','Líquidos'],['relleno','Relleno'],['centro','Centro'],['cobertura','Cobertura'],['decoración','Decoración'],['decoracion','Decoración'],['montaje','Montaje'],['merengue','Merengue'],['almíbar','Almíbar'],['almibar','Almíbar'],['baño','Baño'],['chantilly','Chantilly'],['crema','Crema'],['caramelo','Caramelo'],['extras','Extras'],['procedimiento','Procedimiento'],['preparación','Procedimiento'],['preparacion','Procedimiento'],['observaciones','Observaciones'],['notas','Observaciones']
]);
const clean=value=>value.replace(/^\*\s*/,'').replace(/:$/,'').trim();
const key=value=>clean(value).toLocaleLowerCase('es');
export const cuadernitoCategory=text=>CUADERNITO_CATEGORIES.includes(clean(text))?clean(text):null;
export const cuadernitoSection=text=>SECTION_NAMES.get(key(text))||null;
export function isCuadernitoTitle(block){
  if(!(block.bold||block.underline)||cuadernitoCategory(block.text)||cuadernitoSection(block.text))return false;
  return true;
}
export const cleanCuadernitoTitle=clean;
export const isCuadernitoList=block=>block.type==='list-item'||/listparagraph|list paragraph|prrafodelista/i.test(block.style);
