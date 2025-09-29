-- Step 5: Update invites table for peer-to-peer invitations
-- Remove pro_id/client_id, add inviter_id/invitee_id and slot_id

-- Add new columns for peer-to-peer model
alter table public.invites add column if not exists inviter_id uuid references auth.users(id) on delete cascade;
alter table public.invites add column if not exists invitee_id uuid references auth.users(id) on delete cascade;
alter table public.invites add column if not exists slot_id uuid references public.slots(id) on delete cascade;
alter table public.invites add column if not exists invitee_email text;

-- Migrate existing data if old columns exist
do $$
begin
  -- Check if old columns exist
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'invites' and column_name = 'pro_id'
  ) then
    -- Migrate existing data: pro_id becomes inviter_id
    update public.invites set inviter_id = pro_id where inviter_id is null;
    raise notice 'Migrated pro_id to inviter_id';
  end if;

  -- Handle client_id migration if clients table exists
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'invites' and column_name = 'client_id'
  ) and exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'clients'
  ) then
    -- For existing invites, handle client_id -> invitee_id migration
    update public.invites i
    set invitee_id = c.user_id
    from public.clients c
    where i.client_id = c.id and c.user_id is not null and i.invitee_id is null;

    -- Set invitee_email from clients table for invites without user_id
    update public.invites i
    set invitee_email = c.email
    from public.clients c
    where i.client_id = c.id and c.user_id is null and i.invitee_email is null;
    
    raise notice 'Migrated client relationships to invitee data';
  end if;
end $$;

-- Make inviter_id not null after migration
alter table public.invites alter column inviter_id set not null;

-- Drop old columns
alter table public.invites drop column if exists pro_id cascade;
alter table public.invites drop column if exists client_id cascade;

-- Add constraint: either invitee_id or invitee_email must be provided
alter table public.invites add constraint invites_invitee_check 
check (
  (invitee_id is not null and invitee_email is null) or 
  (invitee_id is null and invitee_email is not null)
);

-- Add necessary index for searching invites by user
create index if not exists invites_invitee_id_idx on public.invites(invitee_id);
