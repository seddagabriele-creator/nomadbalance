import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Users, MoreVertical, Settings as SettingsIcon, RotateCcw, Play, Pencil, Coffee, Activity, BarChart3 } from "lucide-react";
import { analyzeBreakFeasibility } from "../utils/breakFeasibility";
import { Link } from "react-router-dom";
import { createPageUrl, getLocalDateString } from "../utils";
import { toast } from "sonner";
import { daySessionService, taskService, exerciseService, userSettingsService } from "../api/services";
import { useAuth } from "../lib/AuthContext";
import { hasDailyDefaults } from "../hooks/useDailyDefaults";
import { ONE_HOUR_MS, ONE_MINUTE_MS, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, DEFAULT_WORK_HOURS, getEatingHours, calculateEatingWindowEnd } from "../constants";

import FuelCard from "../components/dashboard/FuelCard";
import FlowCard from "../components/dashboard/FlowCard";
import BodyCard from "../components/dashboard/BodyCard";
import JournalCard from "../components/dashboard/JournalCard";
import StartDayWizard from "../components/wizard/StartDayWizard";
import BreathingCircle from "../components/decompression/BreathingCircle";
import MotivationalQuote from "../components/MotivationalQuote";
import MeetingModeDialog from "../components/MeetingModeDialog";
import UseDefaultsDialog from "../components/wizard/UseDefaultsDialog";
import OnboardingTutorial from "../components/onboarding/OnboardingTutorial";
import BreakNotification from "../components/body/BreakNotification";
import DeskStatusToggle from "../components/dashboard/DeskStatusToggle";
import { useTimer } from "../components/lib/TimerContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingDuration, setBreathingDuration] = useState(5);
  const [showQuote, setShowQuote] = useState(false);
  const [showFirstQuote, setShowFirstQuote] = useState(true);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showDefaultsDialog, setShowDefaultsDialog] = useState(false);
  const [useDefaults, setUseDefaults] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeWithWizard, setResumeWithWizard] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check localStorage first for instant response; backend check comes via useEffect
    return !localStorage.getItem("nomadbalance_onboarding_completed");
  });
  const [activeBreakNotification, setActiveBreakNotification] = useState(null);
  const [overdueBreaks, setOverdueBreaks] = useState(null); // batch overdue breaks dialog
  const breakCheckRef = React.useRef(null);
  const breakActionInProgress = React.useRef(false);
  const deskReturnedAt = React.useRef(null);
  // Local fallback for desk tracking when DB columns are missing
  const [localDeskStatus, setLocalDeskStatus] = useState("at_desk");
  const [localAwaySince, setLocalAwaySince] = useState(null);

  const queryClient = useQueryClient();
  const today = getLocalDateString();
  const { pauseTimer, resumeTimer } = useTimer();
  const { user: authUser } = useAuth();

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });

  const userSettings = settings[0] || {};

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

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;
  const hasDeskColumns = session && "desk_status" in session;
  const deskStatus = hasDeskColumns ? session.desk_status : localDeskStatus;
  const awaySince = hasDeskColumns ? session.away_since : localAwaySince;
  const isAway = deskStatus === "away";

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", session?.id],
    queryFn: () => {
      if (!session?.id) return [];
      return taskService.getBySession(session.id);
    },
    enabled: !!session?.id,
  });

  const topTask = [...tasks].sort((a, b) => a.order - b.order).find((t) => !t.completed) || null;

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.listAll(),
  });

  const { data: allPreviousSessions = [] } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => daySessionService.listRecent(),
  });

  // Show motivational quote every hour
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const interval = setInterval(() => {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 10000);
    }, ONE_HOUR_MS);
    return () => clearInterval(interval);
  }, [session]);

  // Check for due body breaks every minute (paused when away from desk)
  useEffect(() => {
    if (!session || session.status !== "active" || session.meeting_mode) return;
    // Pause break checks when user is away from desk
    if (isAway) return;
    // Respect notifications_enabled setting
    if (userSettings.notifications_enabled === false) return;

    const checkBreaks = () => {
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

      const schedule = session.body_break_schedule || [];
      const overdueBreaks = schedule.filter(
        (b) => !b.completed && toMinutes(b.time) <= nowMinutes
      );

      if (overdueBreaks.length > 1) {
        // Multiple overdue: show batch dialog instead of one-by-one
        setOverdueBreaks(overdueBreaks);
      } else if (overdueBreaks.length === 1) {
        setActiveBreakNotification(overdueBreaks[0]);
        // Send browser notification if tab is not visible
        if (document.hidden && Notification.permission === "granted") {
          const exercise = exercises.find((e) => e.id === overdueBreaks[0].exercise_id);
          new Notification("Time for a break!", {
            body: exercise?.name || overdueBreaks[0].exercise_name || "Move your body, clear your mind",
            icon: "/favicon.ico",
            tag: "nomadbalance-break",
          });
        }
      }
    };
    checkBreaks(); // check immediately
    breakCheckRef.current = setInterval(checkBreaks, ONE_MINUTE_MS);
    return () => clearInterval(breakCheckRef.current);
  }, [session, activeBreakNotification, overdueBreaks, userSettings, exercises]);

  const toMinutes = (t) => {
    const [h, m] = (t || "00:00").split(":").map(Number);
    return h * 60 + m;
  };

  const activeExercise = React.useMemo(() => {
    if (!activeBreakNotification) return null;
    return exercises.find((e) => e.id === activeBreakNotification.exercise_id) || null;
  }, [activeBreakNotification, exercises]);

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

  const createSession = useMutation({
    mutationFn: (data) => daySessionService.create({ ...data, date: today, status: "active", started_at: new Date().toTimeString().slice(0, 5) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
    onError: (error) => {
      toast.error("Failed to start day session");
      console.error("Create session error:", error);
    },
  });

  const updateSession = useMutation({
    mutationFn: (data) => daySessionService.update(session.id, data),
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

  const handleStartDay = async (wizardData, tasks, selectedGroups, mealsAlreadyHad = 0) => {
    try {
      // Get exercises done in the last 7 days
      const last7Days = allPreviousSessions.slice(0, 7);
      const recentExercises = last7Days.flatMap(s => s.exercises_done_today || []);

      // Select exercises based on user choice
      let availableExercises = exercises;
      if (selectedGroups && selectedGroups.length > 0) {
        const filtered = exercises.filter(ex => selectedGroups.includes(ex.group));
        if (filtered.length > 0) availableExercises = filtered;
      }

      // Smart: check feasibility with remaining time and auto-adjust
      const feasibility = analyzeBreakFeasibility({
        breaksTarget: wizardData.body_breaks_target,
        workStart: wizardData.work_start_today,
        workEnd: wizardData.work_end_today,
        focusWorkMinutes: wizardData.focus_work_minutes,
        focusBreakMinutes: wizardData.focus_break_minutes,
        useRemainingTime: true,
      });

      // If user's target is unrealistic for remaining time, auto-cap it
      const breaksCount = feasibility.level === "unrealistic"
        ? feasibility.suggestedTarget
        : wizardData.body_breaks_target;

      // Use actual start time (now or scheduled start, whichever is later)
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const parseTime = (t, fallback) => {
        const parts = (t || fallback).split(":");
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      };
      const workStartMinutes = parseTime(wizardData.work_start_today, "10:00");
      const workEndMinutes = parseTime(wizardData.work_end_today, "19:00");
      const effectiveStart = Math.max(nowMinutes, workStartMinutes);
      const effectiveDuration = workEndMinutes - effectiveStart;

      // Try to align breaks with focus break windows
      const cycleLength = (wizardData.focus_work_minutes || DEFAULT_WORK_MINUTES) + (wizardData.focus_break_minutes || DEFAULT_BREAK_MINUTES);

      // Generate schedule with smart exercise selection
      const schedule = [];

      for (let i = 0; i < breaksCount; i++) {
        // Prioritize exercises not done recently
        const notRecentExercises = availableExercises.filter(ex => !recentExercises.includes(ex.id));
        const exercisePool = notRecentExercises.length > 0 ? notRecentExercises : availableExercises;

        // Pick from different groups for variety
        const usedGroups = schedule.map(s => exercises.find(e => e.id === s.exercise_id)?.group);
        const preferredExercises = exercisePool.filter(ex => !usedGroups.includes(ex.group));
        const finalPool = preferredExercises.length > 0 ? preferredExercises : exercisePool;

        if (finalPool.length === 0) continue;
        const exercise = finalPool[Math.floor(Math.random() * finalPool.length)];

        // Evenly space breaks from effective start to end
        const interval = effectiveDuration / (breaksCount + 1);
        const rawBreakTime = effectiveStart + interval * (i + 1);

        // Snap to nearest focus break window if possible
        const cyclesSinceStart = (rawBreakTime - effectiveStart) / cycleLength;
        const nearestCycleEnd = effectiveStart + Math.round(cyclesSinceStart) * cycleLength;
        // The break window starts at cycleEnd - focusBreakMinutes
        const breakWindowStart = nearestCycleEnd - (wizardData.focus_break_minutes || DEFAULT_BREAK_MINUTES);
        // Only snap if within reasonable distance (half a cycle)
        const snapDistance = Math.abs(rawBreakTime - breakWindowStart);
        const breakTime = snapDistance < cycleLength / 2 ? breakWindowStart : rawBreakTime;
        // Clamp within work hours
        const clampedBreakTime = Math.max(effectiveStart + 5, Math.min(breakTime, workEndMinutes - 5));

        schedule.push({
          time: `${String(Math.floor(clampedBreakTime / 60)).padStart(2, "0")}:${String(Math.floor(clampedBreakTime % 60)).padStart(2, "0")}`,
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          completed: false,
        });
      }

      // Auto-calculate eating window from default start time
      const eatingHours = getEatingHours(wizardData.fasting_preset, wizardData.custom_fasting_hours);
      const windowStartTime = wizardData.eating_window_start_time || "12:00";
      const windowEndTime = calculateEatingWindowEnd(windowStartTime, eatingHours);

      // Strip client-only fields before sending to Supabase
      const { eating_window_start_time: _ewst, ...sessionData } = wizardData;

      // Pre-populate meals_logged if user already had meals
      const initialMeals = Array.from({ length: mealsAlreadyHad }, (_, i) => ({
        logged_at: new Date().toISOString(),
        index: i,
      }));

      // Reuse existing session (e.g. after Reset Day) instead of creating a duplicate
      let newSession;
      if (session) {
        newSession = await daySessionService.update(session.id, {
          ...sessionData,
          eating_window_start: windowStartTime,
          eating_window_end: windowEndTime,
          meals_logged: initialMeals,
          body_breaks_target: breaksCount,
          status: "active",
          started_at: new Date().toTimeString().slice(0, 5),
          body_break_schedule: schedule,
          selected_exercise_groups: selectedGroups,
          exercises_done_today: [],
        });
      } else {
        newSession = await daySessionService.create({
          ...sessionData,
          eating_window_start: windowStartTime,
          eating_window_end: windowEndTime,
          meals_logged: initialMeals,
          body_breaks_target: breaksCount,
          date: today,
          status: "active",
          started_at: new Date().toTimeString().slice(0, 5),
          body_break_schedule: schedule,
          selected_exercise_groups: selectedGroups,
          exercises_done_today: [],
        });
      }

      // Append new tasks from wizard to existing ones (never delete old tasks)
      if (tasks.length > 0) {
        // Check tasks already in today's session
        const existingTasks = session ? await taskService.getBySession(newSession.id) : [];
        const existingTitles = new Set(existingTasks.map(t => t.title));
        // Also check ALL uncompleted tasks to avoid duplicates across sessions
        const allTasks = await taskService.listAll("-order");
        const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
        let orderOffset = 0;
        for (const task of tasks) {
          if (existingTitles.has(task.title)) continue;
          // If an uncompleted task with same title exists in another session, move it to today
          const duplicateFromPrev = allTasks.find(
            t => t.title === task.title && !t.completed && t.session_id && t.session_id !== newSession.id
          );
          if (duplicateFromPrev) {
            orderOffset++;
            await taskService.update(duplicateFromPrev.id, {
              session_id: newSession.id,
              order: maxOrder + orderOffset,
            });
          } else {
            orderOffset++;
            await taskService.create({
              session_id: newSession.id,
              title: task.title,
              order: maxOrder + orderOffset,
              completed: false,
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      setShowWizard(false);
      setShowFirstQuote(false);
    } catch (error) {
      console.error("Error starting day:", error);
      toast.error("Failed to start the day. Please try again.");
    }
  };

  const handleShowWizard = () => {
    if (hasDailyDefaults() && !showFirstQuote) {
      setShowDefaultsDialog(true);
    } else if (showFirstQuote) {
      setShowQuote(true);
    } else {
      setShowWizard(true);
    }
  };

  const handleQuoteClose = () => {
    setShowQuote(false);
    if (hasDailyDefaults()) {
      setShowDefaultsDialog(true);
    } else {
      setShowWizard(true);
    }
  };

  const handleUseDefaults = () => {
    setShowDefaultsDialog(false);
    setUseDefaults(true);
    setShowWizard(true);
  };

  const handleManualSetup = () => {
    setShowDefaultsDialog(false);
    setUseDefaults(false);
    setShowWizard(true);
  };

  const handleEndDay = () => {
    setShowBreathing(true);
  };

  const handleDecompressionComplete = () => {
    setShowBreathing(false);
    if (session) {
      if (showMeetingDialog || breathingDuration < 5) {
        updateSession.mutate({ meeting_mode: true });
      } else {
        updateSession.mutate({ status: "completed" });
      }
    }
  };

  const handleBreathingCancel = () => {
    setShowBreathing(false);
    if (session) {
      updateSession.mutate({ status: "completed" });
    }
  };

  const handleSessionComplete = () => {
    if (session) {
      updateSession.mutate({
        focus_sessions_completed: (session.focus_sessions_completed || 0) + 1,
      });
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

  // Auto "Not at Desk" when browser tab is hidden/closed
  useEffect(() => {
    if (!session || session.status !== "active") return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isAway && session?.id) {
        // Tab hidden: mark as away
        pauseTimer();
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
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session, isAway, hasDeskColumns]);

  const handleResetDay = () => {
    if (session && window.confirm("Do you really want to reset the day?")) {
      const resetData = {
        status: "standby",
        body_breaks_done: 0,
        focus_sessions_completed: 0,
        meeting_mode: false,
        body_break_schedule: session.body_break_schedule?.map(b => ({ ...b, completed: false, skipped: false })),
        exercises_done_today: [],
      };
      // Only include desk tracking fields if the session already has them (columns exist)
      if ("desk_status" in session) {
        resetData.desk_status = "at_desk";
        resetData.away_since = null;
        resetData.away_log = [];
      }
      updateSession.mutate(resetData);
    }
  };

  const handleResumeDay = () => {
    // Just reactivate the same session with same settings
    if (session) {
      updateSession.mutate({ status: "active" });
      toast.success("Day resumed!");
    }
  };

  const handleResumeWithChanges = () => {
    // Reset the session to standby, then open wizard with current settings pre-filled
    if (session) {
      setShowResumeDialog(false);
      setResumeWithWizard(true);
      setShowWizard(true);
    }
  };

  const isActive = session?.status === "active";
  const isCompleted = session?.status === "completed";

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
                  {(isActive || isCompleted) && (
                    <DropdownMenuItem 
                      onClick={handleResetDay}
                      className="text-amber-400 hover:bg-white/10 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Day
                    </DropdownMenuItem>
                  )}
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
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 mt-3">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400/70 text-xs font-medium">
                Day completed. Rest well!
              </span>
            </div>
          )}
        </motion.div>

        {/* Motivational Quote */}
        {showQuote && !showWizard && !showBreathing && (
          <div className="mb-6">
            <MotivationalQuote onClose={() => setShowQuote(false)} fullScreen={false} />
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[170px] rounded-2xl bg-white/5 border border-white/10 animate-pulse p-5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 mb-3" />
                  <div className="w-20 h-3 rounded bg-white/10 mb-2" />
                  <div className="w-28 h-2 rounded bg-white/5" />
                </div>
              ))}
            </>
          ) : (
            <>
              <Link to={createPageUrl("Fuel")} className="h-[170px]">
                <FuelCard session={session} />
              </Link>
              <Link to={createPageUrl("Flow")} className="h-[170px]">
                <FlowCard session={session} onSessionComplete={handleSessionComplete} />
              </Link>
              <Link to={createPageUrl("Body")} className="h-[170px]">
                <BodyCard session={session} />
              </Link>
              <Link to={createPageUrl("Journal")} className="h-[170px]">
                <JournalCard session={session} topTask={topTask} onToggleTask={handleToggleTask} />
              </Link>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isActive && !isCompleted && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShowWizard}
            className="mt-4 w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Sun className="w-5 h-5" />
            START DAY
          </motion.button>
        )}

        {isActive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-around rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3"
            >
              <div className="text-center">
                <p className="text-base font-bold text-white">{session?.focus_sessions_completed || 0}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Sessions</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-base font-bold text-white">{session?.body_breaks_done || 0}/{session?.body_breaks_target || 0}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Breaks</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-base font-bold text-white">
                  {((session?.focus_sessions_completed || 0) * (session?.focus_work_minutes || DEFAULT_WORK_MINUTES))} min
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Focus</p>
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
              <div className="relative group/end">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEndDay}
                  className="h-12 px-4 rounded-2xl bg-white/10 border border-white/10 text-white/50 hover:text-white hover:bg-white/15 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Moon className="w-4 h-4" />
                  End
                </motion.button>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl bg-gray-900/95 border border-white/10 px-3 py-2 text-xs text-white/80 text-center opacity-0 group-hover/end:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-50">
                  End your workday — starts a decompression breathing session
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isCompleted && (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 w-full h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center justify-center gap-2"
            >
              <Moon className="w-5 h-5" />
              Day Completed
            </motion.div>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowResumeDialog(true)}
              className="mt-3 w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="w-5 h-5" />
              Resume Day
            </motion.button>
          </>
        )}
      </div>



      {/* Motivational Quote Fullscreen */}
      <AnimatePresence>
        {showQuote && showFirstQuote && (
          <MotivationalQuote onClose={handleQuoteClose} fullScreen={true} autoClose={false} />
        )}
      </AnimatePresence>

      {/* Use Defaults Dialog */}
      <AnimatePresence>
        {showDefaultsDialog && (
          <UseDefaultsDialog
            onUseDefaults={handleUseDefaults}
            onManualSetup={handleManualSetup}
            onCancel={() => setShowDefaultsDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Resume Day Dialog */}
      <AnimatePresence>
        {showResumeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Resume Day</h3>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Your day was ended earlier. Want to pick up where you left off?
              </p>

              <div className="space-y-3 mb-6">
                {/* Quick summary of current settings */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Focus rhythm</span>
                    <span className="text-white">{session?.focus_work_minutes || 45}/{session?.focus_break_minutes || 5} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Active breaks</span>
                    <span className="text-white">{session?.body_breaks_done || 0}/{session?.body_breaks_target || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Work hours</span>
                    <span className="text-white">{session?.work_start_today} — {session?.work_end_today}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setShowResumeDialog(false);
                    handleResumeDay();
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 font-semibold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume with same settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleResumeWithChanges}
                  className="w-full h-12 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Modify settings first
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowResumeDialog(false)}
                  className="w-full h-10 rounded-xl text-white/30 hover:text-white/50 hover:bg-white/5 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard Overlay */}
      <AnimatePresence>
        {showWizard && (
          <StartDayWizard
            onComplete={resumeWithWizard ? async (wizardData, wizardTasks, selectedGroups) => {
              // When resuming with changes, update the existing session instead of creating a new one
              if (session) {
                // Recalculate eating window from new settings
                const { eating_window_start_time: _ewst2, ...resumeData } = wizardData;
                const resumeEatingHours = getEatingHours(wizardData.fasting_preset, wizardData.custom_fasting_hours);
                const resumeWindowStart = wizardData.eating_window_start_time || session.eating_window_start || "12:00";
                resumeData.eating_window_start = resumeWindowStart;
                resumeData.eating_window_end = calculateEatingWindowEnd(resumeWindowStart, resumeEatingHours);
                await daySessionService.update(session.id, {
                  ...resumeData,
                  status: "active",
                  started_at: new Date().toTimeString().slice(0, 5),
                  selected_exercise_groups: selectedGroups,
                });
                // Append new tasks from wizard (never delete existing ones)
                if (wizardTasks.length > 0) {
                  const existingTasks = await taskService.getBySession(session.id);
                  const existingTitles = new Set(existingTasks.map(t => t.title));
                  const allTasks = await taskService.listAll("-order");
                  const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);
                  let orderOffset = 0;
                  for (const task of wizardTasks) {
                    if (existingTitles.has(task.title)) continue;
                    const duplicateFromPrev = allTasks.find(
                      t => t.title === task.title && !t.completed && t.session_id && t.session_id !== session.id
                    );
                    if (duplicateFromPrev) {
                      orderOffset++;
                      await taskService.update(duplicateFromPrev.id, {
                        session_id: session.id,
                        order: maxOrder + orderOffset,
                      });
                    } else {
                      orderOffset++;
                      await taskService.create({
                        session_id: session.id,
                        title: task.title,
                        order: maxOrder + orderOffset,
                        completed: false,
                      });
                    }
                  }
                }
                queryClient.invalidateQueries({ queryKey: ["daySession"] });
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["allTasks"] });
              }
              setShowWizard(false);
              setResumeWithWizard(false);
              toast.success("Day resumed with new settings!");
            } : handleStartDay}
            onCancel={() => {
              setShowWizard(false);
              setUseDefaults(false);
              setResumeWithWizard(false);
            }}
            userSettings={userSettings}
            useDefaults={useDefaults}
            resumeSession={resumeWithWizard ? session : null}
            currentSessionId={session?.id}
          />
        )}
      </AnimatePresence>

      {/* Breathing Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingCircle 
            onComplete={handleDecompressionComplete} 
            durationMinutes={breathingDuration}
            onCancel={handleBreathingCancel}
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