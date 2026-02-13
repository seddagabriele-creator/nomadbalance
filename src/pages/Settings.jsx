import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Wind, Droplets, Timer, Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { analyzeBreakFeasibility } from "../utils/breakFeasibility";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const userSettings = settings[0] || {};
  
  // Load daily defaults from localStorage
  const loadDailyDefaults = () => {
    const saved = localStorage.getItem('dailyDefaults');
    return saved ? JSON.parse(saved) : {
      fasting_preset: "16/8",
      last_meal_time: "",
      next_meal_time: "",
      focus_work_minutes: 45,
      focus_break_minutes: 5,
      focus_sound: "wind",
      relax_sound: "wind",
      body_breaks_target: 6,
      exercise_selection: "auto",
      selected_groups: []
    };
  };

  const [formData, setFormData] = useState({
    display_name: userSettings.display_name || "",
    morning_work_start: userSettings.morning_work_start || "09:00",
    morning_work_end: userSettings.morning_work_end || "13:00",
    afternoon_work_start: userSettings.afternoon_work_start || "14:00",
    afternoon_work_end: userSettings.afternoon_work_end || "18:00",
    breathing_technique: userSettings.breathing_technique || "4-7-8",
    notifications_enabled: userSettings.notifications_enabled ?? true,
    notification_start_time: userSettings.notification_start_time || "09:00",
    notification_end_time: userSettings.notification_end_time || "18:00",
  });

  const [dailyDefaults, setDailyDefaults] = useState(loadDailyDefaults());

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (userSettings.id) {
        return base44.entities.UserSettings.update(userSettings.id, data);
      }
      return base44.entities.UserSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast.success("Settings saved");
    },
  });

  const handleSave = () => {
    // Save both user settings and daily defaults
    saveMutation.mutate(formData);
    localStorage.setItem('dailyDefaults', JSON.stringify(dailyDefaults));
    
    // Emit custom event to notify components
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: dailyDefaults }));
    
    toast.success("Settings saved successfully");
  };

  React.useEffect(() => {
    if (userSettings.id) {
      setFormData({
        display_name: userSettings.display_name || "",
        morning_work_start: userSettings.morning_work_start || "09:00",
        morning_work_end: userSettings.morning_work_end || "13:00",
        afternoon_work_start: userSettings.afternoon_work_start || "14:00",
        afternoon_work_end: userSettings.afternoon_work_end || "18:00",
        breathing_technique: userSettings.breathing_technique || "4-7-8",
        notifications_enabled: userSettings.notifications_enabled ?? true,
        notification_start_time: userSettings.notification_start_time || "09:00",
        notification_end_time: userSettings.notification_end_time || "18:00",
      });
    }
  }, [userSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Personal */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Personal</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white/70">Display Name</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
            </div>
          </div>

          {/* Work Hours */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Default Work Hours</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm">Morning Start</Label>
                  <Input
                    type="time"
                    value={formData.morning_work_start}
                    onChange={(e) => setFormData({ ...formData, morning_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Morning End</Label>
                  <Input
                    type="time"
                    value={formData.morning_work_end}
                    onChange={(e) => setFormData({ ...formData, morning_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm">Afternoon Start</Label>
                  <Input
                    type="time"
                    value={formData.afternoon_work_start}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_start: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Afternoon End</Label>
                  <Input
                    type="time"
                    value={formData.afternoon_work_end}
                    onChange={(e) => setFormData({ ...formData, afternoon_work_end: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Breathing */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Breathing Technique</h2>
            <div className="space-y-3">
              <button
                onClick={() => setFormData({ ...formData, breathing_technique: "4-7-8" })}
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
          </div>

          {/* Notifications */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Enable Notifications</Label>
                <Switch
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
                />
              </div>
              {formData.notifications_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value={formData.notification_start_time}
                      onChange={(e) => setFormData({ ...formData, notification_start_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-sm">End Time</Label>
                    <Input
                      type="time"
                      value={formData.notification_end_time}
                      onChange={(e) => setFormData({ ...formData, notification_end_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Defaults */}
          <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6">
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
              {/* Fasting */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  <Label className="text-white/90 font-medium">Fasting Preset</Label>
                </div>
                <div className="flex gap-2">
                  {["14/10", "16/8", "18/6", "custom"].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setDailyDefaults({ ...dailyDefaults, fasting_preset: preset })}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        dailyDefaults.fasting_preset === preset
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {preset === "custom" ? "Custom" : preset}
                    </button>
                  ))}
                </div>
                {dailyDefaults.fasting_preset === "custom" && (
                  <div>
                    <Label className="text-white/60 text-xs">Fasting duration (hours)</Label>
                    <Input
                      type="number"
                      min="8"
                      max="24"
                      value={dailyDefaults.custom_fasting_hours || 16}
                      onChange={(e) => setDailyDefaults({ ...dailyDefaults, custom_fasting_hours: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1 h-10"
                    />
                  </div>
                )}
              </div>

              {/* Focus */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-violet-400" />
                  <Label className="text-white/90 font-medium">Focus Rhythm</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60 text-xs">Work (minutes)</Label>
                    <Input
                      type="number"
                      min="15"
                      max="90"
                      value={dailyDefaults.focus_work_minutes}
                      onChange={(e) => setDailyDefaults({ ...dailyDefaults, focus_work_minutes: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Break (minutes)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="20"
                      value={dailyDefaults.focus_break_minutes}
                      onChange={(e) => setDailyDefaults({ ...dailyDefaults, focus_break_minutes: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white mt-1 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Body Breaks */}
              {(() => {
                const feasibility = analyzeBreakFeasibility({
                  breaksTarget: dailyDefaults.body_breaks_target,
                  morningStart: formData.morning_work_start,
                  morningEnd: formData.morning_work_end,
                  afternoonStart: formData.afternoon_work_start,
                  afternoonEnd: formData.afternoon_work_end,
                  focusWorkMinutes: dailyDefaults.focus_work_minutes,
                  focusBreakMinutes: dailyDefaults.focus_break_minutes,
                });
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <Label className="text-white/90 font-medium">Active Breaks Target</Label>
                    </div>
                    <div className="flex gap-2">
                      {[2, 4, 6, 8].map(n => {
                        const nFeasibility = analyzeBreakFeasibility({
                          breaksTarget: n,
                          morningStart: formData.morning_work_start,
                          morningEnd: formData.morning_work_end,
                          afternoonStart: formData.afternoon_work_start,
                          afternoonEnd: formData.afternoon_work_end,
                          focusWorkMinutes: dailyDefaults.focus_work_minutes,
                          focusBreakMinutes: dailyDefaults.focus_break_minutes,
                        });
                        const isUnrealistic = nFeasibility.level === "unrealistic";
                        const isTight = nFeasibility.level === "tight";
                        return (
                          <button
                            key={n}
                            onClick={() => setDailyDefaults({ ...dailyDefaults, body_breaks_target: n })}
                            className={`relative flex-1 w-12 h-12 rounded-xl border text-base font-bold transition-all ${
                              dailyDefaults.body_breaks_target === n
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
                    }`}>
                      {feasibility.level === "good" ? (
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      ) : feasibility.level === "tight" ? (
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p>{feasibility.message}</p>
                        <p className="text-white/30 mt-1">
                          {Math.round(feasibility.totalWorkMinutes / 60)}h work day &middot; {feasibility.totalCycles} focus cycles ({dailyDefaults.focus_work_minutes}+{dailyDefaults.focus_break_minutes} min)
                        </p>
                        {feasibility.level === "unrealistic" && (
                          <button
                            onClick={() => setDailyDefaults({ ...dailyDefaults, body_breaks_target: feasibility.suggestedTarget })}
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
                <div className="space-y-2">
                  <button
                    onClick={() => setDailyDefaults({ ...dailyDefaults, exercise_selection: "auto" })}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      dailyDefaults.exercise_selection === "auto"
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-white font-medium text-sm">App chooses for me</p>
                    <p className="text-white/40 text-xs">Automatic balanced workout</p>
                  </button>
                  <button
                    onClick={() => setDailyDefaults({ ...dailyDefaults, exercise_selection: "manual" })}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      dailyDefaults.exercise_selection === "manual"
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

          </div>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}