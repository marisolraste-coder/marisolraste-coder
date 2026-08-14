import {supabase} from '../auth/supabase-auth.js?v=17';

let recipes=[];
let loaded=false;
let loading=false;
const details=new Map();
const photo='../amour-pistache.jpeg';

const metadata=row=>({id:row.id,internalCode:row.internal_code,name:row.name,category:row.category,status:row.status,versionNumber:row.version_number,yield:row.yield_text||'Por revisar',estimatedMinutes:row.estimated_minutes||0,updatedAt:row.updated_at,photo,isPrivate:true,accessLevel:'admin'});
const historyEntry=row=>({versionNumber:row.version_number,status:row.status,authorName:row.author_name,createdAt:row.created_at,reviewerName:row.reviewer_name,reviewedAt:row.reviewed_at,approverName:row.approver_name,approvedAt:row.approved_at});
const normalizedDetail=(data,summary,history)=>({...summary,...data,yieldDetails:data.yield,yield:[data.yield?.quantity,data.yield?.unit].filter(value=>value!==undefined&&value!==null&&value!=='').join(' ')||summary?.yield||'Por revisar',estimatedMinutes:data.totalTimeMinutes??summary?.estimatedMinutes??0,history:(history||[]).map(historyEntry),photo,isPrivate:true,accessLevel:'admin'});

export const recipeRepository=Object.freeze({
  get loaded(){return loaded},
  get loading(){return loading},
  async load(){
    loading=true;
    try{const {data,error}=await supabase.rpc('recipe_library_list',{search_text:'',category_text:''});if(error)throw error;recipes=(data||[]).map(metadata);loaded=true;return recipes}
    finally{loading=false}
  },
  list({search='',category=''}={}){const query=search.trim().toLocaleLowerCase('es');return recipes.filter(recipe=>(!category||recipe.category===category)&&(!query||`${recipe.name} ${recipe.category}`.toLocaleLowerCase('es').includes(query)))},
  categories(){return [...new Set(recipes.map(recipe=>recipe.category))].sort((a,b)=>a.localeCompare(b,'es'))},
  getById(id){return details.get(id)||recipes.find(recipe=>recipe.id===id)||null},
  isSessionRecipe(){return false},
  isPrivateDetail(id){return details.has(id)},
  async loadDetail(id){const [detailResult,historyResult]=await Promise.all([supabase.rpc('recipe_private_detail',{recipe_uuid:id}),supabase.rpc('recipe_version_history',{recipe_uuid:id})]);if(detailResult.error)throw detailResult.error;if(historyResult.error)throw historyResult.error;const detail=normalizedDetail(detailResult.data,recipes.find(recipe=>recipe.id===id),historyResult.data);details.set(id,detail);return detail},
  async saveDrafts(items){const ids=[];for(const recipe of items){const structuredRecipe=recipe.yieldDetails?{...recipe,yield:recipe.yieldDetails}:recipe;const payload=recipes.some(item=>item.id===recipe.id)?structuredRecipe:{...structuredRecipe,id:undefined};const {data,error}=await supabase.rpc('recipe_save_draft',{recipe_data:payload});if(error)throw error;ids.push(data)}await this.load();await Promise.all(ids.map(id=>this.loadDetail(id)));return ids},
  async setStatus(id,status){const {error}=await supabase.rpc('recipe_set_status',{recipe_uuid:id,target_status:status});if(error)throw error;details.delete(id);await this.load();await this.loadDetail(id)}
});
