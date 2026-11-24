-- Escalating sign-in lockout per account, for customers and admins. Only wrong passwords count.
--   3 wrong  -> locked 6 minutes
--   3 more   -> locked 15 minutes
--   2 more   -> locked 1 hour
--   2 more   -> locked 24 hours (and 24 hours after every further 2)
-- A correct password clears the count, and so does a day without a wrong one.
-- Keys hold a hash of the email, never the email itself. Only the store's server (service role) uses this.

create table public.login_lockouts (
  key text primary key,
  failures int not null default 0,
  locked_until timestamptz,
  last_failure_at timestamptz not null default now()
);

alter table public.login_lockouts enable row level security;

-- When the account is locked: the time it opens again. Otherwise null.
create function public.login_locked_until(p_key text) returns timestamptz
language sql stable security definer set search_path = ''
as $$ select locked_until from public.login_lockouts where key = p_key and locked_until > now() $$;

-- Records a wrong password. Returns the time the account opens again if this one locked it, otherwise null.
create function public.login_failed(p_key text) returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  v_failures int;
  v_lock interval;
  v_until timestamptz;
begin
  if random() < 0.01 then
    delete from public.login_lockouts where last_failure_at < now() - interval '2 days';
  end if;

  insert into public.login_lockouts as l (key, failures, last_failure_at)
  values (p_key, 1, now())
  on conflict (key) do update set
    failures = case when l.last_failure_at < now() - interval '1 day' then 1 else l.failures + 1 end,
    last_failure_at = now()
  returning failures into v_failures;

  v_lock := case
    when v_failures = 3 then interval '6 minutes'
    when v_failures = 6 then interval '15 minutes'
    when v_failures = 8 then interval '1 hour'
    when v_failures >= 10 and v_failures % 2 = 0 then interval '24 hours'
  end;

  if v_lock is null then
    return null;
  end if;
  v_until := now() + v_lock;
  update public.login_lockouts set locked_until = v_until where key = p_key;
  return v_until;
end;
$$;

-- A correct password: the count starts again.
create function public.login_succeeded(p_key text) returns void
language sql security definer set search_path = ''
as $$ delete from public.login_lockouts where key = p_key $$;

revoke all on public.login_lockouts from public, anon, authenticated;
revoke execute on function public.login_locked_until(text), public.login_failed(text), public.login_succeeded(text)
  from public, anon, authenticated;
grant execute on function public.login_locked_until(text), public.login_failed(text), public.login_succeeded(text)
  to service_role;
