-- Le Miski OS — security foundation
-- No real recipes or credentials. Safe to run more than once only on a fresh project.

create extension if not exists pgcrypto;
create schema if not exists le_miski_private;

create type public.system_role as enum ('ADMIN', 'PRODUCTION');
create type public.device_type as enum ('PERSONAL', 'WORKSHOP_TABLET', 'ADMIN_DEVICE');
create type public.device_status as enum ('PENDING', 'AUTHORIZED', 'REVOKED');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code public.system_role not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null,
  department_id uuid not null references public.departments(id),
  role_id uuid not null references public.roles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  fingerprint_hash text not null unique,
  label text not null,
  type public.device_type not null,
  status public.device_status not null default 'PENDING',
  registered_by uuid references public.profiles(id),
  authorized_by uuid references public.profiles(id),
  registered_at timestamptz not null default now(),
  authorized_at timestamptz,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  check ((status = 'AUTHORIZED') = (authorized_at is not null) or status = 'REVOKED')
);

create table public.device_permissions (
  device_id uuid not null references public.devices(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted_by uuid not null references public.profiles(id),
  granted_at timestamptz not null default now(),
  primary key (device_id, permission_id)
);

create table public.user_devices (
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  linked_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

create table public.production_order_assignments (
  production_order_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id),
  primary key (production_order_id, user_id)
);

create table public.attendance_pin_credentials (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  pin_hash text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  device_id uuid not null references public.devices(id),
  event_type text not null check (event_type in ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END')),
  occurred_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  device_id uuid references public.devices(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  outcome text not null check (outcome in ('ALLOWED', 'DENIED')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- Formula content lives outside the exposed public schema.
create table le_miski_private.master_formulas (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null,
  version_number integer not null check (version_number > 0),
  encrypted_payload jsonb not null,
  status text not null check (status in ('DRAFT', 'REVIEWED', 'APPROVED', 'ARCHIVED')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (recipe_id, version_number)
);

-- Operational recipes contain only the minimum derived data for one assigned OP.
create table public.operational_recipes (
  id uuid primary key default gen_random_uuid(),
  production_order_id uuid not null unique,
  assigned_user_id uuid not null references public.profiles(id),
  source_formula_version_id uuid not null,
  operational_payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.system_role
language sql stable security definer
set search_path = public
as $$
  select r.code
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid() and p.is_active
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select coalesce(public.current_role() = 'ADMIN', false) $$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.is_admin() or exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions pe on pe.id = rp.permission_id
    where p.id = auth.uid() and p.is_active and pe.code = permission_code
  ), false)
$$;

create or replace function public.is_authorized_device(device_uuid uuid, expected_type public.device_type default null)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.devices d
    join public.user_devices ud on ud.device_id = d.id
    where ud.user_id = auth.uid()
      and d.id = device_uuid
      and d.status = 'AUTHORIZED'
      and (expected_type is null or d.type = expected_type)
  )
$$;

revoke all on schema le_miski_private from public, anon, authenticated;
revoke all on all tables in schema le_miski_private from public, anon, authenticated;
alter default privileges in schema le_miski_private revoke all on tables from public, anon, authenticated;
alter table le_miski_private.master_formulas enable row level security;

alter table public.departments enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.device_permissions enable row level security;
alter table public.user_devices enable row level security;
alter table public.production_order_assignments enable row level security;
alter table public.attendance_pin_credentials enable row level security;
alter table public.attendance_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.operational_recipes enable row level security;

create policy "authenticated read active departments" on public.departments
for select to authenticated using (is_active);
create policy "authenticated read roles" on public.roles
for select to authenticated using (true);
create policy "admin read permissions" on public.permissions
for select to authenticated using (public.is_admin());
create policy "admin read role permissions" on public.role_permissions
for select to authenticated using (public.is_admin());

create policy "profile self read" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "admin profiles all" on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "linked device read" on public.devices
for select to authenticated using (public.is_admin() or exists (
  select 1 from public.user_devices ud where ud.device_id = id and ud.user_id = auth.uid()
));
create policy "admin devices all" on public.devices
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin device permissions all" on public.device_permissions
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "user device links read" on public.user_devices
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin user device links all" on public.user_devices
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "assignment self read" on public.production_order_assignments
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin assignments all" on public.production_order_assignments
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin attendance credentials only" on public.attendance_pin_credentials
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "attendance self read" on public.attendance_events
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin attendance all" on public.attendance_events
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin audit read" on public.audit_events
for select to authenticated using (public.is_admin());

create policy "assigned operational recipe read" on public.operational_recipes
for select to authenticated using (
  public.is_admin() or (
    assigned_user_id = auth.uid()
    and expires_at > now()
    and public.has_permission('operational_recipe.read')
  )
);
create policy "admin operational recipes all" on public.operational_recipes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.departments (code, name) values
  ('GENERAL_DIRECTION', 'Dirección General'),
  ('ADMINISTRATION', 'Administración'),
  ('PRODUCTION', 'Producción'),
  ('SALES_CUSTOMER_SERVICE', 'Ventas/Atención al Cliente'),
  ('DELIVERY_LOGISTICS', 'Reparto/Logística');

insert into public.roles (code, name) values
  ('ADMIN', 'Administrador'),
  ('PRODUCTION', 'Producción');

insert into public.permissions (code, description) values
  ('personal_schedule.read', 'Consultar jornada y horarios propios'),
  ('personal_tasks.read', 'Consultar tareas propias'),
  ('notices.read', 'Consultar avisos'),
  ('training.read', 'Consultar capacitación'),
  ('personal_profile.read', 'Consultar información personal'),
  ('production_order.assigned.read', 'Consultar OP asignadas'),
  ('operational_recipe.read', 'Consultar receta operativa derivada'),
  ('attendance.pin', 'Registrar asistencia por PIN en tablet autorizada');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.code = 'PRODUCTION';

comment on table le_miski_private.master_formulas is
  'Never exposed to browser roles. Only private server functions may derive operational recipes.';
