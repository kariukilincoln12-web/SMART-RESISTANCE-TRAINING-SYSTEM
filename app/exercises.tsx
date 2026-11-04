import React from "react";

export type Mode = "CONSTANT" | "ECCENTRIC_OVERLOAD" | "ACCOMMODATING";

export interface Exercise {
  id: string;
  name: string;
  group: string;
  muscles: string;
  how: string;
  pct: number; // fraction of the member's baseline load
  mode: Mode;
}

export const GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Sports"];

/* Photos live in public/ex-v2/<id>.jpg */
export const LIBRARY: Exercise[] = [
  {"id": "bench-press", "name": "Bench Press", "group": "Chest", "muscles": "Chest, front shoulders, triceps", "how": "Seat upright, handles level with your chest. Press out without locking elbows, return slowly.", "pct": 0.8, "mode": "CONSTANT"},
  {"id": "cable-bench-press", "name": "Cable Bench Press", "group": "Chest", "muscles": "Chest, front shoulders, triceps", "how": "Cable arms at chest height. Press both handles forward, control the return.", "pct": 0.55, "mode": "CONSTANT"},
  {"id": "converging-bench-press", "name": "Converging Bench Press", "group": "Chest", "muscles": "Chest, front shoulders, triceps", "how": "Like the cable press, but your hands travel toward each other as you push.", "pct": 0.5, "mode": "ACCOMMODATING"},
  {"id": "incline-bench-press", "name": "Incline Bench Press", "group": "Chest", "muscles": "Upper chest, front shoulders, triceps", "how": "Tilt the seat back one notch so you lean forward. Press the handles away from your chest.", "pct": 0.6, "mode": "CONSTANT"},
  {"id": "cable-incline-press", "name": "Cable Incline Bench Press", "group": "Chest", "muscles": "Upper chest, front shoulders, triceps", "how": "Press the cables out and up at about 45 degrees from chest height.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "converging-incline-press", "name": "Converging Incline Press", "group": "Chest", "muscles": "Upper chest, front shoulders, triceps", "how": "Press up at 45 degrees while bringing both hands together.", "pct": 0.45, "mode": "ACCOMMODATING"},
  {"id": "decline-bench-press", "name": "Decline Bench Press", "group": "Chest", "muscles": "Lower chest, front shoulders, triceps", "how": "Sit at the front of the seat and lean back. Press the handles away from your chest.", "pct": 0.7, "mode": "CONSTANT"},
  {"id": "cable-decline-press", "name": "Cable Decline Bench Press", "group": "Chest", "muscles": "Lower chest, front shoulders, triceps", "how": "Lean back against the tilted seat and press the cables straight out, level with the floor.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "converging-decline-press", "name": "Converging Decline Press", "group": "Chest", "muscles": "Lower chest, front shoulders, triceps", "how": "Same as the cable decline press, with your hands meeting in the middle.", "pct": 0.45, "mode": "ACCOMMODATING"},
  {"id": "self-stabilizing-chest-press", "name": "Self Stabilizing Chest Press", "group": "Chest", "muscles": "Chest, shoulders, core", "how": "Sit forward with no back support and press. Use much lighter weight, your core works too.", "pct": 0.35, "mode": "CONSTANT"},
  {"id": "cable-pec-fly", "name": "Cable Pec Fly", "group": "Chest", "muscles": "Chest, front shoulders", "how": "Seat tilted back, arms wide. Sweep your hands together in an arc.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "cable-incline-fly", "name": "Cable Incline Fly", "group": "Chest", "muscles": "Chest, front shoulders", "how": "Sit upright, arms wide. Bring your hands together and upward in an arc.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "cable-low-fly", "name": "Cable Low Fly", "group": "Chest", "muscles": "Chest, front shoulders, triceps", "how": "Set the arms low. Sweep your hands up and together to chest height.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "shoulder-press", "name": "Shoulder Press", "group": "Shoulders", "muscles": "Shoulders, triceps", "how": "Seat tilted, handles at shoulder height. Press overhead without locking your elbows.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "cable-shoulder-press", "name": "Cable Shoulder Press", "group": "Shoulders", "muscles": "Shoulders, triceps", "how": "Cable arms vertical, handles at shoulder level. Press both arms overhead.", "pct": 0.4, "mode": "CONSTANT"},
  {"id": "converging-shoulder-press", "name": "Converging Shoulder Press", "group": "Shoulders", "muscles": "Shoulders, triceps", "how": "Press overhead while bringing your hands together.", "pct": 0.4, "mode": "ACCOMMODATING"},
  {"id": "cable-lateral-raise", "name": "Cable Lateral Raise", "group": "Shoulders", "muscles": "Side shoulders", "how": "Arms low, straight arms. Lift your hands out and up, lower slowly.", "pct": 0.12, "mode": "CONSTANT"},
  {"id": "cable-front-raise", "name": "Cable Front Raise", "group": "Shoulders", "muscles": "Front shoulders", "how": "Arms low, overhand grip. Lift straight arms forward and up.", "pct": 0.12, "mode": "CONSTANT"},
  {"id": "standing-cable-lateral-raise", "name": "Standing Cable Lateral Raise", "group": "Shoulders", "muscles": "Side shoulders", "how": "Stand beside one low arm. Raise a straight arm out to the side, lower slowly.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "standing-front-raise", "name": "Standing Front Raise", "group": "Shoulders", "muscles": "Front shoulders", "how": "Use the chain and bar on the low pulley, face away. Raise straight arms to chest height.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "upright-row", "name": "Upright Row", "group": "Shoulders", "muscles": "Shoulders, upper back", "how": "Face the low pulley, bar at arm's length. Pull it up to shoulder level.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "shrugs", "name": "Shrugs", "group": "Shoulders", "muscles": "Upper back, shoulders", "how": "Stand on the foot plate holding the bar. Shrug your shoulders up and back.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "external-rotator", "name": "External Rotator", "group": "Shoulders", "muscles": "Rear shoulder, rotator cuff", "how": "Elbow at your side at elbow height. Rotate your forearm outward like opening a door.", "pct": 0.08, "mode": "CONSTANT"},
  {"id": "internal-rotator", "name": "Internal Rotator", "group": "Shoulders", "muscles": "Shoulders, rotator cuff", "how": "Elbow at your side. Rotate your forearm toward your belly like closing a door.", "pct": 0.08, "mode": "CONSTANT"},
  {"id": "lat-pull-down", "name": "Lat Pull Down", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Knees under the pads, wide overhand grip. Pull the bar to your upper chest.", "pct": 0.7, "mode": "ECCENTRIC_OVERLOAD"},
  {"id": "low-cable-row", "name": "Low Cable Row", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Sit on the floor facing the low pulley. Pull the bar to your midsection and squeeze.", "pct": 0.6, "mode": "CONSTANT"},
  {"id": "mid-row", "name": "Mid Row", "group": "Back", "muscles": "Lats, upper back, rear shoulders", "how": "Handles at shoulder height, arms out. Pull back as far as you can and squeeze.", "pct": 0.6, "mode": "CONSTANT"},
  {"id": "one-arm-row", "name": "One Arm Row", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Bend at the waist, supported on the seat. Pull one handle to your midsection.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "front-lat-pullover", "name": "Front Lat Pullover", "group": "Back", "muscles": "Lats, upper back", "how": "Use the chain on the high pulley. Keep arms straight and pull the bar down.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "seated-cable-mid-row", "name": "Seated Cable Mid Row", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Lean back slightly, bar on the mid pulley. Pull back and keep your torso still.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "self-stabilizing-mid-row", "name": "Self Stabilizing Mid Row", "group": "Back", "muscles": "Lats, upper back, rear shoulders", "how": "Stand facing the machine with the bar on the mid pulley. Pull back as far as possible.", "pct": 0.4, "mode": "CONSTANT"},
  {"id": "cable-arm-curl", "name": "Cable Arm Curl", "group": "Arms", "muscles": "Biceps, forearms", "how": "Arms low, underhand grip. Curl the handles up with your elbows still.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "standing-bar-curl", "name": "Standing Bar Curl", "group": "Arms", "muscles": "Biceps, forearms", "how": "Chain and bar on the low pulley. Curl upward and keep your elbows pinned.", "pct": 0.3, "mode": "ECCENTRIC_OVERLOAD"},
  {"id": "overhead-biceps-curl", "name": "Overhead Biceps Curl", "group": "Arms", "muscles": "Biceps, forearms", "how": "Knees under the pads, bar from the high pulley. Curl the bar toward the back of your head.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "arm-curl-mid-pulley", "name": "Arm Curl From Mid Pulley", "group": "Arms", "muscles": "Biceps, forearms", "how": "Sit facing away from the machine, lean back. Pull the bar from the mid pulley toward your face.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "triceps-pushdown", "name": "Triceps Pushdown", "group": "Arms", "muscles": "Triceps, forearms", "how": "High pulley with chain and bar. Push down until your elbows lock at your sides.", "pct": 0.35, "mode": "CONSTANT"},
  {"id": "triceps-extension", "name": "Triceps Extension", "group": "Arms", "muscles": "Triceps, forearms", "how": "Bar on the mid pulley, upper arm level. Straighten at the elbow only.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "triceps-extension-high", "name": "Triceps Extension From High Pulley", "group": "Arms", "muscles": "Triceps, forearms", "how": "Lean slightly forward, bar from the high pulley. Straighten your elbows, upper arms level.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "triceps-kickback", "name": "Triceps Kickback", "group": "Arms", "muscles": "Triceps, forearms", "how": "Bend to near horizontal beside the machine. Extend your elbow, upper arm stays still.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "ab-crunch", "name": "Ab Crunch", "group": "Core", "muscles": "Abs", "how": "Ab strap over your shoulders. Crunch forward and down using your abs.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "reverse-crunch", "name": "Reverse Crunch", "group": "Core", "muscles": "Abs", "how": "Hold the handles, legs out level. Draw your knees toward your chest.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "oblique-twist", "name": "Oblique Twist", "group": "Core", "muscles": "Obliques, abs", "how": "Handle at your stomach, hips locked. Twist your upper body.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "side-bends", "name": "Side Bends", "group": "Core", "muscles": "Obliques, abs", "how": "Handle held at your side, hips locked. Bend sideways away from it.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "leg-extension", "name": "Leg Extension", "group": "Legs", "muscles": "Quads", "how": "Knees in line with the lever pivot. Extend your legs to horizontal.", "pct": 0.5, "mode": "ECCENTRIC_OVERLOAD"},
  {"id": "standing-leg-curl", "name": "Standing Leg Curl", "group": "Legs", "muscles": "Hamstrings, calves", "how": "Face the machine, ankles behind the lower pads. Curl one leg back and up.", "pct": 0.3, "mode": "ECCENTRIC_OVERLOAD"},
  {"id": "seated-leg-curl", "name": "Seated Leg Curl", "group": "Legs", "muscles": "Hamstrings, calves", "how": "Ankles on the lower pad under the middle pads. Bend your knees (Elite model only).", "pct": 0.4, "mode": "CONSTANT"},
  {"id": "leg-press", "name": "Leg Press", "group": "Legs", "muscles": "Whole leg, glutes", "how": "Feet flat on the plates. Press to full extension without locking knees (needs the leg press attachment).", "pct": 1.0, "mode": "CONSTANT"},
  {"id": "calf-raise", "name": "Calf Raise", "group": "Legs", "muscles": "Calves", "how": "On the leg press plates, legs nearly straight. Press with the balls of your feet.", "pct": 0.8, "mode": "CONSTANT"},
  {"id": "hip-adduction", "name": "Hip Adduction", "group": "Legs", "muscles": "Inner thigh", "how": "Ankle strap on your back leg, hold the support. Pull the leg across in front of the other.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "hip-abduction", "name": "Hip Abduction", "group": "Legs", "muscles": "Outer thigh", "how": "Ankle strap on your front leg, hold the support. Pull the leg outward, away from your body.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "glute-kick", "name": "Glute Kick", "group": "Legs", "muscles": "Glutes, hamstrings", "how": "Face the machine, strap on one ankle. Extend your hip and pull the leg backward.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "golf-swing", "name": "Golf Swing", "group": "Sports", "muscles": "Core, shoulders, arms", "how": "Single handle on one arm. Swing as if hitting a golf ball.", "pct": 0.1, "mode": "ACCOMMODATING"},
  {"id": "tennis-swing", "name": "Tennis Swing", "group": "Sports", "muscles": "Core, shoulders, arms", "how": "Stand beside the arm. Swing like a forehand or backhand.", "pct": 0.1, "mode": "ACCOMMODATING"},
  {"id": "baseball-pitch", "name": "Baseball Pitch", "group": "Sports", "muscles": "Core, shoulders, arms", "how": "Single handle on the mid pulley. Throw as if pitching a baseball.", "pct": 0.1, "mode": "ACCOMMODATING"},
  {"id": "cable-crossover", "name": "Cable Crossover", "group": "Chest", "muscles": "Chest, front shoulders", "how": "Pulleys high, step forward with arms wide. Sweep your hands down and together in front of your hips.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "standing-cable-chest-press", "name": "Standing Cable Chest Press", "group": "Chest", "muscles": "Chest, front shoulders, triceps", "how": "Pulleys at chest height, split stance. Press both handles forward until your arms are straight.", "pct": 0.4, "mode": "CONSTANT"},
  {"id": "cable-chest-fly", "name": "Standing Cable Chest Fly", "group": "Chest", "muscles": "Chest, front shoulders", "how": "Pulleys at chest height, slight elbow bend. Bring your hands together in front of your chest.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "high-to-low-cable-fly", "name": "High to Low Cable Fly", "group": "Chest", "muscles": "Lower chest, front shoulders", "how": "Pulleys high. Sweep your hands down and across toward your waist, squeezing your chest.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "low-crossover", "name": "Low Crossover", "group": "Chest", "muscles": "Upper chest, front shoulders", "how": "Pulleys low. Sweep your hands up and together to chest height with soft elbows.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "one-arm-lateral-raise", "name": "One Arm Lateral Raise", "group": "Shoulders", "muscles": "Side shoulders", "how": "Stand side-on to the pulley, handle in the far hand. Raise your arm out to shoulder height.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "seated-rear-lateral-raise", "name": "Seated Rear Lateral Raise", "group": "Shoulders", "muscles": "Rear shoulders, upper back", "how": "Sit bent forward, cables crossed. Sweep both arms out and back, keeping them nearly straight.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "cable-y-raise", "name": "Cable Y Raise", "group": "Shoulders", "muscles": "Shoulders, upper back", "how": "Pulleys low. Raise both arms up and apart in a Y shape.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "leaning-lateral-raise", "name": "Leaning Lateral Raise", "group": "Shoulders", "muscles": "Side shoulders", "how": "Hold the frame and lean away from the pulley. Raise the free arm out to the side.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "face-pull", "name": "Face Pull", "group": "Shoulders", "muscles": "Rear shoulders, upper back", "how": "Rope at face height. Pull toward your forehead with elbows high and apart.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "rear-delt-row", "name": "Rear Delt Row", "group": "Shoulders", "muscles": "Rear shoulders, upper back", "how": "Pulleys at shoulder height. Pull the handles back with elbows high and out.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "bent-over-side-lateral", "name": "Bent-Over Side Lateral", "group": "Shoulders", "muscles": "Rear shoulders", "how": "Hinge forward with a flat back. Raise your arms out to the sides.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "alt-shoulder-press", "name": "Alternating Shoulder Press", "group": "Shoulders", "muscles": "Shoulders, triceps", "how": "Pulley low, handles at your shoulders. Press one arm overhead, lower, then switch.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "lat-pushdown", "name": "Straight-Arm Lat Pushdown", "group": "Back", "muscles": "Lats", "how": "High pulley, arms straight. Sweep the bar down to your thighs, keeping elbows locked.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "bent-over-lat-pull", "name": "Bent-Over Lat Pull", "group": "Back", "muscles": "Lats, upper back", "how": "Hinge forward, arms reaching to the pulley. Pull your hands down and back to your hips.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "two-arm-row", "name": "Two-Arm Row", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Hinge forward with a flat back. Row both handles to your lower ribs and squeeze.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "shotgun-row", "name": "Shotgun Row", "group": "Back", "muscles": "Lats, upper back, biceps", "how": "Split stance, pulley low. Row one handle back to your hip while rotating slightly.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "one-arm-biceps-curl", "name": "One Arm Biceps Curl", "group": "Arms", "muscles": "Biceps", "how": "Pulley low, step back. Curl the handle up with your elbow fixed at your side.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "inner-biceps-curl", "name": "Inner Biceps Curl", "group": "Arms", "muscles": "Biceps (inner head)", "how": "Pulley at shoulder height, arm out. Curl the handle toward your head.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "unilateral-biceps-curl", "name": "Unilateral Biceps Curl", "group": "Arms", "muscles": "Biceps", "how": "Pulley low, one arm at a time. Curl up and squeeze, then lower slowly.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "incline-biceps-curl", "name": "Incline Biceps Curl", "group": "Arms", "muscles": "Biceps (long head)", "how": "Lie back on an incline bench facing away from the pulley. Curl the handle up with elbows back.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "lying-biceps-curl", "name": "Lying Biceps Curl", "group": "Arms", "muscles": "Biceps", "how": "Lie on a bench with the pulley near your head. Curl the bar toward your face.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "sz-curl", "name": "SZ Bar Curl", "group": "Arms", "muscles": "Biceps, forearms", "how": "Low pulley with an SZ bar. Curl up keeping your elbows pinned.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "hammer-curl", "name": "Rope Hammer Curl", "group": "Arms", "muscles": "Biceps, forearms", "how": "Low pulley with a rope, palms facing in. Curl up and squeeze at the top.", "pct": 0.25, "mode": "CONSTANT"},
  {"id": "reverse-curl", "name": "Reverse Curl", "group": "Arms", "muscles": "Forearms, biceps", "how": "Overhand grip on the bar. Curl up slowly with your wrists straight.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "overhead-cable-extension", "name": "Overhead Cable Extension", "group": "Arms", "muscles": "Triceps", "how": "Face away from the pulley, arms overhead. Straighten your elbows, keeping upper arms still.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "kneeling-triceps-extension", "name": "Kneeling Triceps Extension", "group": "Arms", "muscles": "Triceps", "how": "Kneel at a bench with the high pulley. Extend your elbows, keeping upper arms still.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "sz-bar-pushdown", "name": "SZ Bar Triceps Pushdown", "group": "Arms", "muscles": "Triceps", "how": "High pulley with an SZ bar. Push down until your arms are straight, elbows at your sides.", "pct": 0.35, "mode": "CONSTANT"},
  {"id": "high-cross-triceps-extension", "name": "High Cross Triceps Extension", "group": "Arms", "muscles": "Triceps", "how": "Facing away from a high pulley, elbow up. Straighten your arm forward.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "single-arm-pushdown", "name": "Single Arm Triceps Pushdown", "group": "Arms", "muscles": "Triceps", "how": "High pulley with a single handle. Push down with one arm, elbow fixed at your side.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "single-cable-overhead-press", "name": "Single Cable Overhead Press", "group": "Core", "muscles": "Core, shoulders, obliques", "how": "Squat low, handle at your shoulder. Stand and press the handle overhead, bracing your core.", "pct": 0.2, "mode": "CONSTANT"},
  {"id": "hanging-leg-raise", "name": "Cable Hanging Leg Raise", "group": "Core", "muscles": "Lower abs, hip flexors", "how": "Hang from the bar with an ankle strap on the cable. Raise your legs to hip height.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "standing-cable-twist", "name": "Standing Cable Twist", "group": "Core", "muscles": "Obliques, abs", "how": "Pulley at chest height, arms straight. Rotate your torso away from the machine.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "standing-cable-crunch", "name": "Standing Cable Crunch", "group": "Core", "muscles": "Abs", "how": "High pulley, rope at your head. Curl your ribs toward your hips.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "wood-chop", "name": "Cable Wood Chop", "group": "Core", "muscles": "Obliques, core", "how": "Pulley high on one side. Rotate and chop diagonally down across your body.", "pct": 0.2, "mode": "ACCOMMODATING"},
  {"id": "cable-reverse-crunch", "name": "Lying Cable Reverse Crunch", "group": "Core", "muscles": "Lower abs", "how": "Lie back with the ankle strap on a low cable. Curl your knees toward your chest.", "pct": 0.1, "mode": "CONSTANT"},
  {"id": "kneeling-cable-crunch", "name": "Kneeling Cable Crunch", "group": "Core", "muscles": "Abs", "how": "Kneel facing the high pulley with the rope at your head. Crunch down, hips still.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "russian-twist", "name": "Cable Russian Twist", "group": "Core", "muscles": "Obliques, abs", "how": "Pulley at chest height, hold the handle. Twist side to side from your torso.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "pallof-press", "name": "Pallof Press", "group": "Core", "muscles": "Deep core, obliques", "how": "Stand side-on to the pulley, hands at chest. Press out and hold without letting it twist you.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "hip-rotation", "name": "Cable Hip Rotation", "group": "Core", "muscles": "Obliques, hips", "how": "Pulley at waist height, arms straight. Rotate your hips and torso together.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "seated-cable-crunch", "name": "Seated Cable Crunch", "group": "Core", "muscles": "Abs", "how": "Sit with the rope at your head. Curl your chest toward your knees.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "kneeling-cable-twist", "name": "Kneeling Cable Twist", "group": "Core", "muscles": "Obliques, abs", "how": "Pulley at chest height, arms straight. Twist your torso side to side.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "one-leg-calf-raise", "name": "One Leg Calf Raise", "group": "Legs", "muscles": "Calves", "how": "Ankle strap on one leg, stand on a plate. Rise onto your toes and lower slowly.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "diagonal-kickback", "name": "Diagonal Kickback", "group": "Legs", "muscles": "Glutes", "how": "Ankle strap, hinge forward holding the frame. Kick back and across on a diagonal.", "pct": 0.15, "mode": "CONSTANT"},
  {"id": "inverse-leg-curl", "name": "Inverse Leg Curl", "group": "Legs", "muscles": "Hamstrings", "how": "Kneel on the bench facing the pulley, strap on your ankles. Curl your heels toward your glutes.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "lying-leg-curl", "name": "Lying Leg Curl", "group": "Legs", "muscles": "Hamstrings", "how": "Lie face down, pad above your heels. Curl your heels toward your glutes.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "seated-calf-raise", "name": "Seated Calf Raise", "group": "Legs", "muscles": "Calves", "how": "Knees under the pad, balls of your feet on the plate. Rise up and lower slowly.", "pct": 0.5, "mode": "CONSTANT"},
  {"id": "single-leg-press", "name": "Single Leg Press", "group": "Legs", "muscles": "Quads, glutes", "how": "One foot on the plate. Press to full extension without locking your knee.", "pct": 0.6, "mode": "CONSTANT"},
  {"id": "cable-squat-row", "name": "Cable Row Squat", "group": "Legs", "muscles": "Legs, back", "how": "Hold the handle and squat down, then stand while rowing toward your ribs.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "pull-through", "name": "Cable Pull-Through", "group": "Legs", "muscles": "Glutes, hamstrings", "how": "Face away from a low pulley, rope between your legs. Hinge back, then drive your hips forward.", "pct": 0.3, "mode": "CONSTANT"},
  {"id": "reverse-lunge", "name": "Cable Reverse Lunge", "group": "Legs", "muscles": "Quads, glutes", "how": "Hold the handle at your chest. Step back into a lunge, then push back up.", "pct": 0.2, "mode": "CONSTANT"}
];

export const INFO: Record<string, { diet: string[]; actions: string[] }> = {
  All: {
    diet: ["Aim for roughly 20-40 g of protein within a couple of hours: eggs, chicken, fish, beans or yogurt", "Add carbs to refill energy: rice, oats, potato or fruit", "Drink about 500 ml of water"],
    actions: ["Walk slowly for 5 minutes to bring your heart rate down", "Stretch the muscles you worked, 30 seconds each", "Sleep 7-9 hours, and rest a muscle for about 48 hours before training it hard again"],
  },
  Chest: {
    diet: ["Eggs, chicken or Greek yogurt for protein", "Rice or sweet potato to refill energy", "A banana and a glass of water"],
    actions: ["Doorway chest stretch, 30 seconds each side", "Light shoulder circles to loosen up", "Rest your chest for 48 hours before the next press session"],
  },
  Back: {
    diet: ["Fish, lean beef or beans for protein", "Oats or brown rice for energy", "A glass of milk or yogurt and water"],
    actions: ["Child's pose stretch for 30-60 seconds", "Hang gently from a bar or stretch your lats against a wall", "Keep a tall posture at your desk today"],
  },
  Shoulders: {
    diet: ["Chicken, eggs or lentils for protein", "A bowl of oats with fruit", "Water, plus a handful of nuts"],
    actions: ["Cross-body shoulder stretch, 30 seconds each side", "Slow arm circles", "Avoid heavy overhead work tomorrow"],
  },
  Arms: {
    diet: ["Eggs, milk or tuna for protein", "A banana or toast with peanut butter", "Water"],
    actions: ["Triceps overhead stretch, 30 seconds each arm", "Gentle wrist and forearm stretch", "Rest your arms for about 48 hours"],
  },
  Legs: {
    diet: ["Chicken, fish or beans for protein", "A larger carb portion: rice, pasta or potatoes", "Extra water, since legs burn the most energy"],
    actions: ["Walk or cycle easy for 5-10 minutes", "Stretch quads, hamstrings and calves for 30 seconds each", "Take the stairs gently tomorrow and avoid heavy leg work for 48 hours"],
  },
  Sports: {
    diet: ["Eggs, yogurt or lean meat for protein", "Rice, oats or fruit for energy", "Water, and a little salt if you sweated a lot"],
    actions: ["Stretch shoulders, hips and back, 10-15 seconds each", "Walk for 5 minutes to cool down", "Keep the swing or throw smooth, not forced, next time"],
  },
  Core: {
    diet: ["Eggs, yogurt or lean meat for protein", "Fruit and whole grains", "Water, and a lighter meal if you feel full"],
    actions: ["Cobra or gentle back-extension stretch, 30 seconds", "Slow deep breathing for a minute", "Core can be trained again within a day or two if it feels fine"],
  },
};

export function ExPhoto({ ex, className = "" }: { ex: Exercise; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/ex-v2/${ex.id}.jpg`}
      alt={`${ex.name} - correct form`}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
      className={`w-full aspect-[4/3] object-contain rounded-xl bg-white ${className}`}
    />
  );
}

/* Collapsible form guide used on the Train page */
export function FormGuide({ name }: { name: string }) {
  const ex = LIBRARY.find((e) => e.name === name);
  if (!ex) return null;
  return (
    <details className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <summary className="cursor-pointer font-bold text-sm">Form guide - {ex.name}</summary>
      <div className="grid md:grid-cols-[220px_1fr] gap-4 mt-3 items-start">
        <ExPhoto ex={ex} />
        <div className="space-y-2 text-sm text-zinc-300">
          <p>{ex.how}</p>
          <p className="text-zinc-500">Works: {ex.muscles}</p>
        </div>
      </div>
    </details>
  );
}
