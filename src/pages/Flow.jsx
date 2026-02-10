import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Volume2, Wind, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";

const SOUND_OPTIONS = [
  { value: "40hz_wind", label: "40Hz + Wind", icon: Music, description: "Gamma waves con ambiente rilassante" },
  { value: "40hz", label: "Solo 40Hz", icon: Music, description: "Onde cerebrali pure per focus profondo" },
  { value: "wind", label: "Solo Wind", icon: Wind, description: "Suoni ambiente per mascherare distrazioni" },
  { value: "none", label: "Silenzio", icon: Volume2, description: "Nessun suono di sottofondo" },
];

export default function Flow() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;
  const currentMusicType = session?.focus_music_type || "40hz_wind";

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (session?.id) {
        return base44.entities.DaySession.update(session.id, data);
      }
      return Promise.reject("No active session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      toast.success("Impostazioni audio salvate");
    },
  });

  const handleSelectSound = (soundType) => {
    updateSession.mutate({ focus_music_type: soundType });
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
            <Play className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">Flow State</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">Boost your focus</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              This soundscape blends 40Hz Gamma waves to synchronize your brain for peak attention, 
              layered with wind ambience to mask distractions and trigger a deep Flow State.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Audio Settings</h2>
            <div className="space-y-3">
              {SOUND_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectSound(option.value)}
                    disabled={!session}
                    className={`w-full p-4 rounded-xl border transition-all disabled:opacity-50 ${
                      currentMusicType === option.value
                        ? "bg-violet-500/20 border-violet-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        currentMusicType === option.value ? "bg-violet-500/20" : "bg-white/5"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          currentMusicType === option.value ? "text-violet-400" : "text-white/40"
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{option.label}</p>
                        <p className="text-white/40 text-xs">{option.description}</p>
                      </div>
                      {currentMusicType === option.value && (
                        <div className="w-2 h-2 rounded-full bg-violet-400" />
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
                Inizia la giornata per configurare le impostazioni Flow
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}