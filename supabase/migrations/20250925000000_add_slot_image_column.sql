-- Add image column to slots table to store avatar configuration
-- Uses JSONB to store persona, activity, name, and extension

alter table public.slots add column image jsonb;

-- Add comment to describe the expected JSON structure
comment on column public.slots.image is 'Avatar configuration: {"persona": "adult-female|adult-male|child-female|child-male", "activity": "string", "name": "string", "extension": "webp"}';

-- Optional: Add a check constraint to validate the JSON structure
alter table public.slots add constraint slots_image_structure_check 
check (
  image is null or (
    image ? 'persona' and 
    image ? 'activity' and 
    image ? 'name' and 
    image ? 'extension' and
    image->>'persona' in ('adult-female', 'adult-male', 'child-female', 'child-male') and
    image->>'extension' = 'webp'
  )
);
