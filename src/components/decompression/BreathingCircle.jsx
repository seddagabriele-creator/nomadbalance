import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BreathingInstructions from "./BreathingInstructions";

const TECHNIQUES = {
  "4-7-8": [
    { label: "Breathe In", duration: 4000, scale: 1.5 },
    { label: "Hold", duration: 7000, scale: 1.5 },
    { label: "Breathe Out", duration: 8000, scale: 1 },
  ],
  "box": [
    { label: "Breathe In", duration: 4000, scale: 1.5 },
    { label: "Hold", duration: 4000, scale: 1.5 },
    { label: "Breathe Out", duration: 4000, scale: 1 },
    { label: "Pause", duration: 4000, scale: 1 },
  ],
};

export default function BreathingCircle({ onComplete, durationMinutes = 5 }) {
  const [phase, setPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [started, setStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const technique = settings[0]?.breathing_technique || "4-7-8";
  const PHASES = TECHNIQUES[technique];

  useEffect(() => {
    if (!started) return;

    const sessionInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(sessionInterval);
          setTimeout(onComplete, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(sessionInterval);
  }, [started, onComplete]);

  useEffect(() => {
    if (!started) return;

    const phaseTimeout = setTimeout(() => {
      setPhase((prev) => (prev + 1) % PHASES.length);
    }, PHASES[phase].duration);

    return () => clearTimeout(phaseTimeout);
  }, [phase, started]);

  const currentPhase = PHASES[phase];

  return (
    <>
      <AnimatePresence>
        {showInstructions && (
          <BreathingInstructions
            technique={technique}
            onClose={() => setShowInstructions(false)}
          />
        )}
      </AnimatePresence>

      {!showInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Smooth gradient background overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-blue-900/10"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

      {!started ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 px-6"
        >
          <Sparkles className="w-16 h-16 text-cyan-400 mx-auto" />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Breathing Session</h1>
            <p className="text-white/60">{durationMinutes} minutes of deep pause</p>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-semibold rounded-2xl text-lg transition-all"
          >
            Start Breathing
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center mb-8"
          >
            <motion.p
              className="text-4xl font-bold text-white mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentPhase.label}
            </motion.p>
            <p className="text-white/40 text-sm">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} remaining
            </p>
          </motion.div>

          <motion.div
            className="relative w-64 h-64"
            animate={{ scale: currentPhase.scale }}
            transition={{ duration: currentPhase.duration / 1000, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute inset-8 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-2xl" />
            <div className="absolute inset-16 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-xl" />
            <div className="absolute inset-20 bg-gradient-to-br from-cyan-200/50 to-blue-300/50 rounded-full" />
          </motion.div>

          <button
            onClick={onComplete}
            className="mt-8 text-white/40 hover:text-white/60 transition-colors text-sm"
          >
            Skip
            </button>
            </>
            )}
            </motion.div>
            )}
            </>
            );
            }