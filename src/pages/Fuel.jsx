import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService } from "../api/services";
import { FASTING_PRESETS, calculateEatingWindowEnd } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Droplets, Utensils, Clock, Plus, X, Ban } from "lucide-react";
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

  const session = sessions[0] || null;

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const idx = FASTING_PRESETS.findIndex((p) => p.label === session?.fasting_preset);
    return idx >= 0 ? idx : FASTING_PRESETS.findIndex((p) => p.label === "16/8");
  });
  const [customFasting, setCustomFasting] = useState(session?.custom_fasting_hours || 16);
  const [windowStart, setWindowStart] = useState(session?.eating_window_start || "12:00");
  const [maxMeals, setMaxMeals] = useState(session?.max_meals || 3);
  const [snackFree, setSnackFree] = useState(session?.snack_free_mode || false);

  const preset = FASTING_PRESETS[selectedPreset];
  const eatingHours = preset?.eating !== null ? preset.eating : 24 - customFasting;
  const windowEnd = useMemo(() => calculateEatingWindowEnd(windowStart, eatingHours), [windowStart, eatingHours]);

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

  // Snack-free: suggest next meal time
  const suggestedNextMeal = useMemo(() => {
    if (!snackFree || mealsLogged.length === 0) return null;
    const gap = Math.floor((eatingHours * 60) / maxMeals);
    const lastMealTime = mealsLogged[mealsLogged.length - 1]?.time;
    if (!lastMealTime) return null;
    const [lh, lm] = lastMealTime.split(":").map(Number);
    const nextMin = lh * 60 + lm + gap;
    if (nextMin >= endMin) return null;
    const nH = Math.floor(nextMin / 60) % 24;
    const nM = nextMin % 60;
    return `${String(nH).padStart(2, "0")}:${String(nM).padStart(2, "0")}`;
  }, [snackFree, mealsLogged, eatingHours, maxMeals, endMin]);

  const canLogMeal = isEatingWindow && mealsLogged.length < maxMeals;
  const isTooSoonForMeal = snackFree && suggestedNextMeal && nowMinutes < (parseInt(suggestedNextMeal.split(":")[0]) * 60 + parseInt(suggestedNextMeal.split(":")[1]));

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

  const handleLogMeal = () => {
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const updated = [...mealsLogged, { time: timeStr }];
    updateSession.mutate({ meals_logged: updated });
    toast.success(`Meal logged at ${timeStr}`);
  };

  const handleRemoveMeal = (index) => {
    const updated = mealsLogged.filter((_, i) => i !== index);
    updateSession.mutate({ meals_logged: updated });
  };

  const handleSaveSettings = () => {
    updateSession.mutate({
      fasting_preset: preset?.label || "Custom",
      custom_fasting_hours: selectedPreset === FASTING_PRESETS.length - 1 ? customFasting : null,
      eating_window_start: windowStart,
      eating_window_end: windowEnd,
      max_meals: maxMeals,
      snack_free_mode: snackFree,
    });
    toast.success("Fuel settings updated");
  };

  // Timeline calculations
  const timelineStartMin = startMin - 120; // 2h before window
  const timelineEndMin = endMin + 120; // 2h after window
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
                      ? `${mealsLogged.length}/${maxMeals} meals \u00b7 closes at ${windowEnd}`
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
              {/* Meal dots */}
              {mealsLogged.map((meal, i) => {
                const [mh, mm] = meal.time.split(":").map(Number);
                const mealMin = mh * 60 + mm;
                const mealPct = Math.max(0, Math.min(100, ((mealMin - timelineStartMin) / timelineRange) * 100));
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-600"
                    style={{ left: `${mealPct}%` }}
                    title={`Meal at ${meal.time}`}
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

          {/* Log Meal */}
          {session && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Meals Today</h2>

              {mealsLogged.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {mealsLogged.map((meal, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-400 text-sm font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Meal {i + 1}</p>
                          <p className="text-white/40 text-xs">{meal.time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMeal(i)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm mb-4 italic">No meals logged yet</p>
              )}

              {canLogMeal ? (
                <>
                  {isTooSoonForMeal && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                      <Ban className="w-4 h-4 text-amber-400 shrink-0" />
                      <p className="text-amber-300 text-xs">
                        Snack-free: next meal suggested at <strong>{suggestedNextMeal}</strong>
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleLogMeal}
                    disabled={updateSession.isPending}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Meal ({mealsLogged.length + 1}/{maxMeals})
                  </Button>
                </>
              ) : isEatingWindow && mealsLogged.length >= maxMeals ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Clock className="w-5 h-5 text-white/40" />
                  <p className="text-white/50 text-sm">All {maxMeals} meals logged. Window closes at {windowEnd}.</p>
                </div>
              ) : !isEatingWindow ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Droplets className="w-5 h-5 text-white/40" />
                  <p className="text-white/50 text-sm">
                    {isBeforeWindow
                      ? `Eating window opens at ${windowStart}`
                      : "Eating window is closed for today"
                    }
                  </p>
                </div>
              ) : null}
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
            </div>

            {/* Max meals */}
            <div className="mb-4">
              <Label className="text-white/70 text-sm mb-2 block">Max meals</Label>
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

            {/* Snack-free toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <div>
                <p className="text-white text-sm font-medium">Snack-free mode</p>
                <p className="text-white/40 text-xs">Space meals evenly, avoid snacking</p>
              </div>
              <Switch
                checked={snackFree}
                onCheckedChange={setSnackFree}
              />
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
