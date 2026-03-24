import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Wind, Droplets, Timer, Activity, AlertTriangle, CheckCircle, BookOpen, Bell, BellOff, Trash2 } from "lucide-react";
import { analyzeBreakFeasibility } from "../utils/breakFeasibility";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { userSettingsService, daySessionService, taskService } from "../api/services";
import useDailyDefaults from "../hooks/useDailyDefaults";
import { DEFAULT_WORK_HOURS, FASTING_PRESETS, calculateEatingWindowEnd } from "../constants";

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { defaults: dailyDefaults, setDefaults: saveDailyDefaults } = useDailyDefaults();
  const [localDefaults, setLocalDefaults] = useState(dailyDefaults);

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });

  const userSettings = settings[0] || {};

  const [formData, setFormData] = useState({
    display_name: userSettings.display_name || "",
    morning_work_start: userSettings.morning_work_start || DEFAULT_WORK_HOURS.morning_start,
    morning_work_end: userSettings.morning_work_end || DEFAULT_WORK_HOURS.morning_end,
    afternoon_work_start: userSettings.afternoon_work_start || DEFAULT_WORK_HOURS.afternoon_start,
    afternoon_work_end: userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
    breathing_technique: userSettings.breathing_technique || "4-7-8",
    notifications_enabled: userSettings.notifications_enabled ?? true,
    notification_start_time: userSettings.notification_start_time || DEFAULT_WORK_HOURS.morning_start,
    notification_end_time: userSettings.notification_end_time || DEFAULT_WORK_HOURS.afternoon_end,
  });

  const [browserPermission, setBrowserPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const requestBrowserPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => userSettingsService.save(data, userSettings.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
    saveDailyDefaults(localDefaults);
    toast.success("Settings saved successfully");
    navigate("/");
  };

  React.useEffect(() => {
    if (userSettings.id) {
      setFormData({
        display_name: userSettings.display_name || "",
        morning_work_start: userSettings.morning_work_start || DEFAULT_WORK_HOURS.morning_start,
        morning_work_end: userSettings.morning_work_end || DEFAULT_WORK_HOURS.morning_end,
        afternoon_work_start: userSettings.afternoon_work_start || DEFAULT_WORK_HOURS.afternoon_start,
        afternoon_work_end: userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
        breathing_technique: userSettings.breathing_technique || "4-7-8",
        notifications_enabled: userSettings.notifications_enabled ?? true,
        notification_start_time: userSettings.notification_start_time || DEFAULT_WORK_HOURS.morning_start,
        notification_end_time: userSettings.notification_end_time || DEFAULT_WORK_HOURS.afternoon_end,
      });
    }
  }, [userSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" aria-label="Back to Dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Personal */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Personal settings">
            <h2 className="text-lg font-semibold mb-4">Personal</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name" className="text-white/70">Display Name</Label>
                <Input
                  id="display-name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
            </div>
          </section>

          {/* Work Hours */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Work hours settings">
            <h2 className="text-lg font-semibold mb-4">Default Work Hours</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="morning-start" className="text-white/70 text-sm">Morning Start</Label>
                  <Input
                    id="morning-start"
                    type="time"
                    value={formData.morning_work_start}
                    onChange={(e) => setFormData({ ...formData, morning_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="morning-end" className="text-white/70 text-sm">Morning End</Label>
                  <Input
                    id="morning-end"
                    type="time"
                    value={formData.morning_work_end}
                    onChange={(e) => setFormData({ ...formData, morning_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="afternoon-start" className="text-white/70 text-sm">Afternoon Start</Label>
                  <Input
                    id="afternoon-start"
                    type="time"
                    value={formData.afternoon_work_start}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="afternoon-end" className="text-white/70 text-sm">Afternoon End</Label>
                  <Input
                    id="afternoon-end"
                    type="time"
                    value={formData.afternoon_work_end}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Breathing */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Breathing technique">
            <h2 className="text-lg font-semibold mb-4">Breathing Technique</h2>
            <div className="space-y-3" role="radiogroup" aria-label="Select breathing technique">
              <button
                onClick={() => setFormData({ ...formData, breathing_technique: "4-7-8" })}
                role="radio"
                aria-checked={formData.breathing_technique === "4-7-8"}
                className={`w-full p-4 rounded-xl border transition-all ${
                  formData.breathing_technique === "4-7-8"
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium text-sm">4-7-8 Technique</p>
                    <p className="text-white/40 text-xs">Breathe in 4s, hold 7s, out 8s</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, breathing_technique: "box" })}
                role="radio"
                aria-checked={formData.breathing_technique === "box"}
                className={`w-full p-4 rounded-xl border transition-all ${
                  formData.breathing_technique === "box"
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium text-sm">Box Breathing</p>
                    <p className="text-white/40 text-xs">Equal 4s intervals - in, hold, out, pause</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Notification settings">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-toggle" className="text-white/70">Enable Notifications</Label>
                <Switch
                  id="notifications-toggle"
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, notifications_enabled: checked });
                    if (checked && browserPermission !== "granted") {
                      requestBrowserPermission();
                    }
                  }}
                />
              </div>
              {formData.notifications_enabled && (
                <>
                  {/* Browser permission status */}
                  {browserPermission === "granted" ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <p className="text-emerald-300 text-xs">Browser notifications enabled — you'll be notified even with the tab in background</p>
                    </div>
                  ) : browserPermission === "denied" ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <BellOff className="w-4 h-4 text-red-400" />
                      <p className="text-red-300 text-xs">Browser notifications blocked. Enable them in your browser settings to receive break reminders in background.</p>
                    </div>
                  ) : browserPermission !== "unsupported" ? (
                    <button
                      onClick={requestBrowserPermission}
                      className="w-full flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all"
                    >
                      <Bell className="w-4 h-4 text-amber-400" />
                      <p className="text-amber-300 text-xs text-left">Click to enable browser notifications — get break reminders even with the tab in background</p>
                    </button>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notif-start" className="text-white/70 text-sm">Start Time</Label>
                      <Input
                        id="notif-start"
                        type="time"
                        value={formData.notification_start_time}
                        onChange={(e) => setFormData({ ...formData, notification_start_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notif-end" className="text-white/70 text-sm">End Time</Label>
                      <Input
                        id="notif-end"
                        type="time"
                        value={formData.notification_end_time}
                        onChange={(e) => setFormData({ ...formData, notification_end_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Daily Defaults */}
          <section className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6" aria-label="Daily default settings">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Daily Defaults</h2>
                <p className="text-xs text-white/50">Settings to use when starting your day quickly</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Eating Window */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <Label className="text-white/90 font-medium">Eating Window</Label>
                </div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Fasting preset">
                  {FASTING_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setLocalDefaults({ ...localDefaults, fasting_preset: preset.label === "Custom" ? "custom" : preset.label })}
                      role="radio"
                      aria-checked={localDefaults.fasting_preset === (preset.label === "Custom" ? "custom" : preset.label)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        localDefaults.fasting_preset === (preset.label === "Custom" ? "custom" : preset.label)
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {localDefaults.fasting_preset === "custom" && (
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Fasting: {localDefaults.custom_fasting_hours || 16}h / Eating: {24 - (localDefaults.custom_fasting_hours || 16)}h</Label>
                    <Slider
                      value={[localDefaults.custom_fasting_hours || 16]}
                      onValueChange={([v]) => setLocalDefaults({ ...localDefaults, custom_fasting_hours: v })}
                      min={10}
                      max={23}
                      step={1}
                      className="py-3"
                    />
                  </div>
                )}

                {/* Window start time */}
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Window opens at</Label>
                  <Input
                    type="time"
                    value={localDefaults.eating_window_start_time || "12:00"}
                    onChange={(e) => setLocalDefaults({ ...localDefaults, eating_window_start_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-10 w-36"
                  />
                </div>

                {/* Window summary */}
                {(() => {
                  const preset = FASTING_PRESETS.find(p => p.label === localDefaults.fasting_preset);
                  const eatingHours = preset?.eating ?? (24 - (localDefaults.custom_fasting_hours || 16));
                  const startTime = localDefaults.eating_window_start_time || "12:00";
                  return (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <p className="text-emerald-300 text-xs">
                        <strong>{24 - eatingHours}h fasting</strong> / <strong>{eatingHours}h eating</strong>
                      </p>
                      <p className="text-emerald-300/50 text-[10px] mt-1">
                        {startTime} — {calculateEatingWindowEnd(startTime, eatingHours)}
                      </p>
                    </div>
                  );
                })()}

                {/* Max meals */}
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Max meals per day</Label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        onClick={() => setLocalDefaults({ ...localDefaults, max_meals: n })}
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                          (localDefaults.max_meals || 3) === n
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal breakdown info */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/40 text-xs">
                    {localDefaults.max_meals || 3} meals per day
                  </p>
                </div>
              </div>

              {/* Focus */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-violet-400" />
                  <Label className="text-white/90 font-medium">Focus Rhythm</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="default-work-min" className="text-white/60 text-xs">Work (minutes)</Label>
                    <Input
                      id="default-work-min"
                      type="number"
                      min="15"
                      max="90"
                      value={localDefaults.focus_work_minutes}
                      onChange={(e) => setLocalDefaults({ ...localDefaults, focus_work_minutes: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-break-min" className="text-white/60 text-xs">Break (minutes)</Label>
                    <Input
                      id="default-break-min"
                      type="number"
                      min="3"
                      max="20"
                      value={localDefaults.focus_break_minutes}
                      onChange={(e) => setLocalDefaults({ ...localDefaults, focus_break_minutes: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Body Breaks */}
              {(() => {
                const feasibility = analyzeBreakFeasibility({
                  breaksTarget: localDefaults.body_breaks_target,
                  morningStart: formData.morning_work_start,
                  morningEnd: formData.morning_work_end,
                  afternoonStart: formData.afternoon_work_start,
                  afternoonEnd: formData.afternoon_work_end,
                  focusWorkMinutes: localDefaults.focus_work_minutes,
                  focusBreakMinutes: localDefaults.focus_break_minutes,
                });
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <Label className="text-white/90 font-medium">Active Breaks Target</Label>
                    </div>
                    <div className="flex gap-2" role="radiogroup" aria-label="Active breaks target">
                      {[2, 4, 6, 8].map(n => {
                        const nFeasibility = analyzeBreakFeasibility({
                          breaksTarget: n,
                          morningStart: formData.morning_work_start,
                          morningEnd: formData.morning_work_end,
                          afternoonStart: formData.afternoon_work_start,
                          afternoonEnd: formData.afternoon_work_end,
                          focusWorkMinutes: localDefaults.focus_work_minutes,
                          focusBreakMinutes: localDefaults.focus_break_minutes,
                        });
                        const isUnrealistic = nFeasibility.level === "unrealistic";
                        const isTight = nFeasibility.level === "tight";
                        return (
                          <button
                            key={n}
                            onClick={() => setLocalDefaults({ ...localDefaults, body_breaks_target: n })}
                            role="radio"
                            aria-checked={localDefaults.body_breaks_target === n}
                            aria-label={`${n} breaks${isUnrealistic ? " (unrealistic)" : isTight ? " (tight)" : ""}`}
                            className={`relative flex-1 w-12 h-12 rounded-xl border text-base font-bold transition-all ${
                              localDefaults.body_breaks_target === n
                                ? isUnrealistic
                                  ? "bg-red-500/20 border-red-500/50 text-red-300"
                                  : isTight
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                    : "bg-orange-500/20 border-orange-500/50 text-orange-300"
                                : isUnrealistic
                                  ? "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {n}
                            {isUnrealistic && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500/80" />
                            )}
                            {isTight && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500/80" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Feasibility feedback */}
                    <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
                      feasibility.level === "good"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : feasibility.level === "tight"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                    }`} role="status">
                      {feasibility.level === "good" ? (
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p>{feasibility.message}</p>
                        <p className="text-white/30 mt-1">
                          {Math.round(feasibility.totalWorkMinutes / 60)}h work day &middot; {feasibility.totalCycles} focus cycles ({localDefaults.focus_work_minutes}+{localDefaults.focus_break_minutes} min)
                        </p>
                        {feasibility.level === "unrealistic" && (
                          <button
                            onClick={() => setLocalDefaults({ ...localDefaults, body_breaks_target: feasibility.suggestedTarget })}
                            className="mt-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs transition-all"
                          >
                            Use suggested: {feasibility.suggestedTarget} breaks
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Exercise Selection */}
              <div className="space-y-3">
                <Label className="text-white/90 font-medium">Exercise Selection</Label>
                <div className="space-y-2" role="radiogroup" aria-label="Exercise selection mode">
                  <button
                    onClick={() => setLocalDefaults({ ...localDefaults, exercise_selection: "auto" })}
                    role="radio"
                    aria-checked={localDefaults.exercise_selection === "auto"}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      localDefaults.exercise_selection === "auto"
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-white font-medium text-sm">App chooses for me</p>
                    <p className="text-white/40 text-xs">Automatic balanced workout</p>
                  </button>
                  <button
                    onClick={() => setLocalDefaults({ ...localDefaults, exercise_selection: "manual" })}
                    role="radio"
                    aria-checked={localDefaults.exercise_selection === "manual"}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      localDefaults.exercise_selection === "manual"
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-white font-medium text-sm">I'll choose in the wizard</p>
                    <p className="text-white/40 text-xs">Select muscle groups daily</p>
                  </button>
                </div>
              </div>
            </div>

          </section>

          {/* Tutorial Replay */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Tutorial">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">App Tutorial</h2>
                  <p className="text-xs text-white/40">Replay the getting started guide</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={async () => {
                  localStorage.removeItem("nomadbalance_onboarding_completed");
                  sessionStorage.setItem("nomadbalance_replay_onboarding", "true");
                  // Clear backend flag and wait for it before redirecting
                  if (userSettings.id) {
                    try {
                      await userSettingsService.save(
                        { ...userSettings, onboarding_completed: false },
                        userSettings.id
                      );
                    } catch (e) {
                      // localStorage already cleared as fallback
                    }
                  }
                  window.location.href = createPageUrl("Dashboard");
                }}
                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-sm"
              >
                Replay
              </Button>
            </div>
          </section>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400"
            aria-label="Save all settings"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>

          {/* Delete All Data */}
          <DeleteAllDataSection />
        </div>
      </div>
    </div>
  );
}

function DeleteAllDataSection() {
  const [step, setStep] = useState(0); // 0=idle, 1=confirm, 2=type DELETE
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await daySessionService.deleteAll();
      await taskService.deleteAll();
      await userSettingsService.deleteAll();
      queryClient.clear();
      toast.success("All data deleted successfully");
      navigate("/login");
    } catch (e) {
      toast.error("Failed to delete data: " + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (step === 0) {
    return (
      <section className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Delete all data</h2>
            <p className="text-xs text-white/40">Remove all sessions, tasks, and settings</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setStep(1)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Are you sure?
          </h2>
          <p className="text-xs text-white/50 mt-1">
            This will permanently delete all your sessions, tasks, and settings. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setStep(0)}
            className="text-white/60 hover:text-white hover:bg-white/10 text-sm flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => setStep(2)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm flex-1"
          >
            Yes, delete everything
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-red-400">Type DELETE to confirm</h2>
        <p className="text-xs text-white/50 mt-1">This is permanent and cannot be undone.</p>
      </div>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type DELETE"
        className="bg-white/5 border-red-500/30 text-white placeholder:text-white/20"
      />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => { setStep(0); setConfirmText(""); }}
          className="text-white/60 hover:text-white hover:bg-white/10 text-sm flex-1"
        >
          Cancel
        </Button>
        <Button
          disabled={confirmText !== "DELETE" || isDeleting}
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-500 text-white text-sm flex-1 disabled:opacity-30"
        >
          {isDeleting ? "Deleting..." : "Delete all data"}
        </Button>
      </div>
    </section>
  );
}
