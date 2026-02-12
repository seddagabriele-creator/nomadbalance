import React, { useState, useEffect } from "react";
import { Droplets, Utensils, Clock } from "lucide-react";
import { motion } from "framer-motion";

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

      // Get fasting target from localStorage or session
      const savedDefaults = localStorage.getItem('dailyDefaults');
      let fastingHours = 16;
      if (savedDefaults) {
        const defaults = JSON.parse(savedDefaults);
        if (defaults.fasting_preset === "14/10") fastingHours = 14;
        else if (defaults.fasting_preset === "16/8") fastingHours = 16;
        else if (defaults.fasting_preset === "18/6") fastingHours = 18;
        else if (defaults.fasting_preset === "custom") fastingHours = defaults.custom_fasting_hours || 16;
      }

      // Calculate next meal time based on fasting target
      const nextMeal = new Date(lastMeal.getTime() + fastingHours * 3600000);
      const untilNext = nextMeal - now;
      const diffMs = now - lastMeal;

      if (untilNext > 0) {
        // Fasting window
        const untilH = Math.floor(untilNext / 3600000);
        const untilM = Math.floor((untilNext % 3600000) / 60000);
        setFuelStatus({
          label: "Fasting window active",
          detail: `${untilH}h ${untilM}m until next meal`,
          icon: "droplets",
        });
      } else {
        // Eating window
        const fastedH = Math.floor(diffMs / 3600000);
        setFuelStatus({
          label: "Eating window open",
          detail: "Nourish your body with real, healthy food",
          icon: "utensils",
        });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [session]);

  const IconComp = fuelStatus.icon === "utensils" ? Utensils : fuelStatus.icon === "droplets" ? Droplets : Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 flex flex-col justify-between h-full"
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