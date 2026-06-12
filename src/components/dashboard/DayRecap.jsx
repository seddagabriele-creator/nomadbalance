import React from "react";
import { motion } from "framer-motion";
import { Sunset, Brain, Activity, Utensils, CheckCircle2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_WORK_MINUTES } from "../../constants";

// End-of-day recap: the closing ceremony for the workday.
// Shows what the user accomplished today and lets them formally
// "close" the day (session status → completed).

function StatRow({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      </div>
      {sub && <span className="ml-auto text-[10px] text-white/30">{sub}</span>}
    </div>
  );
}

export default function DayRecap({ session, totalTasks, completedTasks, streak, onConfirm, onDismiss }) {
  const focusSessions = session?.focus_sessions_completed || 0;
  const focusMinutes = focusSessions * (session?.focus_work_minutes || DEFAULT_WORK_MINUTES);
  const breaksDone = session?.body_breaks_done || 0;
  const breaksTarget = session?.body_breaks_target || 0;
  const mealsLogged = (session?.meals_logged || []).length;
  const maxMeals = session?.max_meals || 3;

  const focusHours = Math.floor(focusMinutes / 60);
  const focusRemMin = focusMinutes % 60;
  const focusLabel = focusHours > 0 ? `${focusHours}h ${focusRemMin}m` : `${focusMinutes} min`;

  const didSomething = focusSessions > 0 || breaksDone > 0 || mealsLogged > 0 || completedTasks > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-indigo-950/40 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            initial={{ rotate: -20, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.15 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-amber-500/20 flex items-center justify-center"
          >
            <Sunset className="w-6 h-6 text-amber-300" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-white">Day recap</h2>
            <p className="text-xs text-white/40">
              {didSomething ? "Here's what you accomplished today" : "A quiet day — tomorrow is a new start"}
            </p>
          </div>
        </div>

        {streak >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3 flex items-center gap-2 rounded-2xl bg-orange-500/10 border border-orange-500/25 px-3 py-2"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">{streak}-day streak</span>
            <span className="text-[10px] text-white/35 ml-auto">come back tomorrow to keep it</span>
          </motion.div>
        )}

        <div className="mt-4 space-y-2">
          <StatRow
            icon={Brain}
            color="bg-violet-500/30"
            label="Deep focus"
            value={focusSessions > 0 ? `${focusSessions} session${focusSessions > 1 ? "s" : ""} · ${focusLabel}` : "No focus sessions"}
          />
          <StatRow
            icon={Activity}
            color="bg-orange-500/30"
            label="Exercise breaks"
            value={`${breaksDone}${breaksTarget ? ` of ${breaksTarget}` : ""} done`}
            sub={breaksTarget > 0 && breaksDone >= breaksTarget ? "all done!" : undefined}
          />
          <StatRow
            icon={Utensils}
            color="bg-emerald-500/30"
            label="Meals"
            value={`${mealsLogged} of ${maxMeals} logged`}
          />
          <StatRow
            icon={CheckCircle2}
            color="bg-cyan-500/30"
            label="Tasks"
            value={totalTasks > 0 ? `${completedTasks} of ${totalTasks} completed` : "No tasks today"}
          />
        </div>

        <div className="mt-5 space-y-2">
          <Button
            onClick={onConfirm}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 font-semibold"
          >
            Close the day
          </Button>
          <button
            onClick={onDismiss}
            className="w-full h-10 rounded-2xl text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            Not yet — keep working
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
