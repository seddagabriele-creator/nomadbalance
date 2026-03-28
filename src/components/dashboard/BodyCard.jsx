import React from "react";
import { Activity, ChevronRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { DEFAULT_BODY_BREAKS_TARGET } from "../../constants";

export default function BodyCard({ session, onSwapExercise }) {
  const breaksDone = session?.body_breaks_done || 0;
  const breaksTarget = session?.body_breaks_target || DEFAULT_BODY_BREAKS_TARGET;
  const schedule = session?.body_break_schedule || [];
  const nextBreakIndex = schedule.findIndex(b => !b.completed);
  const nextBreak = nextBreakIndex >= 0 ? schedule[nextBreakIndex] : null;
  const nextExercise = nextBreak?.exercise_name || "No exercise";
  const progressPercent = breaksTarget > 0 ? (breaksDone / breaksTarget) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 flex flex-col h-full"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-auto">
        <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Activity className="w-3 h-3 text-orange-400" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-400">Body</span>
      </div>

      {/* Next exercise */}
      <div className="py-3">
        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Next break</p>
        <div className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <p className="text-white font-semibold text-sm flex-1 leading-snug">{nextExercise}</p>
          {nextBreak && session && onSwapExercise && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSwapExercise(nextBreakIndex); }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-6 h-6 flex-shrink-0 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Swap exercise"
            >
              <RefreshCw className="w-3 h-3 text-white/25 hover:text-orange-400 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/25 uppercase tracking-wider">Progress</span>
          <span className="text-[10px] text-white/40 font-medium tabular-nums">{breaksDone}/{breaksTarget}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
