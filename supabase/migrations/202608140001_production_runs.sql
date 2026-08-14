begin;

create table if not exists le_miski_inventory.production_runs (
  id uuid primary key default gen_random_uuid(),
  production_order_id uuid not null references le_miski_inventory.production_orders(id) on delete restrict,
  run_number integer not null check (run_number > 0),
  status text not null check (status in ('SCHEDULED','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED')),
  actual_quantity numeric,
  started_at timestamptz,
  paused_at timestamptz,
  finished_at timestamptz,
  observations text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (production_order_id, run_number)
);

alter table le_miski_inventory.production_orders
  add column if not exists current_run_id uuid;
alter table le_miski_inventory.movements
  add column if not exists production_run_id uuid;
alter table le_miski_inventory.production_order_events
  add column if not exists production_run_id uuid;

do $backfill$
declare
  v_order record;
  v_boundary timestamptz;
  v_has_legacy boolean;
  v_legacy_run_id uuid;
  v_current_run_id uuid;
  v_current_number integer;
begin
  for v_order in
    select po.*
    from le_miski_inventory.production_orders po
    where po.current_run_id is null
    order by po.created_at, po.id
  loop
    select min(e.occurred_at)
      into v_boundary
    from le_miski_inventory.production_order_events e
    where e.production_order_id = v_order.id;

    v_boundary := coalesce(v_boundary, v_order.started_at, v_order.created_at, now());

    select exists (
      select 1
      from le_miski_inventory.movements m
      where m.production_order_id = v_order.id
        and m.occurred_at < v_boundary
    ) into v_has_legacy;

    if v_has_legacy then
      insert into le_miski_inventory.production_runs (
        production_order_id, run_number, status, started_at, finished_at,
        observations, created_by, created_at
      )
      select
        v_order.id, 1, 'COMPLETED', min(m.occurred_at), max(m.occurred_at),
        'Ejecución histórica preservada durante la migración a production_run_id.',
        v_order.created_by, min(m.occurred_at)
      from le_miski_inventory.movements m
      where m.production_order_id = v_order.id
        and m.occurred_at < v_boundary
      returning id into v_legacy_run_id;

      update le_miski_inventory.movements m
      set production_run_id = v_legacy_run_id
      where m.production_order_id = v_order.id
        and m.occurred_at < v_boundary
        and m.production_run_id is null;

      v_current_number := 2;
    else
      v_current_number := 1;
    end if;

    insert into le_miski_inventory.production_runs (
      production_order_id, run_number, status, actual_quantity,
      started_at, paused_at, finished_at, observations, created_by, created_at
    ) values (
      v_order.id, v_current_number, v_order.status, v_order.actual_quantity,
      v_order.started_at, v_order.paused_at, v_order.finished_at,
      v_order.observations, v_order.created_by, v_boundary
    ) returning id into v_current_run_id;

    update le_miski_inventory.movements m
    set production_run_id = v_current_run_id
    where m.production_order_id = v_order.id
      and m.production_run_id is null;

    update le_miski_inventory.production_order_events e
    set production_run_id = v_current_run_id
    where e.production_order_id = v_order.id
      and e.production_run_id is null;

    update le_miski_inventory.production_orders po
    set current_run_id = v_current_run_id
    where po.id = v_order.id;
  end loop;
end
$backfill$;

alter table le_miski_inventory.production_orders
  drop constraint if exists production_orders_current_run_id_fkey;
alter table le_miski_inventory.production_orders
  add constraint production_orders_current_run_id_fkey
  foreign key (current_run_id) references le_miski_inventory.production_runs(id) on delete restrict;

alter table le_miski_inventory.production_order_events
  drop constraint if exists production_order_events_production_run_id_fkey;
alter table le_miski_inventory.production_order_events
  add constraint production_order_events_production_run_id_fkey
  foreign key (production_run_id) references le_miski_inventory.production_runs(id) on delete restrict;

alter table le_miski_inventory.movements
  drop constraint if exists movements_production_run_id_fkey;
alter table le_miski_inventory.movements
  add constraint movements_production_run_id_fkey
  foreign key (production_run_id) references le_miski_inventory.production_runs(id) on delete restrict;

create index if not exists production_runs_order_idx
  on le_miski_inventory.production_runs(production_order_id, run_number desc);
create index if not exists movements_run_idx
  on le_miski_inventory.movements(production_run_id, item_id, occurred_at);
create index if not exists production_order_events_run_idx
  on le_miski_inventory.production_order_events(production_run_id, occurred_at);

create or replace function public.inventory_register_movement(
  item_uuid uuid,
  movement_kind text,
  quantity numeric,
  production_order_uuid uuid default null,
  origin_reference_text text default null,
  notes_text text default null
) returns uuid
language plpgsql
security definer
set search_path = public, le_miski_inventory, le_miski_private
as $function$
declare
  v_new_id uuid;
  v_item le_miski_inventory.items%rowtype;
  v_order le_miski_inventory.production_orders%rowtype;
  v_run_id uuid;
  v_signed_quantity numeric;
begin
  if not public.is_admin() then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if movement_kind not in ('PURCHASE', 'CONSUMPTION', 'WASTE') then
    raise exception 'Movement type not allowed in this delivery';
  end if;
  if quantity is null or quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  select * into v_item
  from le_miski_inventory.items i
  where i.id = item_uuid and i.is_active;
  if not found then raise exception 'Inventory item not found'; end if;

  if movement_kind in ('CONSUMPTION', 'WASTE') then
    if production_order_uuid is null then raise exception 'Production order required'; end if;
    select * into v_order
    from le_miski_inventory.production_orders po
    where po.id = production_order_uuid and po.status <> 'CANCELLED';
    if not found then raise exception 'Production order not found'; end if;
    v_run_id := v_order.current_run_id;
    if v_run_id is null then raise exception 'Active production run required'; end if;
    if not exists (
      select 1 from le_miski_inventory.production_runs r
      where r.id = v_run_id and r.production_order_id = v_order.id
        and r.status in ('IN_PROGRESS','PAUSED')
    ) then raise exception 'Consumption requires an active production run'; end if;
    if not exists (
      select 1 from le_miski_private.recipe_versions rv
      where rv.id = v_order.recipe_version_id and rv.recipe_id = v_order.recipe_id
        and rv.version_number = v_order.recipe_version_number and rv.status = 'APPROVED'
    ) then raise exception 'Consumption requires an approved recipe version'; end if;
  end if;

  v_signed_quantity := case when movement_kind in ('CONSUMPTION','WASTE')
    then -abs(quantity) else abs(quantity) end;

  insert into le_miski_inventory.movements (
    item_id, movement_type, quantity_delta, unit, production_order_id,
    production_run_id, recipe_id, recipe_version_id, recipe_version_number,
    origin_type, origin_reference, notes, recorded_by
  ) values (
    v_item.id, movement_kind, v_signed_quantity, v_item.unit,
    case when movement_kind='PURCHASE' then null else v_order.id end,
    v_run_id,
    case when movement_kind='PURCHASE' then null else v_order.recipe_id end,
    case when movement_kind='PURCHASE' then null else v_order.recipe_version_id end,
    case when movement_kind='PURCHASE' then null else v_order.recipe_version_number end,
    case when movement_kind='PURCHASE' then 'PURCHASE' else 'PRODUCTION_ORDER' end,
    origin_reference_text, notes_text, auth.uid()
  ) returning id into v_new_id;

  insert into public.audit_events(actor_user_id,action,resource_type,resource_id,outcome,metadata)
  values (auth.uid(),'inventory.movement.created','inventory_movement',v_new_id,'ALLOWED',
    jsonb_build_object('movement_type',movement_kind,'item_id',item_uuid,
      'production_order_id',production_order_uuid,'production_run_id',v_run_id));
  return v_new_id;
end;
$function$;

create or replace function public.inventory_consumption_variance(target_production_order_id uuid)
returns table(
  item_id uuid, item_name text, unit text, theoretical_quantity numeric,
  actual_consumption numeric, waste_quantity numeric, total_real_quantity numeric,
  variance_quantity numeric, variance_percentage numeric
)
language plpgsql stable security definer
set search_path = public, le_miski_inventory
as $function$
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  return query
  with selected_order as (
    select po.recipe_version_id, po.current_run_id
    from le_miski_inventory.production_orders po
    where po.id = target_production_order_id
  ), actual as (
    select m.item_id,
      sum(case when m.movement_type='CONSUMPTION' then abs(m.quantity_delta) else 0 end) consumed,
      sum(case when m.movement_type='WASTE' then abs(m.quantity_delta) else 0 end) wasted
    from le_miski_inventory.movements m
    join selected_order so on so.current_run_id = m.production_run_id
    group by m.item_id
  )
  select rr.item_id, i.name, rr.unit, rr.theoretical_quantity,
    coalesce(a.consumed,0), coalesce(a.wasted,0),
    coalesce(a.consumed,0)+coalesce(a.wasted,0),
    coalesce(a.consumed,0)+coalesce(a.wasted,0)-rr.theoretical_quantity,
    case when rr.theoretical_quantity=0 then 0 else round(
      (coalesce(a.consumed,0)+coalesce(a.wasted,0)-rr.theoretical_quantity)
      / rr.theoretical_quantity*100,2) end
  from selected_order so
  join le_miski_inventory.recipe_requirements rr on rr.recipe_version_id=so.recipe_version_id
  join le_miski_inventory.items i on i.id=rr.item_id
  left join actual a on a.item_id=rr.item_id
  order by i.name;
end;
$function$;

create or replace function public.production_order_detail(target_production_order_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = public, le_miski_inventory, le_miski_private
as $function$
declare v_result jsonb;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  select jsonb_build_object(
    'id',po.id,'code',po.code,'status',r.status,
    'productionRunId',r.id,'runNumber',r.run_number,
    'recipeId',recipe.id,'recipeName',recipe.name,
    'recipeVersionNumber',po.recipe_version_number,
    'plannedQuantity',po.planned_quantity,'actualQuantity',r.actual_quantity,
    'yieldUnit',po.yield_unit,'responsibleName',profile.display_name,
    'startedAt',r.started_at,'pausedAt',r.paused_at,'finishedAt',r.finished_at,
    'observations',r.observations,
    'requirements',coalesce((select jsonb_agg(jsonb_build_object(
      'itemId',i.id,'itemName',i.name,'unit',rr.unit,
      'theoreticalQuantity',rr.theoretical_quantity) order by i.name)
      from le_miski_inventory.recipe_requirements rr
      join le_miski_inventory.items i on i.id=rr.item_id
      where rr.recipe_version_id=po.recipe_version_id),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(jsonb_build_object(
      'id',e.id,'eventType',e.event_type,'previousStatus',e.previous_status,
      'newStatus',e.new_status,'notes',e.notes,'metadata',e.metadata,
      'actorName',coalesce(ap.display_name,'Usuario administrativo'),
      'occurredAt',e.occurred_at) order by e.occurred_at desc)
      from le_miski_inventory.production_order_events e
      left join public.profiles ap on ap.id=e.actor_user_id
      where e.production_run_id=r.id),'[]'::jsonb)
  ) into v_result
  from le_miski_inventory.production_orders po
  join le_miski_inventory.production_runs r on r.id=po.current_run_id
  join le_miski_private.recipes recipe on recipe.id=po.recipe_id
  left join public.profiles profile on profile.id=po.responsible_user_id
  where po.id=target_production_order_id;
  if v_result is null then raise exception 'Production order not found'; end if;
  return v_result;
end;
$function$;

create or replace function public.production_order_register_usage(
  target_production_order_id uuid, target_item_id uuid, usage_type text,
  quantity numeric, notes_text text default null
) returns uuid language plpgsql security definer
set search_path = public, le_miski_inventory, le_miski_private
as $function$
declare
  v_order le_miski_inventory.production_orders%rowtype;
  v_movement_id uuid;
  v_event_name text;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  if usage_type not in ('CONSUMPTION','WASTE') then raise exception 'Only consumption or waste can be registered'; end if;
  if quantity is null or quantity<=0 then raise exception 'Quantity must be greater than zero'; end if;
  select * into v_order from le_miski_inventory.production_orders po
  where po.id=target_production_order_id;
  if not found then raise exception 'Production order not found'; end if;
  if v_order.status not in ('IN_PROGRESS','PAUSED') then
    raise exception 'Usage can only be registered for an active or paused order';
  end if;
  select public.inventory_register_movement(target_item_id,usage_type,quantity,
    target_production_order_id,v_order.code,notes_text) into v_movement_id;
  v_event_name := case when usage_type='WASTE' then 'WASTE_RECORDED' else 'CONSUMPTION_RECORDED' end;
  insert into le_miski_inventory.production_order_events(
    production_order_id,production_run_id,event_type,previous_status,new_status,
    notes,metadata,actor_user_id
  ) values (
    target_production_order_id,v_order.current_run_id,v_event_name,v_order.status,
    v_order.status,nullif(trim(notes_text),''),jsonb_build_object(
      'movement_id',v_movement_id,'item_id',target_item_id,'quantity',quantity,
      'production_run_id',v_order.current_run_id),auth.uid()
  );
  return v_movement_id;
end;
$function$;

create or replace function public.production_order_transition(
  target_production_order_id uuid, target_action text,
  actual_produced_quantity numeric default null, observation_text text default null
) returns void language plpgsql security definer
set search_path = public, le_miski_inventory, le_miski_private
as $function$
declare
  v_order le_miski_inventory.production_orders%rowtype;
  v_run le_miski_inventory.production_runs%rowtype;
  v_next_status text;
  v_event_name text;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  select * into v_order from le_miski_inventory.production_orders po
  where po.id=target_production_order_id for update;
  if not found or v_order.current_run_id is null then raise exception 'Production order or active run not found'; end if;
  select * into v_run from le_miski_inventory.production_runs r
  where r.id=v_order.current_run_id and r.production_order_id=v_order.id for update;
  if not found then raise exception 'Active production run not found'; end if;
  if not exists (select 1 from le_miski_private.recipe_versions rv
    where rv.id=v_order.recipe_version_id and rv.recipe_id=v_order.recipe_id
      and rv.version_number=v_order.recipe_version_number and rv.status='APPROVED')
  then raise exception 'Only approved recipe versions can be executed'; end if;

  case target_action
  when 'START' then
    if v_run.status<>'SCHEDULED' then raise exception 'Only scheduled runs can start'; end if;
    v_next_status:='IN_PROGRESS'; v_event_name:='STARTED';
    update le_miski_inventory.production_runs set status=v_next_status,
      started_at=coalesce(started_at,now()),paused_at=null where id=v_run.id;
  when 'PAUSE' then
    if v_run.status<>'IN_PROGRESS' then raise exception 'Only active runs can pause'; end if;
    v_next_status:='PAUSED'; v_event_name:='PAUSED';
    update le_miski_inventory.production_runs set status=v_next_status,paused_at=now() where id=v_run.id;
  when 'RESUME' then
    if v_run.status<>'PAUSED' then raise exception 'Only paused runs can resume'; end if;
    v_next_status:='IN_PROGRESS'; v_event_name:='RESUMED';
    update le_miski_inventory.production_runs set status=v_next_status,paused_at=null where id=v_run.id;
  when 'FINISH' then
    if v_run.status not in ('IN_PROGRESS','PAUSED') then raise exception 'Only active or paused runs can finish'; end if;
    if actual_produced_quantity is null or actual_produced_quantity<0 then raise exception 'Actual produced quantity is required'; end if;
    v_next_status:='COMPLETED'; v_event_name:='FINISHED';
    update le_miski_inventory.production_runs set status=v_next_status,
      actual_quantity=actual_produced_quantity,finished_at=now(),paused_at=null,
      observations=coalesce(nullif(trim(observation_text),''),observations) where id=v_run.id;
  when 'CANCEL' then
    if v_run.status in ('COMPLETED','CANCELLED') then raise exception 'Completed or cancelled runs cannot be cancelled'; end if;
    v_next_status:='CANCELLED'; v_event_name:='CANCELLED';
    update le_miski_inventory.production_runs set status=v_next_status,finished_at=now(),
      observations=coalesce(nullif(trim(observation_text),''),observations) where id=v_run.id;
  else raise exception 'Invalid production order action';
  end case;

  update le_miski_inventory.production_orders set status=v_next_status,
    started_at=(select r.started_at from le_miski_inventory.production_runs r where r.id=v_run.id),
    paused_at=(select r.paused_at from le_miski_inventory.production_runs r where r.id=v_run.id),
    finished_at=(select r.finished_at from le_miski_inventory.production_runs r where r.id=v_run.id),
    actual_quantity=(select r.actual_quantity from le_miski_inventory.production_runs r where r.id=v_run.id),
    observations=(select r.observations from le_miski_inventory.production_runs r where r.id=v_run.id),
    updated_at=now() where id=v_order.id;

  insert into le_miski_inventory.production_order_events(
    production_order_id,production_run_id,event_type,previous_status,new_status,
    notes,metadata,actor_user_id
  ) values (v_order.id,v_run.id,v_event_name,v_run.status,v_next_status,
    nullif(trim(observation_text),''),case when target_action='FINISH' then
      jsonb_build_object('actual_produced_quantity',actual_produced_quantity,'production_run_id',v_run.id)
      else jsonb_build_object('production_run_id',v_run.id) end,auth.uid());

  insert into public.audit_events(actor_user_id,action,resource_type,resource_id,outcome,metadata)
  values(auth.uid(),'production_order.'||lower(target_action),'production_run',v_run.id,'ALLOWED',
    jsonb_build_object('production_order_id',v_order.id,'run_number',v_run.run_number,
      'previous_status',v_run.status,'new_status',v_next_status,
      'recipe_version_number',v_order.recipe_version_number));
end;
$function$;

create or replace function public.production_order_start_new_run(target_production_order_id uuid)
returns uuid language plpgsql security definer
set search_path = public, le_miski_inventory
as $function$
declare
  v_order le_miski_inventory.production_orders%rowtype;
  v_run_id uuid;
  v_run_number integer;
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  select * into v_order from le_miski_inventory.production_orders po
  where po.id=target_production_order_id for update;
  if not found then raise exception 'Production order not found'; end if;
  select coalesce(max(r.run_number),0)+1 into v_run_number
  from le_miski_inventory.production_runs r where r.production_order_id=v_order.id;
  insert into le_miski_inventory.production_runs(
    production_order_id,run_number,status,created_by,created_at
  ) values(v_order.id,v_run_number,'SCHEDULED',auth.uid(),now()) returning id into v_run_id;
  update le_miski_inventory.production_orders set current_run_id=v_run_id,status='SCHEDULED',
    actual_quantity=null,started_at=null,paused_at=null,finished_at=null,
    observations=null,updated_at=now() where id=v_order.id;
  insert into le_miski_inventory.production_order_events(
    production_order_id,production_run_id,event_type,previous_status,new_status,
    notes,metadata,actor_user_id
  ) values(v_order.id,v_run_id,'CREATED',null,'SCHEDULED',
    'Nueva ejecución creada sin alterar el historial anterior.',
    jsonb_build_object('run_number',v_run_number,'production_run_id',v_run_id),auth.uid());
  return v_run_id;
end;
$function$;

grant execute on function public.production_order_start_new_run(uuid) to authenticated;
grant execute on function public.inventory_consumption_variance(uuid) to authenticated;
grant execute on function public.production_order_detail(uuid) to authenticated;
grant execute on function public.production_order_register_usage(uuid,uuid,text,numeric,text) to authenticated;
grant execute on function public.production_order_transition(uuid,text,numeric,text) to authenticated;

commit;
