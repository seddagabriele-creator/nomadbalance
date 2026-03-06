import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService, exerciseService } from "../api/services";
import { GROUP_LABELS } from "../constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, ChevronRight, CheckCircle, Clock, RefreshCw, SkipForward, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl, getLocalDateString } from "../utils";
import { AnimatePresence, motion } from "framer-motion";
import ExerciseDetail from "../components/body/ExerciseDetail";

// GROUP_LABELS imported from constants

const GROUP_OBJECTIVES = {
  "neck_cervical": 'Reposition the head over the shoulders without stressing the cervical spine.',
  "shoulders_thoracic": 'Real thoracic extension, without lumbar compensations.',
  "wrists_forearms": 'Stretch muscles attaching to the epicondyle and epitrochlea.',
  "lower_back_core": 'Mobilize without loading the discs.',
  "hips_legs": 'Open shortened flexors and activate dormant glutes.'
};

export default function Body() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const today = getLocalDateString();
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.listAll(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;
  const schedule = session?.body_break_schedule || [];
  const nextBreak = schedule.find(b => !b.completed);
  const nextExerciseId = nextBreak?.exercise_id;

  const updateSession = useMutation({
    mutationFn: (data) => daySessionService.update(session.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daySession"] }),
  });

  const handleSwapScheduled = (breakIndex, newExercise) => {
    const updatedSchedule = schedule.map((b, i) =>
      i === breakIndex ? { ...b, exercise_id: newExercise.id, exercise_name: newExercise.name } : b
    );
    queryClient.setQueryData(["daySession", today], (old) =>
      (old || []).map((s) => s.id === session.id ? { ...s, body_break_schedule: updatedSchedule } : s)
    );
    updateSession.mutate({ body_break_schedule: updatedSchedule });
  };

  const [pickerForIndex, setPickerForIndex] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    if (pickerForIndex === null) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerForIndex(null);
        setPickerSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerForIndex]);

  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.group]) {
      acc[exercise.group] = [];
    }
    acc[exercise.group].push(exercise);
    return acc;
  }, {});

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
            <Activity className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Body Exercises</h1>
          </div>
        </div>

        {/* Today's planned exercises */}
        {session?.status === "active" && schedule.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Today's Plan
            </h2>
            <div className="space-y-2">
              {schedule.map((b, idx) => {
                const ex = exercises.find((e) => e.id === b.exercise_id);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      b.completed && b.skipped
                        ? "bg-white/5 border-white/10 opacity-50"
                        : b.completed
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : b === nextBreak
                            ? "bg-orange-500/15 border-orange-500/30"
                            : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span className="text-xs font-mono text-white/40 w-12 shrink-0">{b.time}</span>
                    {b.completed && b.skipped ? (
                      <SkipForward className="w-4 h-4 text-white/30 shrink-0" />
                    ) : b.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Activity className="w-4 h-4 text-orange-400 shrink-0" />
                    )}
                    <button
                      onClick={() => ex && setSelectedExercise(ex)}
                      className="flex-1 text-left text-sm text-white/80 hover:text-white truncate"
                    >
                      {ex?.name || b.exercise_name}
                    </button>
                    {!b.completed && (
                      <div className="relative flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            const currentGroup = ex?.group;
                            const otherExercises = exercises.filter((e) => e.group !== currentGroup);
                            const pool = otherExercises.length > 0 ? otherExercises : exercises.filter((e) => e.id !== b.exercise_id);
                            if (pool.length === 0) return;
                            const newEx = pool[Math.floor(Math.random() * pool.length)];
                            handleSwapScheduled(idx, newEx);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-orange-400 hover:bg-white/10 transition-colors"
                          title="Random swap"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setPickerForIndex(pickerForIndex === idx ? null : idx); setPickerSearch(""); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-orange-400 hover:bg-white/10 transition-colors"
                          title="Choose exercise"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>

                        {/* Exercise picker popover */}
                        <AnimatePresence>
                          {pickerForIndex === idx && (
                            <motion.div
                              ref={pickerRef}
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-2 w-72 max-h-80 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                              <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-2 flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                <input
                                  type="text"
                                  placeholder="Search exercises..."
                                  value={pickerSearch}
                                  onChange={(e) => setPickerSearch(e.target.value)}
                                  autoFocus
                                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                                />
                                <button onClick={() => { setPickerForIndex(null); setPickerSearch(""); }} className="text-white/30 hover:text-white/60">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="overflow-y-auto max-h-64 p-1">
                                {Object.entries(
                                  exercises
                                    .filter((e) => e.id !== b.exercise_id)
                                    .filter((e) => !pickerSearch || e.name.toLowerCase().includes(pickerSearch.toLowerCase()) || (GROUP_LABELS[e.group] || "").toLowerCase().includes(pickerSearch.toLowerCase()))
                                    .reduce((acc, e) => { (acc[e.group] = acc[e.group] || []).push(e); return acc; }, {})
                                ).map(([group, exs]) => (
                                  <div key={group}>
                                    <p className="text-[10px] uppercase tracking-wider text-orange-400/60 font-semibold px-2 pt-2 pb-1">{GROUP_LABELS[group]}</p>
                                    {exs.map((pickEx) => (
                                      <button
                                        key={pickEx.id}
                                        onClick={() => {
                                          handleSwapScheduled(idx, pickEx);
                                          setPickerForIndex(null);
                                          setPickerSearch("");
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                      >
                                        {pickEx.image_url && (
                                          <img src={pickEx.image_url} alt="" className="w-8 h-8 rounded-md object-cover shrink-0 border border-white/10" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="truncate">{pickEx.name}</p>
                                          <p className="text-[10px] text-white/30 truncate">{pickEx.dosage}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([groupKey, groupExercises]) => (
            <div key={groupKey} className="space-y-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-orange-400 mb-1">
                  {GROUP_LABELS[groupKey]}
                </h2>
                <p className="text-xs text-white/50 italic leading-relaxed">
                  {GROUP_OBJECTIVES[groupKey]}
                </p>
              </div>

              <div className="grid gap-3">
                {groupExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className={`backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 transition-all group ${
                      exercise.id === nextExerciseId
                        ? "bg-orange-500/20 border-2 border-orange-500/50"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {exercise.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img
                            src={exercise.image_url}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-white mb-1">{exercise.name}</h3>
                        <p className="text-xs text-white/40">{exercise.dosage}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {exercises.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No exercises available yet</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}