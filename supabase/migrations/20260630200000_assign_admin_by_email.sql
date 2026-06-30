-- Enforce the sole administrator account.
-- The Auth user must already exist; passwords are managed by Supabase Auth and
-- must never be stored in SQL migrations or frontend source code.

do $$
declare
  v_admin_email constant text := 'admin@allahhuautos.pk';
  v_admin_user_id uuid;
begin
  select id
    into v_admin_user_id
  from auth.users
  where lower(email) = lower(v_admin_email)
  limit 1;

  if v_admin_user_id is null then
    raise exception 'No Supabase Auth user exists for email: %', v_admin_email;
  end if;

  delete from public.user_roles
  where role = 'admin'
    and user_id <> v_admin_user_id;

  insert into public.user_roles (user_id, role)
  values (v_admin_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  raise notice 'Administrator access granted to %', v_admin_email;
end
$$;

-- Verification: the selected account should show the admin role.
select
  u.email,
  ur.role
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where ur.role = 'admin'
order by u.email;
