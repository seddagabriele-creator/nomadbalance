import React, { useMemo } from "react";
import { Activity, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const EXERCISES = [
  "Retrazione Cervicale",
  "Stretching Spalle",
  "Rotazione Anche",
  "Flessione Polsi",
  "Estensione Colonna",
  "Stretching Pettorali",
  "Mobilità Caviglie",
  "Allungamento Flessori Anca",
  "Rotazione Collo",
  "Squat Leggero",
];

export default function BodyCard({ session }) {
  const breaksDone = session?.body_breaks_done || 0;
  const breaksTarget = session?.body_breaks_target || 4;
  const nextExercise = EXERCISES[breaksDone % EXERCISES.length];
  const progressPercent = breaksTarget > 0 ? (breaksDone / breaksTarget) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 flex flex-col justify-between min-h-[180px]"
    >
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-400/10 rounded-full translate-y-6 -translate-x-6" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Activity className="w-4 h-4 text-orange-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">Body</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-white/50 text-xs mb-1">Next break</p>
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-orange-400" />
          <p className="text-white font-semibold text-sm">{nextExercise}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Progress</span>
          <span className="text-xs text-white/60 font-medium">{breaksDone}/{breaksTarget}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
}