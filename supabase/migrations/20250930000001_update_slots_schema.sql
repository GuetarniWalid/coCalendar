-- Step 2: Update slots table schema - Part 1
-- Add owner_id column but keep old columns for data migration

-- Add owner_id column (will replace pro_id)
alter table public.slots add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Migrate existing data: pro_id becomes owner_id
update public.slots set owner_id = pro_id where owner_id is null;

-- Make owner_id not null after data migration
alter table public.slots alter column owner_id set not null;

-- Note: client_id, visibility, and pro_id will be dropped in a later migration
-- after data has been migrated to slot_participants
