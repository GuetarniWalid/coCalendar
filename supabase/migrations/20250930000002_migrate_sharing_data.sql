-- Step 3: Migrate existing sharing data to new model
-- Convert visibility='public' + client_id to slot_participants entries

-- Check if the old columns exist before migrating
do $$
begin
  -- Only migrate if the old columns still exist
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'slots' 
    and column_name = 'client_id'
  ) and exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'slots' 
    and column_name = 'visibility'
  ) and exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'clients'
  ) then
    
    -- Migrate existing public slots with client_id to slot_participants
    insert into public.slot_participants (slot_id, user_id, invited_by)
    select 
      s.id as slot_id,
      c.user_id,
      s.owner_id as invited_by
    from public.slots s
    join public.clients c on c.id = s.client_id
    where s.visibility = 'public' 
      and c.user_id is not null
      and s.client_id is not null
    on conflict (slot_id, user_id) do nothing;
    
    raise notice 'Migrated sharing data from old schema to slot_participants';
  else
    raise notice 'Old schema columns not found, skipping data migration';
  end if;
end $$;

-- Note: Slots that had client_id but no associated user_id become private slots
-- These can be manually reshared if needed using the new peer-to-peer system
