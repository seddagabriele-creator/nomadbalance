import React from "react";
import { Target, CheckCircle2, Circle, Clock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function JournalCard({ session, topTask, onToggleTask }) {
  const hasAlarm = !!topTask?.alarm_time;
  const hasNotes = !!topTask?.notes;
  const sessionsCount = session?.focus_sessions_completed || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 flex flex-col h-full"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-auto">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Target className="w-3 h-3 text-cyan-400" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">Journal</span>
      </div>

      {/* Top task */}
      <div className="py-3">
        <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Top priority</p>
        {topTask ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleTask?.(); }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="shrink-0 mt-0.5"
              >
                {topTask.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Circle className="w-4 h-4 text-white/25 hover:text-cyan-400 transition-colors" />
                )}
              </button>
              <p className={`text-sm font-medium leading-snug ${topTask.completed ? 'line-through text-white/30' : 'text-white'}`}>
                {topTask.title}
              </p>
            </div>
            {/* Metadata indicators */}
            {(hasAlarm || hasNotes) && (
              <div className="flex items-center gap-2 pl-6">
                {hasAlarm && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400/60">
                    <Clock className="w-2.5 h-2.5" />
                    {topTask.alarm_time}
                  </span>
                )}
                {hasNotes && (
                  <span className="flex items-center gap-1 text-[10px] text-indigo-400/50">
                    <MessageSquare className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <Circle className="w-4 h-4 text-white/15 shrink-0 mt-0.5" />
            <p className="text-white/20 text-sm font-medium leading-snug">No tasks set</p>
          </div>
        )}
      </div>

      {/* Sessions counter */}
      <div className="flex items-center gap-1.5">
        {sessionsCount > 0 && (
          <div className="flex -space-x-0.5">
            {Array.from({ length: Math.min(sessionsCount, 8) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/60" />
            ))}
          </div>
        )}
        <span className="text-[10px] text-white/25 tabular-nums">{sessionsCount} done</span>
      </div>
    </motion.div>
  );
}
