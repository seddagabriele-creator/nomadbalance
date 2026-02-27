import React, { useState, useEffect } from "react";
import { Droplets, Utensils, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ONE_MINUTE_MS } from "../../constants";

function getSmartFuelStatus(session) {
  if (!session) {
    return { label: "No data", detail: "Start your day", icon: "clock", extra: null };
  }

  if (!session.eating_window_start || !session.eating_window_end) {
    const preset = session.fasting_preset || "16/8";
    return { label: "Fasting", detail: "Window not set", icon: "droplets", extra: `${preset} protocol` };
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

  if (nowMinutes < startMin) {
    const remaining = startMin - nowMinutes;
    return {
      icon: "droplets",
      label: "Fasting",
      detail: `Window opens in ${fmtRemaining(remaining)}`,
      extra: `${mealsTarget} meals planned`,
    };
  } else if (nowMinutes < endMin) {
    if (mealsLeft > 0) {
      const windowRemaining = endMin - nowMinutes;
      return {
        icon: "utensils",
        label: `${mealsLogged.length}/${mealsTarget} meals`,
        detail: `${fmtRemaining(windowRemaining)} left`,
        extra: `${mealsLeft} meal${mealsLeft > 1 ? "s" : ""} to go`,
      };
    }

    const windowRemaining = endMin - nowMinutes;
    return {
      icon: "check",
      label: "All meals done",
      detail: `Window: ${fmtRemaining(windowRemaining)} left`,
      extra: null,
    };
  } else {
    return {
      icon: "droplets",
      label: "Fasting",
      detail: `Window closed`,
      extra: `${mealsLogged.length}/${mealsTarget} meals today`,
    };
  }
}

export default function FuelCard({ session }) {
  const [status, setStatus] = useState(() => getSmartFuelStatus(session));

  useEffect(() => {
    setStatus(getSmartFuelStatus(session));
    const interval = setInterval(() => setStatus(getSmartFuelStatus(session)), ONE_MINUTE_MS);
    return () => clearInterval(interval);
  }, [session]);

  const IconComp =
    status.icon === "utensils"
      ? Utensils
      : status.icon === "droplets"
        ? Droplets
        : status.icon === "check"
          ? CheckCircle
          : Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 flex flex-col justify-between h-full"
      role="region"
      aria-label="Fuel status"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full -translate-y-6 translate-x-6" />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Droplets className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Fuel</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <IconComp className="w-5 h-5 text-white/70" />
          <p className="text-white font-semibold text-sm">{status.label}</p>
        </div>
        <p className="text-white/50 text-xs pl-7">{status.detail}</p>
        {status.extra && (
          <p className="text-emerald-400/50 text-[10px] pl-7 mt-1">{status.extra}</p>
        )}
      </div>
    </motion.div>
  );
}
