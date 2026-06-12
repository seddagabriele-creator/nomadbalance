import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { daySessionService, taskService } from "../api/services";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, BarChart3, TrendingUp, Flame, Dumbbell, CheckCircle,
  Clock, Trophy, Star, Target, Heart, Award, Sun, Utensils, ChevronUp,
  ChevronDown, Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl, getLocalDateString } from "../utils";
import { DEFAULT_WORK_MINUTES } from "../constants";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProGate from "@/components/ProGate";

// ─── Level system ───
const LEVELS = [
  { min: 0, title: "Beginner", color: "text-white/60" },
  { min: 2, title: "Explorer", color: "text-cyan-400" },
  { min: 4, title: "Achiever", color: "text-emerald-400" },
  { min: 6, title: "Warrior", color: "text-violet-400" },
  { min: 9, title: "Champion", color: "text-amber-400" },
  { min: 12, title: "Legend", color: "text-rose-400" },
];

function getUserLevel(badgeCount) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (badgeCount >= l.min) level = l;
  }
  return level;
}

// ─── Badges ───
const BADGES = [
  { id: "first_day", icon: Star, color: "amber", label: "First Day", desc: "Completed your first day",
    check: (s) => s.totalDays >= 1, progress: (s) => ({ current: s.totalDays, target: 1 }) },
  { id: "streak_3", icon: Flame, color: "orange", label: "On Fire", desc: "3-day streak",
    check: (s) => s.currentStreak >= 3, progress: (s) => ({ current: s.currentStreak, target: 3 }) },
  { id: "streak_7", icon: Flame, color: "rose", label: "Week Warrior", desc: "7-day streak",
    check: (s) => s.currentStreak >= 7, progress: (s) => ({ current: s.currentStreak, target: 7 }) },
  { id: "streak_30", icon: Crown, color: "amber", label: "Marathon", desc: "30-day streak",
    check: (s) => s.longestStreakEver >= 30, progress: (s) => ({ current: s.longestStreakEver, target: 30 }) },
  { id: "exercises_10", icon: Dumbbell, color: "emerald", label: "Body Mover", desc: "10 exercises completed",
    check: (s) => s.totalExercises >= 10, progress: (s) => ({ current: s.totalExercises, target: 10 }) },
  { id: "exercises_50", icon: Dumbbell, color: "cyan", label: "Fitness Pro", desc: "50 exercises completed",
    check: (s) => s.totalExercises >= 50, progress: (s) => ({ current: s.totalExercises, target: 50 }) },
  { id: "tasks_25", icon: CheckCircle, color: "violet", label: "Task Master", desc: "25 tasks completed",
    check: (s) => s.totalTasksDone >= 25, progress: (s) => ({ current: s.totalTasksDone, target: 25 }) },
  { id: "focus_10h", icon: Clock, color: "indigo", label: "Deep Focus", desc: "10 hours of focus",
    check: (s) => s.totalFocusMinutes >= 600, progress: (s) => ({ current: Math.round(s.totalFocusMinutes / 60), target: 10 }) },
  { id: "perfect_week", icon: Trophy, color: "amber", label: "Perfect Week", desc: "All breaks done for 5+ days",
    check: (s) => s.perfectBreakDays >= 5, progress: (s) => ({ current: s.perfectBreakDays, target: 5 }) },
  { id: "no_skip_week", icon: Target, color: "emerald", label: "No Skips", desc: "No skipped breaks for 5+ days",
    check: (s) => s.noSkipDays >= 5, progress: (s) => ({ current: s.noSkipDays, target: 5 }) },
  { id: "consistent", icon: Heart, color: "rose", label: "Consistent", desc: "Active 5 of 7 days this week",
    check: (s) => s.thisWeekDays >= 5, progress: (s) => ({ current: s.thisWeekDays, target: 5 }) },
  { id: "early_bird", icon: Sun, color: "amber", label: "Early Bird", desc: "Started a session before 8am",
    check: (s) => s.earlyBirdDays >= 1, progress: (s) => ({ current: s.earlyBirdDays, target: 1 }) },
  { id: "meal_master", icon: Utensils, color: "emerald", label: "Meal Master", desc: "7 days fasting adherence",
    check: (s) => s.fastingAdherenceDays >= 7, progress: (s) => ({ current: s.fastingAdherenceDays, target: 7 }) },
];

const COLOR_MAP = {
  amber: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", icon: "bg-amber-500/20", bar: "#f59e0b" },
  orange: { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", icon: "bg-orange-500/20", bar: "#f97316" },
  rose: { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-400", icon: "bg-rose-500/20", bar: "#f43f5e" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400", icon: "bg-emerald-500/20", bar: "#10b981" },
  cyan: { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400", icon: "bg-cyan-500/20", bar: "#06b6d4" },
  violet: { bg: "bg-violet-500/15", border: "border-violet-500/30", text: "text-violet-400", icon: "bg-violet-500/20", bar: "#8b5cf6" },
  indigo: { bg: "bg-indigo-500/15", border: "border-indigo-500/30", text: "text-indigo-400", icon: "bg-indigo-500/20", bar: "#6366f1" },
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function getWeekLabel(weekStart) {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getShortWeekLabel(weekStart) {
  const start = new Date(weekStart + "T00:00:00");
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function computeTrend(current, previous) {
  if (previous === 0 && current === 0) return { direction: "flat", pct: 0 };
  if (previous === 0) return { direction: "up", pct: 100 };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { direction: "up", pct };
  if (pct < 0) return { direction: "down", pct: Math.abs(pct) };
  return { direction: "flat", pct: 0 };
}

export default function Reports() {
  const { data: sessions = [] } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => daySessionService.listAll(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasksReport"],
    queryFn: () => taskService.listCompleted(),
  });

  const stats = useMemo(() => {
    if (!sessions.length) return null;

    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    // Local date, NOT toISOString (UTC) — otherwise the streak looks broken
    // for users ahead of UTC during the late evening / after midnight.
    const today = getLocalDateString();
    const dateSet = new Set(sorted.map((s) => s.date));

    // ── Current streak ──
    let currentStreak = 0;
    let checkDate = new Date(today + "T00:00:00");
    if (!dateSet.has(today)) checkDate.setDate(checkDate.getDate() - 1);
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── Longest streak ever ──
    let longestStreakEver = 0;
    let tempStreak = 0;
    const allDates = [...dateSet].sort();
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(allDates[i - 1] + "T00:00:00");
        const curr = new Date(allDates[i] + "T00:00:00");
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
      }
      longestStreakEver = Math.max(longestStreakEver, tempStreak);
    }

    // ── Totals ──
    const totalExercises = sorted.reduce((sum, s) => sum + (s.body_breaks_done || 0), 0);
    const totalFocusSessions = sorted.reduce((sum, s) => sum + (s.focus_sessions_completed || 0), 0);
    const totalFocusMinutes = sorted.reduce((sum, s) => sum + (s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES), 0);

    // ── Exercise completion rate ──
    let totalScheduled = 0;
    let totalCompleted = 0;
    sorted.forEach((s) => {
      const sched = s.body_break_schedule || [];
      totalScheduled += sched.length;
      totalCompleted += sched.filter((b) => b.completed).length;
    });
    const exerciseCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    // ── Average daily focus ──
    const daysWithFocus = sorted.filter((s) => (s.focus_sessions_completed || 0) > 0).length;
    const avgDailyFocusMinutes = daysWithFocus > 0 ? Math.round(totalFocusMinutes / daysWithFocus) : 0;

    // ── Perfect break days & no-skip days ──
    const perfectBreakDays = sorted.filter((s) => {
      const sched = s.body_break_schedule || [];
      return sched.length > 0 && sched.every((b) => b.completed && !b.skipped);
    }).length;

    const noSkipDays = sorted.filter((s) => {
      const sched = s.body_break_schedule || [];
      return sched.length > 0 && !sched.some((b) => b.skipped);
    }).length;

    // ── Early bird sessions ──
    const earlyBirdDays = sorted.filter((s) => {
      if (!s.started_at) return false;
      return s.started_at < "08:00";
    }).length;

    // ── Fasting adherence ──
    let fastingAdherenceDays = 0;
    sorted.forEach((s) => {
      if (!s.eating_window_start || !s.eating_window_end || !s.meals_logged) return;
      const meals = Array.isArray(s.meals_logged) ? s.meals_logged : [];
      if (meals.length === 0) return;
      const allInWindow = meals.every((m) => {
        if (!m.logged_at) return true;
        const mealTime = new Date(m.logged_at).toTimeString().slice(0, 5);
        return mealTime >= s.eating_window_start && mealTime <= s.eating_window_end;
      });
      if (allInWindow) fastingAdherenceDays++;
    });

    // ── This week stats vs previous week ──
    const thisWeekStart = getWeekStart(today);
    const prevWeekDate = new Date(thisWeekStart + "T00:00:00");
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    const prevWeekStart = prevWeekDate.toISOString().slice(0, 10);

    const thisWeekSessions = sorted.filter((s) => s.date >= thisWeekStart);
    const prevWeekSessions = sorted.filter((s) => s.date >= prevWeekStart && s.date < thisWeekStart);

    const weekStats = (arr) => ({
      days: arr.length,
      exercises: arr.reduce((sum, s) => sum + (s.body_breaks_done || 0), 0),
      focusMinutes: arr.reduce((sum, s) => sum + (s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES), 0),
      tasks: 0,
    });
    const thisWeek = weekStats(thisWeekSessions);
    const prevWeek = weekStats(prevWeekSessions);

    // Add tasks per week
    allTasks.forEach((t) => {
      if (!t.completed_at) return;
      const taskDate = t.completed_at.slice(0, 10);
      if (taskDate >= thisWeekStart) thisWeek.tasks++;
      else if (taskDate >= prevWeekStart && taskDate < thisWeekStart) prevWeek.tasks++;
    });

    const trends = {
      days: computeTrend(thisWeek.days, prevWeek.days),
      exercises: computeTrend(thisWeek.exercises, prevWeek.exercises),
      focus: computeTrend(thisWeek.focusMinutes, prevWeek.focusMinutes),
      tasks: computeTrend(thisWeek.tasks, prevWeek.tasks),
    };

    // ── Weekly breakdowns (last 6 weeks for chart) ──
    const weekMap = {};
    sorted.forEach((s) => {
      const wk = getWeekStart(s.date);
      if (!weekMap[wk]) weekMap[wk] = { days: 0, exercises: 0, focusSessions: 0, focusMinutes: 0, tasks: 0 };
      weekMap[wk].days++;
      weekMap[wk].exercises += s.body_breaks_done || 0;
      weekMap[wk].focusSessions += s.focus_sessions_completed || 0;
      weekMap[wk].focusMinutes += (s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES);
    });
    allTasks.forEach((t) => {
      if (!t.completed_at) return;
      const wk = getWeekStart(t.completed_at.slice(0, 10));
      if (weekMap[wk]) weekMap[wk].tasks++;
    });
    const weeks = Object.entries(weekMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .reverse()
      .map(([start, data]) => ({
        start,
        label: getShortWeekLabel(start),
        ...data,
        focusHours: +(data.focusMinutes / 60).toFixed(1),
      }));

    // ── Personal records ──
    // Best day (highest combined score)
    const tasksByDate = {};
    allTasks.forEach((t) => {
      if (!t.completed_at) return;
      const d = t.completed_at.slice(0, 10);
      tasksByDate[d] = (tasksByDate[d] || 0) + 1;
    });

    let bestDay = null;
    let bestDayScore = 0;
    sorted.forEach((s) => {
      const focusH = ((s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES)) / 60;
      const exercises = s.body_breaks_done || 0;
      const tasks = tasksByDate[s.date] || 0;
      const score = focusH + exercises + tasks;
      if (score > bestDayScore) {
        bestDayScore = score;
        bestDay = {
          date: s.date,
          focusHours: +focusH.toFixed(1),
          exercises,
          tasks,
        };
      }
    });

    // Max focus in a day
    let maxFocusDay = { date: null, minutes: 0 };
    sorted.forEach((s) => {
      const mins = (s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES);
      if (mins > maxFocusDay.minutes) maxFocusDay = { date: s.date, minutes: mins };
    });

    // Max tasks in a day
    let maxTasksDay = { date: null, count: 0 };
    Object.entries(tasksByDate).forEach(([date, count]) => {
      if (count > maxTasksDay.count) maxTasksDay = { date, count };
    });

    return {
      totalDays: sorted.length,
      currentStreak,
      longestStreakEver,
      totalExercises,
      totalFocusSessions,
      totalFocusMinutes,
      exerciseCompletionRate,
      avgDailyFocusMinutes,
      perfectBreakDays,
      noSkipDays,
      thisWeekDays: thisWeek.days,
      earlyBirdDays,
      fastingAdherenceDays,
      totalTasksDone: allTasks.length,
      weeks,
      trends,
      bestDay,
      maxFocusDay,
      maxTasksDay,
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

  const userLevel = useMemo(() => getUserLevel(earnedBadges.length), [earnedBadges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
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
          <ProGate
            title="Your progress lives here"
            description="Weekly trends, badges, streaks and personal records — unlock the full picture of your work habits."
          >
          <div className="space-y-8">
            {/* Level Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center">
                <Crown className={`w-6 h-6 ${userLevel.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Level {LEVELS.indexOf(userLevel) + 1}</p>
                <p className={`text-lg font-bold ${userLevel.color}`}>{userLevel.title}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{earnedBadges.length}</p>
                <p className="text-[10px] text-white/40 uppercase">badges</p>
              </div>
            </motion.div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Flame} color="orange" label="Current Streak"
                value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`}
                trend={stats.trends.days} />
              <StatCard icon={TrendingUp} color="cyan" label="Total Days" value={stats.totalDays} />
              <StatCard icon={Target} color="emerald" label="Exercise Rate"
                value={`${stats.exerciseCompletionRate}%`}
                trend={stats.trends.exercises} />
              <StatCard icon={Clock} color="indigo" label="Avg Daily Focus"
                value={`${Math.round(stats.avgDailyFocusMinutes)}m`}
                trend={stats.trends.focus} />
              <StatCard icon={CheckCircle} color="violet" label="Tasks Completed"
                value={stats.totalTasksDone}
                trend={stats.trends.tasks} />
              <StatCard icon={Utensils} color="amber" label="Fasting Days"
                value={stats.fastingAdherenceDays} />
            </div>

            {/* Weekly Chart */}
            {stats.weeks.length > 1 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Weekly Trend
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex gap-4 mb-3 justify-center">
                    <ChartLegendDot color="#06b6d4" label="Days" />
                    <ChartLegendDot color="#10b981" label="Exercises" />
                    <ChartLegendDot color="#6366f1" label="Focus (h)" />
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.weeks} barCategoryGap="20%">
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                        <Bar dataKey="days" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="exercises" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="focusHours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Records */}
            {(stats.bestDay || stats.maxFocusDay.date || stats.maxTasksDay.date) && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Personal Records
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {stats.bestDay && (
                    <RecordCard
                      icon={Star}
                      color="amber"
                      label="Best Day"
                      value={formatDate(stats.bestDay.date)}
                      detail={`${stats.bestDay.focusHours}h focus · ${stats.bestDay.exercises} ex · ${stats.bestDay.tasks} tasks`}
                    />
                  )}
                  <RecordCard
                    icon={Flame}
                    color="orange"
                    label="Longest Streak"
                    value={`${stats.longestStreakEver} days`}
                  />
                  {stats.maxFocusDay.date && (
                    <RecordCard
                      icon={Clock}
                      color="indigo"
                      label="Max Focus"
                      value={`${(stats.maxFocusDay.minutes / 60).toFixed(1)}h`}
                      detail={formatDate(stats.maxFocusDay.date)}
                    />
                  )}
                  {stats.maxTasksDay.date && (
                    <RecordCard
                      icon={CheckCircle}
                      color="violet"
                      label="Max Tasks"
                      value={`${stats.maxTasksDay.count} tasks`}
                      detail={formatDate(stats.maxTasksDay.date)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Badges
                <span className="text-sm font-normal text-white/40 ml-1">
                  {earnedBadges.length}/{BADGES.length}
                </span>
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
                  {lockedBadges.map((badge) => {
                    const prog = badge.progress(stats);
                    const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));
                    return (
                      <div
                        key={badge.id}
                        className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                          <badge.icon className="w-5 h-5 text-white/20" />
                        </div>
                        <p className="text-sm font-semibold text-white/40">{badge.label}</p>
                        <p className="text-[10px] text-white/20 mt-0.5">{badge.desc}</p>
                        {/* Progress bar */}
                        <div className="w-full mt-2.5">
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white/20 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-white/25 mt-1">{prog.current}/{prog.target}</p>
                        </div>
                      </div>
                    );
                  })}
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
          </ProGate>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ icon: Icon, color, label, value, trend }) {
  const colors = COLOR_MAP[color];
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold text-white">{value}</p>
        {trend && trend.direction !== "flat" && (
          <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${
            trend.direction === "up" ? "text-emerald-400" : "text-rose-400"
          }`}>
            {trend.direction === "up" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {trend.pct}%
          </div>
        )}
      </div>
    </div>
  );
}

function RecordCard({ icon: Icon, color, label, value, detail }) {
  const colors = COLOR_MAP[color];
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${colors.icon} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      {detail && <p className="text-[10px] text-white/40 mt-0.5">{detail}</p>}
    </div>
  );
}

function ChartLegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-white/40">{label}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-white/50 mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
          <span className="text-white/60 capitalize">{entry.dataKey === "focusHours" ? "Focus (h)" : entry.dataKey}</span>
          <span className="text-white font-semibold ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
