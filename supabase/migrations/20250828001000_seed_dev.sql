-- Seed development data (idempotent) for coCalendar
-- This migration inserts demo rows for the pro user and today’s schedule

-- Optional demo clients
insert into clients (id, pro_id, display_name, email)
values
  ('55555555-5555-5555-5555-555555555555', '9cd90259-7154-4668-9316-045508c2fc2d', 'Béouzo Family', 'beouzo@example.com'),
  ('66666666-6666-6666-6666-666666666666', '9cd90259-7154-4668-9316-045508c2fc2d', 'Frouzins Family', 'frouzins@example.com')
on conflict (id) do nothing;

-- Four demo slots for today
insert into slots (id, pro_id, title, start_at, end_at, visibility, description)
values
  ('11111111-1111-1111-1111-111111111111', '9cd90259-7154-4668-9316-045508c2fc2d', 'Réveil',
    date_trunc('day', now()) + time '08:00', date_trunc('day', now()) + time '08:30', 'private', 'Morning wake up routine'),
  ('22222222-2222-2222-2222-222222222222', '9cd90259-7154-4668-9316-045508c2fc2d', 'Maison Béouzo',
    date_trunc('day', now()) + time '09:30', date_trunc('day', now()) + time '11:00', 'public', 'Cleaning service at Béouzo house'),
  ('33333333-3333-3333-3333-333333333333', '9cd90259-7154-4668-9316-045508c2fc2d', 'Maison Frouzins',
    date_trunc('day', now()) + time '14:00', date_trunc('day', now()) + time '16:00', 'public', 'Cleaning service at Frouzins house'),
  ('44444444-4444-4444-4444-444444444444', '9cd90259-7154-4668-9316-045508c2fc2d', 'Dormir',
    date_trunc('day', now()) + time '23:30', date_trunc('day', now() + interval '1 day') + time '08:00', 'private', 'Sleep time')
on conflict (id) do nothing;

-- Link public slots to clients
update slots set client_id = '55555555-5555-5555-5555-555555555555'
where id = '22222222-2222-2222-2222-222222222222';

update slots set client_id = '66666666-6666-6666-6666-666666666666'
where id = '33333333-3333-3333-3333-333333333333';

-- Shared content for public slots
insert into slot_shared_content (slot_id, shared_note, shared_checklist)
values
  ('22222222-2222-2222-2222-222222222222', 'Checklist', '[{"text":"Task A","completed":false},{"text":"Task B","completed":false}]'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Checklist', '[{"text":"Task A","completed":false},{"text":"Task B","completed":false}]'::jsonb)
on conflict (slot_id) do nothing;

-- Private content for private slots
insert into slot_private_content (slot_id, private_note, private_checklist)
values
  ('11111111-1111-1111-1111-111111111111', 'Private checklist', '[{"text":"Drink water","completed":false},{"text":"Exercise","completed":false}]'::jsonb),
  ('44444444-4444-4444-4444-444444444444', 'Private checklist', '[{"text":"Set alarm","completed":false},{"text":"Review schedule","completed":false}]'::jsonb)
on conflict (slot_id) do nothing;


