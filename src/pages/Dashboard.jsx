import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Users, MoreVertical, Settings as SettingsIcon, Wind, Coffee, Activity, BarChart3, LogOut, Sunset, Flame, Sun, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, getLocalDateString } from "../utils";
import { toast } from "sonner";
import { daySessionService, taskService, exerciseService, userSettingsService } from "../api/services";
import { useAuth } from "../lib/AuthContext";
import { ONE_MINUTE_MS, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, DEFAULT_BREAK_INTERVAL_MINUTES, DEFAULT_WORK_HOURS, AWAY_WARNING_DELAY_MS, AWAY_GRACE_AFTER_WARNING_MS, BREAK_NO_RESPONSE_AWAY_MS, IDLE_AUTO_AWAY_MS, MAX_OVERDUE_BREAKS, getEatingHours, calculateEatingWindowEnd } from "../constants";

import FuelCard from "../components/dashboard/FuelCard";
import FlowCard from "../components/dashboard/FlowCard";
import BodyCard from "../components/dashboard/BodyCard";
import JournalCard from "../components/dashboard/JournalCard";
import BreathingCircle from "../components/decompression/BreathingCircle";
import MeetingModeDialog from "../components/MeetingModeDialog";
import OnboardingTutorial from "../components/onboarding/OnboardingTutorial";
import BreakNotification from "../components/body/BreakNotification";
import DeskStatusToggle from "../components/dashboard/DeskStatusToggle";
import DayRecap from "../components/dashboard/DayRecap";
import { useTimer } from "../components/lib/TimerContext";
import { useSubscription } from "../lib/SubscriptionContext";
import { getDailyDefaults } from "../hooks/useDailyDefaults";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const toMinutes = (t) => {
  const [h, m] = (t || "00:00").split(":").map(Number);
  return h * 60 + m;
};

import { getChimeContext } from "../components/lib/chimeContext";

// Play a gentle two-tone chime for notifications.
// Uses onended to disconnect nodes safely — setTimeout disconnect
// can race with the audio thread's stop() processing and crash Chrome.
function playNotificationChime() {
  try {
    const ctx = getChimeContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);
    osc1.onended = () => { osc1.disconnect(); gain1.disconnect(); };
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
    osc2.onended = () => { osc2.disconnect(); gain2.disconnect(); };
  } catch (e) {
    // Audio not available
  }
}

export default function Dashboard() {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingDuration, setBreathingDuration] = useState(5);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check localStorage first for instant response; backend check comes via useEffect
    return !localStorage.getItem("nomadbalance_onboarding_completed");
  });
  const [activeBreakNotification, setActiveBreakNotification] = useState(null);
  const [overdueBreaks, setOverdueBreaks] = useState(null); // batch overdue breaks dialog
  const [showDayRecap, setShowDayRecap] = useState(false);
  const breakCheckRef = React.useRef(null);
  const breakActionInProgress = React.useRef(false);
  const deskReturnedAt = React.useRef(null);
  const breakShownAt = React.useRef(null); // track when break notification was shown
  const breakNoResponseTimer = React.useRef(null);
  // Local fallback for desk tracking when DB columns are missing
  const [localDeskStatus, setLocalDeskStatus] = useState("at_desk");
  const [localAwaySince, setLocalAwaySince] = useState(null);

  const queryClient = useQueryClient();
  // Guards the once-per-day session auto-create (reset on midnight rollover)
  const autoCreateAttempted = React.useRef(false);
  // State (not a per-render const) so the midnight rollover effect below can
  // force a new day: queryKey changes → fresh session query → auto-create.
  const [today, setToday] = useState(() => getLocalDateString());

  useEffect(() => {
    const scheduleRollover = () => {
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 5, 0); // 00:00:05 — small buffer past midnight
      return setTimeout(() => {
        setToday(getLocalDateString());
        autoCreateAttempted.current = false;
        queryClient.invalidateQueries({ queryKey: ["daySession"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["allTasks"] });
        timerId = scheduleRollover();
      }, nextMidnight.getTime() - Date.now());
    };
    let timerId = scheduleRollover();
    return () => clearTimeout(timerId);
  }, [queryClient]);

  // Tab was hidden/suspended over midnight: timers don't fire reliably in
  // background tabs, so also re-check the date when the tab becomes visible.
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden) return;
      const current = getLocalDateString();
      setToday((prev) => {
        if (prev !== current) {
          autoCreateAttempted.current = false;
          queryClient.invalidateQueries({ queryKey: ["daySession"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["allTasks"] });
        }
        return current;
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [queryClient]);
  const { pauseTimer, resumeTimer, isRunning: timerRunning, isBreak: timerOnBreak, timeLeft: timerTimeLeft } = useTimer();
  const { trialActive, trialDaysLeft, promptUpgrade } = useSubscription();

  const timerRunningRef = React.useRef(timerRunning);
  const timerOnBreakRef = React.useRef(timerOnBreak);
  const timerTimeLeftRef = React.useRef(timerTimeLeft);
  React.useEffect(() => { timerRunningRef.current = timerRunning; }, [timerRunning]);
  React.useEffect(() => { timerOnBreakRef.current = timerOnBreak; }, [timerOnBreak]);
  React.useEffect(() => { timerTimeLeftRef.current = timerTimeLeft; }, [timerTimeLeft]);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });

  const userSettings = React.useMemo(() => settings[0] || {}, [settings]);

  // Sync onboarding state from backend: if backend says completed, dismiss onboarding and sync localStorage
  useEffect(() => {
    // Skip if user just requested a replay from Settings — stale cache might still say completed
    if (sessionStorage.getItem("nomadbalance_replay_onboarding")) {
      sessionStorage.removeItem("nomadbalance_replay_onboarding");
      return;
    }
    if (userSettings.onboarding_completed && showOnboarding) {
      localStorage.setItem("nomadbalance_onboarding_completed", "true");
      setShowOnboarding(false);
    }
  }, [userSettings.onboarding_completed, showOnboarding]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const fallbackName = authUser?.user_metadata?.full_name?.split(" ")[0] || authUser?.email?.split("@")[0] || "";
    setUserName(userSettings.display_name || fallbackName);
  }, [userSettings]);

  const { data: sessions = [], isLoading, isError: sessionError } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;
  const hasDeskColumns = session && "desk_status" in session;
  const deskStatus = hasDeskColumns ? session.desk_status : localDeskStatus;
  const awaySince = hasDeskColumns ? session.away_since : localAwaySince;
  const isAway = deskStatus === "away";

  // Session dates (for the streak) — lightweight `date`-only query, and it
  // only changes once a day. NOTE: this used to share the "allSessions" key
  // with the listRecent() query below (two different queryFns on one key →
  // whichever mounted first won), and it fetched every full row ever.
  const { data: allSessions = [] } = useQuery({
    queryKey: ["sessionDates"],
    queryFn: () => daySessionService.listDates(),
    staleTime: 5 * ONE_MINUTE_MS,
  });

  // Current streak: consecutive days with a session, counting back from today
  // (same logic as Reports — today itself is optional so an early-morning
  // visit before the session exists doesn't show a broken streak)
  const currentStreak = React.useMemo(() => {
    if (!allSessions.length) return 0;
    const dateSet = new Set(allSessions.map((s) => s.date));
    let streak = 0;
    const checkDate = new Date(today + "T00:00:00");
    if (!dateSet.has(today)) checkDate.setDate(checkDate.getDate() - 1);
    while (dateSet.has(getLocalDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }, [allSessions, today]);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", session?.id],
    queryFn: () => {
      if (!session?.id) return [];
      return taskService.getBySession(session.id);
    },
    enabled: !!session?.id,
  });

  const topTask = [...tasks].sort((a, b) => a.order - b.order).find((t) => !t.completed) || null;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  // Old uncompleted tasks from previous sessions — only fetch uncompleted
  // ones (the completed history isn't needed here and grows forever)
  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasks"],
    queryFn: () => taskService.listUncompleted(),
  });

  const oldUncompletedTasks = React.useMemo(() => {
    if (!session?.id) return [];
    return allTasks.filter((t) => !t.completed && t.session_id && t.session_id !== session.id);
  }, [allTasks, session?.id]);

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.listAll(),
  });

  const { data: allPreviousSessions = [] } = useQuery({
    queryKey: ["recentSessions"],
    queryFn: () => daySessionService.listRecent(),
  });

  // Request notification permission early if enabled in settings
  useEffect(() => {
    if (userSettings.notifications_enabled !== false && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [userSettings.notifications_enabled]);

  // Check for task alarm deadlines every minute
  const firedAlarmsRef = React.useRef(new Set());
  useEffect(() => {
    if (!session || session.status !== "active") return;
    if (userSettings.notifications_enabled === false) return;

    const checkTaskAlarms = () => {
      if (document.hidden) return;
      const now = new Date();
      const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      tasks.forEach((task) => {
        if (!task.alarm_time || task.completed) return;
        if (firedAlarmsRef.current.has(task.id)) return;
        if (task.alarm_time === nowTime) {
          firedAlarmsRef.current.add(task.id);
          playNotificationChime();
          toast(`Task reminder: ${task.title}`, { icon: "\u23F0", duration: 10000 });
          if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
              body: task.title,
              icon: "/favicon.ico",
              tag: `nomadbalance-task-${task.id}`,
            });
          }
        }
      });
    };

    checkTaskAlarms();
    const interval = setInterval(checkTaskAlarms, ONE_MINUTE_MS);
    return () => clearInterval(interval);
  }, [session, tasks, userSettings.notifications_enabled]);

  // Check for due body breaks every minute (paused when away from desk)
  useEffect(() => {
    if (!session || session.status !== "active" || session.meeting_mode) return;
    // Pause break checks when user is away from desk
    if (isAway) return;
    // Respect notifications_enabled setting
    if (userSettings.notifications_enabled === false) return;

    const checkBreaks = () => {
      if (document.hidden) return;
      if (activeBreakNotification || overdueBreaks || breakActionInProgress.current) return; // already showing or completing one

      // Respect notification time window
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = toMinutes(userSettings.notification_start_time || DEFAULT_WORK_HOURS.morning_start);
      const endMinutes = toMinutes(userSettings.notification_end_time || DEFAULT_WORK_HOURS.afternoon_end);
      if (nowMinutes < startMinutes || nowMinutes > endMinutes) return;

      // Grace period: don't interrupt right after returning to desk
      if (deskReturnedAt.current) {
        const msSinceReturn = Date.now() - deskReturnedAt.current;
        const graceMinutes = 10; // Let user settle in for 10 minutes
        if (msSinceReturn < graceMinutes * 60 * 1000) return;
        deskReturnedAt.current = null; // Grace period over
      }

      // If focus timer is in work phase with ≤5 min left, defer the break
      // so it aligns with the upcoming focus break (handleSessionComplete will catch it)
      const DEFER_THRESHOLD_SECONDS = 5 * 60;
      if (timerRunningRef.current && !timerOnBreakRef.current && timerTimeLeftRef.current > 0 && timerTimeLeftRef.current <= DEFER_THRESHOLD_SECONDS) return;

      const schedule = session.body_break_schedule || [];
      const dueBreaks = schedule.filter(
        (b) => !b.completed && !b.skipped && toMinutes(b.time) <= nowMinutes
      );

      // Auto-skip excess overdue breaks — keep only the most recent MAX_OVERDUE_BREAKS
      if (dueBreaks.length > MAX_OVERDUE_BREAKS) {
        const toAutoSkip = dueBreaks.slice(0, dueBreaks.length - MAX_OVERDUE_BREAKS);
        const updatedSchedule = schedule.map((b) => {
          if (toAutoSkip.some((s) => s.time === b.time && s.exercise_id === b.exercise_id)) {
            return { ...b, skipped: true };
          }
          return b;
        });
        updateSession.mutate({ body_break_schedule: updatedSchedule });
        // Continue with only the kept breaks
        dueBreaks.splice(0, dueBreaks.length - MAX_OVERDUE_BREAKS);
      }

      if (dueBreaks.length > 1) {
        // Multiple overdue: show batch dialog instead of one-by-one
        setOverdueBreaks(dueBreaks);
        playNotificationChime();
        // Send browser notification
        if (Notification.permission === "granted") {
          new Notification("Breaks to catch up!", {
            body: `You have ${dueBreaks.length} exercise breaks waiting`,
            icon: "/favicon.ico",
            tag: "nomadbalance-break",
          });
        }
      } else if (dueBreaks.length === 1) {
        setActiveBreakNotification(dueBreaks[0]);
        // Play notification sound
        playNotificationChime();
        // Send browser notification (always, not just when tab hidden)
        if (Notification.permission === "granted") {
          const exercise = exercises.find((e) => e.id === dueBreaks[0].exercise_id);
          new Notification("Time for a break!", {
            body: exercise?.name || dueBreaks[0].exercise_name || "Move your body, clear your mind",
            icon: "/favicon.ico",
            tag: "nomadbalance-break",
          });
        }
      }
    };
    try { checkBreaks(); } catch (e) { console.error("Break check error:", e); }
    breakCheckRef.current = setInterval(() => { try { checkBreaks(); } catch (e) { console.error("Break check error:", e); } }, ONE_MINUTE_MS);
    return () => clearInterval(breakCheckRef.current);
  }, [session?.id, session?.status, session?.meeting_mode, session?.body_break_schedule, activeBreakNotification, overdueBreaks, userSettings?.notifications_enabled, userSettings?.notification_start_time, userSettings?.notification_end_time, exercises, isAway]);


  const activeExercise = React.useMemo(() => {
    if (!activeBreakNotification) return null;
    return exercises.find((e) => e.id === activeBreakNotification.exercise_id) || null;
  }, [activeBreakNotification, exercises]);

  const createSession = useMutation({
    mutationFn: (data) => daySessionService.create({ ...data, date: today, status: "active", started_at: new Date().toTimeString().slice(0, 5) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
    onError: (error) => {
      toast.error("Failed to start day session");
      console.error("Create session error:", error);
    },
  });

  const updateSession = useMutation({
    mutationFn: (data) => {
      if (!session?.id) return Promise.reject(new Error("No active session"));
      return daySessionService.update(session.id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
    onError: (error) => {
      toast.error("Failed to update session");
      console.error("Update session error:", error);
    },
  });

  const taskUpdateMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskService.update(taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (error) => {
      toast.error("Failed to update task");
      console.error("Task update error:", error);
    },
  });

  const handleBreakStart = () => {
    // Just marks the beginning — exercise view is shown via phase change
  };

  const handleBreakSnooze = (minutes) => {
    if (!session || !activeBreakNotification) return;
    breakActionInProgress.current = true;
    const now = new Date();
    const snoozedMinutes = now.getHours() * 60 + now.getMinutes() + minutes;
    const newTime = `${String(Math.floor(snoozedMinutes / 60) % 24).padStart(2, "0")}:${String(snoozedMinutes % 60).padStart(2, "0")}`;
    const updatedSchedule = (session.body_break_schedule || []).map((b) =>
      b.time === activeBreakNotification.time && b.exercise_id === activeBreakNotification.exercise_id
        ? { ...b, time: newTime }
        : b
    );
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
    );
    updateSession.mutate({ body_break_schedule: updatedSchedule });
    setActiveBreakNotification(null);
    setTimeout(() => { breakActionInProgress.current = false; }, 2000);
    toast("Break snoozed " + minutes + " min", { icon: "⏰" });
  };

  const handleBreakSkip = () => {
    if (!session || !activeBreakNotification) return;
    breakActionInProgress.current = true;
    const updatedSchedule = (session.body_break_schedule || []).map((b) =>
      b.time === activeBreakNotification.time && b.exercise_id === activeBreakNotification.exercise_id
        ? { ...b, completed: true, skipped: true }
        : b
    );
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
    );
    updateSession.mutate({ body_break_schedule: updatedSchedule });
    setActiveBreakNotification(null);
    setTimeout(() => { breakActionInProgress.current = false; }, 2000);
    toast("Break skipped", { icon: "⏭️" });
  };

  const handleBreakComplete = () => {
    if (!session || !activeBreakNotification) return;
    breakActionInProgress.current = true;
    const updatedSchedule = (session.body_break_schedule || []).map((b) =>
      b.time === activeBreakNotification.time && b.exercise_id === activeBreakNotification.exercise_id
        ? { ...b, completed: true }
        : b
    );
    const exercisesDoneToday = [...(session.exercises_done_today || []), activeBreakNotification.exercise_id];
    // Optimistically update cache so the break check doesn't re-trigger
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) =>
        s.id === session.id
          ? { ...s, body_break_schedule: updatedSchedule, body_breaks_done: (s.body_breaks_done || 0) + 1, exercises_done_today: exercisesDoneToday }
          : s
      )
    );
    updateSession.mutate({
      body_break_schedule: updatedSchedule,
      body_breaks_done: (session.body_breaks_done || 0) + 1,
      exercises_done_today: exercisesDoneToday,
    });
    setActiveBreakNotification(null);
    // Check if there are still more overdue breaks after this one
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const stillOverdue = updatedSchedule.filter(
      (b) => !b.completed && !b.skipped && toMinutes(b.time) <= nowMins
    );
    if (stillOverdue.length > 0) {
      // Show batch dialog instead of auto-triggering the next exercise
      setOverdueBreaks(stillOverdue);
      // Keep breakActionInProgress true to prevent checkBreaks from racing
      setTimeout(() => { breakActionInProgress.current = false; }, 2000);
    } else {
      setTimeout(() => { breakActionInProgress.current = false; }, 2000);
    }
    toast.success("Break completed!");
  };

  const handleBreakSwap = () => {
    if (!session || !activeBreakNotification) return;
    // Pick a different exercise from a different muscle group
    const currentGroup = exercises.find((e) => e.id === activeBreakNotification.exercise_id)?.group;
    const otherExercises = exercises.filter((e) => e.group !== currentGroup);
    const pool = otherExercises.length > 0 ? otherExercises : exercises.filter((e) => e.id !== activeBreakNotification.exercise_id);
    if (pool.length === 0) return;
    const newExercise = pool[Math.floor(Math.random() * pool.length)];
    const updatedSchedule = (session.body_break_schedule || []).map((b) =>
      b.time === activeBreakNotification.time && b.exercise_id === activeBreakNotification.exercise_id
        ? { ...b, exercise_id: newExercise.id, exercise_name: newExercise.name }
        : b
    );
    const newBreak = { ...activeBreakNotification, exercise_id: newExercise.id, exercise_name: newExercise.name };
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
    );
    updateSession.mutate({ body_break_schedule: updatedSchedule });
    setActiveBreakNotification(newBreak);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("nomadbalance_onboarding_completed", "true");
    setShowOnboarding(false);
    // Persist to backend so it survives browser data clears
    userSettingsService.save(
      { ...userSettings, onboarding_completed: true },
      userSettings.id
    ).then(() => queryClient.invalidateQueries({ queryKey: ["userSettings"] }))
     .catch(() => {}); // localStorage already set as fallback
  };

  const handleBreathingClose = () => {
    setShowBreathing(false);
  };

  const handleSessionComplete = () => {
    if (session) {
      updateSession.mutate({
        focus_sessions_completed: (session.focus_sessions_completed || 0) + 1,
      });

      // Check if there's a body break due now or in the next few minutes — trigger it immediately
      // so exercise breaks align with focus timer break phase
      if (!activeBreakNotification && !overdueBreaks && !breakActionInProgress.current) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const lookAheadMinutes = (session.focus_break_minutes || DEFAULT_BREAK_MINUTES);
        const schedule = session.body_break_schedule || [];
        const nearbyBreak = schedule.find(
          (b) => !b.completed && !b.skipped &&
                 toMinutes(b.time) >= nowMinutes - 2 &&
                 toMinutes(b.time) <= nowMinutes + lookAheadMinutes
        );
        if (nearbyBreak) {
          setActiveBreakNotification(nearbyBreak);
          playNotificationChime();
          if (Notification.permission === "granted") {
            const exercise = exercises.find((e) => e.id === nearbyBreak.exercise_id);
            new Notification("Time for a break!", {
              body: exercise?.name || nearbyBreak.exercise_name || "Move your body, clear your mind",
              icon: "/favicon.ico",
              tag: "nomadbalance-break",
            });
          }
        }
      }
    }
  };

  const handleToggleTask = () => {
    if (topTask) {
      taskUpdateMutation.mutate({
        taskId: topTask.id,
        data: {
          completed: !topTask.completed,
          completed_at: !topTask.completed ? new Date().toISOString() : null,
        },
      });
    }
  };

  // Quick action: move all old tasks to today
  const handleMoveAllToToday = async () => {
    if (!session?.id || oldUncompletedTasks.length === 0) return;
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
    let offset = 0;
    let moved = 0;
    try {
      for (const task of oldUncompletedTasks) {
        offset++;
        await taskService.update(task.id, { session_id: session.id, order: maxOrder + offset });
        moved++;
      }
      toast.success(`Moved ${moved} task${moved > 1 ? "s" : ""} to today`);
    } catch (error) {
      console.error("Move tasks error:", error);
      toast.error(moved > 0 ? `Moved ${moved} of ${oldUncompletedTasks.length} tasks — retry for the rest` : "Failed to move tasks. Please try again.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    }
  };

  // Quick action: add a task from the dashboard
  const handleQuickAddTask = async (title) => {
    if (!session?.id || !title.trim()) return;
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
    try {
      await taskService.create({
        session_id: session.id,
        title: title.trim(),
        order: maxOrder + 1,
        completed: false,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      toast.success("Task added");
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error("Failed to add task. Please try again.");
    }
  };

  // Quick action: change sound from FlowCard
  const handleSoundChange = (soundUpdate) => {
    if (session) updateSession.mutate(soundUpdate);
  };

  // Quick action: log meal from FuelCard
  const handleQuickLogMeal = () => {
    if (!session) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const updated = [...(session.meals_logged || []), { time: timeStr }];
    updateSession.mutate({ meals_logged: updated });
    toast.success(`Meal logged at ${timeStr}`);
  };

  // Quick action: swap exercise from BodyCard
  const handleQuickSwapExercise = (breakIndex) => {
    if (!session) return;
    const schedule = session.body_break_schedule || [];
    const currentBreak = schedule[breakIndex];
    if (!currentBreak) return;
    const currentExercise = exercises.find((e) => e.id === currentBreak.exercise_id);
    const currentGroup = currentExercise?.group;
    const otherExercises = exercises.filter((e) => e.group !== currentGroup);
    const pool = otherExercises.length > 0 ? otherExercises : exercises.filter((e) => e.id !== currentBreak.exercise_id);
    if (pool.length === 0) return;
    const newExercise = pool[Math.floor(Math.random() * pool.length)];
    const updatedSchedule = schedule.map((b, i) =>
      i === breakIndex ? { ...b, exercise_id: newExercise.id, exercise_name: newExercise.name } : b
    );
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
    );
    updateSession.mutate({ body_break_schedule: updatedSchedule });
    toast.success(`Swapped to ${newExercise.name}`);
  };

  const toggleMeetingMode = () => {
    if (session) {
      if (!session.meeting_mode) {
        setShowMeetingDialog(true);
      } else {
        // Don't auto-resume timer — let the user start it when ready
        updateSession.mutate({ meeting_mode: false });
      }
    }
  };

  // End-of-day: close the session (status → completed) after the recap
  const handleEndDay = () => {
    if (!session) return;
    pauseTimer();
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    updateSession.mutate({ status: "completed", work_end_today: session.work_end_today || endTime });
    queryClient.invalidateQueries({ queryKey: ["allSessions"] });
    queryClient.invalidateQueries({ queryKey: ["recentSessions"] });
    queryClient.invalidateQueries({ queryKey: ["sessionDates"] });
    setShowDayRecap(false);
    toast.success("Day closed — see you tomorrow!", { icon: "🌅" });
  };

  // Mis-click escape hatch: reopen a closed day
  const handleReopenDay = () => {
    if (!session) return;
    updateSession.mutate({ status: "active" });
    toast.success("Day reopened");
  };

  const handleMeetingConfirm = (breathingMinutes) => {
    setShowMeetingDialog(false);
    pauseTimer();
    if (breathingMinutes > 0) {
      setBreathingDuration(breathingMinutes);
      setShowBreathing(true);
    } else {
      updateSession.mutate({ meeting_mode: true });
    }
  };

  const handleToggleDeskStatus = () => {
    if (!session) return;

    if (!isAway) {
      // Going AWAY: save timestamp, pause timer
      pauseTimer();
      const now = new Date().toISOString();
      if (hasDeskColumns) {
        updateSession.mutate({
          desk_status: "away",
          away_since: now,
        });
      } else {
        setLocalDeskStatus("away");
        setLocalAwaySince(now);
      }
      toast("You're away. Breaks paused.", { icon: "\u2615" });
    } else {
      // Coming BACK: shift remaining break times forward by away duration
      const awayStart = awaySince ? new Date(awaySince) : new Date();
      const awayMinutes = Math.round((Date.now() - awayStart.getTime()) / 60000);

      // Shift all uncompleted breaks forward by the time spent away
      const updatedSchedule = (session.body_break_schedule || []).map((b) => {
        if (b.completed) return b;
        const originalMinutes = toMinutes(b.time);
        const shiftedMinutes = originalMinutes + awayMinutes;
        const clampedMinutes = Math.min(shiftedMinutes, 23 * 60 + 59); // cap at 23:59
        const newTime = `${String(Math.floor(clampedMinutes / 60)).padStart(2, "0")}:${String(clampedMinutes % 60).padStart(2, "0")}`;
        return { ...b, time: newTime };
      });

      if (hasDeskColumns) {
        const awayLog = session.away_log || [];
        awayLog.push({
          start: awaySince,
          end: new Date().toISOString(),
          duration_minutes: awayMinutes,
        });
        updateSession.mutate({
          desk_status: "at_desk",
          away_since: null,
          away_log: awayLog,
          body_break_schedule: updatedSchedule,
        });
      } else {
        setLocalDeskStatus("at_desk");
        setLocalAwaySince(null);
        updateSession.mutate({ body_break_schedule: updatedSchedule });
      }
      deskReturnedAt.current = Date.now(); // Start grace period
      toast.success(`Welcome back! Breaks shifted by ${awayMinutes} min.`);
    }
  };

  // Smart auto-away: warn after 30 min of tab hidden, then auto-away after 5 min grace
  const awayWarningTimer = React.useRef(null);
  const awayAutoTimer = React.useRef(null);

  const markAsAway = React.useCallback(() => {
    if (!session?.id || isAway) return;
    // NOTE: intentionally NOT calling pauseTimer() here. Auto-away is a
    // heuristic (tab hidden for 30+5 min, or no input for 15 min while
    // visible); it can easily misfire when the user is genuinely working
    // in another tab with background audio. We still flip the desk
    // status so break reminders don't fire while they're presumed away,
    // but the active focus session and its audio keep running. The
    // manual at-desk / away toggle (handleToggleDeskStatus) DOES still
    // pause the timer — that's an explicit user action.
    const now = new Date().toISOString();
    if (hasDeskColumns) {
      daySessionService.update(session.id, {
        desk_status: "away",
        away_since: now,
      }).then(() => queryClient.invalidateQueries({ queryKey: ["daySession"] }));
    } else {
      setLocalDeskStatus("away");
      setLocalAwaySince(now);
    }
  }, [session, isAway, hasDeskColumns, queryClient]);

  // Auto-away if break notification is ignored for 10 min
  useEffect(() => {
    if (activeBreakNotification || (overdueBreaks && overdueBreaks.length > 0)) {
      breakShownAt.current = Date.now();
      breakNoResponseTimer.current = setTimeout(() => {
        if (!isAway) {
          markAsAway();
          toast("No response to break — you've been set to Away.", { icon: "☕" });
        }
      }, BREAK_NO_RESPONSE_AWAY_MS);
    } else {
      // Break was answered (start/skip/snooze) → clear timer
      breakShownAt.current = null;
      if (breakNoResponseTimer.current) {
        clearTimeout(breakNoResponseTimer.current);
        breakNoResponseTimer.current = null;
      }
    }
    return () => {
      if (breakNoResponseTimer.current) {
        clearTimeout(breakNoResponseTimer.current);
        breakNoResponseTimer.current = null;
      }
    };
  }, [activeBreakNotification, overdueBreaks, isAway, markAsAway]);

  useEffect(() => {
    if (!session || session.status !== "active") return;

    const clearAwayTimers = () => {
      if (awayWarningTimer.current) { clearTimeout(awayWarningTimer.current); awayWarningTimer.current = null; }
      if (awayAutoTimer.current) { clearTimeout(awayAutoTimer.current); awayAutoTimer.current = null; }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isAway) {
        // Tab hidden → start 30 min countdown
        awayWarningTimer.current = setTimeout(() => {
          // Send warning notification
          if (Notification.permission === "granted") {
            new Notification("Are you still there?", {
              body: "You've been away for 30 minutes. We'll pause your session soon.",
              icon: "/favicon.ico",
              tag: "nomadbalance-away-warning",
            });
          }
          playNotificationChime();
          // Start 5 min grace period before auto-away
          awayAutoTimer.current = setTimeout(() => {
            markAsAway();
            toast("You've been set to Away automatically.", { icon: "☕" });
          }, AWAY_GRACE_AFTER_WARNING_MS);
        }, AWAY_WARNING_DELAY_MS);
      } else if (!document.hidden) {
        // Tab visible again → cancel all pending timers
        clearAwayTimers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearAwayTimers();
    };
  }, [session, isAway, markAsAway]);

  // Idle detection: track mouse/keyboard/scroll/touch activity on visible tab
  const idleTimer = React.useRef(null);
  const lastActivityRef = React.useRef(Date.now());

  useEffect(() => {
    if (!session || session.status !== "active" || isAway) return;

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (!document.hidden && !isAway) {
          markAsAway();
          toast("No activity detected — you've been set to Away.", { icon: "☕" });
        }
      }, IDLE_AUTO_AWAY_MS);
    };

    // Start the idle timer immediately
    resetIdleTimer();

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "pointerdown"];
    events.forEach((e) => document.addEventListener(e, resetIdleTimer, { passive: true }));

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null; }
    };
  }, [session?.id, session?.status, isAway, markAsAway]);


  const isActive = session?.status === "active";

  // Auto-create session when none exists for today
  // (autoCreateAttempted ref is declared at the top of the component so the
  // midnight-rollover effects can reset it for the new day)
  useEffect(() => {
    if (isLoading || session || createSession.isPending || autoCreateAttempted.current) return;
    if (!userSettings || Object.keys(userSettings).length === 0) return;
    autoCreateAttempted.current = true;

    // Daily defaults (fasting, eating window, focus, break interval, exercise
    // groups, sounds) live in localStorage, not in the user_settings DB row.
    // userSettings only holds profile + work-hour + notification fields.
    const defaults = getDailyDefaults();

    // Build session from user settings + daily defaults
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const workStart = userSettings.morning_work_start || DEFAULT_WORK_HOURS.morning_start;
    const workEnd = userSettings.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end;
    const workStartMinutes = toMinutes(workStart);
    const workEndMinutes = toMinutes(workEnd);
    const effectiveStart = Math.max(nowMinutes, workStartMinutes);

    // Generate interval-based break schedule
    const breakInterval = defaults.break_interval_minutes || DEFAULT_BREAK_INTERVAL_MINUTES;
    const focusWork = defaults.focus_work_minutes || DEFAULT_WORK_MINUTES;
    const focusBreak = defaults.focus_break_minutes || DEFAULT_BREAK_MINUTES;

    // Get exercises
    const selectedGroups = defaults.selected_groups || [];
    let availableExercises = exercises;
    if (selectedGroups.length > 0) {
      const filtered = exercises.filter(ex => selectedGroups.includes(ex.group));
      if (filtered.length > 0) availableExercises = filtered;
    }

    // Get recently done exercises to avoid repetition
    const recentExercises = allPreviousSessions.slice(0, 7).flatMap(s => s.exercises_done_today || []);

    const schedule = [];
    for (let t = effectiveStart + breakInterval; t < workEndMinutes; t += breakInterval) {
      // Pick exercise with variety
      const notRecent = availableExercises.filter(ex => !recentExercises.includes(ex.id));
      const pool = notRecent.length > 0 ? notRecent : availableExercises;
      const usedGroups = schedule.map(s => exercises.find(e => e.id === s.exercise_id)?.group);
      const preferred = pool.filter(ex => !usedGroups.includes(ex.group));
      const finalPool = preferred.length > 0 ? preferred : pool;
      if (finalPool.length === 0) continue;
      const exercise = finalPool[Math.floor(Math.random() * finalPool.length)];

      schedule.push({
        time: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        completed: false,
      });
    }

    // Calculate eating window
    const eatingHours = getEatingHours(defaults.fasting_preset || "16/8", defaults.custom_fasting_hours);
    const windowStart = defaults.eating_window_start_time || "12:00";
    const windowEnd = calculateEatingWindowEnd(windowStart, eatingHours);

    createSession.mutate({
      focus_work_minutes: focusWork,
      focus_break_minutes: focusBreak,
      focus_sound: defaults.focus_sound || "40hz-wind",
      relax_sound: defaults.relax_sound || "10hz-binaural-ocean",
      fasting_preset: defaults.fasting_preset || "16/8",
      custom_fasting_hours: defaults.custom_fasting_hours || null,
      max_meals: defaults.max_meals || 3,
      eating_window_start: windowStart,
      eating_window_end: windowEnd,
      meals_logged: [],
      body_breaks_target: schedule.length,
      body_break_schedule: schedule,
      selected_exercise_groups: selectedGroups,
      exercises_done_today: [],
      work_start_today: workStart,
      work_end_today: workEnd,
    });
  }, [isLoading, session, userSettings, exercises, createSession.isPending]);

  // Show error state if session query fails
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/50 mb-4">Failed to load session data.</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["daySession"] })} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}{userName ? `, ${userName}` : ""} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isActive && isAway && (
                <div className="flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/30 rounded-full px-3 py-1">
                  <Coffee className="w-3 h-3 text-sky-400" />
                  <span className="text-sky-300 text-xs font-medium">Away</span>
                </div>
              )}
              {isActive && session?.meeting_mode && (
                <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300 text-xs font-medium">Meeting</span>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                  <Link to={createPageUrl("Reports")}>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Reports
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl("Settings")}>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  {isActive && (
                    <>
                      <DropdownMenuItem
                        onClick={() => { setBreathingDuration(5); setShowBreathing(true); }}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Wind className="w-4 h-4 mr-2" />
                        Breathing Session
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await logout();
                        navigate("/login");
                      } catch (error) {
                        console.error("Logout error:", error);
                        toast.error("Logout failed. Please try again.");
                      }
                    }}
                    className="text-red-400 hover:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isActive && (
            <div className="flex items-center gap-2 mt-3">
              {isAway ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-400/70 text-xs font-medium">
                    Away from desk
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400/70 text-xs font-medium">
                    Day active since {session.started_at}
                  </span>
                </>
              )}
              <span className="ml-auto flex items-center gap-1.5">
                {trialActive && (
                  <button
                    onClick={promptUpgrade}
                    className="flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/25 px-2 py-0.5 hover:bg-violet-500/20 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-violet-300" />
                    <span className="text-[10px] font-semibold text-violet-300">Pro trial · {trialDaysLeft}d</span>
                  </button>
                )}
                {currentStreak >= 2 && (
                  <span className="flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/25 px-2 py-0.5">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-semibold text-orange-300">{currentStreak} days</span>
                  </span>
                )}
              </span>
            </div>
          )}

          {session?.status === "completed" && (
            <div className="flex items-center gap-2 mt-3 rounded-2xl bg-violet-500/10 border border-violet-500/25 px-3 py-2">
              <Sunset className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-medium text-white/70">Day closed — enjoy your evening!</span>
              <button
                onClick={handleReopenDay}
                className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition-colors"
              >
                <Sun className="w-3 h-3" />
                Reopen
              </button>
            </div>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="min-h-[170px] rounded-2xl bg-white/5 border border-white/10 animate-pulse p-5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 mb-3" />
                  <div className="w-20 h-3 rounded bg-white/10 mb-2" />
                  <div className="w-28 h-2 rounded bg-white/5" />
                </div>
              ))}
            </>
          ) : (
            <>
              <Link to={createPageUrl("Fuel")} className="min-h-[170px]">
                <FuelCard session={session} onLogMeal={handleQuickLogMeal} />
              </Link>
              <Link to={createPageUrl("Flow")} className="min-h-[170px]">
                <FlowCard session={session} onSessionComplete={handleSessionComplete} onSoundChange={handleSoundChange} />
              </Link>
              <Link to={createPageUrl("Body")} className="min-h-[170px]">
                <BodyCard session={session} onSwapExercise={handleQuickSwapExercise} />
              </Link>
              <Link to={createPageUrl("Journal")} className="min-h-[170px]">
                <JournalCard
                  session={session}
                  topTask={topTask}
                  onToggleTask={handleToggleTask}
                  oldTaskCount={oldUncompletedTasks.length}
                  onMoveAllToToday={handleMoveAllToToday}
                  onAddTask={handleQuickAddTask}
                  totalTasks={totalTasks}
                  completedTasks={completedTasks}
                />
              </Link>
            </>
          )}
        </div>

        {isActive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-around rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3"
            >
              <div className="text-center group relative cursor-default">
                <p className="text-base font-bold text-white">{session?.focus_sessions_completed || 0}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Sessions</p>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2.5 py-1 text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg">
                  Focus sessions completed today
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center group relative cursor-default">
                <p className="text-base font-bold text-white">{session?.body_breaks_done || 0}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Breaks</p>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2.5 py-1 text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg">
                  Exercise breaks done today
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center group relative cursor-default">
                <p className="text-base font-bold text-white">
                  {((session?.focus_sessions_completed || 0) * (session?.focus_work_minutes || DEFAULT_WORK_MINUTES))} min
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Focus</p>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2.5 py-1 text-[10px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg">
                  Total deep focus time today
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex gap-3"
            >
              <DeskStatusToggle
                isAway={isAway}
                awaySince={awaySince}
                onToggle={handleToggleDeskStatus}
              />
              <div className="relative group/mtg">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleMeetingMode}
                  className={`h-12 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    session.meeting_mode
                      ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                      : "bg-white/10 border border-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {session.meeting_mode ? "MTG" : "MTG"}
                </motion.button>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl bg-gray-900/95 border border-white/10 px-3 py-2 text-xs text-white/80 text-center opacity-0 group-hover/mtg:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-50">
                  {session.meeting_mode
                    ? "Tap to exit meeting mode — notifications will resume"
                    : "Meeting mode — all notifications and reminders are paused"}
                </div>
              </div>
              <div className="relative group/endday">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDayRecap(true)}
                  className="h-12 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white/70 hover:bg-amber-500/15 hover:border-amber-500/25 hover:text-amber-300 transition-all"
                  aria-label="End the day and see your recap"
                >
                  <Sunset className="w-4 h-4" />
                </motion.button>
                <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-gray-900/95 border border-white/10 px-3 py-2 text-xs text-white/80 text-center opacity-0 group-hover/endday:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-50">
                  End the day — see your recap and close the session
                </div>
              </div>
            </motion.div>
          </>
        )}

      </div>

      {/* End-of-day Recap */}
      <AnimatePresence>
        {showDayRecap && session && (
          <DayRecap
            session={session}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            streak={currentStreak}
            onConfirm={handleEndDay}
            onDismiss={() => setShowDayRecap(false)}
          />
        )}
      </AnimatePresence>

      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingCircle 
            onComplete={handleBreathingClose}
            durationMinutes={breathingDuration}
            onCancel={handleBreathingClose}
          />
        )}
      </AnimatePresence>

      {/* Meeting Mode Dialog */}
      <AnimatePresence>
        {showMeetingDialog && (
          <MeetingModeDialog
            onConfirm={handleMeetingConfirm}
            onCancel={() => setShowMeetingDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Overdue Breaks Batch Dialog */}
      <AnimatePresence>
        {overdueBreaks && overdueBreaks.length >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-orange-950/30 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center"
                >
                  <Activity className="w-6 h-6 text-orange-400" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {overdueBreaks.length === 1 ? "1 break to catch up" : `${overdueBreaks.length} breaks to catch up`}
                  </h2>
                </div>
              </div>
              <div className="space-y-2">
                {overdueBreaks.length > 1 && (
                  <Button
                    onClick={() => {
                      // Do all: start with first, the rest will be prompted one by one via batch dialog
                      setActiveBreakNotification(overdueBreaks[0]);
                      setOverdueBreaks(null);
                    }}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 font-semibold"
                  >
                    Catch up ({overdueBreaks.length} sessions)
                  </Button>
                )}
                <Button
                  onClick={() => {
                    // Do just one, skip the rest
                    const firstBreak = overdueBreaks[0];
                    if (overdueBreaks.length > 1) {
                      // Skip all overdue except the first
                      const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                      const updatedSchedule = (session.body_break_schedule || []).map((b) => {
                        if (b.completed) return b;
                        // Skip overdue ones that are not the first
                        if (b.time !== firstBreak.time && b.exercise_id !== firstBreak.exercise_id && toMinutes(b.time) <= nowMins) {
                          return { ...b, completed: true, skipped: true };
                        }
                        return b;
                      });
                      queryClient.setQueryData(["daySession", today], (old) =>
                        (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
                      );
                      updateSession.mutate({ body_break_schedule: updatedSchedule });
                    }
                    setActiveBreakNotification(firstBreak);
                    setOverdueBreaks(null);
                  }}
                  className={`w-full h-12 rounded-2xl font-semibold ${overdueBreaks.length === 1 ? "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400" : "bg-white/10 hover:bg-white/20 text-white"}`}
                >
                  {overdueBreaks.length === 1 ? "Let's go" : "Just 1, skip the rest"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Skip all overdue
                    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                    const updatedSchedule = (session.body_break_schedule || []).map((b) => {
                      if (b.completed) return b;
                      if (toMinutes(b.time) <= nowMins) {
                        return { ...b, completed: true, skipped: true };
                      }
                      return b;
                    });
                    queryClient.setQueryData(["daySession", today], (old) =>
                      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
                    );
                    updateSession.mutate({ body_break_schedule: updatedSchedule });
                    setOverdueBreaks(null);
                    toast("Skipped, continuing with remaining schedule", { icon: "⏭️" });
                  }}
                  className="w-full h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm"
                >
                  Skip {overdueBreaks.length === 1 ? "" : "all "}& continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Notification Overlay */}
      <AnimatePresence>
        {activeBreakNotification && (
          <BreakNotification
            breakItem={activeBreakNotification}
            exercise={activeExercise}
            onStart={handleBreakStart}
            onSnooze={handleBreakSnooze}
            onSkip={handleBreakSkip}
            onComplete={handleBreakComplete}
            onSwap={handleBreakSwap}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Tutorial */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTutorial onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
