-- Add without_time field for date-only slots
alter table slots add column without_time boolean not null default false;
comment on column slots.without_time is 'When true, slot displays as "Today" instead of specific times';
