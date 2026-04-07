import React, { useState } from "react";
import { Target, CheckCircle2, Circle, Clock, MessageSquare, Plus, ArrowDownToLine } from "lucide-react";
import { motion } from "framer-motion";

export default function JournalCard({ session, topTask, onToggleTask, oldTaskCount, onMoveAllToToday, onAddTask, totalTasks, completedTasks }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const hasAlarm = !!topTask?.alarm_time;
  const hasNotes = !!topTask?.notes;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTitle.trim()) {
      onAddTask?.(newTitle);
      setNewTitle("");
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 flex flex-col h-full"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Target className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">Journal</span>
        </div>
        {session && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAdding(!isAdding); }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="w-3 h-3 text-white/50" />
          </button>
        )}
      </div>

      {/* Quick add input */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="mt-2"
        >
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => { if (!newTitle.trim()) setIsAdding(false); }}
            onKeyDown={(e) => { if (e.key === "Escape") { setIsAdding(false); setNewTitle(""); } }}
            placeholder="New task..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40"
          />
        </form>
      )}

      {/* Top task */}
      <div className="py-2">
        {topTask ? (
          <div className="space-y-1.5">
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
            <p className="text-white/20 text-sm font-medium leading-snug">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Move old tasks */}
      {oldTaskCount > 0 && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveAllToToday?.(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium hover:bg-amber-500/20 transition-colors mb-2 w-fit"
        >
          <ArrowDownToLine className="w-3 h-3" />
          Move {oldTaskCount} from yesterday
        </button>
      )}

      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {totalTasks > 0 ? (
          <>
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-400/60 transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-white/25 tabular-nums">{completedTasks}/{totalTasks}</span>
          </>
        ) : (
          <span className="text-[10px] text-white/25 tabular-nums">0 tasks</span>
        )}
      </div>
    </motion.div>
  );
}
