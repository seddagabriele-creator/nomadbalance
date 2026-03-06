import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { daySessionService, taskService } from "../api/services";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Flame, Dumbbell, CheckCircle, Clock, Trophy, Star, Zap, Target, Heart, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";

const BADGES = [
  { id: "first_day", icon: Star, color: "amber", label: "First Day", desc: "Completed your first day", check: (stats) => stats.totalDays >= 1 },
  { id: "streak_3", icon: Flame, color: "orange", label: "On Fire", desc: "3-day streak", check: (stats) => stats.currentStreak >= 3 },
  { id: "streak_7", icon: Flame, color: "rose", label: "Week Warrior", desc: "7-day streak", check: (stats) => stats.currentStreak >= 7 },
  { id: "exercises_10", icon: Dumbbell, color: "emerald", label: "Body Mover", desc: "10 exercises completed", check: (stats) => stats.totalExercises >= 10 },
  { id: "exercises_50", icon: Dumbbell, color: "cyan", label: "Fitness Pro", desc: "50 exercises completed", check: (stats) => stats.totalExercises >= 50 },
  { id: "tasks_25", icon: CheckCircle, color: "violet", label: "Task Master", desc: "25 tasks completed", check: (stats) => stats.totalTasksDone >= 25 },
  { id: "focus_10h", icon: Clock, color: "indigo", label: "Deep Focus", desc: "10 hours of focus", check: (stats) => stats.totalFocusMinutes >= 600 },
  { id: "perfect_week", icon: Trophy, color: "amber", label: "Perfect Week", desc: "All breaks done for 5+ days", check: (stats) => stats.perfectBreakDays >= 5 },
  { id: "no_skip_week", icon: Target, color: "emerald", label: "No Skips", desc: "A full week without skipping breaks", check: (stats) => stats.noSkipDays >= 5 },
  { id: "consistent", icon: Heart, color: "rose", label: "Consistent", desc: "Active 5 out of 7 days this week", check: (stats) => stats.thisWeekDays >= 5 },
];

const COLOR_MAP = {
  amber: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", icon: "bg-amber-500/20" },
  orange: { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", icon: "bg-orange-500/20" },
  rose: { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-400", icon: "bg-rose-500/20" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", icon: "bg-emerald-500/20" },
  cyan: { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400", icon: "bg-cyan-500/20" },
  violet: { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-400", icon: "bg-violet-500/20" },
  indigo: { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-400", icon: "bg-indigo-500/20" },
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function getWeekLabel(weekStart) {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function Reports() {
  const { data: sessions = [] } = useQuery({
    queryKey: ["recentSessions"],
    queryFn: () => daySessionService.listRecent(30),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasksReport"],
    queryFn: () => taskService.listCompleted(),
  });

  const stats = useMemo(() => {
    if (!sessions.length) return null;

    // Sort by date ascending
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

    // Current streak
    let currentStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const dateSet = new Set(sorted.map((s) => s.date));
    let checkDate = new Date(today);
    // If today isn't in the set, start from yesterday
    if (!dateSet.has(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (dateSet.has(checkDate.toISOString().slice(0, 10))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Total exercises
    const totalExercises = sorted.reduce((sum, s) => sum + (s.body_breaks_done || 0), 0);

    // Total focus sessions & approximate minutes
    const totalFocusSessions = sorted.reduce((sum, s) => sum + (s.focus_sessions_completed || 0), 0);
    const totalFocusMinutes = sorted.reduce((sum, s) => sum + (s.focus_sessions_completed || 0) * (s.focus_work_minutes || 45), 0);

    // Perfect break days (all breaks done, none skipped)
    const perfectBreakDays = sorted.filter((s) => {
      const sched = s.body_break_schedule || [];
      return sched.length > 0 && sched.every((b) => b.completed && !b.skipped);
    }).length;

    // No-skip days
    const noSkipDays = sorted.filter((s) => {
      const sched = s.body_break_schedule || [];
      return sched.length > 0 && !sched.some((b) => b.skipped);
    }).length;

    // This week days
    const thisWeekStart = getWeekStart(today);
    const thisWeekDays = sorted.filter((s) => s.date >= thisWeekStart).length;

    // Total tasks done
    const totalTasksDone = allTasks.length;

    // Weekly breakdowns (last 4 weeks)
    const weekMap = {};
    sorted.forEach((s) => {
      const wk = getWeekStart(s.date);
      if (!weekMap[wk]) weekMap[wk] = { days: 0, exercises: 0, focusSessions: 0, focusMinutes: 0, tasks: 0 };
      weekMap[wk].days++;
      weekMap[wk].exercises += s.body_breaks_done || 0;
      weekMap[wk].focusSessions += s.focus_sessions_completed || 0;
      weekMap[wk].focusMinutes += (s.focus_sessions_completed || 0) * (s.focus_work_minutes || 45);
    });

    // Add tasks per week
    allTasks.forEach((t) => {
      if (!t.completed_at) return;
      const wk = getWeekStart(t.completed_at.slice(0, 10));
      if (weekMap[wk]) weekMap[wk].tasks++;
    });

    const weeks = Object.entries(weekMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4)
      .map(([start, data]) => ({ start, label: getWeekLabel(start), ...data }));

    return {
      totalDays: sorted.length,
      currentStreak,
      totalExercises,
      totalFocusSessions,
      totalFocusMinutes,
      perfectBreakDays,
      noSkipDays,
      thisWeekDays,
      totalTasksDone,
      weeks,
    };
  }, [sessions, allTasks]);

  const earnedBadges = useMemo(() => {
    if (!stats) return [];
    return BADGES.filter((b) => b.check(stats));
  }, [stats]);

  const lockedBadges = useMemo(() => {
    if (!stats) return BADGES;
    return BADGES.filter((b) => !b.check(stats));
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
        </div>

        {!stats || stats.totalDays === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Complete your first day to see reports</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Flame} color="orange" label="Current Streak" value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`} />
              <StatCard icon={TrendingUp} color="cyan" label="Total Days" value={stats.totalDays} />
              <StatCard icon={Dumbbell} color="emerald" label="Exercises Done" value={stats.totalExercises} />
              <StatCard icon={Clock} color="indigo" label="Focus Time" value={`${Math.round(stats.totalFocusMinutes / 60)}h`} />
              <StatCard icon={CheckCircle} color="violet" label="Tasks Completed" value={stats.totalTasksDone} />
              <StatCard icon={Zap} color="amber" label="Focus Sessions" value={stats.totalFocusSessions} />
            </div>

            {/* Weekly Breakdown */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Weekly Summary
              </h2>
              <div className="space-y-3">
                {stats.weeks.map((week, i) => (
                  <motion.div
                    key={week.start}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <p className="text-sm font-semibold text-white/80 mb-3">{week.label}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <WeekStat label="Days" value={week.days} />
                      <WeekStat label="Exercises" value={week.exercises} />
                      <WeekStat label="Focus" value={`${Math.round(week.focusMinutes / 60)}h`} />
                      <WeekStat label="Tasks" value={week.tasks} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges
              </h2>

              {earnedBadges.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {earnedBadges.map((badge, i) => {
                    const colors = COLOR_MAP[badge.color];
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className={`${colors.bg} border ${colors.border} rounded-2xl p-4 flex flex-col items-center text-center`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center mb-2`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <p className="text-sm font-semibold text-white">{badge.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{badge.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {lockedBadges.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {lockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center opacity-40"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                        <badge.icon className="w-5 h-5 text-white/20" />
                      </div>
                      <p className="text-sm font-semibold text-white/40">{badge.label}</p>
                      <p className="text-[10px] text-white/20 mt-0.5">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Motivational footer */}
            <div className="text-center py-4">
              <p className="text-white/30 text-xs italic">
                {stats.currentStreak >= 7
                  ? "You're on a roll — keep the momentum going!"
                  : stats.currentStreak >= 3
                    ? "Nice streak! Consistency is your superpower."
                    : stats.totalDays >= 5
                      ? "Every day counts. You're building something great."
                      : "You're just getting started. Great things take time."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }) {
  const colors = COLOR_MAP[color];
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function WeekStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
    </div>
  );
}
