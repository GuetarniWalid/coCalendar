-- Add completed column to slots table
alter table slots add column completed boolean not null default false;

-- Add index for performance when filtering by completion status
create index if not exists slots_completed_idx on slots (completed);
