import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Settings, Sun, Droplets, Headphones,
  ClipboardList, Dumbbell, Rocket, ChevronRight, ChevronLeft, Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Compass,
    color: "violet",
    title: "Welcome to NomadBalance",
    body: "Your daily companion for a better workday. Whether you're in the office, working from home, at a coworking space, or a coffee shop halfway across the world — this app helps you stay focused, build healthy habits, and actually take care of yourself while getting things done.",
    hint: null,
  },
  {
    icon: Settings,
    color: "cyan",
    title: "Set Up Your Routine",
    body: "Start in Settings to define your work schedule — morning and afternoon blocks, plus your preferences. These become your daily defaults, so you can start each day in seconds without re-configuring everything.",
    hint: "Settings > Default Work Hours & Daily Defaults",
  },
  {
    icon: Sun,
    color: "amber",
    title: "Start Your Day",
    body: "Each morning, hit Start Day. If you've saved defaults, you'll get a quick-start option. Otherwise, the wizard walks you through everything — goals, eating window, focus rhythm, and exercise plan. On unusual days, customize anything from scratch.",
    hint: "Dashboard > Start Day",
  },
  {
    icon: Droplets,
    color: "emerald",
    title: "Fuel — Eat Smart, Think Less",
    body: "Set your eating window and the app handles the rest. It knows your lunch break and when you finish work, so it tells you exactly when your next meal is. No more clock-watching or food anxiety — just a simple system that keeps you fueled without overthinking it.",
    hint: "2 main meals auto-planned + snacks based on your schedule",
  },
  {
    icon: Headphones,
    color: "indigo",
    title: "Flow — Your Focus Zone",
    body: "Work in focused blocks with ambient audio that helps you get in the zone. Structured work and break cycles keep your mind sharp throughout the day. Find your rhythm — whether that's 45/5, 50/10, or something custom.",
    hint: "Tap to start a focus session, audio plays automatically",
  },
  {
    icon: ClipboardList,
    color: "sky",
    title: "Journal — Stay on Track",
    body: "Add your daily priorities each morning and check them off as you go. Keep it simple with a quick to-do list, or set specific time slots. Your tasks stay visible on the dashboard so you always know what's next.",
    hint: "Drag to reorder, tap to complete",
  },
  {
    icon: Dumbbell,
    color: "orange",
    title: "Body — Move, Don't Rust",
    body: "Hours at a desk take a real toll. The app schedules short exercise breaks throughout your day — quick movements designed for desk workers that help your posture, relieve tension, and keep your body from filing a complaint. When it's time, you'll get a notification with exactly what to do.",
    hint: "Exercises auto-selected for variety across muscle groups",
  },
  {
    icon: Coffee,
    color: "cyan",
    title: "At Desk — Smart Pauses",
    body: "Use the 'At Desk' toggle on your dashboard to tell the app when you step away — for a coffee, a meeting, or just a walk. This pauses break reminders while you're gone, and the app picks up right where you left off when you return. It also auto-detects when you close the tab, so you won't come back to a pile of missed notifications.",
    hint: "Toggle it from the dashboard — your breaks adapt to your real schedule",
  },
  {
    icon: Rocket,
    color: "rose",
    title: "You're All Set",
    body: "That's it. NomadBalance works best when you let it guide your day — start in the morning, follow the rhythm, and let the small habits add up. Your future self will thank you.",
    hint: null,
  },
];

const COLOR_MAP = {
  violet: { bg: "from-violet-600/20 to-violet-500/5", icon: "bg-violet-500/20", text: "text-violet-400", dot: "bg-violet-400" },
  cyan: { bg: "from-cyan-600/20 to-cyan-500/5", icon: "bg-cyan-500/20", text: "text-cyan-400", dot: "bg-cyan-400" },
  amber: { bg: "from-amber-600/20 to-amber-500/5", icon: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  emerald: { bg: "from-emerald-600/20 to-emerald-500/5", icon: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  indigo: { bg: "from-indigo-600/20 to-indigo-500/5", icon: "bg-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-400" },
  sky: { bg: "from-sky-600/20 to-sky-500/5", icon: "bg-sky-500/20", text: "text-sky-400", dot: "bg-sky-400" },
  orange: { bg: "from-orange-600/20 to-orange-500/5", icon: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  rose: { bg: "from-rose-600/20 to-rose-500/5", icon: "bg-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
};

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const current = STEPS[step];
  const colors = COLOR_MAP[current.color];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (isFirst) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4"
    >
      {/* Background orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className={`w-20 h-20 rounded-3xl ${colors.icon} flex items-center justify-center mb-8`}>
              <Icon className={`w-10 h-10 ${colors.text}`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              {current.title}
            </h2>

            {/* Body */}
            <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-sm">
              {current.body}
            </p>

            {/* Hint */}
            {current.hint && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colors.bg} border border-white/10`}>
                <p className={`text-xs font-medium ${colors.text}`}>{current.hint}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex flex-col items-center gap-4">
          {/* Buttons */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            {!isFirst && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={goNext}
              className={`flex-1 h-12 rounded-2xl font-semibold text-base ${
                isLast
                  ? "bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              }`}
            >
              {isLast ? "Let's Go!" : "Next"}
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                className={`transition-all duration-300 rounded-full ${
                  i === step
                    ? `w-6 h-2 ${colors.dot}`
                    : i < step
                      ? "w-2 h-2 bg-white/30"
                      : "w-2 h-2 bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onComplete}
              className="text-white/20 text-xs hover:text-white/40 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
