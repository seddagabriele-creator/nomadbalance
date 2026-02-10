import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Waves, Wind, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";

const FOCUS_SOUNDS = [
  { 
    id: "wind", 
    name: "Wind", 
    icon: Wind, 
    url: "https://drive.google.com/uc?export=download&id=1MPfMRcZVDFE7jMIbz8y_oFrn0Oi_EADw",
    description: "Natural wind ambience to mask distractions"
  },
];

const RELAX_SOUNDS = [
  { 
    id: "wind", 
    name: "Wind", 
    icon: Wind, 
    url: "https://drive.google.com/uc?export=download&id=1MPfMRcZVDFE7jMIbz8y_oFrn0Oi_EADw",
    description: "Gentle wind for peaceful breaks"
  },
];

export default function Flow() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;
  const currentFocusSound = session?.focus_sound || "wind";
  const currentRelaxSound = session?.relax_sound || "wind";

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return base44.entities.DaySession.update(session.id, data);
      }
      return Promise.reject("No active session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      toast.success("Audio settings saved");
    },
  });

  const handleSelectFocusSound = (soundId) => {
    updateSession.mutate({ focus_sound: soundId });
  };

  const handleSelectRelaxSound = (soundId) => {
    updateSession.mutate({ relax_sound: soundId });
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
            <Waves className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">Flow State</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">Boost your focus</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Immerse yourself in carefully crafted soundscapes designed to enhance concentration during work 
              and promote relaxation during breaks. Let the flow carry you.
            </p>
          </div>

          {/* Focus Sounds */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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
                    disabled={!session}
                    className={`w-full p-4 rounded-xl border transition-all disabled:opacity-50 ${
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
                      {isSelected && (
                        <Check className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relax Sounds */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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
                    disabled={!session}
                    className={`w-full p-4 rounded-xl border transition-all disabled:opacity-50 ${
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
                      {isSelected && (
                        <Check className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!session && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
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