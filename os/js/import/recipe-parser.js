import {cleanCuadernitoTitle,cuadernitoCategory,cuadernitoSection,isCuadernitoList,isCuadernitoTitle} from './cuadernito-azul-profile.js?v=2';
import {normalizeUnit,parseQuantity} from './recipe-normalizer.js';
import {validateRecipeCandidate} from './recipe-validator.js';

const id=prefix=>globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const QUANTITY=/^(\d+(?:[.,]\d+)?(?:\s*[¼½¾⅓⅔])?|[¼½¾⅓⅔]|\d+\s*\/\s*\d+)\s*/;
const UNIT_TOKEN=/^([\p{L}.]+)\s*/u;
const ACTION=/\b(agregar|añadir|mezclar|batir|incorporar|calentar|hervir|hornear|cocinar|enfriar|refrigerar|congelar|colar|tamizar|reservar|verter|colocar|llevar|dejar|armar|decorar)\b/i;
const CATEGORY_LABELS={HELADOS:'Helados',SORBETES:'Sorbetes',TRUFAS:'Trufas',PIES:'Pies',MUFFINS:'Muffins',TORTAS:'Tortas',CHEESECAKES:'Cheesecakes',POSTRES:'Postres'};

function parseIngredient(block,section){
  const rawText=block.rawText||block.text,clean=rawText.replace(/^[•·\-*–—]\s*/,'').trim(),quantityMatch=clean.match(QUANTITY),quantityToken=quantityMatch?.[1],afterQuantity=quantityMatch?clean.slice(quantityMatch[0].length):clean,unitMatch=afterQuantity.match(UNIT_TOKEN),unitToken=unitMatch?.[1]||'',unit=normalizeUnit(unitToken),name=(unit?afterQuantity.slice(unitMatch[0].length):afterQuantity).trim();
  const uncertain=!quantityToken||!unit||!name;
  return {id:id('ingredient'),name:name||afterQuantity||clean,quantity:parseQuantity(quantityToken),unit:unit||undefined,preparationNote:uncertain?'Revisar la interpretación del texto original.':undefined,section:section||undefined,optional:/\bopcional\b/i.test(clean),rawText};
}
function createRecipe(name,category,fileName,titleBlock){return {id:id('recipe'),name:cleanCuadernitoTitle(name),category:CATEGORY_LABELS[category]||'Sin categoría',description:'',yield:{quantity:undefined,unit:'',notes:''},ingredients:[],steps:[],preparationTimeMinutes:undefined,cookingTimeMinutes:undefined,restingTimeMinutes:undefined,totalTimeMinutes:undefined,temperature:{value:undefined,unit:'C',notes:''},equipment:[],criticalPoints:[],qualityCriteria:[],storageInstructions:[],allergens:[],notes:[],rawBlocks:[titleBlock],uninterpretedBlocks:[],source:{type:'docx',fileName,importedAt:new Date().toISOString()},status:'draft'};}

export function parseRecipeBlocks(blocks,fileName,{limit}={}){
  const recipes=[];let category=null,current=null,section='',mode='ingredients';
  const finish=()=>{if(!current)return;recipes.push(validateRecipeCandidate(current));current=null;section='';mode='ingredients'};
  for(const block of blocks){
    const foundCategory=cuadernitoCategory(block.text);if(foundCategory){finish();category=foundCategory;continue}
    if(isCuadernitoTitle(block)){finish();if(limit&&recipes.length>=limit)break;current=createRecipe(block.text,category,fileName,block);continue}
    if(!current)continue;current.rawBlocks.push(block);
    const foundSection=cuadernitoSection(block.text);if(foundSection){section=foundSection;mode=foundSection==='Procedimiento'?'steps':foundSection==='Observaciones'?'observations':'ingredients';continue}
    const temperature=block.text.match(/(\d{2,3})\s*°?\s*([cf])\b/i);if(temperature){current.temperature={value:Number(temperature[1]),unit:temperature[2].toUpperCase(),notes:block.rawText};}
    const time=block.text.match(/(?:tiempo|duraci[oó]n|reposo|horno)\s*:?\s*(\d+)\s*(?:min|minutos?)/i);if(time)current.totalTimeMinutes=Number(time[1]);
    const recipeYield=block.text.match(/rendimiento\s*:?\s*(\d+(?:[.,]\d+)?)?\s*(.*)/i);if(recipeYield){current.yield.quantity=recipeYield[1]?Number(recipeYield[1].replace(',','.')):undefined;current.yield.unit=recipeYield[2]?.trim()||'';continue}
    if(mode==='ingredients'&&isCuadernitoList(block)){current.ingredients.push(parseIngredient(block,section));continue}
    if(mode==='steps'||ACTION.test(block.text)){current.steps.push({id:id('step'),order:current.steps.length+1,instruction:block.text,rawText:block.rawText,section:section||undefined,notes:''});continue}
    if(mode==='observations'){current.notes.push(block.text);continue}
    current.uninterpretedBlocks.push(block);current.notes.push(block.text);
  }
  finish();return recipes;
}
