-- Gym Progress 3.9.0 cloud snapshot. Run once in Vivavos Project -> SQL Editor.
-- Complements the eight existing normalized tables; stores the original PWA format losslessly.
create table if not exists public.gym_cloud_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null,
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.gym_cloud_state enable row level security;
drop policy if exists gym_cloud_owner_select on public.gym_cloud_state;
create policy gym_cloud_owner_select on public.gym_cloud_state for select to authenticated using (user_id = (select auth.uid()));
-- Writes are permitted ONLY through this revision-checked function, never direct REST updates.
create or replace function public.gym_save_cloud_state(p_state jsonb,p_expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_revision bigint;
begin
 if v_user is null then raise exception 'Login required'; end if;
 if p_state is null or jsonb_typeof(p_state) <> 'object' then raise exception 'Invalid state'; end if;
 if pg_catalog.octet_length(p_state::text) > 5000000 then raise exception 'Backup too large'; end if;
 insert into public.gym_cloud_state(user_id,state,revision,updated_at)
 values (v_user,p_state,1,now())
 on conflict(user_id) do update set state=excluded.state,revision=public.gym_cloud_state.revision+1,updated_at=now()
 where public.gym_cloud_state.revision = p_expected_revision
 returning revision into v_revision;
 if v_revision is null then raise exception 'Cloud revision conflict'; end if;
 return v_revision;
end $$;
revoke all on function public.gym_save_cloud_state(jsonb,bigint) from public,anon;
grant execute on function public.gym_save_cloud_state(jsonb,bigint) to authenticated;
