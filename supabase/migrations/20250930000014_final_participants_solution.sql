-- FINAL SOLUTION: Clean up and implement proper participant display
-- This consolidates all previous attempts into one working solution

-- Step 1: Clean up previous failed attempts
DROP FUNCTION IF EXISTS public.get_slot_participants(uuid);
DROP FUNCTION IF EXISTS public.get_auth_users_by_ids(uuid[]);
DROP FUNCTION IF EXISTS public.get_participant_profiles(uuid[]);
DROP VIEW IF EXISTS public.user_profiles;

-- Remove any failed constraints
ALTER TABLE public.slot_participants DROP CONSTRAINT IF EXISTS slot_participants_user_id_profiles_fkey;

-- Step 2: Remove the redundant invited_by column and add display fields
-- Remove invited_by as it's always the same as slots.owner_id
ALTER TABLE public.slot_participants DROP COLUMN IF EXISTS invited_by;

-- Add display fields directly to slot_participants (denormalized approach)
-- This is how successful apps handle participant display - copy data at insert time
ALTER TABLE public.slot_participants ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.slot_participants ADD COLUMN IF NOT EXISTS email text;

-- Step 3: Create a simple function to populate participant display data
CREATE OR REPLACE FUNCTION public.add_slot_participant(
  p_slot_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_display_name text;
  user_email text;
BEGIN
  -- Get display name and email from auth.users
  SELECT 
    COALESCE(raw_user_meta_data->>'display_name', email),
    email
  INTO user_display_name, user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Insert participant with display data (no invited_by needed)
  INSERT INTO public.slot_participants (slot_id, user_id, display_name, email, created_at)
  VALUES (p_slot_id, p_user_id, user_display_name, user_email, now())
  ON CONFLICT (slot_id, user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email;
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.add_slot_participant(uuid, uuid) TO authenticated;

-- Step 4: Update existing participant records with display data
DO $$
DECLARE
  participant_record RECORD;
BEGIN
  FOR participant_record IN 
    SELECT slot_id, user_id FROM public.slot_participants WHERE display_name IS NULL
  LOOP
    PERFORM public.add_slot_participant(participant_record.slot_id, participant_record.user_id);
  END LOOP;
END $$;

SELECT 'Participant display system implemented successfully' as status;
