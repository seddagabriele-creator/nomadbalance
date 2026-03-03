-- ============================================================
-- NomadBalance — Exercise Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- 27 exercises across 5 groups
-- Image URLs point to Supabase Storage bucket: exercise-images
-- ============================================================

-- -------------------------------------------------------
-- GROUP 1: NECK & CERVICAL (neck_cervical) — 5 exercises
-- -------------------------------------------------------

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
(
  'Chin Tucks',
  1,
  'neck_cervical',
  '10 reps with a 2-3 second hold.',
  'Sit or stand tall, looking straight ahead. Gently glide your chin straight back horizontally as if making a "double chin" (without tilting your head down). Feel the stretch at the back of your neck.',
  'DO NOT look down and DO NOT look up. The head must slide on a horizontal track.',
  'If you feel tension in your traps, lean your back and the back of your head against a wall and try to flatten the cervical curve against it.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Chin%20Tucks.jpg'
),
(
  'Assisted Lateral Tilt (Upper Trap Stretch)',
  2,
  'neck_cervical',
  '20 seconds per side.',
  'Gently tilt your head, bringing your right ear to your right shoulder. With your right hand, apply very light pressure to your left temple to increase the stretch. Keep your left shoulder pressed down. Repeat on the other side.',
  'The left shoulder must not rise. The torso must not tilt.',
  'If you feel a "pinch" on the side you are bending towards, reduce the tilt.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Assisted%20Lateral%20Tilt.jpg'
),
(
  'Head Rotations (No-No)',
  3,
  'neck_cervical',
  '10 slow rotations per side.',
  'Slowly rotate your head to the right, trying to look over your shoulder, then to the left. Keep your chin parallel to the floor.',
  'Shoulders must remain motionless. Do not rotate your torso.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Head%20Rotation.jpg'
),
(
  'Assisted Flexion & Isometric Extension',
  4,
  'neck_cervical',
  '20 seconds stretch down, 5 pushes of 5 seconds back.',
  'Interlace hands behind your head and gently guide your chin to your chest (flexion). Then, place hands on your forehead and push your head backward against your hands\' resistance (isometric extension) without moving.',
  'During flexion, do not round your back (only the neck). During the backward push, do not move the head, activate only the muscles.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Assisted%20Flexion.jpg'
),
(
  'Reverse Shrugs',
  5,
  'neck_cervical',
  '10 slow reps.',
  'Inhale bringing shoulders to ears. Exhale and push shoulders toward the floor, as if you wanted to touch the ground. Arms stay attached to the body.',
  'Do not bend your elbows. The movement is only the shoulder blades descending.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Reverse%20Shrugs.jpg'
);

-- -------------------------------------------------------
-- GROUP 2: SHOULDERS & THORACIC (shoulders_thoracic) — 6 exercises
-- -------------------------------------------------------

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
(
  'Thoracic Extension on Chair',
  1,
  'shoulders_thoracic',
  '10 slow reps.',
  'Seated, hands behind head, elbows open. Lean your upper back against the backrest. Arch backward over the chair while exhaling and looking at the ceiling. Do not arch your lower back.',
  'Keep your abs contracted. Do not arch the lumbar area (lower back). If you feel tension in the lower back, you are doing it wrong.',
  'Place a pillow between your back and the backrest if the edge is hard.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Thoracic%20Extension%20on%20Chair.jpg'
),
(
  'Wall Slides',
  2,
  'shoulders_thoracic',
  '12 reps.',
  'Back against a wall, arms in a "cactus" position (elbows at 90°). Slide arms up the wall trying to keep elbows and wrists in contact with the wall.',
  'Elbows and wrists must touch the wall. The lower back must NEVER detach. If it detaches, the exercise is null.',
  'If you cannot keep wrists and back attached, move your feet further from the wall (even 50 cm) until you can. Do not go all the way up if you lose contact.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Wall%20Slides.jpg'
),
(
  '"W" Openers',
  3,
  'shoulders_thoracic',
  '10 slow reps.',
  'Standing. Keep elbows tucked at your sides. Rotate your forearms outward, turning your palms up as if begging with both hands. Squeeze your shoulder blades together and push them downward.',
  'Do not arch your back. Keep ribs down (core active). Do not detach elbows from sides.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/W%20Openers.jpg'
),
(
  'Doorway Pec Stretch',
  4,
  'shoulders_thoracic',
  '10 slow reps.',
  'Standing in a doorway, place one forearm on the doorframe, with your elbow positioned slightly above shoulder line. Step forward with the leg on the same side to feel a stretch in your chest. Keep your back straight.',
  'Do not rotate the whole torso. Do not push the head forward (common error).',
  'If you feel pain in the front of the shoulder, lower the elbow.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Doorway%20Pec%20Stretch.jpg'
),
(
  'Large Arm Circles',
  5,
  'shoulders_thoracic',
  '10 slow reps.',
  'Standing with arms at your sides. Slowly draw large circles with your arms. As your arms reach the highest point, rotate your palms outward, away from each other.',
  'Keep ribs closed (do not flare ribs when arms go up).',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Large%20Arms%20Circles.jpg'
),
(
  'Dynamic Hug',
  6,
  'shoulders_thoracic',
  '10 slow reps.',
  'Open arms while inhaling (palms up). Cross them in front of you while exhaling and rounding only the upper back (shoulder blades move apart).',
  'Do not move the pelvis. The movement is thoracic.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Dynamic%20Hug.jpg'
);

-- -------------------------------------------------------
-- GROUP 3: WRISTS & FOREARMS (wrists_forearms) — 5 exercises
-- -------------------------------------------------------

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
(
  'Extensor Stretch (Palm Facing You)',
  1,
  'wrists_forearms',
  '10 slow reps per side.',
  'Arm straight forward, palm down. With the other hand, bend the wrist down and slightly outward (towards the pinky).',
  'The elbow must be completely locked (straight). If you bend it, you lose tension on the elbow tendons.',
  'If it hurts, bend the elbow slightly.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Extensor%20Stretch.jpg'
),
(
  'Flexor Stretch (Palm Facing Away)',
  2,
  'wrists_forearms',
  '10 slow reps per side.',
  'Arm straight, palm forward ("Stop"). Pull fingers (including thumb) toward you.',
  'Shoulder down (do not bring it to the ear). Elbow straight.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Flexor%20Stretch.jpg'
),
(
  'Wrist Rotations',
  3,
  'wrists_forearms',
  '10 slow rotations in each direction.',
  'Interlace fingers. Rotate wrists trying to make the heels of the hands touch.',
  'Do not do it jerkily. Fluid movement.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Wrist%20Rotations.jpg'
),
(
  'Reverse Prayer',
  4,
  'wrists_forearms',
  '10 slow reps.',
  'Backs of hands united in front of chest. Lower elbows and wrists.',
  'Keep backs in contact. If they separate, stop at that height.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Reverse%20Prayer.jpg'
),
(
  'Finger Flicks',
  5,
  'wrists_forearms',
  '10 explosive reps per hand.',
  'Tight fist -> Explosive opening extending fingers fully.',
  'Truly extend fingers all the way, don\'t stop halfway.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Finger%20Flicks.jpg'
);

-- -------------------------------------------------------
-- GROUP 4: LOWER BACK & CORE (lower_back_core) — 5 exercises
-- -------------------------------------------------------

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
(
  'Seated Torso Twist',
  1,
  'lower_back_core',
  '10 slow twists per side.',
  'Seated. "Grow" tall with your head (lengthen the spine). Then rotate right, grabbing the backrest.',
  'First lengthen, then rotate. Never rotate with a slumped/curved back. Pelvis immobile.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Seated%20Torso%20Twist.jpg'
),
(
  'Desk Cat-Cow',
  2,
  'lower_back_core',
  '10 slow reps.',
  'Hands on desk. Inhale and arch back looking up (stick butt out). Exhale and round back looking at belly button (posterior pelvic tilt).',
  'Move vertebra by vertebra, not just the neck.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Desk%20Cat-Cow.jpg'
),
(
  'Standing Side Bend',
  3,
  'lower_back_core',
  '10 slow bends per side.',
  'Stand with feet together. Slide your right hand down your right leg. Reach your left arm over your head to stretch the side.',
  'Imagine being between two panes of glass: you cannot bend forward or backward, only sideways.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Standing%20Side%20Bend.jpg'
),
(
  'March in Place (High Knees)',
  4,
  'lower_back_core',
  '20 reps total (10 per leg).',
  'Lift one knee above the hip. Balance for 1 second. Switch to the other leg.',
  'Do not bend the torso toward the knee. Torso stays straight, leg comes up.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/March%20in%20Place.jpg'
),
(
  'Forward Fold (Spine Release - Caution)',
  5,
  'lower_back_core',
  'Hold for 20-30 seconds.',
  'Feet wide. Knees slightly bent. Let yourself fall forward.',
  'Do not force touching the ground. Let gravity pull the head.',
  'If you have known lumbar herniations, avoid this or do it resting hands on a table (flat back) instead of going down.',
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Forward%20fold.jpg'
);

-- -------------------------------------------------------
-- GROUP 5: HIPS & LEGS (hips_legs) — 6 exercises
-- -------------------------------------------------------

INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
(
  'Standing Glute Squeeze',
  1,
  'hips_legs',
  '5 reps (hold for 5 seconds each).',
  'Standing. Posterior pelvic tilt (tuck tail). Contract glutes extremely hard for 5 seconds.',
  'DO NOT push belly forward. The movement is in the pelvis, not the lumbar. If you feel a pinch in the lower back, you are doing it wrong: use your abs.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Standing%20Glute%20Squeeze.jpg'
),
(
  'Static Lunge (Hip Flexor Stretch)',
  2,
  'hips_legs',
  'Hold for 20-30 seconds per side.',
  'Step back. Back heel lifted. Bend back knee. Rotate pelvis forward (posterior tilt).',
  'You don\'t need to go deep. If you rotate the pelvis well (pubis toward belly button), you will feel the front thigh stretch while standing almost straight. Do not arch the back.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Static%20Lunge.jpg'
),
(
  'Calf Raises',
  3,
  'hips_legs',
  '15 slow reps.',
  'Rise on your toes. Lower slowly, grazing the floor with your heels before rising again.',
  'Ankles straight, do not let them roll outward.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Calf%20Raises.jpg'
),
(
  'Seated Piriformis Stretch (Figure 4)',
  4,
  'hips_legs',
  'Hold for 20-30 seconds per side.',
  'Seated. Right ankle on left knee. Back very straight. Lean forward from the hips (like a hinge).',
  'Do not round the back to go down. Keep chest out. Leaning just 2 cm is enough to feel the glute pull if the back is straight.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Seated%20Piriformis%20Stretch.jpg'
),
(
  'Air Squat (Activation)',
  5,
  'hips_legs',
  '10 slow reps.',
  'Feet shoulder-width. Descend sitting back.',
  'Heels glued to floor. Knees not caving inward. If heels lift, descend less.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Air%20Squat.jpg'
),
(
  'Butt Kicks (Hamstring activation)',
  6,
  'hips_legs',
  '10 reps per leg.',
  'Standing. Bring heel to glute using the hamstring.',
  'The knee must point down, not come forward. Keep pelvis still.',
  NULL,
  'https://lrxsovhnwlyyajndknev.supabase.co/storage/v1/object/public/exercise-images/Butt%20Kicks.jpg'
);
