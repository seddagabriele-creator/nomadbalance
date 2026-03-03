import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Play, Clock, SkipForward, X, ChevronRight, AlertCircle, Info, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONE_SECOND_MS } from "../../constants";

const SNOOZE_OPTIONS = [3, 5, 10]; // minutes

export default function BreakNotification({
  breakItem,
  exercise,
  onStart,
  onSnooze,
  onSkip,
  onComplete,
  onSwap,
}) {
  const [phase, setPhase] = useState("alert"); // "alert" | "exercise"
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartExercise = () => {
    setPhase("exercise");
    setElapsed(0);
    onStart?.();
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, ONE_SECOND_MS);
  };

  const handleDone = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onComplete?.();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!breakItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        {phase === "alert" ? (
          <motion.div
            key="alert"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-orange-950/30 backdrop-blur-xl rounded-3xl border border-orange-500/30 overflow-hidden"
          >
            {/* Header pulse */}
            <div className="relative px-6 pt-8 pb-4 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Activity className="w-8 h-8 text-orange-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-1">Time for a break!</h2>
              <p className="text-white/50 text-sm">Move your body, clear your mind</p>
            </div>

            {/* Exercise preview */}
            <div className="px-6 pb-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  {exercise?.image_url && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img
                        src={exercise.image_url}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {exercise?.name || breakItem.exercise_name}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{exercise?.dosage || "Quick exercise"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-400/50" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-2">
              <Button
                onClick={handleStartExercise}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 font-semibold text-base"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Exercise
              </Button>

              {onSwap && (
                <Button
                  variant="ghost"
                  onClick={onSwap}
                  className="w-full h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Try another exercise
                </Button>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                    className="w-full h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm"
                  >
                    <Clock className="w-4 h-4 mr-1.5" />
                    Snooze
                  </Button>

                  <AnimatePresence>
                    {showSnoozeOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-white/10 rounded-xl overflow-hidden"
                      >
                        {SNOOZE_OPTIONS.map((min) => (
                          <button
                            key={min}
                            onClick={() => {
                              setShowSnoozeOptions(false);
                              onSnooze?.(min);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {min} minutes
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="flex-1 h-10 rounded-xl text-white/30 hover:text-white/50 hover:bg-white/5 text-sm"
                >
                  <SkipForward className="w-4 h-4 mr-1.5" />
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exercise"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl rounded-3xl border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            {/* Exercise header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">
                      {exercise?.name || breakItem.exercise_name}
                    </h2>
                    <p className="text-orange-400/70 text-xs font-mono">{formatTime(elapsed)}</p>
                  </div>
                </div>
                <button
                  onClick={handleDone}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Image */}
              {exercise?.image_url && (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={exercise.image_url}
                    alt={exercise.name}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Dosage */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-orange-300 uppercase tracking-wider mb-1">Dosage</h3>
                <p className="text-white/80 text-sm">{exercise?.dosage}</p>
              </div>

              {/* Execution */}
              {exercise?.execution && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Info className="w-3 h-3 text-orange-400" />
                    </div>
                    <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider">How to do it</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{exercise.execution}</p>
                </div>
              )}

              {/* Anti-cheating */}
              {exercise?.anti_cheating && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    </div>
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Watch out</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{exercise.anti_cheating}</p>
                </div>
              )}

              {/* Done button */}
              <Button
                onClick={handleDone}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 font-semibold text-base"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Done
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
