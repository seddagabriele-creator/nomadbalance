import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Waves, Wind, Check, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { daySessionService } from "../api/services";
import useDailyDefaults from "../hooks/useDailyDefaults";
import { AUDIO_URLS, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES } from "../constants";

const FOCUS_SOUNDS = [
  {
    id: "wind",
    name: "Wind",
    icon: Wind,
    url: AUDIO_URLS.wind,
    description: "Natural wind ambience to mask distractions"
  },
];

const RELAX_SOUNDS = [
  {
    id: "wind",
    name: "Wind",
    icon: Wind,
    url: AUDIO_URLS.wind,
    description: "Gentle wind for peaceful breaks"
  },
];

export default function Flow() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const { updateDefaults } = useDailyDefaults();

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;
  const currentFocusSound = session?.focus_sound || "wind";
  const currentRelaxSound = session?.relax_sound || "wind";

  const [focusMinutes, setFocusMinutes] = useState(session?.focus_work_minutes || DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(session?.focus_break_minutes || DEFAULT_BREAK_MINUTES);

  useEffect(() => {
    if (session) {
      setFocusMinutes(session.focus_work_minutes || DEFAULT_WORK_MINUTES);
      setBreakMinutes(session.focus_break_minutes || DEFAULT_BREAK_MINUTES);
    }
  }, [session]);

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return daySessionService.update(session.id, data);
      }
      return Promise.reject("No active session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      toast.success("Audio settings saved");
    },
    onError: (error) => {
      toast.error("Failed to update settings");
      console.error("Flow update error:", error);
    },
  });

  const handleSelectFocusSound = (soundId) => {
    updateSession.mutate({ focus_sound: soundId });
  };

  const handleSelectRelaxSound = (soundId) => {
    updateSession.mutate({ relax_sound: soundId });
  };

  const handleUpdateDuration = () => {
    if (!session?.id) return;

    updateSession.mutate(
      {
        focus_work_minutes: focusMinutes,
        focus_break_minutes: breakMinutes
      },
      {
        onSuccess: () => {
          updateDefaults({ focus_work_minutes: focusMinutes, focus_break_minutes: breakMinutes });
          toast.success("Duration updated");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" aria-label="Back to Dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">Flow State</h1>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Flow description">
            <h2 className="text-lg font-semibold mb-2">Boost your focus</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Immerse yourself in carefully crafted soundscapes designed to enhance concentration during work
              and promote relaxation during breaks. Let the flow carry you.
            </p>
          </section>

          {/* Duration Controls */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Session duration">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Timer className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold">Session Duration</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="flow-focus-min" className="text-white/70 text-sm">Focus (minutes)</Label>
                <Input
                  id="flow-focus-min"
                  type="number"
                  min="15"
                  max="90"
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(parseInt(e.target.value) || DEFAULT_WORK_MINUTES)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="flow-break-min" className="text-white/70 text-sm">Break (minutes)</Label>
                <Input
                  id="flow-break-min"
                  type="number"
                  min="3"
                  max="20"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || DEFAULT_BREAK_MINUTES)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateDuration}
              disabled={!session}
              className="w-full bg-violet-600 hover:bg-violet-500"
            >
              Apply Duration
            </Button>
          </section>

          {/* Focus Sounds */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Focus sounds">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Waves className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold">Focus Sounds</h2>
            </div>
            <p className="text-xs text-white/40 mb-4">Plays during work sessions</p>
            <div className="space-y-3">
              {FOCUS_SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isSelected = currentFocusSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSelectFocusSound(sound.id)}
                    aria-pressed={isSelected}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-violet-500/20 border-violet-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-violet-500/20" : "bg-white/5"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? "text-violet-400" : "text-white/40"
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{sound.name}</p>
                        <p className="text-white/40 text-xs">{sound.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-violet-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Relax Sounds */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6" aria-label="Relax sounds">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-lg font-semibold">Relax Sounds</h2>
            </div>
            <p className="text-xs text-white/40 mb-4">Plays during break sessions</p>
            <div className="space-y-3">
              {RELAX_SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isSelected = currentRelaxSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSelectRelaxSound(sound.id)}
                    aria-pressed={isSelected}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-cyan-500/20" : "bg-white/5"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? "text-cyan-400" : "text-white/40"
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{sound.name}</p>
                        <p className="text-white/40 text-xs">{sound.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {!session && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4" role="alert">
              <p className="text-amber-300 text-sm">
                Start your day to configure Flow settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
