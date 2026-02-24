create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  elo integer not null default 1200,
  matches_played integer not null default 0,
  banned_until timestamptz,
  ban_reason text,
  consecutive_participations integer not null default 0,
  podium_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  status text not null default 'registration' check (status in ('registration', 'pool', 'knockout', 'finished')),
  format text default 'pools' check (format in ('round_robin', 'pools', 'swiss')),
  swiss_rounds integer default 0,
  divisions_enabled boolean not null default false,
  registration_open_at timestamptz,
  registration_close_at timestamptz,
  publish_at timestamptz,
  start_at timestamptz,
  pause_start_at timestamptz,
  pause_end_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  tournament_id uuid not null references tournaments on delete cascade,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'validated', 'rejected')),
  division text not null default 'B' check (division in ('A', 'B')),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, tournament_id)
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments on delete cascade,
  name text not null,
  division text check (division in ('A', 'B')),
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments on delete cascade,
  group_id uuid references groups on delete set null,
  round_type text not null check (round_type in ('pool', 'quarter', 'semi', 'final', 'swiss')),
  round_no integer,
  division text check (division in ('A', 'B')),
  player1_id uuid not null references users,
  player2_id uuid references users,
  score1 integer,
  score2 integer,
  winner_id uuid references users,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'forfeit', 'draw')),
  locked boolean not null default false,
  elo_applied boolean not null default false,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists standings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments on delete cascade,
  group_id uuid references groups on delete cascade,
  user_id uuid not null references users on delete cascade,
  division text check (division in ('A', 'B')),
  points numeric not null default 0,
  tie_break numeric not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  opponents uuid[] default '{}',
  updated_at timestamptz not null default now(),
  unique (tournament_id, group_id, user_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references users,
  action_type text not null,
  target_id text,
  timestamp timestamptz not null default now(),
  details_json jsonb
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  tournament_id uuid not null references tournaments on delete cascade,
  amount numeric not null,
  method text not null,
  status text not null check (status in ('pending', 'validated', 'rejected')),
  validated_by uuid references users,
  timestamp timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  type text not null,
  payload jsonb,
  status text not null default 'pending',
  sent_at timestamptz
);

create table if not exists trophies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  month integer not null,
  year integer not null,
  type text not null,
  details_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists elo_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  tournament_id uuid references tournaments on delete set null,
  before_elo integer not null,
  after_elo integer not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

create table if not exists api_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null
);

create index if not exists idx_registrations_tournament on registrations (tournament_id, payment_status);
create index if not exists idx_matches_tournament_round on matches (tournament_id, round_type, round_no);
create index if not exists idx_payments_tournament on payments (tournament_id, status);
create index if not exists idx_audit_logs_admin on audit_logs (admin_id, timestamp);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function prevent_locked_match_update()
returns trigger as $$
begin
  if old.locked = true then
    raise exception 'match locked';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_matches_updated_at before update on matches
for each row execute procedure set_updated_at();

create trigger prevent_match_update before update on matches
for each row execute procedure prevent_locked_match_update();

create trigger set_tournaments_updated_at before update on tournaments
for each row execute procedure set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
