import React, { useState, useEffect } from "react";
import { Droplets, Utensils, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getDailyDefaults } from "../../hooks/useDailyDefaults";
import { DEFAULT_FASTING_HOURS, ONE_MINUTE_MS, ONE_HOUR_MS } from "../../constants";

const FASTING_HOURS_MAP = {
  "14/10": 14,
  "16/8": 16,
  "18/6": 18,
};

function getFastingHours() {
  const defaults = getDailyDefaults();
  if (defaults.fasting_preset === "custom") {
    return defaults.custom_fasting_hours || DEFAULT_FASTING_HOURS;
  }
  return FASTING_HOURS_MAP[defaults.fasting_preset] || DEFAULT_FASTING_HOURS;
}

export default function FuelCard({ session }) {
  const [fuelStatus, setFuelStatus] = useState({ label: "", detail: "", icon: "droplets" });

  useEffect(() => {
    if (!session || !session.last_meal_time) {
      setFuelStatus({ label: "No data", detail: "Start your day", icon: "clock" });
      return;
    }

    const updateStatus = () => {
      const now = new Date();
      const [lh, lm] = session.last_meal_time.split(":").map(Number);
      const lastMeal = new Date();
      lastMeal.setHours(lh, lm, 0, 0);

      const fastingHours = getFastingHours();
      const nextMeal = new Date(lastMeal.getTime() + fastingHours * ONE_HOUR_MS);
      const untilNext = nextMeal - now;

      if (untilNext > 0) {
        const untilH = Math.floor(untilNext / ONE_HOUR_MS);
        const untilM = Math.floor((untilNext % ONE_HOUR_MS) / ONE_MINUTE_MS);
        setFuelStatus({
          label: "Fasting window active",
          detail: `${untilH}h ${untilM}m until next meal`,
          icon: "droplets",
        });
      } else {
        setFuelStatus({
          label: "Eating window open",
          detail: "Nourish your body with real, healthy food",
          icon: "utensils",
        });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, ONE_MINUTE_MS);
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
      aria-label="Fasting status"
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
