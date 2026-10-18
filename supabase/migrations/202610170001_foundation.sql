create table public.preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 settings jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint preferences_size check (octet_length(settings::text) <= 8000)
);
create table public.lessons (
 id text primary key,
 content jsonb not null
);
create table public.sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 mode text not null check(mode in ('course','free')),
 lesson_id text references public.lessons(id),
 configuration jsonb not null,
 status text not null default 'active' check(status in ('active','completed','safety')),
 turn_count int not null default 0 check(turn_count between 0 and 20),
 busy_until timestamptz,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create index sessions_user_created on public.sessions(user_id,created_at desc);
create table public.messages (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.sessions(id) on delete cascade,
 role text not null check(role in ('user','assistant')),
 content text not null check(length(content) between 1 and 4000),
 ordering int not null,
 created_at timestamptz not null default now(),
 unique(session_id,ordering)
);
create table public.reflections (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null unique references public.sessions(id) on delete cascade,
 content jsonb not null,
 created_at timestamptz not null default now()
);
create table public.api_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index api_usage_user_time on public.api_usage(user_id,created_at);
alter table public.preferences enable row level security;
alter table public.lessons enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.reflections enable row level security;
alter table public.api_usage enable row level security;
create policy own_preferences on public.preferences for all to authenticated using(user_id = auth.uid()) with check(user_id = auth.uid());
create policy read_lessons on public.lessons for select to authenticated using(true);
create policy read_sessions on public.sessions for select to authenticated using(user_id = auth.uid());
create policy delete_sessions on public.sessions for delete to authenticated using(user_id = auth.uid());
create policy read_messages on public.messages for select to authenticated using(exists(select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy read_reflections on public.reflections for select to authenticated using(exists(select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
-- Only service-role Edge Functions may create conversations, messages, reflections or usage records.
revoke all on public.sessions, public.messages, public.reflections, public.api_usage from anon, authenticated;
grant select, delete on public.sessions to authenticated;
grant select on public.messages, public.reflections, public.lessons to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;
-- Serialize quota checks across function instances for each user.
create function public.reserve_usage(caller uuid) returns boolean language plpgsql security definer set search_path = public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(caller::text, 0));
 if (select count(*) from public.api_usage where user_id = caller and created_at > now() - interval '1 hour') >= 100
 or (select count(*) from public.api_usage where user_id = caller and created_at > now() - interval '1 day') >= 400 then return false; end if;
 delete from public.api_usage where user_id = caller and created_at < now() - interval '1 day';
 insert into public.api_usage(user_id) values(caller);
 return true;
end $$;
revoke all on function public.reserve_usage(uuid) from public, anon, authenticated;
grant execute on function public.reserve_usage(uuid) to service_role;
create function public.claim_turn(session uuid, caller uuid) returns boolean language plpgsql security definer set search_path = public as $$
begin
 update public.sessions set busy_until = now() + interval '90 seconds'
 where id = session and user_id = caller and status = 'active' and turn_count < 20 and (busy_until is null or busy_until < now());
 return found;
end $$;
revoke all on function public.claim_turn(uuid,uuid) from public, anon, authenticated;
grant execute on function public.claim_turn(uuid,uuid) to service_role;
-- Persist both messages and advance the session in one transaction.
create function public.commit_turn(session uuid, caller uuid, user_text text, assistant_text text, safety boolean) returns void language plpgsql security definer set search_path = public as $$
declare n int;
begin
 select turn_count into n from public.sessions where id = session and user_id = caller and status = 'active' for update;
 if not found then raise exception 'Session is no longer active'; end if;
 insert into public.messages(session_id,role,content,ordering) values(session,'user',user_text,n*2+1),(session,'assistant',assistant_text,n*2+2);
 update public.sessions set turn_count=n+1, busy_until=null, status=case when safety then 'safety' when n+1>=20 then 'completed' else 'active' end,
 completed_at=case when safety or n+1>=20 then now() else null end where id=session;
end $$;
revoke all on function public.commit_turn(uuid,uuid,text,text,boolean) from public, anon, authenticated;
grant execute on function public.commit_turn(uuid,uuid,text,text,boolean) to service_role;
