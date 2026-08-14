-- Le Miski OS — private recipe library, delivery 1
-- Test data only. Master formula payloads never receive direct browser grants.

create extension if not exists unaccent;

create table le_miski_private.recipe_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table le_miski_private.recipes (
  id uuid primary key default gen_random_uuid(),
  internal_code text not null unique,
  name text not null,
  normalized_name text not null,
  category_id uuid not null references le_miski_private.recipe_categories(id),
  status text not null default 'DRAFT' check (status in ('DRAFT','REVIEWED','APPROVED','ARCHIVED')),
  current_version_number integer not null default 1 check (current_version_number > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, category_id)
);

create table le_miski_private.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references le_miski_private.recipes(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  status text not null default 'DRAFT' check (status in ('DRAFT','REVIEWED','APPROVED','ARCHIVED')),
  description text,
  yield_quantity numeric(18,6),
  yield_unit text,
  total_time_minutes integer check (total_time_minutes is null or total_time_minutes >= 0),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL','DOCX','DEMO')),
  source_file_name text,
  formula_payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  approved_at timestamptz,
  unique (recipe_id, version_number)
);

alter table le_miski_private.recipe_categories enable row level security;
alter table le_miski_private.recipes enable row level security;
alter table le_miski_private.recipe_versions enable row level security;
revoke all on all tables in schema le_miski_private from public, anon, authenticated;

create or replace function public.recipe_library_list(search_text text default '', category_text text default '')
returns table(id uuid, internal_code text, name text, category text, status text, version_number integer, yield_text text, estimated_minutes integer, updated_at timestamptz)
language plpgsql stable security definer
set search_path = public, le_miski_private
as $$
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  return query
  select r.id,r.internal_code,r.name,c.name,r.status,r.current_version_number,
    concat_ws(' ',trim(trailing '.' from trim(trailing '0' from v.yield_quantity::text)),v.yield_unit),
    coalesce(v.total_time_minutes,0),r.updated_at
  from le_miski_private.recipes r
  join le_miski_private.recipe_categories c on c.id=r.category_id
  join le_miski_private.recipe_versions v on v.recipe_id=r.id and v.version_number=r.current_version_number
  where (coalesce(search_text,'')='' or r.name ilike '%'||search_text||'%' or c.name ilike '%'||search_text||'%')
    and (coalesce(category_text,'')='' or c.name=category_text)
    and r.status<>'ARCHIVED'
  order by r.updated_at desc,r.name;
end $$;

create or replace function public.recipe_private_detail(recipe_uuid uuid)
returns jsonb language plpgsql stable security definer
set search_path = public, le_miski_private
as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  select jsonb_build_object('id',r.id,'internalCode',r.internal_code,'name',r.name,'category',c.name,'status',r.status,
    'versionNumber',v.version_number,'description',v.description,'yield',jsonb_build_object('quantity',v.yield_quantity,'unit',v.yield_unit),
    'totalTimeMinutes',v.total_time_minutes,'sourceType',v.source_type,'sourceFileName',v.source_file_name,
    'ingredients',coalesce(v.formula_payload->'ingredients','[]'::jsonb),'steps',coalesce(v.formula_payload->'steps','[]'::jsonb),
    'temperature',v.formula_payload->'temperature','criticalPoints',coalesce(v.formula_payload->'criticalPoints','[]'::jsonb),
    'createdAt',v.created_at,'reviewedAt',v.reviewed_at,'approvedAt',v.approved_at)
  into result from le_miski_private.recipes r join le_miski_private.recipe_categories c on c.id=r.category_id
  join le_miski_private.recipe_versions v on v.recipe_id=r.id and v.version_number=r.current_version_number where r.id=recipe_uuid;
  return result;
end $$;

create or replace function public.recipe_save_draft(recipe_data jsonb)
returns uuid language plpgsql security definer
set search_path = public, le_miski_private
as $$
declare category_uuid uuid; recipe_uuid uuid; next_version integer; normalized text; code text;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  if nullif(trim(recipe_data->>'name'),'') is null then raise exception 'Recipe name required'; end if;
  normalized:=lower(regexp_replace(unaccent(trim(recipe_data->>'name')),'[^a-zA-Z0-9]+','-','g'));
  code:=coalesce(nullif(recipe_data->>'internalCode',''),'LM-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)));
  insert into le_miski_private.recipe_categories(name,slug) values(coalesce(nullif(trim(recipe_data->>'category'),''),'Sin categoría'),lower(regexp_replace(unaccent(coalesce(nullif(trim(recipe_data->>'category'),''),'Sin categoría')),'[^a-zA-Z0-9]+','-','g')))
    on conflict(name) do update set name=excluded.name returning id into category_uuid;
  if nullif(recipe_data->>'id','') is not null then recipe_uuid:=(recipe_data->>'id')::uuid; end if;
  if recipe_uuid is null then
    insert into le_miski_private.recipes(internal_code,name,normalized_name,category_id,created_by) values(code,trim(recipe_data->>'name'),normalized,category_uuid,auth.uid()) returning id into recipe_uuid;
    next_version:=1;
  else
    select coalesce(max(version_number),0)+1 into next_version from le_miski_private.recipe_versions where recipe_id=recipe_uuid;
    update le_miski_private.recipes set name=trim(recipe_data->>'name'),normalized_name=normalized,category_id=category_uuid,status='DRAFT',current_version_number=next_version,updated_at=now() where id=recipe_uuid;
  end if;
  insert into le_miski_private.recipe_versions(recipe_id,version_number,status,description,yield_quantity,yield_unit,total_time_minutes,source_type,source_file_name,formula_payload,created_by)
  values(recipe_uuid,next_version,'DRAFT',recipe_data->>'description',nullif(recipe_data#>>'{yield,quantity}','')::numeric,recipe_data#>>'{yield,unit}',nullif(recipe_data->>'totalTimeMinutes','')::integer,
    case when recipe_data#>>'{source,type}'='docx' then 'DOCX' else 'MANUAL' end,recipe_data#>>'{source,fileName}',
    jsonb_build_object('ingredients',coalesce(recipe_data->'ingredients','[]'::jsonb),'steps',coalesce(recipe_data->'steps','[]'::jsonb),'temperature',recipe_data->'temperature','criticalPoints',coalesce(recipe_data->'criticalPoints','[]'::jsonb),'rawText',recipe_data->'rawText'),auth.uid());
  return recipe_uuid;
end $$;

create or replace function public.recipe_set_status(recipe_uuid uuid, target_status text)
returns void language plpgsql security definer set search_path=public,le_miski_private as $$
declare version_no integer;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  if target_status not in ('REVIEWED','APPROVED','ARCHIVED') then raise exception 'Invalid status'; end if;
  select current_version_number into version_no from le_miski_private.recipes where id=recipe_uuid for update;
  update le_miski_private.recipes set status=target_status,updated_at=now() where id=recipe_uuid;
  update le_miski_private.recipe_versions set status=target_status,
    reviewed_by=case when target_status in ('REVIEWED','APPROVED') then auth.uid() else reviewed_by end,
    reviewed_at=case when target_status in ('REVIEWED','APPROVED') then now() else reviewed_at end,
    approved_by=case when target_status='APPROVED' then auth.uid() else approved_by end,
    approved_at=case when target_status='APPROVED' then now() else approved_at end
  where recipe_id=recipe_uuid and version_number=version_no;
end $$;

revoke all on function public.recipe_library_list(text,text) from public,anon;
revoke all on function public.recipe_private_detail(uuid) from public,anon;
revoke all on function public.recipe_save_draft(jsonb) from public,anon;
revoke all on function public.recipe_set_status(uuid,text) from public,anon;
grant execute on function public.recipe_library_list(text,text),public.recipe_private_detail(uuid),public.recipe_save_draft(jsonb),public.recipe_set_status(uuid,text) to authenticated;

-- Demonstration-only metadata and empty formulas.
select set_config('request.jwt.claim.sub','6c7a8942-8248-4abb-ac51-6f2ae71e1824',true);
select public.recipe_save_draft('{"name":"Brownie de demostración","category":"Brownies","description":"Ficha privada de prueba, sin fórmula real.","yield":{"quantity":24,"unit":"unidades"},"totalTimeMinutes":75,"ingredients":[],"steps":[],"source":{"type":"manual"}}'::jsonb);
select public.recipe_save_draft('{"name":"Ganache de demostración","category":"Rellenos","description":"Ficha privada de prueba, sin fórmula real.","yield":{"quantity":1,"unit":"kg"},"totalTimeMinutes":35,"ingredients":[],"steps":[],"source":{"type":"manual"}}'::jsonb);
select set_config('request.jwt.claim.sub','',true);
