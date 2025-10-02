-- Import exam questions from final.en.json
-- Run this in Supabase SQL Editor

INSERT INTO public.quiz_items (
  module_slug,
  locale,
  question,
  choices,
  correct_index,
  explain,
  difficulty,
  tags,
  is_exam_candidate,
  active,
  status,
  source,
  version
) VALUES
-- Question 1
('final-exam', 'en', 'Stability triangle points are:', ARRAY['Seat, mast, load', 'Front wheels and rear axle pivot', 'Forks, load, ground'], 1, 'Counterbalance basics.', 3, ARRAY['exam', 'stability'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 2
('final-exam', 'en', 'Travel position:', ARRAY['Forks high, tilt forward', 'Forks low, slight back tilt', 'Forks scraping floor'], 1, 'Low + slight back tilt.', 3, ARRAY['exam', 'operation'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 3
('final-exam', 'en', 'Pedestrian blind corner:', ARRAY['Accelerate through', 'Slow, sound horn, peek', 'Turn wide at speed'], 1, 'Slow and horn.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 4
('final-exam', 'en', 'PPE sequence starts with:', ARRAY['Hard hat', 'Safety vest', 'Steel-toed boots'], 1, 'Vest first for visibility.', 3, ARRAY['exam', 'ppe'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 5
('final-exam', 'en', '8-point inspection includes:', ARRAY['Tires, brakes, steering', 'All safety systems', 'Just the engine'], 1, 'Complete safety check.', 3, ARRAY['exam', 'inspection'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 6
('final-exam', 'en', 'Load capacity decreases when:', ARRAY['Forks are raised higher', 'Load center moves forward', 'Both A and B'], 2, 'Height and distance both reduce capacity.', 3, ARRAY['exam', 'capacity'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 7
('final-exam', 'en', 'Spill response:', ARRAY['Drive around carefully', 'Stop, secure area, report', 'Clean quickly yourself'], 1, 'Stop and secure first.', 3, ARRAY['exam', 'hazards'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 8
('final-exam', 'en', 'Shutdown sequence ends with:', ARRAY['Key off only', 'Forks up, key off', 'Forks down, brake, key off'], 2, 'Complete shutdown procedure.', 3, ARRAY['exam', 'shutdown'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 9
('final-exam', 'en', 'When turning with load:', ARRAY['Turn quickly to minimize time', 'Make wide, slow turns', 'Lean into the turn'], 1, 'Wide turns prevent load shift.', 3, ARRAY['exam', 'operation'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 10
('final-exam', 'en', 'Overhead obstacles require:', ARRAY['Lower load, watch mast height', 'Raise load to clear', 'Drive faster'], 0, 'Lower load and check clearance.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 11
('final-exam', 'en', 'Unstable loads should be:', ARRAY['Moved carefully at low speed', 'Secured before moving', 'Tilted back for stability'], 1, 'Never move unstable loads.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 12
('final-exam', 'en', 'Electric forklift charging:', ARRAY['Plug in after each use', 'Only when battery is dead', 'Unplug to cool down'], 0, 'Charge after use per policy.', 3, ARRAY['exam', 'equipment'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 13
('final-exam', 'en', 'LPG shutdown requires:', ARRAY['Leave valve open', 'Close tank valve', 'Remove tank'], 1, 'Close valve for safety.', 3, ARRAY['exam', 'shutdown'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 14
('final-exam', 'en', 'Grade parking requires:', ARRAY['Wheel chocks', 'Parking uphill only', 'Extra brake pressure'], 0, 'Chocks prevent rolling.', 3, ARRAY['exam', 'parking'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 15
('final-exam', 'en', 'Data plate capacity:', ARRAY['Never changes', 'Changes with height and attachments', 'Only for new operators'], 1, 'Height and attachments affect capacity.', 3, ARRAY['exam', 'capacity'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 16
('final-exam', 'en', 'Hydraulic leak response:', ARRAY['Continue operating', 'Tag out and report', 'Add more fluid'], 1, 'Tag out for safety.', 3, ARRAY['exam', 'maintenance'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 17
('final-exam', 'en', 'Pre-operation inspection:', ARRAY['Optional if forklift looks good', 'Required every shift', 'Only for new equipment'], 1, 'Daily inspection required.', 3, ARRAY['exam', 'inspection'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 18
('final-exam', 'en', 'Blind spot safety:', ARRAY['Use mirrors only', 'Sound horn and proceed slowly', 'Assume clear'], 1, 'Horn and slow approach.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 19
('final-exam', 'en', 'Load center forward means:', ARRAY['Higher capacity', 'Lower capacity', 'No change'], 1, 'Forward load center reduces capacity.', 3, ARRAY['exam', 'capacity'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 20
('final-exam', 'en', 'Parking brake must be:', ARRAY['Set before leaving forklift', 'Optional on level ground', 'Only for overnight parking'], 0, 'Always set brake when parking.', 3, ARRAY['exam', 'parking'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 21
('final-exam', 'en', 'Hazard identification priority:', ARRAY['Speed over safety', 'Safety over speed', 'Equal importance'], 1, 'Safety always comes first.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 22
('final-exam', 'en', 'Mast tilt affects:', ARRAY['Stability only', 'Load security only', 'Both stability and load security'], 2, 'Tilt affects both factors.', 3, ARRAY['exam', 'operation'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 23
('final-exam', 'en', 'Equipment inspection finds damage:', ARRAY['Continue if minor', 'Tag out immediately', 'Report at end of shift'], 1, 'Tag out damaged equipment immediately.', 3, ARRAY['exam', 'maintenance'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 24
('final-exam', 'en', 'Pedestrian right-of-way:', ARRAY['Forklifts have priority', 'Pedestrians always have right-of-way', 'Depends on the situation'], 1, 'Always yield to pedestrians.', 3, ARRAY['exam', 'safety'], true, true, 'published', 'content/exam/final.en.json', 1),

-- Question 25
('final-exam', 'en', 'Load exceeds capacity plate:', ARRAY['Proceed if experienced', 'Do not lift', 'Lift slowly'], 1, 'Never exceed rated capacity.', 3, ARRAY['exam', 'capacity'], true, true, 'published', 'content/exam/final.en.json', 1);

-- Verify import
SELECT 
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE is_exam_candidate = true) as exam_candidates,
  COUNT(*) FILTER (WHERE locale = 'en') as english_questions
FROM quiz_items
WHERE module_slug = 'final-exam';

