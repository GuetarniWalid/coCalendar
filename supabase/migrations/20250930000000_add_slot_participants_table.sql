-- Step 1: Create slot_participants table for peer-to-peer sharing
-- This replaces the visibility concept with actual user relationships

create table if not exists public.slot_participants (
  slot_id uuid not null references public.slots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (slot_id, user_id)
);

-- Enable RLS
alter table public.slot_participants enable row level security;

-- Necessary indexes for searching by participants and user
create index if not exists slot_participants_user_id_idx on public.slot_participants(user_id);

-- Policies will be added in a later migration after schema transformation
