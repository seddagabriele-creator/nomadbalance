import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService, userSettingsService } from "../api/services";
import { FASTING_PRESETS, calculateEatingWindowEnd, calculateMealPlan, DEFAULT_WORK_HOURS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Droplets, Utensils, Clock, Check, Coffee, X, Play, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";

export default function Fuel() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const { data: settingsArr = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });

  const session = sessions[0] || null;
  const userSettings = settingsArr[0] || {};

  // Determine if eating window is active (has been opened today)
  const windowActive = !!(session?.eating_window_start && session?.eating_window_end);

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const idx = FASTING_PRESETS.findIndex((p) => p.label === session?.fasting_preset);
    return idx >= 0 ? idx : FASTING_PRESETS.findIndex((p) => p.label === "16/8");
  });
  const [customFasting, setCustomFasting] = useState(session?.custom_fasting_hours || 16);
  const [maxMeals, setMaxMeals] = useState(session?.max_meals || 3);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomStart, setShowCustomStart] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("");

  const preset = FASTING_PRESETS[selectedPreset];
  const eatingHours = preset?.eating !== null ? preset.eating : 24 - customFasting;

  // Window times (only meaningful if active)
  const windowStart = session?.eating_window_start || "";
  const windowEnd = session?.eating_window_end || "";

  // Meal plan from session
  const mealPlan = session?.meal_plan || [];
  const snacksAllowed = session?.snacks_allowed || 0;
  const mealsLogged = session?.meals_logged || [];

  // Current status
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let isEatingWindow = false;
  let isBeforeWindow = false;
  let startMin = 0;
  let endMin = 0;

  if (windowActive) {
    const [sh, sm] = windowStart.split(":").map(Number);
    const [eh, em] = windowEnd.split(":").map(Number);
    startMin = sh * 60 + sm;
    endMin = eh * 60 + em;
    isEatingWindow = nowMinutes >= startMin && nowMinutes < endMin;
    isBeforeWindow = nowMinutes < startMin;
  }

  // Logged counts
  const loggedMainTypes = mealsLogged.filter((m) => m.type !== "snack").map((m) => m.type);
  const snacksLogged = mealsLogged.filter((m) => m.type === "snack").length;
  const snacksLeft = Math.max(0, snacksAllowed - snacksLogged);

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return daySessionService.update(session.id, data);
      }
      return daySessionService.create({ ...data, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
    },
  });

  // Open eating window (dynamic start)
  const handleOpenWindow = (startTimeOverride) => {
    const startTime = startTimeOverride || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const endTime = calculateEatingWindowEnd(startTime, eatingHours);

    const newMealPlan = calculateMealPlan({
      morningEnd: userSettings.morning_work_end || DEFAULT_WORK_HOURS.morning_end,
      afternoonEnd: userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
      windowStart: startTime,
      windowEnd: endTime,
      maxMeals: maxMeals,
    });

    updateSession.mutate({
      eating_window_start: startTime,
      eating_window_end: endTime,
      meal_plan: newMealPlan.mainMeals,
      snacks_allowed: newMealPlan.snacksAllowed,
    });

    toast.success(`Eating window opened: ${startTime} — ${endTime}`);
    setShowCustomStart(false);
  };

  const handleLogMainMeal = (mealType) => {
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const updated = [...mealsLogged, { time: timeStr, type: mealType }];
    updateSession.mutate({ meals_logged: updated });
    toast.success(`Meal logged at ${timeStr}`);
  };

  const handleLogSnack = () => {
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const updated = [...mealsLogged, { time: timeStr, type: "snack" }];
    updateSession.mutate({ meals_logged: updated });
    toast.success(`Snack logged at ${timeStr}`);
  };

  const handleRemoveMeal = (index) => {
    const updated = mealsLogged.filter((_, i) => i !== index);
    updateSession.mutate({ meals_logged: updated });
  };

  const handleSaveSettings = () => {
    const saveData = {
      fasting_preset: preset?.label || "Custom",
      custom_fasting_hours: selectedPreset === FASTING_PRESETS.length - 1 ? customFasting : null,
      max_meals: maxMeals,
    };

    // If window is already active, recalculate with new eating hours
    if (windowActive) {
      const newWindowEnd = calculateEatingWindowEnd(windowStart, eatingHours);
      const newMealPlan = calculateMealPlan({
        morningEnd: userSettings.morning_work_end || DEFAULT_WORK_HOURS.morning_end,
        afternoonEnd: userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
        windowStart: windowStart,
        windowEnd: newWindowEnd,
        maxMeals: maxMeals,
      });
      saveData.eating_window_end = newWindowEnd;
      saveData.meal_plan = newMealPlan.mainMeals;
      saveData.snacks_allowed = newMealPlan.snacksAllowed;
    }

    updateSession.mutate(saveData);
    toast.success("Settings updated");
    setShowSettings(false);
  };

  // Close window manually
  const handleCloseWindow = () => {
    const closeTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    updateSession.mutate({ eating_window_end: closeTime });
    toast.success("Eating window closed");
  };

  // Timeline calculations (only if window active)
  let timelineStartMin = 0, timelineEndMin = 0, timelineRange = 1;
  let windowStartPct = 0, windowWidthPct = 0, nowPct = 50;
  if (windowActive) {
    timelineStartMin = startMin - 60;
    timelineEndMin = endMin + 60;
    timelineRange = timelineEndMin - timelineStartMin;
    windowStartPct = ((startMin - timelineStartMin) / timelineRange) * 100;
    windowWidthPct = ((endMin - startMin) / timelineRange) * 100;
    nowPct = Math.max(0, Math.min(100, ((nowMinutes - timelineStartMin) / timelineRange) * 100));
  }

  // Format remaining time
  const fmtRemaining = (mins) => {
    if (mins <= 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold">Fuel</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* ========== WINDOW NOT ACTIVE: Fasting State ========== */}
          {!windowActive && (
            <>
              {/* Fasting Status */}
              <div className="rounded-2xl border bg-white/5 border-white/10 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-white/40" />
                </div>
                <h2 className="text-xl font-bold text-white/80 mb-1">Fasting</h2>
                <p className="text-white/40 text-sm mb-6">
                  {preset?.label || "Custom"} protocol · {eatingHours}h eating window
                </p>

                {/* Start Eating Button */}
                <Button
                  onClick={() => handleOpenWindow()}
                  disabled={updateSession.isPending}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-semibold text-base rounded-xl mb-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start eating now
                </Button>

                {/* Custom start time */}
                {!showCustomStart ? (
                  <button
                    onClick={() => {
                      setCustomStartTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
                      setShowCustomStart(true);
                    }}
                    className="text-white/30 text-xs hover:text-white/50 transition-colors"
                  >
                    or set a different start time
                  </button>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white/40 text-xs">Started at:</span>
                    <Input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-10 w-32 text-center"
                    />
                    <Button
                      onClick={() => handleOpenWindow(customStartTime)}
                      disabled={updateSession.isPending || !customStartTime}
                      size="sm"
                      className="bg-emerald-600/80 hover:bg-emerald-500 text-white"
                    >
                      Open
                    </Button>
                    <button
                      onClick={() => setShowCustomStart(false)}
                      className="text-white/30 hover:text-white/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========== WINDOW ACTIVE ========== */}
          {windowActive && (
            <>
              {/* Current Status */}
              <div className={`rounded-2xl border p-6 ${
                isEatingWindow
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-white/5 border-white/10"
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {isEatingWindow ? (
                    <Utensils className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Droplets className="w-6 h-6 text-white/50" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">
                      {isEatingWindow ? "Eating Window" : "Fasting"}
                    </h2>
                    <p className="text-white/50 text-sm">
                      {isEatingWindow
                        ? `${windowStart} — ${windowEnd} · ${fmtRemaining(endMin - nowMinutes)} left`
                        : `Window closed · next window when you eat tomorrow`
                      }
                    </p>
                  </div>
                  {isEatingWindow && (
                    <button
                      onClick={handleCloseWindow}
                      className="text-white/20 hover:text-red-400 transition-colors text-xs border border-white/10 rounded-lg px-2 py-1"
                    >
                      Close
                    </button>
                  )}
                </div>

                {/* Timeline */}
                <div className="relative h-8 rounded-full bg-white/5 overflow-hidden mb-2">
                  <div
                    className="absolute top-0 h-full bg-emerald-500/20 rounded-full"
                    style={{ left: `${windowStartPct}%`, width: `${windowWidthPct}%` }}
                  />
                  {mealPlan.map((meal) => {
                    const mealPct = Math.max(0, Math.min(100, ((meal.minutes - timelineStartMin) / timelineRange) * 100));
                    const isLogged = loggedMainTypes.includes(meal.type);
                    return (
                      <div
                        key={meal.type}
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                          isLogged
                            ? "bg-emerald-400 border-emerald-600"
                            : "bg-transparent border-emerald-400/50"
                        }`}
                        style={{ left: `${mealPct}%` }}
                        title={`${meal.label} at ${meal.time}`}
                      />
                    );
                  })}
                  {mealsLogged.filter(m => m.type === "snack").map((snack, i) => {
                    const [mh, mm] = snack.time.split(":").map(Number);
                    const snackMin = mh * 60 + mm;
                    const snackPct = Math.max(0, Math.min(100, ((snackMin - timelineStartMin) / timelineRange) * 100));
                    return (
                      <div
                        key={`snack-${i}`}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400"
                        style={{ left: `${snackPct}%` }}
                        title={`Snack at ${snack.time}`}
                      />
                    );
                  })}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/70"
                    style={{ left: `${nowPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>{`${String(Math.floor(((timelineStartMin % 1440) + 1440) % 1440 / 60)).padStart(2, "0")}:${String(((timelineStartMin % 60) + 60) % 60).padStart(2, "0")}`}</span>
                  <span>{windowStart}</span>
                  <span>{windowEnd}</span>
                  <span>{`${String(Math.floor(((timelineEndMin % 1440) + 1440) % 1440 / 60)).padStart(2, "0")}:${String(((timelineEndMin % 60) + 60) % 60).padStart(2, "0")}`}</span>
                </div>
              </div>

              {/* Meal Plan */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Your Meals</h2>

                {mealPlan.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {mealPlan.map((meal, i) => {
                      const isLogged = loggedMainTypes.includes(meal.type);
                      const loggedEntry = mealsLogged.find((m) => m.type === meal.type);
                      const diff = meal.minutes - nowMinutes;
                      const isNow = isEatingWindow && diff <= 5 && diff > -30;

                      return (
                        <div
                          key={meal.type}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            isLogged
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : isNow
                                ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isLogged ? "bg-emerald-500/20" : "bg-white/10"
                            }`}>
                              {isLogged ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <span className="text-white/40 text-sm font-bold">{i + 1}</span>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isLogged ? "text-emerald-300" : isNow ? "text-emerald-200" : "text-white"}`}>
                                {meal.label}
                                {isNow && !isLogged && <span className="text-emerald-400 ml-2 text-xs">now!</span>}
                              </p>
                              <p className="text-white/40 text-xs">
                                {isLogged ? `Logged at ${loggedEntry.time}` : `Planned at ${meal.time}`}
                              </p>
                            </div>
                          </div>
                          {!isLogged && isEatingWindow ? (
                            <Button
                              size="sm"
                              onClick={() => handleLogMainMeal(meal.type)}
                              disabled={updateSession.isPending}
                              className="bg-emerald-600/80 hover:bg-emerald-500 text-white"
                            >
                              Log
                            </Button>
                          ) : isLogged ? (
                            <button
                              onClick={() => {
                                const idx = mealsLogged.findIndex((m) => m.type === meal.type);
                                if (idx >= 0) handleRemoveMeal(idx);
                              }}
                              className="text-white/20 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm mb-4 italic">No meals planned.</p>
                )}

                {/* Snacks section */}
                {snacksAllowed > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span className="text-white/70 text-sm font-medium">Snacks</span>
                      <span className="text-white/30 text-xs">{snacksLogged}/{snacksAllowed}</span>
                    </div>

                    {mealsLogged.filter((m) => m.type === "snack").map((snack, i) => {
                      const snackIndices = mealsLogged.reduce((acc, m, idx) => (m.type === "snack" ? [...acc, idx] : acc), []);
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-2">
                          <div className="flex items-center gap-3">
                            <Coffee className="w-4 h-4 text-amber-400" />
                            <div>
                              <p className="text-amber-300 text-sm font-medium">Snack {i + 1}</p>
                              <p className="text-white/40 text-xs">{snack.time}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMeal(snackIndices[i])}
                            className="text-white/20 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {isEatingWindow && snacksLeft > 0 && (
                      <Button
                        onClick={handleLogSnack}
                        disabled={updateSession.isPending}
                        variant="outline"
                        className="w-full h-10 border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
                      >
                        <Coffee className="w-4 h-4 mr-2" />
                        Log Snack ({snacksLogged + 1}/{snacksAllowed})
                      </Button>
                    )}
                  </div>
                )}

                {/* Status messages when outside window */}
                {!isEatingWindow && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                    <Droplets className="w-5 h-5 text-white/40" />
                    <p className="text-white/50 text-sm">
                      Eating window closed for today
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========== SETTINGS (collapsible) ========== */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-white/40" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              {showSettings ? (
                <ChevronUp className="w-5 h-5 text-white/40" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/40" />
              )}
            </button>

            {showSettings && (
              <div className="px-6 pb-6 space-y-4">
                {/* Preset selector */}
                <div>
                  <Label className="text-white/70 text-sm mb-2 block">Fasting plan</Label>
                  <div className="flex flex-wrap gap-2">
                    {FASTING_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPreset(idx)}
                        className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                          selectedPreset === idx
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom slider */}
                {selectedPreset === FASTING_PRESETS.length - 1 && (
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Fasting: {customFasting}h / Eating: {24 - customFasting}h</Label>
                    <Slider
                      value={[customFasting]}
                      onValueChange={([v]) => setCustomFasting(v)}
                      min={10}
                      max={23}
                      step={1}
                      className="py-3"
                    />
                  </div>
                )}

                {/* Window summary */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-emerald-300 text-sm">
                    <strong>{24 - eatingHours}h fasting</strong> / <strong>{eatingHours}h eating</strong>
                  </p>
                  {windowActive && (
                    <p className="text-emerald-300/50 text-xs mt-1">
                      Current window: {windowStart} — {windowEnd}
                    </p>
                  )}
                  <p className="text-emerald-300/50 text-xs mt-1">
                    {maxMeals} meals: {Math.min(2, maxMeals)} main + {Math.max(0, maxMeals - 2)} snack{maxMeals - 2 !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Max meals */}
                <div>
                  <Label className="text-white/70 text-sm mb-2 block">Max meals per day</Label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMaxMeals(n)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                          maxMeals === n
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSession.isPending}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400"
                >
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
