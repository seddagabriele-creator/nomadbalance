import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/api/supabaseClient";
import { getLocalDateString } from "@/utils";
import { DEFAULT_WORK_MINUTES } from "@/constants";

// AI Weekly Coach: sends aggregated stats from the user's recent sessions
// to /api/weekly-coach (Claude) and renders personalized insights.
// Results are cached per ISO week in localStorage so re-opening Reports
// doesn't burn API credits.

const CACHE_KEY = "nomadbalance:weekly-coach:v1";

function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (raw?.week === isoWeekKey() && raw?.result) return raw.result;
  } catch {}
  return null;
}

function writeCache(result) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ week: isoWeekKey(), result }));
  } catch {}
}

// Compact the last 21 days of sessions into the aggregate the coach reads.
// Day-by-day rows (not totals) so it can spot weekday/time patterns.
function buildStats(sessions, completedTasks) {
  const cutoff = new Date(Date.now() - 21 * 86400000);
  const recent = sessions
    .filter((s) => new Date(s.date + "T00:00:00") >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  const tasksByDate = {};
  for (const t of completedTasks) {
    if (!t.completed_at) continue;
    const day = getLocalDateString(new Date(t.completed_at));
    tasksByDate[day] = (tasksByDate[day] || 0) + 1;
  }

  return {
    today: getLocalDateString(),
    days: recent.map((s) => {
      const schedule = s.body_break_schedule || [];
      return {
        date: s.date,
        weekday: new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
        started_at: s.started_at || null,
        focus_sessions: s.focus_sessions_completed || 0,
        focus_minutes: (s.focus_sessions_completed || 0) * (s.focus_work_minutes || DEFAULT_WORK_MINUTES),
        breaks_done: schedule.filter((b) => b.completed).length,
        breaks_skipped: schedule.filter((b) => b.skipped).length,
        breaks_scheduled: schedule.length,
        meals_logged: (s.meals_logged || []).length,
        max_meals: s.max_meals || 3,
        tasks_completed: tasksByDate[s.date] || 0,
        day_closed: s.status === "completed",
      };
    }),
  };
}

export default function WeeklyCoach({ sessions, completedTasks }) {
  const [result, setResult] = useState(() => readCache());
  const [loading, setLoading] = useState(false);

  // Auto-generate once per week when there's enough data to say something
  const enoughData = sessions.filter(
    (s) => new Date(s.date + "T00:00:00") >= new Date(Date.now() - 21 * 86400000)
  ).length >= 3;

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch("/api/weekly-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stats: buildStats(sessions, completedTasks) }),
      });
      if (!res.ok) throw new Error(`Coach API ${res.status}`);
      const json = await res.json();
      setResult(json);
      writeCache(json);
    } catch (err) {
      console.error("[WeeklyCoach] error:", err);
      toast.error("The coach is unavailable right now — try again in a minute.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result && enoughData && !loading) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enoughData]);

  if (!enoughData && !result) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-violet-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Weekly Coach</p>
          <p className="text-xs text-white/40">Use the app for a few more days — once there's enough data, your coach will analyze your patterns here.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/25 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-violet-500/25 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            AI Weekly Coach
            <Sparkles className="w-3 h-3 text-violet-300" />
          </p>
          {result?.headline && <p className="text-xs text-white/50">{result.headline}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={generate}
          disabled={loading}
          className="text-white/40 hover:text-white shrink-0"
          aria-label="Regenerate insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && !result && (
        <p className="text-xs text-white/40 mt-3 animate-pulse">Analyzing your work patterns…</p>
      )}

      {result?.insights?.length > 0 && (
        <div className="mt-3 space-y-2.5">
          {result.insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-white/5 border border-white/10 p-3"
            >
              <p className="text-sm font-semibold text-white">
                {insight.emoji && <span className="mr-1.5">{insight.emoji}</span>}
                {insight.title}
              </p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{insight.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
