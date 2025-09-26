-- Add voice recording fields to slots table
alter table public.slots 
add column if not exists voice_path text,
add column if not exists voice_duration integer,
add column if not exists voice_mime text,
add column if not exists voice_size_bytes integer,
add column if not exists voice_created_at timestamptz;
