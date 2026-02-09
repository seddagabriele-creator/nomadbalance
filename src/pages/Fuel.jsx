import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Droplets, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";

const PRESETS = [
  { label: "14/10", fasting: 14, eating: 10 },
  { label: "16/8", fasting: 16, eating: 8 },
  { label: "18/6", fasting: 18, eating: 6 },
  { label: "Custom", fasting: null, eating: null },
];

export default function Fuel() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;
  const [lastMeal, setLastMeal] = useState(session?.last_meal_time || "");
  const [nextMeal, setNextMeal] = useState(session?.next_meal_time || "");
  const [selectedPreset, setSelectedPreset] = useState(
    PRESETS.findIndex((p) => p.label === session?.fasting_preset) || 0
  );

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return base44.entities.DaySession.update(session.id, data);
      }
      return base44.entities.DaySession.create({ ...data, date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      toast.success("Fuel settings updated");
    },
  });

  const handleSave = () => {
    updateSession.mutate({
      last_meal_time: lastMeal,
      next_meal_time: nextMeal,
      fasting_preset: PRESETS[selectedPreset].label,
    });
  };

  const calculateNextMeal = (preset) => {
    if (!lastMeal || !preset.fasting) return;
    const [h, m] = lastMeal.split(":").map(Number);
    const lastMealDate = new Date();
    lastMealDate.setHours(h, m, 0, 0);
    lastMealDate.setHours(lastMealDate.getHours() + preset.fasting);
    const nextH = String(lastMealDate.getHours()).padStart(2, "0");
    const nextM = String(lastMealDate.getMinutes()).padStart(2, "0");
    setNextMeal(`${nextH}:${nextM}`);
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
            <h1 className="text-2xl font-bold">Fuel Management</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Meal Times</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white/70">Last Meal Time</Label>
                <Input
                  type="time"
                  value={lastMeal}
                  onChange={(e) => setLastMeal(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
              <div>
                <Label className="text-white/70">Next Meal Time</Label>
                <Input
                  type="time"
                  value={nextMeal}
                  onChange={(e) => setNextMeal(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Fasting Window</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(idx);
                    calculateNextMeal(preset);
                  }}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedPreset === idx
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {selectedPreset < 3 && PRESETS[selectedPreset] && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>{PRESETS[selectedPreset].fasting} hours</strong> fasting,{" "}
                  <strong>{PRESETS[selectedPreset].eating} hours</strong> eating window
                </p>
              </div>
            )}
          </div>

          {lastMeal && nextMeal && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold">Current Status</h3>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>Last meal: {lastMeal}</p>
                <p>Next meal: {nextMeal}</p>
                <p className="text-emerald-300 font-medium mt-3">
                  {(() => {
                    const [lh, lm] = lastMeal.split(":").map(Number);
                    const [nh, nm] = nextMeal.split(":").map(Number);
                    const now = new Date();
                    const last = new Date();
                    last.setHours(lh, lm, 0, 0);
                    const next = new Date();
                    next.setHours(nh, nm, 0, 0);
                    const elapsed = Math.floor((now - last) / 3600000);
                    const remaining = Math.floor((next - now) / 3600000);
                    if (remaining > 0) {
                      return `${elapsed}h into fast, ${remaining}h until next meal`;
                    }
                    return "It's time to eat!";
                  })()}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={updateSession.isPending}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400"
          >
            Save Fuel Settings
          </Button>
        </div>
      </div>
    </div>
  );
}