import React from "react";
import { Activity, ChevronRight, RefreshCw, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function BodyCard({ session, onSwapExercise, isAfterHours, onExtendSupport }) {
  const breaksDone = session?.body_breaks_done || 0;
  const schedule = session?.body_break_schedule || [];

  const nextBreakIndex = schedule.findIndex(b => !b.completed && !b.skipped);
  const nextBreak = nextBreakIndex >= 0 ? schedule[nextBreakIndex] : null;
  const allDone = session && !nextBreak;
  const nextExercise = nextBreak?.exercise_name || (session ? "All caught up" : "Loading...");

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

      {/* Next exercise or positive count */}
      <div className="py-3">
        {nextBreak ? (
          <>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">
              Next at {nextBreak.time}
            </p>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <p className="text-white font-semibold text-sm flex-1 leading-snug">{nextExercise}</p>
              {session && onSwapExercise && (
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
          </>
        ) : (
          <>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Status</p>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <p className="text-white font-semibold text-sm leading-snug">All caught up</p>
            </div>
          </>
        )}
      </div>

      {/* After-hours support button */}
      {isAfterHours && allDone && onExtendSupport && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onExtendSupport(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-1.5 mb-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
        >
          <Clock className="w-3 h-3 text-orange-400" />
          <span className="text-[10px] font-medium text-orange-400">Continue stretching support?</span>
        </button>
      )}

      {/* Breaks done today — positive metric only */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/25 uppercase tracking-wider">{breaksDone === 1 ? "Break" : "Breaks"} today</span>
        <span className="text-sm text-white font-bold tabular-nums">{breaksDone}</span>
      </div>
    </motion.div>
  );
}
