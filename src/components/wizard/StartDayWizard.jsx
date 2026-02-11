import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, Droplets, Timer, Activity, ArrowRight, ArrowLeft, Plus, Trash2, GripVertical, History } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

export default function StartDayWizard({ onComplete, onCancel, userSettings }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(-1); // Start at -1 to handle pre-existing tasks
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showPreviousSettings, setShowPreviousSettings] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [exerciseSelection, setExerciseSelection] = useState("auto");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [data, setData] = useState({
    last_meal_time: "",
    next_meal_time: "",
    focus_work_minutes: 45,
    focus_break_minutes: 5,
    focus_sound: "wind",
    relax_sound: "wind",
    body_breaks_target: 6,
    work_start_today: userSettings?.morning_work_start || "10:00",
    work_end_today: userSettings?.afternoon_work_end || "19:00",
  });
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [needsWorkHours, setNeedsWorkHours] = useState(!userSettings?.morning_work_start);

  const { data: previousSessions = [] } = useQuery({
    queryKey: ["previousSession"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      return base44.entities.DaySession.filter({ date: yesterdayStr });
    },
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("order"),
  });

  const { data: allPreviousSessions = [] } = useQuery({
    queryKey: ["allSessions"],
    queryFn: () => base44.entities.DaySession.list("-date", 30),
  });

  const { data: existingTasks = [] } = useQuery({
    queryKey: ["preDayTasks"],
    queryFn: () => base44.entities.Task.filter({ session_id: null }),
  });

  const previousSession = previousSessions[0];

  useEffect(() => {
    // Check for existing pre-day tasks
    if (existingTasks.length > 0 && step === -1) {
      setShowTasksDialog(true);
    } else if (previousSession && step === -1) {
      setShowPreviousSettings(true);
    } else if (step === -1) {
      setStep(0);
    }
  }, [existingTasks, previousSession, step]);

  const loadPreviousSettings = async () => {
    const prevData = {
      ...data,
      last_meal_time: previousSession.last_meal_time || "",
      next_meal_time: previousSession.next_meal_time || "",
      focus_work_minutes: previousSession.focus_work_minutes || 45,
      focus_break_minutes: previousSession.focus_break_minutes || 5,
      focus_sound: previousSession.focus_sound || "wind",
      relax_sound: previousSession.relax_sound || "wind",
      body_breaks_target: previousSession.body_breaks_target || 6,
    };
    
    // Load previous tasks
    const { data: prevTasks = [] } = await queryClient.fetchQuery({
      queryKey: ["previousTasks", previousSession.id],
      queryFn: () => base44.entities.Task.filter({ session_id: previousSession.id }),
    });
    
    const prevTasksList = prevTasks.map((t, i) => ({ title: t.title, order: i + 1 }));
    
    // Use previous exercise selection
    const selectedGroups = previousSession.selected_exercise_groups || null;
    
    await handleStartDay(prevData, prevTasksList, selectedGroups);
  };

  const loadExistingTasks = () => {
    setTasks(existingTasks.map(t => ({ title: t.title, order: t.order })));
    setShowTasksDialog(false);
    setStep(0);
  };

  const currentStep = step >= 0 ? STEPS[step] : STEPS[0];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await onComplete(data, tasks, exerciseSelection === "auto" ? null : selectedGroups);
    }
  };

  const handleBack = () => {
    if (step > 0) {
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
    setTasks([...tasks, { title: newTaskTitle, order: tasks.length + 1 }]);
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
          {step >= 0 && (
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
              <div className={`w-10 h-10 rounded-xl bg-${currentStep.color}-500/20 flex items-center justify-center`}>
                <currentStep.icon className={`w-5 h-5 text-${currentStep.color}-400`} />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">Step {step + 1}/4</p>
                <h2 className="text-white font-bold text-lg">{currentStep.label}</h2>
              </div>
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
                                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                                  >
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="flex-1 text-white text-sm">{task.title}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeTask(index)}
                                      className="text-red-400 hover:text-red-300 h-8 w-8"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
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
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="fuel" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">When did you last eat?</Label>
                    <Input
                      type="time"
                      value={data.last_meal_time}
                      onChange={(e) => setData({ ...data, last_meal_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">When is your next meal?</Label>
                    <Input
                      type="time"
                      value={data.next_meal_time}
                      onChange={(e) => setData({ ...data, next_meal_time: e.target.value })}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                      placeholder="Optional"
                    />
                  </div>
                  {!data.last_meal_time && !data.next_meal_time && (
                    <div className="text-center py-4">
                      <p className="text-white/40 text-sm italic">Today I'll eat when I feel it 🍃</p>
                    </div>
                  )}
                  {needsWorkHours && (
                    <>
                      <div className="h-px bg-white/10 my-4" />
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
              )}

              {step === 2 && (
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

              {step === 3 && (
                <motion.div key="body" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                  <p className="text-white/50 text-sm">How many active breaks today?</p>
                  <div className="flex justify-center gap-4 py-4">
                    {[2, 4, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setData({ ...data, body_breaks_target: n })}
                        className={`w-14 h-14 rounded-2xl border text-lg font-bold transition-all ${
                          data.body_breaks_target === n
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

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

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Plan</p>
                    <p className="text-white font-semibold">
                      {data.body_breaks_target} active breaks during the day
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      About 1 every {Math.round((8 * 60) / data.body_breaks_target)} minutes
                    </p>
                  </div>
                </motion.div>
              )}
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
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={(step === 3 && exerciseSelection === "manual" && selectedGroups.length === 0)}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold disabled:opacity-50"
            >
              {step === 3 ? "Start!" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}