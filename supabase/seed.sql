-- Seed data for coCalendar development
-- This creates sample data for testing the timeline view
-- 
-- IMPORTANT: The pro_id values below must match your Auth user UUID.

-- Sample slots for today using dynamic dates
INSERT INTO slots (id, pro_id, title, start_at, end_at, visibility, description) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Réveil',
  date_trunc('day', now()) + time '08:00',
  date_trunc('day', now()) + time '08:30',
  'private',
  'Morning wake up routine'
),
(
  '22222222-2222-2222-2222-222222222222',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Maison Béouzo',
  date_trunc('day', now()) + time '09:30',
  date_trunc('day', now()) + time '11:00',
  'public',
  'Cleaning service at Béouzo house'
),
(
  '33333333-3333-3333-3333-333333333333',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Maison Frouzins',
  date_trunc('day', now()) + time '14:00',
  date_trunc('day', now()) + time '16:00',
  'public',
  'Cleaning service at Frouzins house'
),
(
  '44444444-4444-4444-4444-444444444444',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Dormir',
  date_trunc('day', now()) + time '23:30',
  date_trunc('day', now() + interval '1 day') + time '08:00',
  'private',
  'Sleep time'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample shared content for public slots
INSERT INTO slot_shared_content (slot_id, shared_note, shared_checklist) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'Client requested extra attention to kitchen area',
  '[
    {"id": 1, "text": "Clean kitchen surfaces", "completed": false},
    {"id": 2, "text": "Vacuum living room", "completed": false},
    {"id": 3, "text": "Clean bathrooms", "completed": false},
    {"id": 4, "text": "Change bed linens", "completed": false},
    {"id": 5, "text": "Take out trash", "completed": false}
  ]'::jsonb
),
(
  '33333333-3333-3333-3333-333333333333',
  'Regular weekly cleaning service',
  '[
    {"id": 1, "text": "Dust all surfaces", "completed": false},
    {"id": 2, "text": "Mop floors", "completed": false},
    {"id": 3, "text": "Clean windows", "completed": false},
    {"id": 4, "text": "Organize closets", "completed": false}
  ]'::jsonb
) ON CONFLICT (slot_id) DO NOTHING;

-- Insert sample private content for private slots
INSERT INTO slot_private_content (slot_id, private_note, private_checklist) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Personal morning routine',
  '[
    {"id": 1, "text": "Drink water", "completed": false},
    {"id": 2, "text": "Exercise", "completed": false}
  ]'::jsonb
),
(
  '44444444-4444-4444-4444-444444444444',
  'Prepare for tomorrow',
  '[
    {"id": 1, "text": "Set alarm", "completed": false},
    {"id": 2, "text": "Review schedule", "completed": false}
  ]'::jsonb
) ON CONFLICT (slot_id) DO NOTHING;

-- Insert sample clients (will be linked to your profile after you sign up)
INSERT INTO clients (id, pro_id, display_name, email) VALUES
(
  '55555555-5555-5555-5555-555555555555',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Béouzo Family',
  'beouzo@example.com'
),
(
  '66666666-6666-6666-6666-666666666666',
  '9cd90259-7154-4668-9316-045508c2fc2d', -- your user ID
  'Frouzins Family',
  'frouzins@example.com'
) ON CONFLICT (id) DO NOTHING;

-- Update slots to link with clients
UPDATE slots 
SET client_id = '55555555-5555-5555-5555-555555555555' 
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE slots 
SET client_id = '66666666-6666-6666-6666-666666666666' 
WHERE id = '33333333-3333-3333-3333-333333333333';
