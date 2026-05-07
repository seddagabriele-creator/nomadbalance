import React, { useState, useEffect } from "react";
import { Droplets, Utensils, Clock, CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { ONE_MINUTE_MS } from "../../constants";

function getSmartFuelStatus(session) {
  if (!session) {
    return { label: "Fasting", detail: "Start your day to begin", icon: "droplets", extra: null, canLogMeal: false };
  }

  if (!session.eating_window_start || !session.eating_window_end) {
    const preset = session.fasting_preset || "16/8";
    return { label: "Fasting", detail: "Window not set", icon: "droplets", extra: `${preset} protocol`, canLogMeal: false };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const startMin = toMin(session.eating_window_start);
  const endMin = toMin(session.eating_window_end);
  const mealsLogged = session.meals_logged || [];
  const mealsTarget = session.max_meals || 3;
  const mealsLeft = Math.max(0, mealsTarget - mealsLogged.length);

  const fmtRemaining = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const crossesMidnight = endMin <= startMin;
  const isEating = crossesMidnight
    ? (nowMinutes >= startMin || nowMinutes < endMin)
    : (nowMinutes >= startMin && nowMinutes < endMin);
  const isBefore = crossesMidnight
    ? (!isEating && nowMinutes < startMin)
    : (nowMinutes < startMin);

  if (isBefore) {
    const remaining = startMin - nowMinutes;
    return { icon: "droplets", label: "Fasting", detail: `Opens in ${fmtRemaining(remaining)}`, extra: `${mealsTarget} meals planned`, canLogMeal: false };
  } else if (isEating) {
    const windowRemaining = crossesMidnight
      ? (nowMinutes >= startMin ? (1440 - nowMinutes + endMin) : (endMin - nowMinutes))
      : (endMin - nowMinutes);
    if (mealsLeft > 0) {
      return { icon: "utensils", label: `${mealsLogged.length}/${mealsTarget} meals`, detail: `${fmtRemaining(windowRemaining)} left`, extra: null, canLogMeal: true };
    }
    return { icon: "check", label: "All meals done", detail: `${fmtRemaining(windowRemaining)} left`, extra: null, canLogMeal: false };
  } else {
    return { icon: "droplets", label: "Fasting", detail: "Window closed", extra: `${mealsLogged.length}/${mealsTarget} meals today`, canLogMeal: false };
  }
}

export default function FuelCard({ session, onLogMeal }) {
  const [status, setStatus] = useState(() => getSmartFuelStatus(session));

  useEffect(() => {
    setStatus(getSmartFuelStatus(session));
    const interval = setInterval(() => { if (!document.hidden) setStatus(getSmartFuelStatus(session)); }, ONE_MINUTE_MS);
    return () => clearInterval(interval);
  }, [session?.eating_window_start, session?.eating_window_end, session?.meals_logged?.length, session?.max_meals]);

  const IconComp =
    status.icon === "utensils" ? Utensils
      : status.icon === "droplets" ? Droplets
        : status.icon === "check" ? CheckCircle
          : Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 flex flex-col h-full"
      role="region"
      aria-label="Fuel status"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-auto">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Droplets className="w-3 h-3 text-emerald-400" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Fuel</span>
      </div>

      {/* Status */}
      <div className="py-3">
        <div className="flex items-center gap-2 mb-0.5">
          <IconComp className="w-4 h-4 text-white/50" />
          <p className="text-white font-semibold text-sm">{status.label}</p>
        </div>
        <p className="text-white/40 text-xs pl-6">{status.detail}</p>
        {status.extra && (
          <p className="text-emerald-400/40 text-[10px] pl-6 mt-0.5">{status.extra}</p>
        )}
      </div>

      {/* Quick action */}
      {status.canLogMeal && onLogMeal && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLogMeal(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">Log Meal</span>
        </button>
      )}
    </motion.div>
  );
}
