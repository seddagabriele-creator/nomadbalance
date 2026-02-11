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

    const now = new Date();
    const [lh, lm] = session.last_meal_time.split(":").map(Number);
    const lastMeal = new Date();
    lastMeal.setHours(lh, lm, 0, 0);

    const diffMs = now - lastMeal;
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);

    if (session.next_meal_time) {
      const [nh, nm] = session.next_meal_time.split(":").map(Number);
      const nextMeal = new Date();
      nextMeal.setHours(nh, nm, 0, 0);
      const untilNext = nextMeal - now;

      if (untilNext > 0) {
        const untilH = Math.floor(untilNext / 3600000);
        const untilM = Math.floor((untilNext % 3600000) / 60000);
        setFuelStatus({
          label: `Fasting ${diffH}h ${diffM}m`,
          detail: `Next meal in ${untilH}h ${untilM}m`,
          icon: "droplets",
        });
      } else {
        setFuelStatus({
          label: "Time to eat!",
          detail: `Fasted: ${diffH}h ${diffM}m`,
          icon: "utensils",
        });
      }
    } else {
      setFuelStatus({
        label: `Last meal ${diffH}h ago`,
        detail: "No meal scheduled",
        icon: "clock",
      });
    }
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