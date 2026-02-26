-- ============================================================
-- NomadBalance — Exercise Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- NECK & CERVICAL
INSERT INTO exercises (name, "order", "group", dosage, execution, anti_cheating, modification, image_url) VALUES
('Chin Tuck', 1, 'neck_cervical',
 '3 sets × 10 reps, hold 5s each',
 'Sit tall with shoulders relaxed. Draw your chin straight back, creating a "double chin". Hold for 5 seconds, then release. Keep your eyes level — don''t look up or down.',
 'Don''t tilt your head up or down. The movement is purely horizontal, like sliding a drawer back.',
 'Place two fingers on your chin to guide the movement. For more intensity, do it lying face-up.',
 NULL),

('Neck Lateral Flexion Stretch', 2, 'neck_cervical',
 '2 sets × 30s each side',
 'Sit tall. Gently tilt your right ear toward your right shoulder until you feel a stretch on the left side. Hold for 30 seconds. Repeat on the other side.',
 'Keep both shoulders down and relaxed — don''t shrug the opposite shoulder up. Don''t rotate or look sideways.',
 'For deeper stretch, gently place your hand on the side of your head (no pulling, just weight). Sit on your opposite hand to anchor the shoulder.',
 NULL),

('Levator Scapulae Stretch', 3, 'neck_cervical',
 '2 sets × 30s each side',
 'Sit tall. Rotate your head 45° to the right, then look down toward your right armpit. Use your right hand to gently assist the stretch. You should feel it in the back-left of your neck.',
 'Don''t round your upper back. Keep your chest open and shoulder blades gently pulled together.',
 'Can be done standing with one hand behind your back to depress the shoulder.',
 NULL),

-- SHOULDERS & THORACIC
('Thoracic Extension on Chair', 1, 'shoulders_thoracic',
 '3 sets × 10 reps',
 'Sit at the edge of a chair. Clasp your hands behind your head. Slowly arch your upper back over the chair backrest, extending through the thoracic spine. Return to neutral.',
 'Don''t arch your lower back — isolate the movement to the upper/mid back. The lumbar spine should stay neutral.',
 'Place a rolled towel behind your mid-back for a focal point. Reduce range of motion if uncomfortable.',
 NULL),

('Wall Angels', 2, 'shoulders_thoracic',
 '3 sets × 10 reps',
 'Stand with your back flat against a wall. Press your head, upper back, and hips into the wall. Start with arms at 90° (goalpost position). Slowly slide arms up toward the ceiling and back down while keeping contact with the wall.',
 'Don''t let your lower back arch away from the wall. If your arms lose wall contact, reduce the range.',
 'If wall is too difficult, do it lying face-up on the floor.',
 NULL),

('Doorway Pec Stretch', 3, 'shoulders_thoracic',
 '2 sets × 30s each side',
 'Stand in a doorway. Place your forearm against the door frame at shoulder height, elbow at 90°. Step through with the same-side foot until you feel a stretch across your chest and front shoulder.',
 'Don''t rotate your torso to "cheat" more range. Keep your core engaged and ribs down.',
 'Adjust arm height: higher targets upper pec fibers, lower targets lower fibers.',
 NULL),

('Scapular Retraction', 4, 'shoulders_thoracic',
 '3 sets × 12 reps, hold 3s each',
 'Sit or stand tall. Squeeze your shoulder blades together as if holding a pencil between them. Hold 3 seconds, release slowly.',
 'Don''t shrug your shoulders up toward your ears. The movement is purely backward, not upward.',
 'Add a resistance band between hands for more challenge.',
 NULL),

-- WRISTS & FOREARMS
('Wrist Extensor Stretch', 1, 'wrists_forearms',
 '2 sets × 30s each hand',
 'Extend your right arm straight in front, palm facing down. With your left hand, gently press the right fingers downward until you feel a stretch on the top of your forearm.',
 'Don''t bend your elbow. Keep the stretching arm completely straight for maximum effect.',
 'Do it with fingers curled for a deeper stretch of the extensors.',
 NULL),

('Wrist Flexor Stretch', 2, 'wrists_forearms',
 '2 sets × 30s each hand',
 'Extend your right arm straight in front, palm facing up. With your left hand, gently pull the right fingers back toward you until you feel a stretch on the underside of your forearm.',
 'Keep the elbow locked straight. Don''t shrug your shoulder.',
 'Press your palm flat against a wall with fingers pointing down for a passive stretch.',
 NULL),

('Finger Tendon Glides', 3, 'wrists_forearms',
 '2 sets × 10 reps each hand',
 'Start with fingers straight. Make a hook fist (bend at the middle and end joints only). Then make a full fist. Then a flat fist (bend only at the knuckles). Return to straight. That''s one rep.',
 'Move slowly and deliberately through each position. Don''t rush — the goal is tendon mobility, not speed.',
 'If any position causes pain, skip it and move to the next.',
 NULL),

('Wrist Circles', 4, 'wrists_forearms',
 '2 sets × 10 each direction per hand',
 'Extend your arm. Make slow, controlled circles with your wrist — 10 clockwise, then 10 counter-clockwise. Aim for the largest pain-free range of motion.',
 'Don''t move your forearm — only your hand should be rotating. Keep the movement smooth, not jerky.',
 'Clasp hands together and do circles with both wrists simultaneously.',
 NULL),

-- LOWER BACK & CORE
('Cat-Cow', 1, 'lower_back_core',
 '3 sets × 10 reps (slow)',
 'Get on all fours, hands under shoulders, knees under hips. Inhale: arch your back, lift your chest and tailbone (Cow). Exhale: round your spine, tuck chin and tailbone (Cat). Move slowly with breath.',
 'Don''t just move your head — the entire spine should articulate segmentally from tailbone to crown.',
 'Can be done seated in a chair for a desk-friendly version.',
 NULL),

('Dead Bug', 2, 'lower_back_core',
 '3 sets × 8 reps each side',
 'Lie face-up. Raise arms straight toward ceiling and bend knees to 90°. Slowly extend your right arm overhead and left leg forward simultaneously, keeping your lower back pressed into the floor. Return and switch sides.',
 'Your lower back MUST stay in contact with the floor throughout. If it arches, you''ve gone too far.',
 'Start with just legs or just arms if both together is too challenging.',
 NULL),

('Pelvic Tilt', 3, 'lower_back_core',
 '3 sets × 12 reps, hold 5s each',
 'Lie face-up with knees bent, feet flat. Gently flatten your lower back into the floor by tilting your pelvis upward. Hold 5 seconds, then release. Think of "tucking your tail".',
 'Don''t push with your feet or squeeze your glutes hard. The movement should be subtle and controlled, driven by your deep abs.',
 'Can be done standing against a wall for a work-friendly option.',
 NULL),

('Seated Spinal Rotation', 4, 'lower_back_core',
 '2 sets × 8 each side, hold 5s',
 'Sit tall in your chair with feet flat. Cross your arms over your chest. Slowly rotate your torso to the right, looking over your right shoulder. Hold 5 seconds. Return to center and rotate left.',
 'Don''t shift your hips — they should stay square to the front. Only your ribcage and above should rotate.',
 'Hold the back of the chair with the hand you''re rotating toward for gentle assistance.',
 NULL),

-- HIPS & LEGS
('Hip Flexor Stretch (Half Kneeling)', 1, 'hips_legs',
 '2 sets × 30s each side',
 'Kneel on your right knee, left foot forward in a lunge position. Tuck your pelvis slightly and shift your weight forward until you feel a stretch in the front of your right hip. Keep your torso upright.',
 'Don''t arch your lower back to fake a deeper stretch. The stretch should come from hip extension, not lumbar extension.',
 'Squeeze the glute of the kneeling leg to intensify the stretch. Raise the same-side arm for an added oblique stretch.',
 NULL),

('Seated Figure-4 Stretch', 2, 'hips_legs',
 '2 sets × 30s each side',
 'Sit tall. Cross your right ankle over your left knee in a figure-4 shape. Keeping your back straight, lean forward from the hips until you feel a stretch deep in your right glute.',
 'Don''t round your back to get deeper — hinge at the hips. Press the crossed knee gently down if needed.',
 'If seated is uncomfortable, do it lying face-up (supine pigeon).',
 NULL),

('Glute Bridge', 3, 'hips_legs',
 '3 sets × 12 reps, hold 3s at top',
 'Lie face-up, knees bent, feet flat and hip-width apart. Push through your heels to lift your hips toward the ceiling. Squeeze your glutes at the top for 3 seconds. Lower slowly.',
 'Don''t hyperextend — your body should form a straight line from shoulders to knees at the top. Don''t push from your lower back.',
 'Single-leg glute bridge for more challenge. Place feet on an elevated surface for variation.',
 NULL),

('Standing Quad Stretch', 4, 'hips_legs',
 '2 sets × 30s each side',
 'Stand on your left leg (hold something for balance if needed). Bend your right knee and grab your right ankle behind you. Pull your heel toward your glute. Keep your knees together and your pelvis tucked.',
 'Don''t let the stretching knee drift forward or out to the side. Keep it pointing straight down, aligned with the standing knee.',
 'If you can''t reach your ankle, loop a towel or belt around your foot.',
 NULL);
