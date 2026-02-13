import React, { useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useTimer } from "../lib/TimerContext";

export default function FlowCard({ session, onSessionComplete }) {
  const { timeLeft, isRunning, isBreak, workMinutes, breakMinutes, toggleTimer, resetTimer, initializeTimer } = useTimer();

  // Load user's preferred duration from localStorage or use session/default
  const getUserPreferredDuration = () => {
    const savedDefaults = localStorage.getItem('dailyDefaults');
    if (savedDefaults) {
      const defaults = JSON.parse(savedDefaults);
      return {
        work: defaults.focus_work_minutes || 45,
        break: defaults.focus_break_minutes || 5
      };
    }
    return {
      work: session?.focus_work_minutes || 45,
      break: session?.focus_break_minutes || 5
    };
  };

  const sessionWorkMinutes = session?.focus_work_minutes || getUserPreferredDuration().work;
  const sessionBreakMinutes = session?.focus_break_minutes || getUserPreferredDuration().break;
  const totalSeconds = isBreak ? breakMinutes * 60 : workMinutes * 60;

  useEffect(() => {
    initializeTimer(sessionWorkMinutes, sessionBreakMinutes, onSessionComplete);
  }, [sessionWorkMinutes, sessionBreakMinutes, onSessionComplete, initializeTimer]);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      const newDefaults = event.detail;
      const newWork = newDefaults.focus_work_minutes || 45;
      const newBreak = newDefaults.focus_break_minutes || 5;
      initializeTimer(newWork, newBreak, onSessionComplete);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, [onSessionComplete, initializeTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 34;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden h-full p-6 pb-8 flex flex-col justify-between"
    >
      <div className="absolute top-0 left-0 w-24 h-24 bg-violet-400/10 rounded-full -translate-y-6 -translate-x-6" />
      
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Play className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Flow</span>
        {isBreak && (
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
            BREAK
          </span>
        )}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-3xl font-bold text-white tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
          {isBreak ? "Break time" : "Focus time"}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTimer();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-all shadow-lg"
        >
          {isRunning ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetTimer();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-6 h-6 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-3 h-3 text-white/50 hover:text-white/80" />
        </button>
      </div>
    </motion.div>
  );
}