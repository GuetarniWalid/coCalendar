-- Step 7: Drop tables that are no longer needed

-- Drop content tables (replaced by single slot with participants model)
drop table if exists public.slot_private_content cascade;
drop table if exists public.slot_shared_content cascade;

-- Drop clients table (no longer needed with peer-to-peer model)
drop table if exists public.clients cascade;
