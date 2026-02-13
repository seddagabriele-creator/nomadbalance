/**
 * Break Feasibility Calculator
 *
 * Calculates whether the chosen number of active breaks is realistic
 * given: work hours, focus rhythm, current time, and minimum spacing.
 */

import { MIN_BREAK_SPACING_MINUTES, ACTIVE_BREAK_DURATION_MINUTES, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES } from "../constants";

/**
 * Parse "HH:MM" into total minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Format minutes back to "HH:MM"
 */
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Calculate total work minutes from work hours settings.
 * Supports split schedule (morning + afternoon) or single range.
 */
export function calculateWorkMinutes({ morningStart, morningEnd, afternoonStart, afternoonEnd, workStart, workEnd }) {
  if (workStart && workEnd) {
    return Math.max(0, timeToMinutes(workEnd) - timeToMinutes(workStart));
  }
  const morning = Math.max(0, timeToMinutes(morningEnd) - timeToMinutes(morningStart));
  const afternoon = Math.max(0, timeToMinutes(afternoonEnd) - timeToMinutes(afternoonStart));
  return morning + afternoon;
}

/**
 * Calculate remaining work minutes from NOW until end of work.
 * Accounts for lunch break in split schedules.
 */
export function calculateRemainingWorkMinutes({ morningStart, morningEnd, afternoonStart, afternoonEnd, workStart, workEnd }) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (workStart && workEnd) {
    const start = timeToMinutes(workStart);
    const end = timeToMinutes(workEnd);
    if (nowMinutes >= end) return 0;
    if (nowMinutes <= start) return end - start;
    return end - nowMinutes;
  }

  const mStart = timeToMinutes(morningStart);
  const mEnd = timeToMinutes(morningEnd);
  const aStart = timeToMinutes(afternoonStart);
  const aEnd = timeToMinutes(afternoonEnd);

  let remaining = 0;

  // Morning block
  if (nowMinutes < mEnd) {
    remaining += mEnd - Math.max(nowMinutes, mStart);
  }

  // Afternoon block
  if (nowMinutes < aEnd) {
    remaining += aEnd - Math.max(nowMinutes, aStart);
  }

  return Math.max(0, remaining);
}

/**
 * Calculate the maximum feasible number of active breaks.
 *
 * Logic: Each break needs MIN_BREAK_SPACING_MINUTES of spacing,
 * plus the break itself takes ACTIVE_BREAK_DURATION_MINUTES.
 * We also check that breaks fit within focus cycles.
 */
export function calculateMaxBreaks({ totalWorkMinutes, focusWorkMinutes, focusBreakMinutes }) {
  const cycleLength = (focusWorkMinutes || DEFAULT_WORK_MINUTES) + (focusBreakMinutes || DEFAULT_BREAK_MINUTES);
  const totalCycles = Math.floor(totalWorkMinutes / cycleLength);

  // Approach 1: based on spacing — how many breaks fit with minimum spacing
  const spacingBased = Math.floor(totalWorkMinutes / (MIN_BREAK_SPACING_MINUTES + ACTIVE_BREAK_DURATION_MINUTES));

  // Approach 2: based on focus cycles — ideally 1 break per focus cycle
  const cycleBased = totalCycles;

  // Take the more conservative (smaller) value
  return Math.max(1, Math.min(spacingBased, cycleBased));
}

/**
 * Full feasibility analysis.
 * Returns an object with all the info needed for UI feedback.
 */
export function analyzeBreakFeasibility({
  breaksTarget,
  morningStart = "09:00",
  morningEnd = "13:00",
  afternoonStart = "14:00",
  afternoonEnd = "18:00",
  workStart,
  workEnd,
  focusWorkMinutes = 45,
  focusBreakMinutes = 5,
  useRemainingTime = false,
}) {
  const totalWorkMinutes = calculateWorkMinutes({
    morningStart, morningEnd, afternoonStart, afternoonEnd, workStart, workEnd,
  });

  const remainingWorkMinutes = calculateRemainingWorkMinutes({
    morningStart, morningEnd, afternoonStart, afternoonEnd, workStart, workEnd,
  });

  const effectiveMinutes = useRemainingTime ? remainingWorkMinutes : totalWorkMinutes;

  const maxBreaks = calculateMaxBreaks({
    totalWorkMinutes: effectiveMinutes,
    focusWorkMinutes,
    focusBreakMinutes,
  });

  const intervalMinutes = breaksTarget > 0 ? Math.round(effectiveMinutes / (breaksTarget + 1)) : 0;

  const cycleLength = focusWorkMinutes + focusBreakMinutes;
  const totalCycles = Math.floor(effectiveMinutes / cycleLength);

  // Feasibility levels
  let level; // "good" | "tight" | "unrealistic"
  let message;
  let suggestedTarget = breaksTarget;

  if (breaksTarget <= maxBreaks) {
    level = "good";
    message = `1 break every ~${intervalMinutes} min — fits well in your ${Math.round(effectiveMinutes / 60)}h${useRemainingTime ? " remaining" : ""}`;
  } else if (breaksTarget <= maxBreaks + 2) {
    level = "tight";
    suggestedTarget = maxBreaks;
    message = `Tight! Only ~${intervalMinutes} min between breaks. Suggested: ${maxBreaks}`;
  } else {
    level = "unrealistic";
    suggestedTarget = maxBreaks;
    message = `Too many for ${Math.round(effectiveMinutes / 60)}h${useRemainingTime ? " left" : ""}. Max realistic: ${maxBreaks}`;
  }

  return {
    level,
    message,
    suggestedTarget,
    maxBreaks,
    intervalMinutes,
    totalWorkMinutes,
    remainingWorkMinutes,
    effectiveMinutes,
    totalCycles,
    breaksTarget,
  };
}
