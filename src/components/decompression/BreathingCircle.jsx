import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Moon, Wind } from "lucide-react";

const PHASES = [
  { label: "Inspira", duration: 4000, scale: 1.4 },
  { label: "Trattieni", duration: 4000, scale: 1.4 },
  { label: "Espira", duration: 6000, scale: 1 },
  { label: "Pausa", duration: 2000, scale: 1 },
];

const TOTAL_CYCLE = PHASES.reduce((sum, p) => sum + p.duration, 0);
const SESSION_DURATION = 5 * 60; // 5 minutes

export default function BreathingCircle({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const phaseRef = useRef(null);

  useEffect(() => {
    if (!started) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(phaseRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let elapsed = 0;
    const advancePhase = () => {
      const currentPhase = PHASES[phase];
      elapsed += 100;
      if (elapsed >= currentPhase.duration) {
        elapsed = 0;
        setPhase((p) => (p + 1) % PHASES.length);
      }
    };
    phaseRef.current = setInterval(advancePhase, 100);

    // Better phase cycling
    const cyclePhases = () => {
      let currentIdx = 0;
      const cycle = () => {
        setPhase(currentIdx);
        const dur = PHASES[currentIdx].duration;
        currentIdx = (currentIdx + 1) % PHASES.length;
        phaseRef.current = setTimeout(cycle, dur);
      };
      cycle();
    };

    clearInterval(phaseRef.current);
    cyclePhases();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(phaseRef.current);
    };
  }, [started]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentPhase = PHASES[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6"
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-white/60 text-sm font-medium uppercase tracking-widest">Decompressione</h2>
        </div>

        {!started ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-6">
            <div className="w-40 h-40 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
              <Wind className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-semibold mb-2">Sessione di Respirazione</p>
              <p className="text-white/40 text-sm">5 minuti per rilasciare la tensione</p>
            </div>
            <Button
              onClick={() => setStarted(true)}
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white font-semibold text-base"
            >
              Inizia Respirazione
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Breathing circle */}
            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-400/30"
                animate={{ scale: currentPhase.scale }}
                transition={{ duration: currentPhase.duration / 1000, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10"
                animate={{ scale: currentPhase.scale }}
                transition={{ duration: currentPhase.duration / 1000, ease: "easeInOut", delay: 0.1 }}
              />
              <div className="absolute flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white font-semibold text-xl"
                  >
                    {currentPhase.label}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Timer */}
            <p className="text-white/30 text-sm tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>

            <Button
              variant="ghost"
              onClick={onComplete}
              className="mt-8 text-white/30 hover:text-white/60 text-sm"
            >
              Salta
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}