-- Step 8: Update RLS policies for the new peer-to-peer model

-- Drop existing policies (only for tables that still exist)
do $$
begin
  -- Drop policies only if the tables exist
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'clients') then
    drop policy if exists pro_clients_all on clients;
  end if;
  
  drop policy if exists pro_slots_all on slots;
  
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'slot_private_content') then
    drop policy if exists pro_slot_private_all on slot_private_content;
  end if;
  
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'slot_shared_content') then
    drop policy if exists pro_slot_shared_all on slot_shared_content;
    drop policy if exists client_slot_shared_select on slot_shared_content;
  end if;
  
  drop policy if exists pro_reminders_all on reminders;
  drop policy if exists pro_push_tokens_all on push_tokens;
  drop policy if exists pro_invites_all on invites;
  drop policy if exists client_slots_select on slots;
  drop policy if exists profiles_self_all on profiles;
  drop policy if exists slot_tasks_select_own on slot_tasks;
  drop policy if exists slot_tasks_modify_own on slot_tasks;
end $$;

-- NEW POLICIES FOR PEER-TO-PEER MODEL

-- Profiles: users can see/update their own profile
create policy profiles_self_all on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Slots: owners have full access, participants have read-only access
create policy slots_owner_all on public.slots
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy slots_participants_select on public.slots
  for select using (
    id in (
      select slot_id from public.slot_participants 
      where user_id = auth.uid()
    )
  );

-- Slot participants: owners can manage participants, participants can see themselves
create policy slot_participants_owner_all on public.slot_participants
  for all using (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  );

create policy slot_participants_self_select on public.slot_participants
  for select using (user_id = auth.uid());

-- Slot tasks: owners have full access, participants have read-only access
create policy slot_tasks_owner_all on public.slot_tasks
  for all using (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  );

create policy slot_tasks_participants_select on public.slot_tasks
  for select using (
    slot_id in (
      select sp.slot_id from public.slot_participants sp 
      where sp.user_id = auth.uid()
    )
  );

-- Reminders: owners only (participants get notified but don't manage reminders)
create policy reminders_owner_all on public.reminders
  for all using (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.slots s 
      where s.id = slot_id and s.owner_id = auth.uid()
    )
  );

-- Push tokens: users manage their own tokens
create policy push_tokens_self_all on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Invites: inviters can manage their sent invites, invitees can see invites for them
create policy invites_inviter_all on public.invites
  for all using (inviter_id = auth.uid()) with check (inviter_id = auth.uid());

create policy invites_invitee_select on public.invites
  for select using (
    invitee_id = auth.uid() or 
    (invitee_id is null and invitee_email = auth.email())
  );
