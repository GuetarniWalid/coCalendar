-- Create table for slot checklist items
create table if not exists public.slot_tasks (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots(id) on delete cascade,
  text text not null default '',
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.slot_tasks enable row level security;

-- Policy: slots belong to pros via slots.pro_id
create policy "slot_tasks_select_own"
  on public.slot_tasks
  for select
  using (exists(select 1 from public.slots s where s.id = slot_id and s.pro_id = auth.uid()));

create policy "slot_tasks_modify_own"
  on public.slot_tasks
  for all
  using (exists(select 1 from public.slots s where s.id = slot_id and s.pro_id = auth.uid()))
  with check (exists(select 1 from public.slots s where s.id = slot_id and s.pro_id = auth.uid()));

-- Helpful index for ordering
create index if not exists slot_tasks_slot_id_position_idx on public.slot_tasks(slot_id, position);


