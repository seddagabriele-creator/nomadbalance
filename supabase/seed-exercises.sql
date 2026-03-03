-- ============================================================
-- NomadBalance — Exercise Seed Data (27 exercises with images)
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

DELETE FROM exercises;

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES

-- NECK & CERVICAL (4 exercises)
('Chin Tucks', 0, 'neck_cervical',
 '10 reps, hold 5 seconds each',
 'Sit tall. Draw your chin straight back as if making a double chin. Hold, then release.',
 'Don''t tilt your head up or down. The movement is purely horizontal.',
 'Place a finger on your chin for tactile feedback.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Chin%20Tucks.jpg'),

('Head Rotation', 1, 'neck_cervical',
 '8 reps per side, slow and controlled',
 'Sit tall with chin tucked. Slowly rotate your head to look over one shoulder, hold 3s, return to center, repeat other side.',
 'Don''t force the range. Stop if you feel pain or pinching.',
 'Reduce range of motion if stiff.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Head%20Rotation.jpg'),

('Assisted Flexion', 2, 'neck_cervical',
 '3 reps, hold 15-20 seconds each',
 'Sit tall. Interlace fingers behind your head. Gently pull chin toward chest until you feel a stretch in the back of your neck.',
 'Don''t round your upper back. Keep shoulders down and relaxed.',
 'Use less hand pressure for a gentler stretch.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Assisted%20Flexion.jpg'),

('Assisted Lateral Tilt', 3, 'neck_cervical',
 '3 reps per side, hold 15-20 seconds',
 'Sit tall. Tilt ear toward shoulder. Place hand on side of head and gently add pressure to deepen the stretch.',
 'Don''t lift the opposite shoulder. Keep both shoulders down.',
 'Skip the hand assist if the stretch is too intense.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Assisted%20Lateral%20Tilt.jpg'),

-- SHOULDERS & THORACIC (9 exercises)
('Doorway Pec Stretch', 4, 'shoulders_thoracic',
 '3 reps per side, hold 20-30 seconds',
 'Stand in a doorway. Place forearm against the frame at 90°. Step forward until you feel a stretch across your chest.',
 'Don''t arch your lower back. Keep core engaged.',
 'Adjust arm height to target different areas of the chest.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Doorway%20Pec%20Stretch.jpg'),

('Dynamic Hug', 5, 'shoulders_thoracic',
 '10-12 reps, slow and controlled',
 'Open arms wide, squeezing shoulder blades together. Then wrap arms around yourself like a big hug, rounding upper back. Alternate.',
 'Don''t rush. Focus on full range in both directions.',
 'Reduce speed if feeling dizzy.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Dynamic%20Hug.jpg'),

('Large Arms Circles', 6, 'shoulders_thoracic',
 '10 circles forward, 10 backward',
 'Stand tall with arms extended to the sides. Make large circles, gradually increasing size. Reverse direction after 10.',
 'Don''t shrug shoulders up. Keep neck relaxed.',
 'Start with smaller circles if shoulders are tight.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Large%20Arms%20Circles.jpg'),

('Reverse Shrugs', 7, 'shoulders_thoracic',
 '10-12 reps, hold 3 seconds at bottom',
 'Sit or stand tall. Push shoulders down and back, away from ears, as far as you can. Hold 3s, relax, repeat.',
 'Don''t arch your lower back. Isolate the shoulder blade movement.',
 'Press hands on a desk to assist the movement.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Reverse%20Shrugs.jpg'),

('Thoracic Extension on Chair', 8, 'shoulders_thoracic',
 '8-10 reps, hold 3 seconds at top',
 'Sit with hands behind head. Place chair back against mid-back. Gently extend backward over the chair. Hold, return.',
 'Don''t extend from the lower back. Focus on mid-back only.',
 'Use a rolled towel on the chair back for comfort.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Thoracic%20Extension%20on%20Chair.jpg'),

('W Openers', 9, 'shoulders_thoracic',
 '10-12 reps, hold 3 seconds',
 'Stand with arms at 90° like a goalpost (W shape). Squeeze shoulder blades together and pull elbows back. Hold, then release.',
 'Don''t flare your ribs. Keep core tight and lower back neutral.',
 'Start with arms lower if shoulder mobility is limited.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/W%20Openers.jpg'),

('Wall Slides', 10, 'shoulders_thoracic',
 '10 reps, slow and controlled',
 'Stand with back, head, and arms against wall. Arms in goalpost position. Slowly slide arms up overhead keeping wall contact. Slide back down.',
 'Don''t let lower back arch away from wall. Keep abs engaged.',
 'Step slightly away from wall if unable to maintain contact.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Wall%20Slides.jpg'),

('Reverse Prayer', 11, 'shoulders_thoracic',
 '3 reps, hold 15-20 seconds',
 'Bring hands behind your back and press palms together in prayer position between shoulder blades. Hold and breathe.',
 'Don''t force it if palms can''t touch. Go to your comfortable limit.',
 'Touch backs of hands together if flexibility is limited.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Reverse%20Prayer.jpg'),

('Desk Cat-Cow', 12, 'shoulders_thoracic',
 '8-10 reps, slow and fluid',
 'Sit on chair edge, hands on knees. Inhale: arch back, lift chest, look up (cow). Exhale: round back, tuck chin, pull belly in (cat). Flow between positions.',
 'Don''t rush. Coordinate movement with breathing.',
 'Reduce range if you feel lower back discomfort.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Desk%20Cat-Cow.jpg'),

-- WRISTS & FOREARMS (4 exercises)
('Extensor Stretch', 13, 'wrists_forearms',
 '3 reps per hand, hold 15-20 seconds',
 'Extend one arm forward, palm down. Use other hand to gently press fingers toward the floor. Hold and breathe.',
 'Don''t lock your elbow. Keep a slight bend.',
 'Reduce pressure if you feel pain.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Extensor%20Stretch.jpg'),

('Flexor Stretch', 14, 'wrists_forearms',
 '3 reps per hand, hold 15-20 seconds',
 'Extend one arm forward, palm up. Use other hand to gently pull fingers back toward you. Hold and breathe.',
 'Don''t hyperextend the elbow. Keep it soft.',
 'Use less pulling force for a gentler stretch.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Flexor%20Stretch.jpg'),

('Finger Flicks', 15, 'wrists_forearms',
 '10 reps, both hands simultaneously',
 'Make a tight fist with both hands. Then quickly open and spread all fingers wide. Repeat rhythmically.',
 'Don''t skip the full fist closure. Go through full range each rep.',
 'Slow down if fingers feel stiff.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Finger%20Flicks.jpg'),

('Wrist Rotations', 16, 'wrists_forearms',
 '10 circles per direction, each wrist',
 'Extend arms forward. Make slow circles with your wrists — 10 clockwise, then 10 counterclockwise.',
 'Don''t move from the forearm. Isolate the wrist joint.',
 'Interlace fingers and rotate both wrists together.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Wrist%20Rotations.jpg'),

-- LOWER BACK & CORE (3 exercises)
('Seated Torso Twist', 17, 'lower_back_core',
 '8 reps per side, hold 3 seconds',
 'Sit tall with feet flat. Cross arms over chest. Rotate torso to one side, hold 3s, return to center, repeat other side.',
 'Don''t move your hips. Rotation should come from the mid-back.',
 'Use the chair back as a gentle assist for more rotation.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Seated%20Torso%20Twist.jpg'),

('Standing Side Bend', 18, 'lower_back_core',
 '8 reps per side, hold 3 seconds',
 'Stand tall with one arm overhead. Lean to the opposite side until you feel a stretch along your side. Hold, return, switch.',
 'Don''t lean forward or backward. Keep the bend strictly lateral.',
 'Place free hand on hip for balance.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Standing%20Side%20Bend.jpg'),

('Forward Fold', 19, 'lower_back_core',
 '3 reps, hold 15-20 seconds',
 'Stand with feet hip-width apart. Slowly fold forward from hips, letting arms hang toward floor. Bend knees slightly. Breathe deeply.',
 'Don''t bounce. Let gravity do the work. Bend knees if hamstrings are tight.',
 'Bend knees generously and rest hands on shins.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Forward%20fold.jpg'),

-- HIPS & LEGS (7 exercises)
('Air Squat', 20, 'hips_legs',
 '10-12 reps, controlled tempo',
 'Stand with feet shoulder-width apart. Push hips back and bend knees to lower into a squat. Go as deep as comfortable, then stand up.',
 'Don''t let knees cave inward. Keep them tracking over toes.',
 'Hold onto a desk or chair for balance.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Air%20Squat.jpg'),

('Butt Kicks', 21, 'hips_legs',
 '20 reps (10 per leg), moderate pace',
 'Stand tall. Jog in place, kicking heels up toward glutes with each step. Keep core engaged.',
 'Don''t lean forward. Stay upright throughout.',
 'Slow down and reduce heel height if needed.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Butt%20Kicks.jpg'),

('Calf Raises', 22, 'hips_legs',
 '12-15 reps, hold 2 seconds at top',
 'Stand with feet hip-width apart. Rise onto toes as high as possible. Hold 2s at top, slowly lower back down.',
 'Don''t rush the lowering phase. Control the descent.',
 'Hold a wall or desk for balance.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Calf%20Raises.jpg'),

('March in Place', 23, 'hips_legs',
 '30 seconds, moderate pace',
 'Stand tall. March in place, lifting knees to hip height. Swing arms naturally with each step.',
 'Don''t lean back as you lift knees. Stay tall with engaged core.',
 'Lower knee height if hip flexors are tight.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/March%20in%20Place.jpg'),

('Seated Piriformis Stretch', 24, 'hips_legs',
 '3 reps per side, hold 20-30 seconds',
 'Sit tall. Cross one ankle over opposite knee (figure-4). Gently lean forward from hips until you feel a deep glute stretch.',
 'Don''t round your back. Hinge from the hips.',
 'Stay upright and press crossed knee gently down if leaning is too intense.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Seated%20Piriformis%20Stretch.jpg'),

('Standing Glute Squeeze', 25, 'hips_legs',
 '12 reps, hold 5 seconds each',
 'Stand tall with feet hip-width apart. Squeeze glutes as hard as possible. Hold 5s, release, repeat.',
 'Don''t tilt your pelvis forward. Keep a neutral spine.',
 'Place hands on glutes to feel the contraction.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Standing%20Glute%20Squeeze.jpg'),

('Static Lunge', 26, 'hips_legs',
 '8 reps per leg, hold 3 seconds at bottom',
 'Stand in split stance, one foot forward. Lower back knee toward floor, keeping front knee over ankle. Hold 3s, push back up.',
 'Don''t let front knee go past toes. Keep torso upright.',
 'Hold a desk or wall for balance. Reduce depth if needed.',
 'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Static%20Lunge.jpg');
