import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Users, MoreVertical, Settings as SettingsIcon, RotateCcw } from "lucide-react";
import { analyzeBreakFeasibility } from "../utils/breakFeasibility";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { toast } from "sonner";
import { daySessionService, taskService, exerciseService, userSettingsService, authService } from "../api/services";
import { hasDailyDefaults } from "../hooks/useDailyDefaults";
import { ONE_HOUR_MS, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES } from "../constants";

import FuelCard from "../components/dashboard/FuelCard";
import FlowCard from "../components/dashboard/FlowCard";
import BodyCard from "../components/dashboard/BodyCard";
import JournalCard from "../components/dashboard/JournalCard";
import StartDayWizard from "../components/wizard/StartDayWizard";
import BreathingCircle from "../components/decompression/BreathingCircle";
import MotivationalQuote from "../components/MotivationalQuote";
import MeetingModeDialog from "../components/MeetingModeDialog";
import UseDefaultsDialog from "../components/wizard/UseDefaultsDialog";
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
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");

  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const { pauseTimer, resumeTimer } = useTimer();

  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });

  const userSettings = settings[0] || {};

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    authService.me().then((user) => {
      setUserName(userSettings.display_name || user?.full_name?.split(" ")[0] || "");
    }).catch(() => {});
  }, [userSettings]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", session?.id],
    queryFn: () => {
      if (!session?.id) return [];
      return taskService.getBySession(session.id);
    },
    enabled: !!session?.id,
  });

  const topTask = tasks.sort((a, b) => a.order - b.order).find((t) => !t.completed) || null;

  // Show motivational quote every hour
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const interval = setInterval(() => {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 10000);
    }, ONE_HOUR_MS);
    return () => clearInterval(interval);
  }, [session]);

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

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.listAll(),
  });

  const { data: allPreviousSessions = [] } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => daySessionService.listRecent(),
  });

  const taskUpdateMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskService.update(taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (error) => {
      toast.error("Failed to update task");
      console.error("Task update error:", error);
    },
  });

  const handleStartDay = async (wizardData, tasks, selectedGroups) => {
    try {
      // Get exercises done in the last 7 days
      const last7Days = allPreviousSessions.slice(0, 7);
      const recentExercises = last7Days.flatMap(s => s.exercises_done_today || []);

      // Select exercises based on user choice
      let availableExercises = exercises;
      if (selectedGroups && selectedGroups.length > 0) {
        availableExercises = exercises.filter(ex => selectedGroups.includes(ex.group));
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
      const workStartMinutes = parseInt(wizardData.work_start_today.split(":")[0]) * 60 + parseInt(wizardData.work_start_today.split(":")[1]);
      const workEndMinutes = parseInt(wizardData.work_end_today.split(":")[0]) * 60 + parseInt(wizardData.work_end_today.split(":")[1]);
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

      const newSession = await daySessionService.create({
        ...wizardData,
        body_breaks_target: breaksCount,
        date: today,
        status: "active",
        started_at: new Date().toTimeString().slice(0, 5),
        body_break_schedule: schedule,
        selected_exercise_groups: selectedGroups,
        exercises_done_today: [],
      });

      for (const task of tasks) {
        await taskService.create({
          session_id: newSession.id,
          title: task.title,
          order: task.order,
          completed: false,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["daySession"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
        body_breaks_done: (session.body_breaks_done || 0) + 1,
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
        resumeTimer();
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

  const handleResetDay = () => {
    if (session && window.confirm("Do you really want to reset the day?")) {
      updateSession.mutate({ 
        status: "standby",
        body_breaks_done: 0,
        focus_sessions_completed: 0,
        meeting_mode: false,
        body_break_schedule: session.body_break_schedule?.map(b => ({ ...b, completed: false })),
        exercises_done_today: [],
      });
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
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/70 text-xs font-medium">
                Day active since {session.started_at}
              </span>
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

            <div className="mt-3 flex gap-3">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleMeetingMode}
                className={`flex-1 h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  session.meeting_mode
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                    : "bg-white/10 border border-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                <Users className="w-4 h-4" />
                {session.meeting_mode ? "IN MEETING" : "MEETING"}
              </motion.button>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEndDay}
                className="h-12 px-5 rounded-2xl bg-white/10 border border-white/10 text-white/50 hover:text-white hover:bg-white/15 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Moon className="w-4 h-4" />
                End
              </motion.button>
            </div>
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
              onClick={() => {
                if (window.confirm("Start a new day now?")) {
                  handleResetDay();
                  setShowWizard(true);
                }
              }}
              className="mt-3 w-full h-12 rounded-2xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Sun className="w-4 h-4" />
              Start a new day now
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

      {/* Wizard Overlay */}
      <AnimatePresence>
        {showWizard && (
          <StartDayWizard 
            onComplete={handleStartDay} 
            onCancel={() => {
              setShowWizard(false);
              setUseDefaults(false);
            }}
            userSettings={userSettings}
            useDefaults={useDefaults}
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
    </div>
  );
}