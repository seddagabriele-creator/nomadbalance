import React from "react";
import { motion } from "framer-motion";
import { X, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExerciseDetail({ exercise, onClose }) {
  if (!exercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {exercise.image_url && (
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Info className="w-3 h-3 text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Execution</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{exercise.execution}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                </div>
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Anti-Cheating</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{exercise.anti_cheating}</p>
            </div>

            {exercise.modification && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Info className="w-3 h-3 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Modification</h3>
                </div>
                <p className="text-white/70 leading-relaxed">{exercise.modification}</p>
              </div>
            )}

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-orange-300 mb-1">DOSAGE</h3>
              <p className="text-white/80">{exercise.dosage}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}