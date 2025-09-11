-- coCalendar initial schema (profiles, clients, slots, content, reminders, push_tokens, invites)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('pro','client')) not null default 'pro',
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid null references clients(id) on delete set null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  visibility text not null default 'private' check (visibility in ('private','public')),
  description text,
  created_at timestamptz not null default now()
);
create index if not exists slots_pro_start_idx on slots (pro_id, start_at);

create table if not exists slot_shared_content (
  slot_id uuid primary key references slots(id) on delete cascade,
  shared_note text,
  shared_checklist jsonb
);

create table if not exists slot_private_content (
  slot_id uuid primary key references slots(id) on delete cascade,
  private_note text,
  private_checklist jsonb
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  minutes_before int not null,
  target text not null check (target in ('pro','client','both')),
  created_at timestamptz not null default now()
);

create table if not exists push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_token text not null,
  platform text,
  primary key (user_id, expo_token)
);

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','redeemed','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table slots enable row level security;
alter table slot_shared_content enable row level security;
alter table slot_private_content enable row level security;
alter table reminders enable row level security;
alter table push_tokens enable row level security;
alter table invites enable row level security;

-- Pro: full access where pro_id = auth.uid()
create policy pro_clients_all on clients
  for all using (pro_id = auth.uid()) with check (pro_id = auth.uid());

create policy pro_slots_all on slots
  for all using (pro_id = auth.uid()) with check (pro_id = auth.uid());

create policy pro_slot_private_all on slot_private_content
  for all using (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()))
  with check (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()));

create policy pro_slot_shared_all on slot_shared_content
  for all using (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()))
  with check (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()));

create policy pro_reminders_all on reminders
  for all using (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()))
  with check (exists (select 1 from slots s where s.id = slot_id and s.pro_id = auth.uid()));

create policy pro_push_tokens_all on push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy pro_invites_all on invites
  for all using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- Client access
-- Client can select slots where visibility='public' and client_id belongs to them (via clients.user_id = auth.uid())
create policy client_slots_select on slots
  for select using (
    visibility = 'public' and client_id in (
      select c.id from clients c where c.user_id = auth.uid()
    )
  );

create policy client_slot_shared_select on slot_shared_content
  for select using (
    exists (
      select 1 from slots s
      join clients c on c.id = s.client_id
      where s.id = slot_id and s.visibility = 'public' and c.user_id = auth.uid()
    )
  );

-- profiles: user can see/update own profile
create policy profiles_self_all on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());


