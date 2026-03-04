import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Utensils, Activity, Headphones, CheckCircle, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GROUP_LABELS } from "../constants";

export default function WeeklySummary({ sessions = [], onClose }) {
  // Aggregate weekly data
  const totalDays = sessions.length;

  // Meals
  const totalMeals = sessions.reduce((sum, s) => {
    const meals = (s.meals_logged || []).filter(m => m.type !== "snack");
    return sum + meals.length;
  }, 0);
  const totalSnacks = sessions.reduce((sum, s) => {
    const snacks = (s.meals_logged || []).filter(m => m.type === "snack");
    return sum + snacks.length;
  }, 0);
  const totalPlannedMeals = sessions.reduce((sum, s) => sum + (s.max_meals || 3), 0);
  const mealsOnTrack = totalPlannedMeals > 0 && totalMeals >= totalPlannedMeals * 0.8;

  // Focus
  const totalFocusSessions = sessions.reduce((sum, s) => sum + (s.focus_sessions_completed || 0), 0);
  const avgFocusMinutes = totalDays > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.focus_sessions_completed || 0) * (s.focus_work_minutes || 45), 0) / totalDays)
    : 0;

  // Body
  const totalBreaksDone = sessions.reduce((sum, s) => sum + (s.body_breaks_done || 0), 0);
  const totalBreaksTarget = sessions.reduce((sum, s) => sum + (s.body_breaks_target || 0), 0);
  const allExercises = sessions.flatMap(s => s.exercises_done_today || []);

  // Count muscle groups worked
  const muscleGroupCounts = {};
  // We can't resolve exercise IDs to groups here without exercises data,
  // so we count unique exercise IDs as a proxy
  const uniqueExercises = [...new Set(allExercises)];

  // Tasks
  // Note: tasks are in a separate table, so we can't access them here.
  // We'll skip task stats for now.

  // Determine if this is the best week (simple heuristic)
  const completionRate = totalBreaksTarget > 0 ? totalBreaksDone / totalBreaksTarget : 0;

  // Positive messages based on performance
  const getMotivationalMessage = () => {
    if (completionRate >= 0.9 && mealsOnTrack) {
      return "Outstanding week! You're building amazing habits.";
    }
    if (completionRate >= 0.7) {
      return "Great consistency! Every break you take is an investment in your health.";
    }
    if (completionRate >= 0.5) {
      return "Good progress! You're finding your rhythm. Keep going!";
    }
    if (totalDays > 0) {
      return "Every day you show up counts. Tomorrow is a fresh start!";
    }
    return "Ready for a new week? Let's make it count!";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-violet-950/30 backdrop-blur-xl rounded-3xl border border-violet-500/30 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4"
          >
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-1">Your Week</h2>
          <p className="text-white/50 text-sm">{totalDays} day{totalDays !== 1 ? "s" : ""} tracked</p>
        </div>

        {/* Stats */}
        <div className="px-6 pb-4 space-y-3">
          {/* Meals */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-300 font-semibold text-sm">Meals</p>
                <p className="text-white/50 text-xs">
                  {totalMeals} meals logged
                  {totalSnacks > 0 && ` + ${totalSnacks} snack${totalSnacks > 1 ? "s" : ""}`}
                </p>
              </div>
              {mealsOnTrack && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Body */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-orange-300 font-semibold text-sm">Body</p>
                <p className="text-white/50 text-xs">
                  {totalBreaksDone} exercises completed
                  {uniqueExercises.length > 0 && ` across ${uniqueExercises.length} different moves`}
                </p>
              </div>
              {completionRate >= 0.8 && (
                <Trophy className="w-5 h-5 text-orange-400" />
              )}
            </div>
          </div>

          {/* Focus */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-indigo-300 font-semibold text-sm">Focus</p>
                <p className="text-white/50 text-xs">
                  {totalFocusSessions} sessions &middot; ~{avgFocusMinutes} min/day average
                </p>
              </div>
            </div>
          </div>

          {/* Badge */}
          {completionRate >= 0.9 && mealsOnTrack && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 text-center"
            >
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-amber-300 font-bold text-sm">Best Week Yet!</p>
              <p className="text-white/40 text-xs mt-1">You crushed every goal this week</p>
            </motion.div>
          )}
        </div>

        {/* Motivational message */}
        <div className="px-6 pb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white/70 text-sm text-center italic">
              {getMotivationalMessage()}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-semibold text-base"
          >
            Let's go!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
