-- Admin users page, the super admin, and a switch that lets a test database make every account an admin.
--
-- * admins.super marks the store's owner. Only a super admin adds or removes admins (set_admin).
--   A super admin row cannot be deleted or demoted by anyone, the database refuses it.
--   This migration makes nobody super: on each project, mark the owner by hand (see README).
-- * settings.every_account_is_admin is off here and must stay off in production. Turn it on only in a
--   test project, where every signed-in account then reaches the test admin (still with two-factor sign-in).
-- * admin_access() is the one place that decides admin rights. The app asks it at sign-in;
--   is_admin() and is_super_admin() add the two-factor requirement on top for every row rule.

-- ---------------------------------------------------------------- super admin
alter table public.admins add column super boolean not null default false;

create function public.protect_super_admin() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.super then
    raise exception 'super_admin_protected';
  end if;
  if tg_op = 'UPDATE' and old.super and not new.super then
    raise exception 'super_admin_protected';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger admins_protect_super before update or delete on public.admins
  for each row execute function public.protect_super_admin();

-- ---------------------------------------------------------------- per-project settings
create table public.settings (
  id boolean primary key default true check (id),
  every_account_is_admin boolean not null default false
);
insert into public.settings default values;

alter table public.settings enable row level security;
revoke all on public.settings from anon, authenticated;

-- ---------------------------------------------------------------- who is an admin
-- 'super', 'admin' or null for the signed-in account, before the two-factor step.
create function public.admin_access() returns text
language sql stable security definer set search_path = ''
as $$
  select case
    when (select auth.uid()) is null then null
    when a.super then 'super'
    when a.user_id is not null then 'admin'
    when (select s.every_account_is_admin from public.settings s) then 'admin'
  end
  from (select 1) one
  left join public.admins a on a.user_id = (select auth.uid())
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2' and public.admin_access() is not null
$$;

create function public.is_super_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2' and public.admin_access() = 'super'
$$;

-- Lets the admin show that this project gives every account admin rights.
create function public.every_account_is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select public.is_admin() and (select s.every_account_is_admin from public.settings s) $$;

-- ---------------------------------------------------------------- users page
-- Every account with what the admin needs to know. Empty for anyone who is not an admin.
create function public.admin_users(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid,
  email text,
  phone text,
  name text,
  providers jsonb,
  has_password boolean,
  confirmed boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  orders bigint,
  role text,
  total bigint
)
language sql stable security definer set search_path = ''
as $$
  select
    u.id,
    u.email::text,
    u.phone::text,
    coalesce(nullif(p.name, ''), u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
    coalesce(u.raw_app_meta_data -> 'providers', '[]'::jsonb),
    coalesce(u.encrypted_password, '') <> '',
    u.email_confirmed_at is not null or u.phone_confirmed_at is not null,
    u.created_at,
    u.last_sign_in_at,
    (select count(*) from public.orders o where o.user_id = u.id),
    case when a.super then 'super' when a.user_id is not null then 'admin' end,
    count(*) over ()
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  left join public.admins a on a.user_id = u.id
  where public.is_admin()
    and (
      coalesce(p_search, '') = ''
      or position(lower(p_search) in lower(coalesce(u.email, ''))) > 0
      or position(lower(p_search) in lower(coalesce(u.phone, ''))) > 0
      or position(lower(p_search) in lower(coalesce(p.name, ''))) > 0
    )
  order by a.super desc nulls last, (a.user_id is not null) desc, u.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0)
$$;

-- Only a super admin adds or removes admins. The trigger above keeps the super admin.
create function public.set_admin(p_user_id uuid, p_admin boolean) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not_allowed';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'not_found';
  end if;
  if p_admin then
    insert into public.admins (user_id) values (p_user_id) on conflict (user_id) do nothing;
  else
    delete from public.admins where user_id = p_user_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------- privileges
revoke execute on function public.protect_super_admin() from public, anon, authenticated;
revoke execute on function public.admin_access() from public, anon;
revoke execute on function public.is_super_admin() from public, anon;
revoke execute on function public.every_account_is_admin() from public, anon;
revoke execute on function public.admin_users(text, int, int) from public, anon;
revoke execute on function public.set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_access(), public.is_super_admin(), public.every_account_is_admin(),
  public.admin_users(text, int, int), public.set_admin(uuid, boolean) to authenticated;
