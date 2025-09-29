-- Step 6: Update reminders table target field
-- Change target options to reflect new model: 'owner', 'participants'

-- Update existing data: 'pro' becomes 'owner', 'client' and 'both' become 'participants'
update public.reminders 
set target = case 
  when target = 'pro' then 'owner'
  when target = 'client' then 'participants'
  when target = 'both' then 'participants'
  else target
end;

-- Update the check constraint
alter table public.reminders drop constraint if exists reminders_target_check;
alter table public.reminders add constraint reminders_target_check 
check (target in ('owner', 'participants'));
