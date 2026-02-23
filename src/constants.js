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

// Fasting / Eating window defaults
export const DEFAULT_FASTING_PRESET = "16/8";
export const DEFAULT_FASTING_HOURS = 16;
export const DEFAULT_EATING_WINDOW_START = "12:00";
export const DEFAULT_MAX_MEALS = 3;

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
  if (preset === "custom" && customFastingHours) return 24 - customFastingHours;
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

// Calculate smart meal plan based on work schedule and eating window
export function calculateMealPlan({ morningEnd, afternoonEnd, windowStart, windowEnd, maxMeals }) {
  const toMin = (t) => {
    const [h, m] = (t || "12:00").split(":").map(Number);
    return h * 60 + m;
  };
  const toTime = (m) =>
    `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const winStart = toMin(windowStart);
  const winEnd = toMin(windowEnd);
  const lunchMin = toMin(morningEnd);
  const dinnerMin = toMin(afternoonEnd);

  const mainMeals = [];

  // Lunch: at morning work end (lunch break), clamped to eating window
  const lunchTime = Math.max(lunchMin, winStart);
  if (lunchTime < winEnd - 30) {
    mainMeals.push({ type: "lunch", label: "Lunch break", time: toTime(lunchTime), minutes: lunchTime });
  }

  // Dinner: at afternoon work end, must fit in eating window with 30min margin
  const dinnerTime = Math.min(dinnerMin, winEnd - 30);
  if (dinnerTime > (mainMeals[0]?.minutes || winStart) + 60 && dinnerTime >= winStart) {
    mainMeals.push({ type: "dinner", label: "After work", time: toTime(dinnerTime), minutes: dinnerTime });
  }

  const snacksAllowed = Math.max(0, (maxMeals || 3) - mainMeals.length);

  return { mainMeals, snacksAllowed };
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
  eating_window_start: null,
  custom_fasting_hours: null,
  max_meals: DEFAULT_MAX_MEALS,
  focus_work_minutes: DEFAULT_WORK_MINUTES,
  focus_break_minutes: DEFAULT_BREAK_MINUTES,
  focus_sound: "wind",
  relax_sound: "wind",
  body_breaks_target: DEFAULT_BODY_BREAKS_TARGET,
  exercise_selection: "auto",
  selected_groups: [],
};
