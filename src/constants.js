// Time constants
export const ONE_HOUR_MS = 3600000;
export const ONE_MINUTE_MS = 60000;
export const ONE_SECOND_MS = 1000;

// Break scheduling
export const MIN_BREAK_SPACING_MINUTES = 20;
export const ACTIVE_BREAK_DURATION_MINUTES = 5;

// Timer defaults
export const DEFAULT_WORK_MINUTES = 45;
export const DEFAULT_BREAK_MINUTES = 5;
export const DEFAULT_BODY_BREAKS_TARGET = 6;
export const DEFAULT_BREAK_INTERVAL_MINUTES = 30; // how often to take a stretch break

// Smart away detection
export const AWAY_WARNING_DELAY_MS = 30 * ONE_MINUTE_MS; // 30 min hidden → send warning
export const AWAY_GRACE_AFTER_WARNING_MS = 5 * ONE_MINUTE_MS; // 5 min to respond before auto-away
export const BREAK_NO_RESPONSE_AWAY_MS = 10 * ONE_MINUTE_MS; // 10 min ignoring a break → auto-away

// Fasting / Eating window defaults
export const DEFAULT_FASTING_PRESET = "16/8";
export const DEFAULT_FASTING_HOURS = 16;
export const DEFAULT_EATING_WINDOW_START = "12:00";
export const DEFAULT_MAX_MEALS = 3;

// Audio — files hosted in Supabase Storage bucket "audio"
const AUDIO_FILES = {
  "40hz-wind":           "40hz+wind.mp3",
  "40hz-ocean":          "40hz+ocean.mp3",
  "10hz-binaural-ocean": "10hz-binaural+ocean.mp3",
  "10hz-binaural-wind":  "10hz-binaural+wind.mp3",
};

// Legacy sound IDs from older sessions → map to current IDs
const LEGACY_SOUND_MAP = {
  "wind": "40hz-wind",
  "ocean": "40hz-ocean",
};

export const getAudioUrl = (soundId) => {
  const resolvedId = LEGACY_SOUND_MAP[soundId] || soundId;
  const filename = AUDIO_FILES[resolvedId];
  if (!filename) return null;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/audio/${filename}`;
};

// Default work hours
export const DEFAULT_WORK_HOURS = {
  morning_start: "09:00",
  morning_end: "13:00",
  afternoon_start: "14:00",
  afternoon_end: "18:00",
};

// Fasting presets
export const FASTING_PRESETS = [
  { label: "12/12", fasting: 12, eating: 12 },
  { label: "14/10", fasting: 14, eating: 10 },
  { label: "16/8", fasting: 16, eating: 8 },
  { label: "18/6", fasting: 18, eating: 6 },
  { label: "Custom", fasting: null, eating: null },
];

// Get eating hours from preset
export function getEatingHours(preset, customFastingHours) {
  const found = FASTING_PRESETS.find(p => p.label === preset);
  if (found && found.eating !== null) return found.eating;
  if (customFastingHours) return 24 - customFastingHours;
  return 8;
}

// Calculate eating window end time from start + eating hours
export function calculateEatingWindowEnd(startTime, eatingHours) {
  const [h, m] = (startTime || "12:00").split(":").map(Number);
  const totalMinutes = h * 60 + m + eatingHours * 60;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}


// Exercise muscle group labels
export const GROUP_LABELS = {
  neck_cervical: "Neck & Cervical",
  shoulders_thoracic: "Shoulders & Thoracic",
  wrists_forearms: "Wrists & Forearms",
  lower_back_core: "Lower Back & Core",
  hips_legs: "Hips & Legs",
};

// Daily defaults initial values
export const INITIAL_DAILY_DEFAULTS = {
  fasting_preset: DEFAULT_FASTING_PRESET,
  eating_window_start_time: DEFAULT_EATING_WINDOW_START,
  custom_fasting_hours: null,
  max_meals: DEFAULT_MAX_MEALS,
  focus_work_minutes: DEFAULT_WORK_MINUTES,
  focus_break_minutes: DEFAULT_BREAK_MINUTES,
  focus_sound: "40hz-wind",
  relax_sound: "10hz-binaural-ocean",
  body_breaks_target: DEFAULT_BODY_BREAKS_TARGET,
  break_interval_minutes: DEFAULT_BREAK_INTERVAL_MINUTES,
  exercise_selection: "auto",
  selected_groups: [],
};
