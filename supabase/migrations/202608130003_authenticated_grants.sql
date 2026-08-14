-- Le Miski OS — authenticated API grants
-- PostgreSQL grants allow requests to reach RLS; policies remain authoritative.

revoke all on all tables in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table
  public.departments,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.profiles,
  public.devices,
  public.device_permissions,
  public.user_devices,
  public.production_order_assignments,
  public.attendance_pin_credentials,
  public.attendance_events,
  public.audit_events,
  public.operational_recipes
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

revoke execute on function public.current_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_permission(text) from public, anon;
revoke execute on function public.is_authorized_device(uuid, public.device_type) from public, anon;

grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_authorized_device(uuid, public.device_type) to authenticated;

