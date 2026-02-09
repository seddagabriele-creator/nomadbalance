import React from "react";
import { Target, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

export default function JournalCard({ session, topTask, onToggleTask }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 flex flex-col justify-between min-h-[180px]"
    >
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-cyan-400/10 rounded-full translate-y-6 translate-x-6" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Journal</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-white/50 text-xs mb-2">Top priority</p>
        {topTask ? (
          <div className="flex items-start gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleTask?.();
              }}
              className="shrink-0 mt-0.5"
            >
              {topTask.completed ? (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <Circle className="w-4 h-4 text-white/40 hover:text-cyan-400 transition-colors" />
              )}
            </button>
            <p className={`text-white font-semibold text-sm leading-relaxed ${topTask.completed ? 'line-through text-white/40' : ''}`}>
              {topTask.title}
            </p>
          </div>
        ) : (
          <p className="text-white/30 text-sm italic">No tasks set</p>
        )}
      </div>
      {session?.focus_sessions_completed > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(session.focus_sessions_completed, 8) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border border-white/20"
              />
            ))}
          </div>
          <span className="text-[10px] text-white/40">
            {session.focus_sessions_completed} sessions completed
          </span>
        </div>
      )}
    </motion.div>
  );
}