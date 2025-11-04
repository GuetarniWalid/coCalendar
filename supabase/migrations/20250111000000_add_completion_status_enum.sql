-- Create completion status enum
create type slot_completion_status as enum ('auto', 'completed', 'incomplete');

-- Add completion_status column with default 'auto'
alter table slots add column completion_status slot_completion_status not null default 'auto';

-- Migrate existing completed data to new enum field
update slots
set completion_status = case
  when completed = true then 'completed'::slot_completion_status
  else 'auto'::slot_completion_status
end;

-- Drop old completed column
alter table slots drop column completed;

-- Drop old index
drop index if exists slots_completed_idx;

-- Add new index for performance when filtering by completion status
create index if not exists slots_completion_status_idx on slots (completion_status);
