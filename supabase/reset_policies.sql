-- Complete RLS policy reset for slots and slot_participants tables

-- Drop ALL existing policies on slots table
DROP POLICY IF EXISTS slots_owner_all ON public.slots;
DROP POLICY IF EXISTS slots_participants_select ON public.slots;
DROP POLICY IF EXISTS pro_slots_all ON public.slots;
DROP POLICY IF EXISTS client_slots_select ON public.slots;

-- Drop ALL existing policies on slot_participants table
DROP POLICY IF EXISTS slot_participants_owner_all ON public.slot_participants;
DROP POLICY IF EXISTS slot_participants_self_select ON public.slot_participants;

-- Recreate clean, simple policies
CREATE POLICY slots_owner_all ON public.slots
  FOR ALL USING (owner_id = auth.uid()) 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY slots_participants_select ON public.slots
  FOR SELECT USING (
    id IN (
      SELECT slot_id FROM public.slot_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY slot_participants_owner_all ON public.slot_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.slots s 
      WHERE s.id = slot_id AND s.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.slots s 
      WHERE s.id = slot_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY slot_participants_self_select ON public.slot_participants
  FOR SELECT USING (user_id = auth.uid());

SELECT 'RLS policies reset successfully' as status;
