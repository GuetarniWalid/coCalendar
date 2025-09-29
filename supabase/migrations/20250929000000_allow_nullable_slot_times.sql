-- Allow nullable start_at and end_at times for slots
-- This enables creating slots without specific times (all-day events) 
-- or slots with dates but no specific hours

-- Remove NOT NULL constraints from start_at and end_at
alter table slots 
  alter column start_at drop not null,
  alter column end_at drop not null;

-- Update the existing index to handle null values
-- The original index was: slots_pro_start_idx on slots (pro_id, start_at)
-- We need to recreate it to handle nulls properly
drop index if exists slots_pro_start_idx;

-- Create new index that handles nulls
-- Null start_at values will be sorted first (as they should be displayed first)
create index slots_pro_start_idx on slots (pro_id, start_at nulls first);

-- Add a partial index for slots with start_at for better performance on time-based queries
create index slots_pro_timed_idx on slots (pro_id, start_at) where start_at is not null;

-- Add a partial index for slots without start_at (all-day or undated slots)
create index slots_pro_untimed_idx on slots (pro_id, created_at) where start_at is null;
