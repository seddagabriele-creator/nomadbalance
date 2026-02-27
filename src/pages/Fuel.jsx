import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService } from "../api/services";
import { FASTING_PRESETS, calculateEatingWindowEnd, getEatingHours } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Droplets, Utensils, Check, X, Settings2, ChevronDown, ChevronUp } from "lucide-react";
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

  // Determine if eating window is active (has been opened today)
  const windowActive = !!(session?.eating_window_start && session?.eating_window_end);

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const idx = FASTING_PRESETS.findIndex((p) => p.label === session?.fasting_preset);
    return idx >= 0 ? idx : FASTING_PRESETS.findIndex((p) => p.label === "16/8");
  });
  const [customFasting, setCustomFasting] = useState(session?.custom_fasting_hours || 16);
  const [maxMeals, setMaxMeals] = useState(session?.max_meals || 3);
  const [windowStartEdit, setWindowStartEdit] = useState(session?.eating_window_start || session?.eating_window_start_time || "12:00");
  const [showSettings, setShowSettings] = useState(false);

  const preset = FASTING_PRESETS[selectedPreset];
  const eatingHours = preset?.eating !== null ? preset.eating : 24 - customFasting;

  // Window times (only meaningful if active)
  const windowStart = session?.eating_window_start || "";
  const windowEnd = session?.eating_window_end || "";

  // Meal tracking — simple counter
  const mealsLogged = session?.meals_logged || [];
  const mealsTarget = session?.max_meals || maxMeals || 3;
  const mealsLeft = Math.max(0, mealsTarget - mealsLogged.length);

  // Current status
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let isBeforeWindow = false;
  let isEatingWindow = false;
  let isAfterWindow = false;
  let startMin = 0;
  let endMin = 0;

  if (windowActive) {
    const [sh, sm] = windowStart.split(":").map(Number);
    const [eh, em] = windowEnd.split(":").map(Number);
    startMin = sh * 60 + sm;
    endMin = eh * 60 + em;
    isBeforeWindow = nowMinutes < startMin;
    isEatingWindow = nowMinutes >= startMin && nowMinutes < endMin;
    isAfterWindow = nowMinutes >= endMin;
  }

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

  // Log a meal — just a tap, no names
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
    const newEatingHours = preset?.eating !== null ? preset.eating : 24 - customFasting;
    const newEnd = calculateEatingWindowEnd(windowStartEdit, newEatingHours);

    updateSession.mutate({
      fasting_preset: preset?.label || "Custom",
      custom_fasting_hours: selectedPreset === FASTING_PRESETS.length - 1 ? customFasting : null,
      max_meals: maxMeals,
      eating_window_start: windowStartEdit,
      eating_window_end: newEnd,
    });
    toast.success(`Window updated: ${windowStartEdit} — ${newEnd}`);
    setShowSettings(false);
  };

  // Format remaining time
  const fmtRemaining = (mins) => {
    if (mins <= 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Meal progress dots
  const renderMealDots = () => {
    const dots = [];
    for (let i = 0; i < mealsTarget; i++) {
      const isLogged = i < mealsLogged.length;
      dots.push(
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all ${
            isLogged
              ? "bg-emerald-400"
              : "bg-white/15 border border-white/20"
          }`}
        />
      );
    }
    return dots;
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
          {/* ========== NO SESSION YET ========== */}
          {!session && (
            <div className="rounded-2xl border bg-white/5 border-white/10 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-white/40" />
              </div>
              <h2 className="text-xl font-bold text-white/80 mb-1">No session</h2>
              <p className="text-white/40 text-sm">
                Start your day from the dashboard to set up your eating window.
              </p>
            </div>
          )}

          {/* ========== SESSION EXISTS ========== */}
          {session && (
            <>
              {/* Current Status */}
              <div className={`rounded-2xl border p-6 ${
                isEatingWindow
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : isBeforeWindow
                    ? "bg-white/5 border-white/10"
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
                      {isBeforeWindow ? "Fasting" : isEatingWindow ? "Eating Window" : "Fasting"}
                    </h2>
                    <p className="text-white/50 text-sm">
                      {isBeforeWindow
                        ? `Window opens at ${windowStart} · in ${fmtRemaining(startMin - nowMinutes)}`
                        : isEatingWindow
                          ? `${windowStart} — ${windowEnd} · ${fmtRemaining(endMin - nowMinutes)} left`
                          : `Window closed · ${windowStart} — ${windowEnd}`
                      }
                    </p>
                  </div>
                </div>

                {/* Meal progress: dots */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {renderMealDots()}
                  </div>
                  <span className="text-white/50 text-sm">
                    {mealsLogged.length} / {mealsTarget}
                  </span>
                </div>
              </div>

              {/* Meal Log */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Meals</h2>

                {/* Logged meals list */}
                {mealsLogged.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {mealsLogged.map((meal, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-emerald-300 text-sm font-medium">
                              Meal {i + 1}
                            </p>
                            <p className="text-white/40 text-xs">
                              {meal.time}
                            </p>
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
                )}

                {/* Log meal button — available during eating window */}
                {isEatingWindow && mealsLeft > 0 && (
                  <Button
                    onClick={handleLogMeal}
                    disabled={updateSession.isPending}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-semibold rounded-xl"
                  >
                    <Utensils className="w-4 h-4 mr-2" />
                    Log meal ({mealsLogged.length + 1}/{mealsTarget})
                  </Button>
                )}

                {/* Before window */}
                {isBeforeWindow && mealsLogged.length === 0 && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Droplets className="w-5 h-5 text-white/40" />
                    <p className="text-white/50 text-sm">
                      Window opens at {windowStart}
                    </p>
                  </div>
                )}

                {/* All meals done */}
                {mealsLeft === 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <p className="text-emerald-300 text-sm font-medium">All meals done</p>
                  </div>
                )}

                {/* Window closed */}
                {isAfterWindow && mealsLeft > 0 && (
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
          {session && (
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

                  {/* Window start time */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">Window opens at</Label>
                    <Input
                      type="time"
                      value={windowStartEdit}
                      onChange={(e) => setWindowStartEdit(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-10 w-36"
                    />
                  </div>

                  {/* Window summary */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-300 text-sm">
                      <strong>{24 - (preset?.eating !== null ? preset.eating : 24 - customFasting)}h fasting</strong> / <strong>{preset?.eating !== null ? preset.eating : 24 - customFasting}h eating</strong>
                    </p>
                    <p className="text-emerald-300/50 text-xs mt-1">
                      {windowStartEdit} — {calculateEatingWindowEnd(windowStartEdit, preset?.eating !== null ? preset.eating : 24 - customFasting)} · {maxMeals} meals
                    </p>
                  </div>

                  {/* Max meals */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">Meals per day</Label>
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
          )}
        </div>
      </div>
    </div>
  );
}
