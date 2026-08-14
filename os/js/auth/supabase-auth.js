import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://wcfflsfwhivbwnbkenva.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_OzIVIlocfWpl8CXuXQI2fw_wTzELA2q';

export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

const AREA_BY_CODE={GENERAL_DIRECTION:'general_direction',PRODUCTION:'production'};
const ROLE_BY_CODE={ADMIN:'admin',PRODUCTION:'production'};
const LOCAL_ID_BY_ROLE={ADMIN:'marisol',PRODUCTION:'user-1'};

export function toAppUser(profile){
  const roleCode=profile?.role?.code;
  const departmentCode=profile?.department?.code;
  if(!LOCAL_ID_BY_ROLE[roleCode]||!AREA_BY_CODE[departmentCode])throw new Error('Tu perfil todavía no tiene acceso a Le Miski OS.');
  return {id:LOCAL_ID_BY_ROLE[roleCode],authUserId:profile.id,name:profile.display_name,area:AREA_BY_CODE[departmentCode],role:ROLE_BY_CODE[roleCode]};
}

export async function authenticatedUser(){
  const {data:{session},error:sessionError}=await supabase.auth.getSession();
  if(sessionError)throw sessionError;
  if(!session)return null;
  const {data,error}=await supabase.from('profiles').select('id,display_name,is_active,department:departments(code,name),role:roles(code,name)').eq('id',session.user.id).single();
  if(error)throw error;
  if(!data.is_active)throw new Error('Tu acceso está pausado. Conversa con Marisol para revisarlo.');
  return toAppUser(data);
}

export async function signIn(email,password){
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error)throw error;
  return authenticatedUser();
}

export async function signOut(){
  const {error}=await supabase.auth.signOut();
  if(error)throw error;
}

export function onPasswordRecovery(callback){
  return supabase.auth.onAuthStateChange(event=>{
    if(event==='PASSWORD_RECOVERY')callback();
  }).data.subscription;
}

export async function updatePassword(password){
  const {error}=await supabase.auth.updateUser({password});
  if(error)throw error;
}

export async function requestPasswordRecovery(email){
  const redirectTo=`${location.origin}/os/`;
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
  if(error)throw error;
}
