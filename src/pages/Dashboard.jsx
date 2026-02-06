import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Zap, Users } from "lucide-react";

import FuelCard from "../components/dashboard/FuelCard";
import FlowCard from "../components/dashboard/FlowCard";
import BodyCard from "../components/dashboard/BodyCard";
import JournalCard from "../components/dashboard/JournalCard";
import StartDayWizard from "../components/wizard/StartDayWizard";
import BreathingCircle from "../components/decompression/BreathingCircle";

const MOTIVATIONAL = [
  "Sei vivo! Fai qualcosa di grande oggi.",
  "Ogni respiro è una nuova opportunità.",
  "La disciplina è libertà.",
  "Il focus è il tuo superpotere.",
  "Piccoli passi, grandi risultati.",
  "La costanza batte il talento.",
  "Oggi è il giorno perfetto.",
];

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [motivation, setMotivation] = useState("");

  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buongiorno");
    else if (hour < 18) setGreeting("Buon pomeriggio");
    else setGreeting("Buonasera");
    setMotivation(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

    base44.auth.me().then((user) => {
      setUserName(user?.full_name?.split(" ")[0] || "");
    }).catch(() => {});
  }, []);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;

  const createSession = useMutation({
    mutationFn: (data) => base44.entities.DaySession.create({ ...data, date: today, status: "active", started_at: new Date().toTimeString().slice(0, 5) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
  });

  const updateSession = useMutation({
    mutationFn: (data) => base44.entities.DaySession.update(session.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
  });

  const handleStartDay = (wizardData) => {
    createSession.mutate(wizardData);
    setShowWizard(false);
  };

  const handleEndDay = () => {
    setShowBreathing(true);
  };

  const handleDecompressionComplete = () => {
    setShowBreathing(false);
    if (session) {
      updateSession.mutate({ status: "completed" });
    }
  };

  const handleSessionComplete = () => {
    if (session) {
      updateSession.mutate({
        focus_sessions_completed: (session.focus_sessions_completed || 0) + 1,
        body_breaks_done: (session.body_breaks_done || 0) + 1,
      });
    }
  };

  const toggleMeetingMode = () => {
    if (session) {
      updateSession.mutate({ meeting_mode: !session.meeting_mode });
    }
  };

  const isActive = session?.status === "active";
  const isCompleted = session?.status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}{userName ? `, ${userName}` : ""} 👋
              </h1>
              <p className="text-white/40 text-sm mt-1">{motivation}</p>
            </div>
            {isActive && session?.meeting_mode && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                <Users className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 text-xs font-medium">Meeting</span>
              </div>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/70 text-xs font-medium">
                Giornata attiva dalle {session.started_at}
              </span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 mt-3">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400/70 text-xs font-medium">
                Giornata completata. Riposa bene!
              </span>
            </div>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          <FuelCard session={session} />
          <FlowCard session={session} onSessionComplete={handleSessionComplete} />
          <BodyCard session={session} />
          <JournalCard session={session} />
        </div>

        {/* Stats bar */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-around rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
          >
            <div className="text-center">
              <p className="text-lg font-bold text-white">{session?.focus_sessions_completed || 0}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Sessioni</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">{session?.body_breaks_done || 0}/{session?.body_breaks_target || 0}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Pause</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {((session?.focus_sessions_completed || 0) * (session?.focus_work_minutes || 45))} min
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Focus</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center px-4">
        <div className="max-w-lg w-full flex gap-3">
          {!isActive && !isCompleted && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowWizard(true)}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Sun className="w-5 h-5" />
              INIZIA GIORNATA
            </motion.button>
          )}

          {isActive && (
            <>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleMeetingMode}
                className={`flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  session.meeting_mode
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                    : "bg-white/10 border border-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                <Users className="w-5 h-5" />
                {session.meeting_mode ? "IN MEETING" : "MEETING MODE"}
              </motion.button>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEndDay}
                className="h-14 px-6 rounded-2xl bg-white/10 border border-white/10 text-white/50 hover:text-white hover:bg-white/15 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Moon className="w-5 h-5" />
                Fine
              </motion.button>
            </>
          )}

          {isCompleted && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex-1 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center justify-center gap-2"
            >
              <Moon className="w-5 h-5" />
              Giornata Completata
            </motion.div>
          )}
        </div>
      </div>

      {/* Wizard Overlay */}
      <AnimatePresence>
        {showWizard && (
          <StartDayWizard onComplete={handleStartDay} onCancel={() => setShowWizard(false)} />
        )}
      </AnimatePresence>

      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingCircle onComplete={handleDecompressionComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}