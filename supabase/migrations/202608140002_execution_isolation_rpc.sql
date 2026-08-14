begin;

create or replace function public.production_run_consumption_variance(target_production_run_id uuid)
returns table(item_id uuid,item_name text,unit text,theoretical_quantity numeric,actual_consumption numeric,waste_quantity numeric,total_real_quantity numeric,variance_quantity numeric,variance_percentage numeric)
language plpgsql stable security definer
set search_path = public, le_miski_inventory
as $function$
begin
  if not public.is_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  return query
  with selected_run as (
    select r.id run_id,po.recipe_version_id
    from le_miski_inventory.production_runs r
    join le_miski_inventory.production_orders po on po.id=r.production_order_id
    where r.id=target_production_run_id
  ), actual as (
    select m.item_id,
      sum(case when m.movement_type='CONSUMPTION' then abs(m.quantity_delta) else 0 end) consumed,
      sum(case when m.movement_type='WASTE' then abs(m.quantity_delta) else 0 end) wasted
    from le_miski_inventory.movements m
    where m.production_run_id=target_production_run_id
    group by m.item_id
  )
  select rr.item_id,i.name,rr.unit,rr.theoretical_quantity,
    coalesce(a.consumed,0),coalesce(a.wasted,0),
    coalesce(a.consumed,0)+coalesce(a.wasted,0),
    coalesce(a.consumed,0)+coalesce(a.wasted,0)-rr.theoretical_quantity,
    case when rr.theoretical_quantity=0 then 0 else round(
      (coalesce(a.consumed,0)+coalesce(a.wasted,0)-rr.theoretical_quantity)
      /rr.theoretical_quantity*100,2) end
  from selected_run sr
  join le_miski_inventory.recipe_requirements rr on rr.recipe_version_id=sr.recipe_version_id
  join le_miski_inventory.items i on i.id=rr.item_id
  left join actual a on a.item_id=rr.item_id
  order by i.name;
end;
$function$;

grant execute on function public.production_run_consumption_variance(uuid) to authenticated;

commit;
