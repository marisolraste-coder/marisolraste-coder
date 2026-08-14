export const RESOURCE_POLICIES=Object.freeze({
  recipes:Object.freeze({view:Object.freeze(['admin']),import:Object.freeze(['admin'])}),
  masterFormulas:Object.freeze({view:Object.freeze(['admin']),manage:Object.freeze(['admin'])}),
  administration:Object.freeze({users:Object.freeze(['admin']),devices:Object.freeze(['admin']),audit:Object.freeze(['admin'])}),
  finance:Object.freeze({view:Object.freeze(['admin'])}),
  operationalRecipes:Object.freeze({view:Object.freeze(['production'])})
});
export function can(user,resource,action='view'){
  if(!user)return false;
  return RESOURCE_POLICIES[resource]?.[action]?.includes(user.role)===true;
}
