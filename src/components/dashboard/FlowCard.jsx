import React, { useEffect } from "react";
import { Play, Pause, RotateCcw, Wind, Waves, Shell } from "lucide-react";
import { motion } from "framer-motion";
import { useTimer } from "../lib/TimerContext";
import { getDailyDefaults } from "../../hooks/useDailyDefaults";
import { DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES } from "../../constants";

const ALL_SOUNDS = [
  { id: "40hz-wind", label: "Wind", icon: Wind, type: "focus" },
  { id: "40hz-ocean", label: "Ocean", icon: Waves, type: "focus" },
  { id: "10hz-binaural-ocean", label: "Ocean", icon: Waves, type: "relax" },
  { id: "10hz-binaural-wind", label: "Wind", icon: Shell, type: "relax" },
];

export default function FlowCard({ session, onSessionComplete, onSoundChange }) {
  const { timeLeft, isRunning, isBreak, workMinutes, breakMinutes, toggleTimer, resetTimer, initializeTimer, setFocusSoundId } = useTimer();

  const userDuration = (() => {
    const defaults = getDailyDefaults();
    return {
      work: defaults.focus_work_minutes || DEFAULT_WORK_MINUTES,
      break: defaults.focus_break_minutes || DEFAULT_BREAK_MINUTES,
    };
  })();

  const sessionWorkMinutes = session?.focus_work_minutes || userDuration.work;
  const sessionBreakMinutes = session?.focus_break_minutes || userDuration.break;

  useEffect(() => {
    initializeTimer(sessionWorkMinutes, sessionBreakMinutes, onSessionComplete);
  }, [sessionWorkMinutes, sessionBreakMinutes, onSessionComplete, initializeTimer]);

  useEffect(() => {
    if (session?.focus_sound) setFocusSoundId(session.focus_sound);
  }, [session?.focus_sound, setFocusSoundId]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentFocusSound = session?.focus_sound || "40hz-wind";
  const currentRelaxSound = session?.relax_sound || "10hz-binaural-ocean";
  const activeSound = isBreak ? currentRelaxSound : currentFocusSound;
  const activeSoundObj = ALL_SOUNDS.find(s => s.id === activeSound) || ALL_SOUNDS[0];

  const handleCycleSound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || !onSoundChange) return;
    // Cycle through ALL sounds (focus + relax)
    const currentIndex = ALL_SOUNDS.findIndex(s => s.id === activeSound);
    const nextIndex = (currentIndex + 1) % ALL_SOUNDS.length;
    const nextSound = ALL_SOUNDS[nextIndex];
    // Update the right field based on the sound type
    if (nextSound.type === "focus") {
      onSoundChange({ focus_sound: nextSound.id });
      setFocusSoundId(nextSound.id);
    } else {
      onSoundChange({ relax_sound: nextSound.id });
    }
  };

  const SoundIcon = activeSoundObj.icon;
  const soundLabel = activeSoundObj.type === "focus"
    ? `Focus: ${activeSoundObj.label}`
    : `Relax: ${activeSoundObj.label}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden h-full p-5 flex flex-col"
      role="region"
      aria-label="Focus timer"
    >
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Play className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">Flow</span>
        </div>
        {isBreak && (
          <span className="text-[9px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-medium">
            BREAK
          </span>
        )}
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center py-3">
        <div className="text-3xl font-bold text-white tabular-nums tracking-tight" aria-live="polite" aria-atomic="true">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
          {isBreak ? "Break" : "Focus"}
        </div>
      </div>

      {/* Controls + Sound */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTimer(); }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetTimer(); }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-3 h-3 text-white/30" />
          </button>
        </div>
        {session && (
          <button
            onClick={handleCycleSound}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={`Sound: ${soundLabel}. Tap to switch.`}
          >
            <SoundIcon className="w-3 h-3 text-white/25" />
            <span className="text-[9px] text-white/25">{soundLabel}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
