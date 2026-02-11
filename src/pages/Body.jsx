import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { AnimatePresence } from "framer-motion";
import ExerciseDetail from "../components/body/ExerciseDetail";

const GROUP_LABELS = {
  "neck_cervical": "Neck & Cervical",
  "shoulders_thoracic": "Shoulders & Thoracic",
  "wrists_forearms": "Wrists & Forearms",
  "lower_back_core": "Lower Back & Core",
  "hips_legs": "Hips & Legs"
};

const GROUP_OBJECTIVES = {
  "neck_cervical": 'Reposition the head over the shoulders without stressing the cervical spine.',
  "shoulders_thoracic": 'Real thoracic extension, without lumbar compensations.',
  "wrists_forearms": 'Stretch muscles attaching to the epicondyle and epitrochlea.',
  "lower_back_core": 'Mobilize without loading the discs.',
  "hips_legs": 'Open shortened flexors and activate dormant glutes.'
};

export default function Body() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("order"),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;
  const nextBreak = session?.body_break_schedule?.find(b => !b.completed);
  const nextExerciseId = nextBreak?.exercise_id;

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