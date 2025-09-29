-- Migration Summary: Transform from Pro/Client to Peer-to-Peer Model
-- 
-- CHANGES MADE:
-- 
-- 1. SCHEMA CHANGES:
--    - slots: pro_id → owner_id, removed client_id and visibility
--    - profiles: removed role column (everyone is equal)
--    - invites: pro_id/client_id → inviter_id/invitee_id/slot_id
--    - reminders: target values updated ('pro'→'owner', 'client'/'both'→'participants')
--    - Added: slot_participants table for sharing
--    - Removed: slot_private_content, slot_shared_content, clients tables
-- 
-- 2. DATA PRESERVATION:
--    - All existing slots preserved with pro_id → owner_id
--    - Public slots with client relationships migrated to slot_participants
--    - Existing invites migrated to new structure where possible
--    - Reminder targets updated to new model
-- 
-- 3. NEW MODEL:
--    - Privacy: Determined by presence of participants (not visibility field)
--    - Sharing: Via slot_participants junction table
--    - Permissions: Owners have full access, participants read-only
--    - Invitations: Direct user-to-user for specific slots
-- 
-- 4. MIGRATION NOTES:
--    - Some data may need manual verification after migration
--    - Slots that had client_id but no user_id become private (manual reshare needed)
--    - Invites without matching user accounts preserved with email for future redemption

-- Add a comment to mark migration completion
comment on table public.slot_participants is 'Peer-to-peer slot sharing - replaces visibility/client model';

select 'Migration to peer-to-peer model completed successfully' as status;
