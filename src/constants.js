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

// Fasting defaults
export const DEFAULT_FASTING_PRESET = "16/8";
export const DEFAULT_FASTING_HOURS = 16;

// Audio URLs
export const AUDIO_URLS = {
  wind: "https://drive.google.com/uc?export=download&id=1MPfMRcZVDFE7jMIbz8y_oFrn0Oi_EADw",
  focus_default: "https://files.catbox.moe/f0pwi6.mp3",
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
  { label: "14/10", fasting: 14, eating: 10 },
  { label: "16/8", fasting: 16, eating: 8 },
  { label: "18/6", fasting: 18, eating: 6 },
  { label: "Custom", fasting: null, eating: null },
];

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
  last_meal_time: "",
  next_meal_time: "",
  focus_work_minutes: DEFAULT_WORK_MINUTES,
  focus_break_minutes: DEFAULT_BREAK_MINUTES,
  focus_sound: "wind",
  relax_sound: "wind",
  body_breaks_target: DEFAULT_BODY_BREAKS_TARGET,
  exercise_selection: "auto",
  selected_groups: [],
};
