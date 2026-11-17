-- Scooter Land: admin roles. The owner adds and removes admins; nobody else can.

alter table public.admins
  add column role text not null default 'admin' check (role in ('owner', 'admin')),
  add column created_at timestamptz not null default now();

-- Everyone who is an admin before this migration is the shop's owner.
update public.admins set role = 'owner';

create function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admins where user_id = (select auth.uid()) and role = 'owner')
$$;

-- Admins and their emails, for the owner's team page.
create function public.list_admins()
returns table (user_id uuid, email text, role text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_owner() then
    raise exception 'not_owner';
  end if;
  return query
  select a.user_id, u.email::text, a.role, a.created_at, u.last_sign_in_at
  from public.admins a
  join auth.users u on u.id = a.user_id
  order by a.role desc, a.created_at;
end;
$$;

-- The account must already exist in Supabase Auth (the store's server creates it first).
create function public.grant_admin(p_email text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_owner() then
    raise exception 'not_owner';
  end if;
  select id into v_user from auth.users where lower(email) = lower(btrim(coalesce(p_email, '')));
  if v_user is null then
    raise exception 'user_not_found';
  end if;
  insert into public.admins (user_id, role) values (v_user, 'admin') on conflict (user_id) do nothing;
  return v_user;
end;
$$;

-- Owners cannot be removed here, so the shop can never lose its last owner by mistake.
create function public.revoke_admin(p_user_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'not_owner';
  end if;
  if exists (select 1 from public.admins where user_id = p_user_id and role = 'owner') then
    raise exception 'cannot_remove_owner';
  end if;
  delete from public.admins where user_id = p_user_id;
end;
$$;

-- Used by the store's server before it creates an account, to reuse an existing one.
create function public.auth_user_id_by_email(p_email text) returns uuid
language sql stable security definer set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(btrim(coalesce(p_email, '')))
$$;

-- Only these functions change the admins table. Nobody writes to it directly.
revoke insert, update, delete on public.admins from anon, authenticated;

revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.list_admins() from public, anon;
revoke execute on function public.grant_admin(text) from public, anon;
revoke execute on function public.revoke_admin(uuid) from public, anon;
revoke execute on function public.auth_user_id_by_email(text) from public, anon, authenticated;

grant execute on function public.is_owner() to authenticated;
grant execute on function public.list_admins() to authenticated;
grant execute on function public.grant_admin(text) to authenticated;
grant execute on function public.revoke_admin(uuid) to authenticated;
grant execute on function public.auth_user_id_by_email(text) to service_role;
