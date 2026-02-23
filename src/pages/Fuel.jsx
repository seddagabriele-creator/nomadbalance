import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService, userSettingsService } from "../api/services";
import { FASTING_PRESETS, calculateEatingWindowEnd, calculateMealPlan, DEFAULT_WORK_HOURS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Droplets, Utensils, Clock, Check, Coffee, X } from "lucide-react";
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

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const idx = FASTING_PRESETS.findIndex((p) => p.label === session?.fasting_preset);
    return idx >= 0 ? idx : FASTING_PRESETS.findIndex((p) => p.label === "16/8");
  });
  const [customFasting, setCustomFasting] = useState(session?.custom_fasting_hours || 16);
  const [windowStart, setWindowStart] = useState(session?.eating_window_start || "12:00");
  const [maxMeals, setMaxMeals] = useState(session?.max_meals || 3);

  const preset = FASTING_PRESETS[selectedPreset];
  const eatingHours = preset?.eating !== null ? preset.eating : 24 - customFasting;
  const windowEnd = useMemo(() => calculateEatingWindowEnd(windowStart, eatingHours), [windowStart, eatingHours]);

  // Meal plan from session
  const mealPlan = session?.meal_plan || [];
  const snacksAllowed = session?.snacks_allowed || 0;
  const mealsLogged = session?.meals_logged || [];

  // Current status
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = windowStart.split(":").map(Number);
  const [eh, em] = windowEnd.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const isEatingWindow = nowMinutes >= startMin && nowMinutes < endMin;
  const isBeforeWindow = nowMinutes < startMin;

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
    const newWindowEnd = calculateEatingWindowEnd(windowStart, eatingHours);
    const newMealPlan = calculateMealPlan({
      morningEnd: userSettings.morning_work_end || DEFAULT_WORK_HOURS.morning_end,
      afternoonEnd: userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
      windowStart: windowStart,
      windowEnd: newWindowEnd,
      maxMeals: maxMeals,
    });

    updateSession.mutate({
      fasting_preset: preset?.label || "Custom",
      custom_fasting_hours: selectedPreset === FASTING_PRESETS.length - 1 ? customFasting : null,
      eating_window_start: windowStart,
      eating_window_end: newWindowEnd,
      max_meals: maxMeals,
      meal_plan: newMealPlan.mainMeals,
      snacks_allowed: newMealPlan.snacksAllowed,
    });
    toast.success("Fuel settings updated");
  };

  // Timeline calculations
  const timelineStartMin = startMin - 120;
  const timelineEndMin = endMin + 120;
  const timelineRange = timelineEndMin - timelineStartMin;
  const windowStartPct = ((startMin - timelineStartMin) / timelineRange) * 100;
  const windowWidthPct = ((endMin - startMin) / timelineRange) * 100;
  const nowPct = Math.max(0, Math.min(100, ((nowMinutes - timelineStartMin) / timelineRange) * 100));

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
              <div>
                <h2 className="text-lg font-bold">
                  {isEatingWindow ? "Eating Window Open" : "Fasting"}
                </h2>
                <p className="text-white/50 text-sm">
                  {isBeforeWindow
                    ? `Window opens at ${windowStart}`
                    : isEatingWindow
                      ? `${windowStart} — ${windowEnd} · closes at ${windowEnd}`
                      : `Window opens tomorrow at ${windowStart}`
                  }
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative h-8 rounded-full bg-white/5 overflow-hidden mb-2">
              {/* Eating window zone */}
              <div
                className="absolute top-0 h-full bg-emerald-500/20 rounded-full"
                style={{ left: `${windowStartPct}%`, width: `${windowWidthPct}%` }}
              />
              {/* Planned meal markers (hollow) */}
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
              {/* Logged snack dots */}
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
              {/* Now marker */}
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
          {session && (
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
                <p className="text-white/30 text-sm mb-4 italic">No meal plan yet. Save settings to generate one.</p>
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
                    {isBeforeWindow
                      ? `Eating window opens at ${windowStart}`
                      : "Eating window closed for today"
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Today's Settings */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Window</h2>

            {/* Preset selector */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Custom slider */}
            {selectedPreset === FASTING_PRESETS.length - 1 && (
              <div className="space-y-2 mb-4">
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

            {/* Window start */}
            <div className="mb-4">
              <Label className="text-white/70 text-sm">Eating window starts at</Label>
              <Input
                type="time"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>

            {/* Window summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
              <p className="text-emerald-300 text-sm">
                <strong>{windowStart}</strong> — <strong>{windowEnd}</strong> ({eatingHours}h eating window)
              </p>
              <p className="text-emerald-300/50 text-xs mt-1">
                {maxMeals} meals: {Math.min(2, maxMeals)} main + {Math.max(0, maxMeals - 2)} snack{maxMeals - 2 !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Max meals */}
            <div className="mb-4">
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
              <p className="text-white/30 text-xs mt-2">
                2 main meals (lunch + after work) + {Math.max(0, maxMeals - 2)} snack{maxMeals - 2 !== 1 ? "s" : ""}
              </p>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={updateSession.isPending}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
