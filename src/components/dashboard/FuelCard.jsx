import React, { useState, useEffect } from "react";
import { Droplets, Utensils, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ONE_MINUTE_MS } from "../../constants";

function getWindowStatus(session) {
  if (!session?.eating_window_start || !session?.eating_window_end) {
    return { label: "No data", detail: "Start your day", icon: "clock" };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = session.eating_window_start.split(":").map(Number);
  const [eh, em] = session.eating_window_end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  const mealsLogged = (session.meals_logged || []).length;
  const maxMeals = session.max_meals || 3;

  if (nowMinutes < startMin) {
    // Fasting - before eating window
    const remaining = startMin - nowMinutes;
    const rH = Math.floor(remaining / 60);
    const rM = remaining % 60;
    return {
      label: "Fasting",
      detail: `Window opens in ${rH}h ${rM}m`,
      icon: "droplets",
    };
  } else if (nowMinutes < endMin) {
    // Eating window open
    const remaining = endMin - nowMinutes;
    const rH = Math.floor(remaining / 60);
    const rM = remaining % 60;
    return {
      label: `Eating window`,
      detail: `${mealsLogged}/${maxMeals} meals \u00b7 closes in ${rH}h ${rM}m`,
      icon: "utensils",
    };
  } else {
    // Fasting - after eating window
    return {
      label: "Fasting",
      detail: `Window opens tomorrow at ${session.eating_window_start}`,
      icon: "droplets",
    };
  }
}

export default function FuelCard({ session }) {
  const [fuelStatus, setFuelStatus] = useState(() => getWindowStatus(session));

  useEffect(() => {
    setFuelStatus(getWindowStatus(session));
    const interval = setInterval(() => setFuelStatus(getWindowStatus(session)), ONE_MINUTE_MS);
    return () => clearInterval(interval);
  }, [session]);

  const IconComp = fuelStatus.icon === "utensils" ? Utensils : fuelStatus.icon === "droplets" ? Droplets : Clock;

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
          <p className="text-white font-semibold text-sm">{fuelStatus.label}</p>
        </div>
        <p className="text-white/50 text-xs pl-7">{fuelStatus.detail}</p>
      </div>
    </motion.div>
  );
}
