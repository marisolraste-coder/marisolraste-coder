-- Le Miski OS — initial authenticated identities
-- UUIDs reference Supabase Auth. Emails and passwords are intentionally absent.

insert into public.profiles (id, display_name, department_id, role_id)
select
  '6c7a8942-8248-4abb-ac51-6f2ae71e1824'::uuid,
  'Marisol Rodríguez',
  d.id,
  r.id
from public.departments d
cross join public.roles r
where d.code = 'GENERAL_DIRECTION' and r.code = 'ADMIN';

insert into public.profiles (id, display_name, department_id, role_id)
select
  '8e056874-30f7-41d8-8b58-0e2c845057ba'::uuid,
  'Usuario 1',
  d.id,
  r.id
from public.departments d
cross join public.roles r
where d.code = 'PRODUCTION' and r.code = 'PRODUCTION';

