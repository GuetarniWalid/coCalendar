-- Step 4: Update profiles table - remove role concept
-- All users are now equal, no pro/client distinction

-- Remove the role column and its constraint
alter table public.profiles drop column if exists role cascade;

-- Update any profile policies that might reference role (will be handled in RLS migration)
