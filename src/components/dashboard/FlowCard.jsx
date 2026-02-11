import React, { useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useTimer } from "../lib/TimerContext";

export default function FlowCard({ session, onSessionComplete }) {
  const { timeLeft, isRunning, isBreak, workMinutes, breakMinutes, toggleTimer, resetTimer, initializeTimer } = useTimer();

  const sessionWorkMinutes = session?.focus_work_minutes || 45;
  const sessionBreakMinutes = session?.focus_break_minutes || 5;
  const totalSeconds = isBreak ? breakMinutes * 60 : workMinutes * 60;

  useEffect(() => {
    initializeTimer(sessionWorkMinutes, sessionBreakMinutes, onSessionComplete);
  }, [sessionWorkMinutes, sessionBreakMinutes, onSessionComplete]);

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
      className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 flex flex-col justify-between h-full"
    >
      <div className="absolute top-0 left-0 w-24 h-24 bg-violet-400/10 rounded-full -translate-y-6 -translate-x-6" />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Flow</span>
        {isBreak && (
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
            BREAK
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-white tabular-nums mb-1">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="text-xs text-white/40 uppercase tracking-wider">
          {isBreak ? "Break time" : "Focus time"}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTimer();
          }}
          className="w-11 h-11 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shadow-lg"
        >
          {isRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetTimer();
          }}
          className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </motion.div>
  );
}