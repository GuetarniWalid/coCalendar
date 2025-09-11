-- idempotent migration: add color if missing

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'slots' and column_name = 'color'
  ) then
    alter table public.slots add column color text;
  end if;
end
$$;



