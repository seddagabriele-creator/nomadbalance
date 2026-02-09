import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export default function CurrentTaskOverlay({ task, onToggle }) {
  if (!task) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-4 right-4 z-30 max-w-lg mx-auto"
    >
      <button
        onClick={onToggle}
        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/15 transition-all"
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-white/40 shrink-0" />
        )}
        <div className="flex-1 text-left">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Top Priority</p>
          <p className={`text-sm font-medium ${task.completed ? "text-white/40 line-through" : "text-white"}`}>
            {task.title}
          </p>
        </div>
      </button>
    </motion.div>
  );
}