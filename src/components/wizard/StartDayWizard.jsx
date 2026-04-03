import React, { useState, useEffect } from "react";
import { daySessionService, exerciseService, taskService } from "../../api/services";
import { getDailyDefaults } from "../../hooks/useDailyDefaults";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, Droplets, Timer, Activity, ArrowRight, ArrowLeft, Plus, Trash2, GripVertical, History, AlertTriangle, CheckCircle, Clock, RotateCcw, X, Pencil, Check } from "lucide-react";
import { analyzeBreakFeasibility, calculateSessionConflict } from "../../utils/breakFeasibility";
import { getLocalDateString } from "../../utils";
import { FASTING_PRESETS, getEatingHours, calculateEatingWindowEnd, DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, DEFAULT_BODY_BREAKS_TARGET, DEFAULT_WORK_HOURS } from "../../constants";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STEP_COLOR_MAP = {
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-400" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

const STEPS = [
  { key: "goals", label: "Today's Goals", icon: Target, color: "cyan" },
  { key: "fuel", label: "Fuel Check", icon: Droplets, color: "emerald" },
  { key: "focus", label: "Focus Rhythm", icon: Timer, color: "violet" },
  { key: "body", label: "Body Pledge", icon: Activity, color: "orange" },
];

const PRESETS = [
  { label: "45 / 5", work: 45, rest: 5 },
  { label: "50 / 10", work: 50, rest: 10 },
  { label: "Custom", work: null, rest: null },
];

const GROUP_LABELS = {
  "neck_cervical": "Neck & Cervical",
  "shoulders_thoracic": "Shoulders & Thoracic",
  "wrists_forearms": "Wrists & Forearms",
  "lower_back_core": "Lower Back & Core",
  "hips_legs": "Hips & Legs"
};

export default function StartDayWizard({ onComplete, onCancel, userSettings, useDefaults = false, resumeSession = null, currentSessionId = null }) {
  const queryClient = useQueryClient();

  // Load daily defaults if using them
  const loadedDefaults = useDefaults ? getDailyDefaults() : null;

  // When resuming, pre-fill from existing session
  const resumeDefaults = resumeSession ? {
    fasting_preset: resumeSession.fasting_preset || "16/8",
    eating_window_start_time: resumeSession.eating_window_start_time || resumeSession.eating_window_start || "12:00",
    custom_fasting_hours: resumeSession.custom_fasting_hours || null,
    max_meals: resumeSession.max_meals || 3,
    focus_work_minutes: resumeSession.focus_work_minutes || DEFAULT_WORK_MINUTES,
    focus_break_minutes: resumeSession.focus_break_minutes || DEFAULT_BREAK_MINUTES,
    focus_sound: resumeSession.focus_sound || "40hz-wind",
    relax_sound: resumeSession.relax_sound || "10hz-binaural-ocean",
    body_breaks_target: resumeSession.body_breaks_target || DEFAULT_BODY_BREAKS_TARGET,
    work_start_today: resumeSession.work_start_today || userSettings?.morning_work_start || DEFAULT_WORK_HOURS.morning_start,
    work_end_today: resumeSession.work_end_today || userSettings?.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
  } : null;

  const defaults = resumeDefaults || loadedDefaults;

  const [step, setStep] = useState(resumeSession ? 0 : -1);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showPreviousSettings, setShowPreviousSettings] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [exerciseSelection, setExerciseSelection] = useState(
    resumeSession?.selected_exercise_groups?.length > 0 ? "manual" :
    defaults?.exercise_selection || "auto"
  );
  const [selectedGroups, setSelectedGroups] = useState(
    resumeSession?.selected_exercise_groups || defaults?.selected_groups || []
  );
  const [data, setData] = useState({
    fasting_preset: defaults?.fasting_preset || "16/8",
    eating_window_start_time: defaults?.eating_window_start_time || "12:00",
    custom_fasting_hours: defaults?.custom_fasting_hours || null,
    max_meals: defaults?.max_meals || 3,
    focus_work_minutes: defaults?.focus_work_minutes || DEFAULT_WORK_MINUTES,
    focus_break_minutes: defaults?.focus_break_minutes || DEFAULT_BREAK_MINUTES,
    focus_sound: defaults?.focus_sound || "40hz-wind",
    relax_sound: defaults?.relax_sound || "10hz-binaural-ocean",
    body_breaks_target: defaults?.body_breaks_target || DEFAULT_BODY_BREAKS_TARGET,
    work_start_today: defaults?.work_start_today || userSettings?.morning_work_start || DEFAULT_WORK_HOURS.morning_start,
    work_end_today: defaults?.work_end_today || userSettings?.afternoon_work_end || DEFAULT_WORK_HOURS.afternoon_end,
  });
  const [mealsAlreadyHad, setMealsAlreadyHad] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [needsWorkHours, setNeedsWorkHours] = useState(!userSettings?.morning_work_start);
  const [conflictResolution, setConflictResolution] = useState(null);

  const { data: previousSessions = [] } = useQuery({
    queryKey: ["previousSession"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      return daySessionService.getByDate(yesterdayStr);
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

  const { data: existingTasks = [] } = useQuery({
    queryKey: ["preDayTasks"],
    queryFn: () => taskService.getUnassigned(),
  });

  // Load tasks from current session (resume or same-day reopen)
  const taskSessionId = resumeSession?.id || currentSessionId;
  const { data: sessionTasks = [] } = useQuery({
    queryKey: ["sessionTasks", taskSessionId],
    queryFn: () => taskService.getBySession(taskSessionId),
    enabled: !!taskSessionId,
  });

  // Fetch all tasks to find previous uncompleted ones
  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasksWizard"],
    queryFn: () => taskService.listAll("-order"),
  });

  const previousUncompletedTasks = allTasks.filter(
    (t) => t.session_id && t.session_id !== taskSessionId && !t.completed
  );

  const [showOldTasks, setShowOldTasks] = useState(false);
  const [selectedOldTasks, setSelectedOldTasks] = useState(new Set());
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showAlarmIndex, setShowAlarmIndex] = useState(null);

  // Pre-fill task list from session tasks
  useEffect(() => {
    if (sessionTasks.length > 0 && tasks.length === 0) {
      setTasks(sessionTasks.map(t => ({ title: t.title, order: t.order })));
    }
  }, [sessionTasks]);

  const previousSession = previousSessions[0];

  useEffect(() => {
    // Skip all dialogs if resuming
    if (resumeSession) {
      return;
    }

    // Always show existing tasks dialog, even when using defaults
    if (existingTasks.length > 0 && step === -1) {
      setShowTasksDialog(true);
    } else if (!useDefaults && previousSession && step === -1) {
      // Only show previous settings if NOT using defaults
      setShowPreviousSettings(true);
    } else if (step === -1) {
      setStep(0);
    }
  }, [existingTasks, previousSession, step, useDefaults, resumeSession]);

  const loadPreviousSettings = async () => {
    const prevData = {
      ...data,
      fasting_preset: previousSession.fasting_preset || data.fasting_preset,
      eating_window_start: null,
      custom_fasting_hours: previousSession.custom_fasting_hours || data.custom_fasting_hours,
      max_meals: previousSession.max_meals || data.max_meals,
      focus_work_minutes: previousSession.focus_work_minutes || DEFAULT_WORK_MINUTES,
      focus_break_minutes: previousSession.focus_break_minutes || DEFAULT_BREAK_MINUTES,
      focus_sound: previousSession.focus_sound || "40hz-wind",
      relax_sound: previousSession.relax_sound || "10hz-binaural-ocean",
      body_breaks_target: previousSession.body_breaks_target || DEFAULT_BODY_BREAKS_TARGET,
    };

    // Use previous exercise selection (tasks are NOT carried over —
    // uncompleted tasks from past days appear in Journal's "Previous Tasks" section)
    const selectedGroups = previousSession.selected_exercise_groups || null;

    await onComplete(prevData, [], selectedGroups);
  };

  const loadExistingTasks = () => {
    setTasks(existingTasks.map(t => ({ title: t.title, order: t.order })));
    setShowTasksDialog(false);
    setStep(0);
  };

  const currentStep = step >= 0 ? STEPS[step] : STEPS[0];

  const handleNext = async () => {
    // If using defaults, show only tasks (step 0), then body (step 3) if manual exercises, then complete
    if (useDefaults) {
      if (step === 0) {
        // If user chose manual exercises, show body step; otherwise complete
        if (exerciseSelection === "manual") {
          setStep(3);
        } else {
          await onComplete(data, tasks, exerciseSelection === "auto" ? null : selectedGroups, mealsAlreadyHad);
        }
      } else if (step === 3) {
        await onComplete(data, tasks, exerciseSelection === "auto" ? null : selectedGroups, mealsAlreadyHad);
      }
    } else if (step < 3) {
      setStep(step + 1);
    } else {
      await onComplete(data, tasks, exerciseSelection === "auto" ? null : selectedGroups, mealsAlreadyHad);
    }
  };

  const handleBack = () => {
    if (useDefaults) {
      if (step === 0) {
        onCancel(); // From tasks (first step in defaults flow), cancel
      } else if (step === 3) {
        setStep(0); // From body, go back to tasks
      }
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const selectPreset = (idx) => {
    setSelectedPreset(idx);
    if (PRESETS[idx].work !== null) {
      setData({ ...data, focus_work_minutes: PRESETS[idx].work, focus_break_minutes: PRESETS[idx].rest });
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { title: newTaskTitle, order: tasks.length + 1, alarm_time: null }]);
    setNewTaskTitle("");
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTasks(reordered.map((t, i) => ({ ...t, order: i + 1 })));
  };

  const toggleGroup = (group) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter(g => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
    >
      {showTasksDialog ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Existing Tasks</h2>
          </div>
          
          <p className="text-white/70 mb-6">
            You have {existingTasks.length} task{existingTasks.length > 1 ? 's' : ''} from before. Keep them for today?
          </p>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 space-y-2 max-h-48 overflow-y-auto">
            {existingTasks.slice(0, 5).map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">{i + 1}.</span>
                <span className="text-white">{task.title}</span>
              </div>
            ))}
            {existingTasks.length > 5 && (
              <p className="text-white/40 text-xs">...and {existingTasks.length - 5} more</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-10 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10 px-0"
            >
              ✕
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowTasksDialog(false); setStep(0); }}
              className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
            >
              Create new
            </Button>
            <Button
              onClick={loadExistingTasks}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400"
            >
              Keep these
            </Button>
          </div>
        </motion.div>
      ) : showPreviousSettings ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Previous Settings</h2>
          </div>
          
          <p className="text-white/70 mb-6">
            Would you like to use yesterday's settings?
          </p>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Focus:</span>
              <span className="text-white">{previousSession.focus_work_minutes}/{previousSession.focus_break_minutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Active breaks:</span>
              <span className="text-white">{previousSession.body_breaks_target}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-10 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10 px-0"
            >
              ✕
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowPreviousSettings(false); setStep(0); }}
              className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
            >
              No, customize
            </Button>
            <Button
              onClick={loadPreviousSettings}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400"
            >
              Yes, use those
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Progress */}
          {step >= 0 && !useDefaults && (
            <div className="flex gap-2 p-6 pb-0">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${i <= step ? "bg-gradient-to-r from-violet-500 to-cyan-400" : ""}`}
                    initial={{ width: 0 }}
                    animate={{ width: i <= step ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${STEP_COLOR_MAP[currentStep.color].bg} flex items-center justify-center`}>
                <currentStep.icon className={`w-5 h-5 ${STEP_COLOR_MAP[currentStep.color].text}`} />
              </div>
              <div className="flex-1">
                {!useDefaults && <p className="text-white/40 text-xs uppercase tracking-widest">Step {step + 1}/4</p>}
                <h2 className="text-white font-bold text-lg">
                  {useDefaults ? (step === 3 ? "Body Pledge" : "Today's Tasks") : currentStep.label}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[240px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="goals" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                  <p className="text-white/70 text-sm">What must you complete today? List in order of priority.</p>
                  <div className="flex gap-2">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTask()}
                      placeholder="Add a task..."
                      className="bg-white/5 border-white/10 text-white flex-1"
                    />
                    <Button onClick={addTask} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {tasks.length > 0 && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="wizard-tasks">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {tasks.map((task, index) => (
                              <Draggable key={index} draggableId={`task-${index}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/10"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="w-4 h-4 text-white/40" />
                                      </div>
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold shrink-0">
                                        {index + 1}
                                      </div>
                                      {editingTaskIndex === index ? (
                                        <div className="flex-1 flex items-center gap-1">
                                          <Input
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyPress={(e) => {
                                              if (e.key === "Enter" && editingTitle.trim()) {
                                                setTasks(tasks.map((t, i) => i === index ? { ...t, title: editingTitle.trim() } : t));
                                                setEditingTaskIndex(null);
                                              }
                                            }}
                                            className="bg-white/5 border-white/10 text-white h-7 text-sm flex-1"
                                            autoFocus
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              if (editingTitle.trim()) {
                                                setTasks(tasks.map((t, i) => i === index ? { ...t, title: editingTitle.trim() } : t));
                                              }
                                              setEditingTaskIndex(null);
                                            }}
                                            className="text-emerald-400 hover:text-emerald-300 h-7 w-7"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <span
                                          className="flex-1 text-white text-sm cursor-pointer hover:text-white/80"
                                          onClick={() => { setEditingTaskIndex(index); setEditingTitle(task.title); }}
                                        >
                                          {task.title}
                                        </span>
                                      )}
                                      {task.alarm_time && editingTaskIndex !== index && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] shrink-0">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>{task.alarm_time}</span>
                                        </div>
                                      )}
                                      {editingTaskIndex !== index && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setEditingTaskIndex(index); setEditingTitle(task.title); }}
                                            className="text-white/30 hover:text-white/60 h-7 w-7"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowAlarmIndex(showAlarmIndex === index ? null : index)}
                                            className={`h-7 w-7 ${task.alarm_time ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'}`}
                                          >
                                            <Clock className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { removeTask(index); if (showAlarmIndex === index) setShowAlarmIndex(null); }}
                                            className="text-red-400 hover:text-red-300 h-7 w-7"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                    {showAlarmIndex === index && (
                                      <div className="flex items-center gap-2 pl-12">
                                        <Input
                                          type="time"
                                          value={task.alarm_time || ""}
                                          onChange={(e) => setTasks(tasks.map((t, i) => i === index ? { ...t, alarm_time: e.target.value || null } : t))}
                                          className="bg-white/5 border-white/10 text-white h-7 text-xs w-28"
                                        />
                                        {task.alarm_time && (
                                          <button
                                            onClick={() => setTasks(tasks.map((t, i) => i === index ? { ...t, alarm_time: null } : t))}
                                            className="text-red-400/60 hover:text-red-400 text-xs"
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}

                  {tasks.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-white/40 text-sm italic">No specific tasks, I'll follow the flow ✨</p>
                    </div>
                  )}

                  {/* Old tasks section */}
                  {previousUncompletedTasks.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { setShowOldTasks(!showOldTasks); setSelectedOldTasks(new Set()); }}
                          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          {showOldTasks ? "Hide" : "View"} old tasks ({previousUncompletedTasks.length})
                        </button>
                        <Button
                          onClick={() => {
                            const newTasks = previousUncompletedTasks
                              .filter((t) => !tasks.some((existing) => existing.title === t.title))
                              .map((t, i) => ({ title: t.title, order: tasks.length + i + 1 }));
                            setTasks([...tasks, ...newTasks]);
                            setShowOldTasks(false);
                            setSelectedOldTasks(new Set());
                          }}
                          variant="ghost"
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs h-7 px-2"
                        >
                          Move all to today
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showOldTasks && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                              {previousUncompletedTasks.map((task) => (
                                <button
                                  key={task.id}
                                  onClick={() => {
                                    const next = new Set(selectedOldTasks);
                                    next.has(task.id) ? next.delete(task.id) : next.add(task.id);
                                    setSelectedOldTasks(next);
                                  }}
                                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                                    selectedOldTasks.has(task.id)
                                      ? "bg-cyan-500/15 border border-cyan-500/40 text-white"
                                      : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                                    selectedOldTasks.has(task.id) ? "bg-cyan-500 border-cyan-500" : "border-white/30"
                                  }`}>
                                    {selectedOldTasks.has(task.id) && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="flex-1 truncate">{task.title}</span>
                                </button>
                              ))}
                            </div>
                            {selectedOldTasks.size > 0 && (
                              <Button
                                onClick={() => {
                                  const selected = previousUncompletedTasks.filter((t) => selectedOldTasks.has(t.id));
                                  const newTasks = selected
                                    .filter((t) => !tasks.some((existing) => existing.title === t.title))
                                    .map((t, i) => ({ title: t.title, order: tasks.length + i + 1 }));
                                  setTasks([...tasks, ...newTasks]);
                                  setSelectedOldTasks(new Set());
                                  setShowOldTasks(false);
                                }}
                                className="w-full mt-3 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-sm font-semibold"
                              >
                                Add {selectedOldTasks.size} to today
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 1 && (() => {
                const eatingHours = getEatingHours(data.fasting_preset, data.custom_fasting_hours);
                const presetIdx = FASTING_PRESETS.findIndex(p => p.label === data.fasting_preset || (data.fasting_preset === "custom" && p.label === "Custom"));

                return (
                <motion.div key="fuel" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                  <p className="text-white/50 text-sm">Set your fasting plan and when your eating window opens.</p>

                  {/* Preset selector */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Fasting plan</Label>
                    <div className="flex flex-wrap gap-2">
                      {FASTING_PRESETS.map((p, idx) => (
                        <button
                          key={p.label}
                          onClick={() => setData({
                            ...data,
                            fasting_preset: p.label === "Custom" ? "custom" : p.label,
                          })}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                            (presetIdx === idx)
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom slider */}
                  {data.fasting_preset === "custom" && (
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">
                        Fasting: {data.custom_fasting_hours || 16}h / Eating: {24 - (data.custom_fasting_hours || 16)}h
                      </Label>
                      <Slider
                        value={[data.custom_fasting_hours || 16]}
                        onValueChange={([v]) => setData({ ...data, custom_fasting_hours: v })}
                        min={10}
                        max={23}
                        step={1}
                        className="py-3"
                      />
                    </div>
                  )}

                  {/* Max meals */}
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Meals per day</Label>
                    <div className="flex gap-1.5">
                      {[2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => setData({ ...data, max_meals: n })}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                            data.max_meals === n
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="text-white/30 text-[10px]">
                      {data.max_meals} meals per day
                    </p>
                  </div>

                  {/* Window start time */}
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Window opens at</Label>
                    <Input
                      type="time"
                      value={data.eating_window_start_time}
                      onChange={(e) => setData({ ...data, eating_window_start_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white h-10 w-32"
                    />
                  </div>

                  {/* Already had meals? Show if time is past eating window start or always in manual mode */}
                  {(!useDefaults || (new Date().getHours() * 60 + new Date().getMinutes()) >= (() => { const [h, m] = (data.eating_window_start_time || "12:00").split(":").map(Number); return h * 60 + m; })()) && (
                    <div className="space-y-1">
                      <Label className="text-white/60 text-xs">Already had a meal today?</Label>
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(n => (
                          <button
                            key={n}
                            onClick={() => setMealsAlreadyHad(n)}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                              mealsAlreadyHad === n
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            }`}
                          >
                            {n === 0 ? "No" : n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <p className="text-emerald-300 text-sm font-medium">
                      {24 - eatingHours}h fasting / {eatingHours}h eating
                    </p>
                    <p className="text-emerald-300/60 text-xs mt-0.5">
                      {data.eating_window_start_time} — {calculateEatingWindowEnd(data.eating_window_start_time, eatingHours)} · {data.max_meals} meals
                      {mealsAlreadyHad > 0 && ` · ${mealsAlreadyHad} already had`}
                    </p>
                  </div>

                  {!useDefaults && needsWorkHours && (
                    <>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Today's work start time</Label>
                        <Input
                          type="time"
                          value={data.work_start_today}
                          onChange={(e) => setData({ ...data, work_start_today: e.target.value })}
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Today's work end time</Label>
                        <Input
                          type="time"
                          value={data.work_end_today}
                          onChange={(e) => setData({ ...data, work_end_today: e.target.value })}
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                        />
                      </div>
                    </>
                  )}
                </motion.div>
                );
              })()}

              {step === 2 && !useDefaults && (
                <motion.div key="focus" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                  <p className="text-white/50 text-sm">Choose your work/break rhythm</p>
                  <div className="flex gap-3">
                    {PRESETS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => selectPreset(i)}
                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                          selectedPreset === i
                            ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {selectedPreset === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-white text-sm font-medium">Work: {data.focus_work_minutes} min</Label>
                          <Slider
                            value={[data.focus_work_minutes]}
                            onValueChange={([v]) => setData({ ...data, focus_work_minutes: v })}
                            min={15}
                            max={90}
                            step={5}
                            className="py-3"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm font-medium">Break: {data.focus_break_minutes} min</Label>
                          <Slider
                            value={[data.focus_break_minutes]}
                            onValueChange={([v]) => setData({ ...data, focus_break_minutes: v })}
                            min={3}
                            max={20}
                            step={1}
                            className="py-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Your rhythm</p>
                    <p className="text-white font-semibold">{data.focus_work_minutes} min focus → {data.focus_break_minutes} min break</p>
                  </div>
                </motion.div>
              )}

              {step === 3 && (!useDefaults || exerciseSelection === "manual") && (() => {
                const feasibility = analyzeBreakFeasibility({
                  breaksTarget: data.body_breaks_target,
                  workStart: data.work_start_today,
                  workEnd: data.work_end_today,
                  focusWorkMinutes: data.focus_work_minutes,
                  focusBreakMinutes: data.focus_break_minutes,
                  useRemainingTime: false,
                });
                const nowFeasibility = analyzeBreakFeasibility({
                  breaksTarget: data.body_breaks_target,
                  workStart: data.work_start_today,
                  workEnd: data.work_end_today,
                  focusWorkMinutes: data.focus_work_minutes,
                  focusBreakMinutes: data.focus_break_minutes,
                  useRemainingTime: true,
                });
                const isLateStart = nowFeasibility.remainingWorkMinutes < feasibility.totalWorkMinutes - 30;

                // Smart conflict detection
                const conflict = calculateSessionConflict({
                  breaksTarget: data.body_breaks_target,
                  focusWorkMinutes: data.focus_work_minutes,
                  focusBreakMinutes: data.focus_break_minutes,
                  remainingMinutes: nowFeasibility.remainingWorkMinutes,
                  workEndTime: data.work_end_today,
                });

                const remainingH = Math.floor(nowFeasibility.remainingWorkMinutes / 60);
                const remainingM = nowFeasibility.remainingWorkMinutes % 60;
                const remainingLabel = remainingH > 0
                  ? `${remainingH}h${remainingM > 0 ? ` ${remainingM}min` : ""}`
                  : `${remainingM} min`;

                return (
                <motion.div key="body" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                  <p className="text-white/50 text-sm">How many active breaks today?</p>
                  <div className="flex justify-center gap-4 py-4">
                    {[2, 4, 6, 8].map((n) => {
                      const nFeas = analyzeBreakFeasibility({
                        breaksTarget: n,
                        workStart: data.work_start_today,
                        workEnd: data.work_end_today,
                        focusWorkMinutes: data.focus_work_minutes,
                        focusBreakMinutes: data.focus_break_minutes,
                        useRemainingTime: isLateStart,
                      });
                      const isUnrealistic = nFeas.level === "unrealistic";
                      const isTight = nFeas.level === "tight";
                      return (
                        <button
                          key={n}
                          onClick={() => {
                            // If a conflict resolution was applied, revert to original values first
                            const base = conflictResolution
                              ? { ...data, ...conflictResolution.originalData }
                              : data;
                            setConflictResolution(null);
                            setData({ ...base, body_breaks_target: n });
                          }}
                          className={`relative w-14 h-14 rounded-2xl border text-lg font-bold transition-all ${
                            data.body_breaks_target === n
                              ? isUnrealistic
                                ? "bg-red-500/20 border-red-500/50 text-red-300"
                                : isTight
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                  : "bg-orange-500/20 border-orange-500/50 text-orange-300"
                              : isUnrealistic
                                ? "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          {n}
                          {isUnrealistic && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500/80" />
                          )}
                          {isTight && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500/80" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Smart conflict resolution */}
                  {isLateStart && conflict && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-amber-500/5 border-amber-500/20">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-amber-300 font-semibold text-sm">Not enough time</p>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">
                            Your workday ends at <strong className="text-white/70">{data.work_end_today}</strong> ({remainingLabel} left).
                            With <strong className="text-white/70">{data.focus_work_minutes}+{data.focus_break_minutes} min</strong> rhythm,{" "}
                            <strong className="text-white/70">{data.body_breaks_target} sessions</strong> need{" "}
                            <strong className="text-white/70">{Math.floor(conflict.totalNeededMinutes / 60)}h{conflict.totalNeededMinutes % 60 > 0 ? ` ${conflict.totalNeededMinutes % 60}min` : ""}</strong>.
                          </p>
                        </div>
                      </div>

                      <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium pl-1">Choose how to adapt</p>

                      <div className="space-y-2">
                        {/* Option A: Compress sessions */}
                        {conflict.compress.viable && (
                          <button
                            onClick={() => {
                              setConflictResolution({
                                type: "compress",
                                label: `Compressed to ${conflict.compress.focusMinutes}+${conflict.compress.breakMinutes} min`,
                                originalData: {
                                  focus_work_minutes: data.focus_work_minutes,
                                  focus_break_minutes: data.focus_break_minutes,
                                  body_breaks_target: data.body_breaks_target,
                                  work_end_today: data.work_end_today,
                                },
                              });
                              setData({
                                ...data,
                                focus_work_minutes: conflict.compress.focusMinutes,
                                focus_break_minutes: conflict.compress.breakMinutes,
                              });
                            }}
                            className="w-full p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all text-left group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Timer className="w-3.5 h-3.5 text-violet-400" />
                              <p className="text-violet-300 font-medium text-sm">Compress sessions</p>
                            </div>
                            <p className="text-white/40 text-xs leading-relaxed">
                              Keep {data.body_breaks_target} sessions, shorten rhythm to{" "}
                              <strong className="text-white/60">{conflict.compress.focusMinutes}+{conflict.compress.breakMinutes} min</strong>{" "}
                              (instead of {data.focus_work_minutes}+{data.focus_break_minutes})
                            </p>
                          </button>
                        )}

                        {/* Option B: Reduce breaks */}
                        {conflict.reduce.breaks < data.body_breaks_target && (
                          <button
                            onClick={() => {
                              setConflictResolution({
                                type: "reduce",
                                label: `Reduced to ${conflict.reduce.breaks} session${conflict.reduce.breaks > 1 ? "s" : ""}`,
                                originalData: {
                                  focus_work_minutes: data.focus_work_minutes,
                                  focus_break_minutes: data.focus_break_minutes,
                                  body_breaks_target: data.body_breaks_target,
                                  work_end_today: data.work_end_today,
                                },
                              });
                              setData({ ...data, body_breaks_target: conflict.reduce.breaks });
                            }}
                            className="w-full p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-left group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-3.5 h-3.5 text-cyan-400" />
                              <p className="text-cyan-300 font-medium text-sm">Reduce to {conflict.reduce.breaks} session{conflict.reduce.breaks > 1 ? "s" : ""}</p>
                            </div>
                            <p className="text-white/40 text-xs leading-relaxed">
                              Keep your <strong className="text-white/60">{data.focus_work_minutes}+{data.focus_break_minutes} min</strong> rhythm,
                              do {conflict.reduce.breaks} session{conflict.reduce.breaks > 1 ? "s" : ""} before {data.work_end_today}
                            </p>
                          </button>
                        )}

                        {/* Option C: Extend workday */}
                        <button
                          onClick={() => {
                            setConflictResolution({
                              type: "extend",
                              label: `Extended to ${conflict.extend.newEndTime}`,
                              originalData: {
                                focus_work_minutes: data.focus_work_minutes,
                                focus_break_minutes: data.focus_break_minutes,
                                body_breaks_target: data.body_breaks_target,
                                work_end_today: data.work_end_today,
                              },
                            });
                            setData({ ...data, work_end_today: conflict.extend.newEndTime });
                          }}
                          className="w-full p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <p className="text-emerald-300 font-medium text-sm">Extend to {conflict.extend.newEndTime}</p>
                          </div>
                          <p className="text-white/40 text-xs leading-relaxed">
                            Do all {data.body_breaks_target} sessions with normal rhythm.
                            Work <strong className="text-white/60">+{conflict.extend.extraMinutes} min</strong> longer (until {conflict.extend.newEndTime})
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show applied resolution with option to change */}
                  {conflictResolution && !conflict && (
                    <div className="flex items-center justify-between p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p className="text-emerald-300 text-sm font-medium">{conflictResolution.label}</p>
                      </div>
                      <button
                        onClick={() => {
                          setData({ ...data, ...conflictResolution.originalData });
                          setConflictResolution(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/50 hover:text-white/70 text-xs font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Change
                      </button>
                    </div>
                  )}

                  {/* Simple late start hint (when no full conflict) */}
                  {isLateStart && !conflict && !conflictResolution && nowFeasibility.level !== "good" && (
                    <div className="flex items-start gap-2 p-3 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-300 text-xs">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Starting late</p>
                        <p className="text-white/40 mt-0.5">
                          {remainingLabel} left until {data.work_end_today} — schedule is tight but doable.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-white/70 text-sm">Exercise selection</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setExerciseSelection("auto")}
                        className={`w-full p-4 rounded-xl border transition-all ${
                          exerciseSelection === "auto"
                            ? "bg-orange-500/20 border-orange-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-white font-medium text-sm">App chooses for me</p>
                        <p className="text-white/40 text-xs">Automatic balanced workout</p>
                      </button>
                      <button
                        onClick={() => setExerciseSelection("manual")}
                        className={`w-full p-4 rounded-xl border transition-all ${
                          exerciseSelection === "manual"
                            ? "bg-orange-500/20 border-orange-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-white font-medium text-sm">I choose the groups</p>
                        <p className="text-white/40 text-xs">Focus on specific areas</p>
                      </button>
                    </div>
                  </div>

                  {exerciseSelection === "manual" && (
                    <div className="space-y-2">
                      <p className="text-white/70 text-sm">Select muscle groups</p>
                      <div className="space-y-2">
                        {Object.entries(GROUP_LABELS).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => toggleGroup(key)}
                            className={`w-full p-3 rounded-lg border text-sm transition-all ${
                              selectedGroups.includes(key)
                                ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart plan summary */}
                  {!conflict && (
                    <div className={`rounded-xl p-4 border ${
                      nowFeasibility.level === "good" || feasibility.level === "good"
                        ? "bg-white/5 border-white/10"
                        : feasibility.level === "tight"
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-red-500/5 border-red-500/20"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {(nowFeasibility.level === "good" || feasibility.level === "good") ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className={`w-3.5 h-3.5 ${feasibility.level === "tight" ? "text-amber-400" : "text-red-400"}`} />
                        )}
                        <p className="text-white/40 text-xs">Plan</p>
                      </div>
                      <p className="text-white font-semibold">
                        {data.body_breaks_target} active breaks during the day
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {isLateStart ? nowFeasibility.message : feasibility.message}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        {isLateStart ? nowFeasibility.totalCycles : feasibility.totalCycles} focus cycles &middot; {data.focus_work_minutes}+{data.focus_break_minutes} min rhythm
                      </p>
                    </div>
                  )}
                </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 0 && !useDefaults ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={(step === 3 && exerciseSelection === "manual" && selectedGroups.length === 0)}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold disabled:opacity-50"
            >
              {(useDefaults && step === 0) || (!useDefaults && step === 3) ? "Start!" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}