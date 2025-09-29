-- Step 3.5: Drop old columns from slots table after data migration
-- This happens after the slot_participants data migration

-- Drop the old columns and constraints
alter table public.slots drop column if exists pro_id cascade;
alter table public.slots drop column if exists client_id cascade;
alter table public.slots drop column if exists visibility cascade;

-- Update the main index to use owner_id instead of pro_id (this was already existing)
drop index if exists slots_pro_start_idx;
drop index if exists slots_pro_timed_idx;
drop index if exists slots_pro_untimed_idx;

-- Recreate the main index that was already there, just with new column name
create index if not exists slots_owner_start_idx on public.slots (owner_id, start_at nulls first);
