import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Droplets, Timer, Activity, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const STEPS = [
  { key: "fuel", label: "Fuel Check", icon: Droplets, color: "emerald" },
  { key: "focus", label: "Focus Rhythm", icon: Timer, color: "violet" },
  { key: "body", label: "Body Pledge", icon: Activity, color: "orange" },
];

const PRESETS = [
  { label: "45 / 5", work: 45, rest: 5 },
  { label: "50 / 10", work: 50, rest: 10 },
  { label: "Custom", work: null, rest: null },
];

export default function StartDayWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    last_meal_time: "",
    next_meal_time: "",
    focus_work_minutes: 45,
    focus_break_minutes: 5,
    body_breaks_target: 4,
    daily_goal: "",
  });
  const [selectedPreset, setSelectedPreset] = useState(0);

  const currentStep = STEPS[step];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onCancel();
  };

  const selectPreset = (idx) => {
    setSelectedPreset(idx);
    if (PRESETS[idx].work !== null) {
      setData({ ...data, focus_work_minutes: PRESETS[idx].work, focus_break_minutes: PRESETS[idx].rest });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
      >
        {/* Progress */}
        <div className="flex gap-2 p-6 pb-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  i <= step ? "bg-gradient-to-r from-violet-500 to-cyan-400" : ""
                }`}
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${currentStep.color}-500/20 flex items-center justify-center`}>
              <currentStep.icon className={`w-5 h-5 text-${currentStep.color}-400`} />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">Step {step + 1}/3</p>
              <h2 className="text-white font-bold text-lg">{currentStep.label}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[240px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="fuel" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Quando hai fatto l'ultimo pasto?</Label>
                  <Input
                    type="time"
                    value={data.last_meal_time}
                    onChange={(e) => setData({ ...data, last_meal_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Quando vuoi che sia il prossimo?</Label>
                  <Input
                    type="time"
                    value={data.next_meal_time}
                    onChange={(e) => setData({ ...data, next_meal_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Obiettivo di oggi
                  </Label>
                  <Input
                    placeholder="Es. Completare Progetto X"
                    value={data.daily_goal}
                    onChange={(e) => setData({ ...data, daily_goal: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="focus" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                <p className="text-white/50 text-sm">Scegli il tuo ritmo di lavoro/pausa</p>
                <div className="flex gap-3">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => selectPreset(i)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        selectedPreset === i
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {selectedPreset === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Lavoro: {data.focus_work_minutes} min</Label>
                      <Slider
                        value={[data.focus_work_minutes]}
                        onValueChange={([v]) => setData({ ...data, focus_work_minutes: v })}
                        min={15}
                        max={90}
                        step={5}
                        className="py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Pausa: {data.focus_break_minutes} min</Label>
                      <Slider
                        value={[data.focus_break_minutes]}
                        onValueChange={([v]) => setData({ ...data, focus_break_minutes: v })}
                        min={3}
                        max={20}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  </div>
                )}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Il tuo ritmo</p>
                  <p className="text-white font-semibold">{data.focus_work_minutes} min focus → {data.focus_break_minutes} min pausa</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="body" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                <p className="text-white/50 text-sm">Quante pause attive vuoi fare oggi?</p>
                <div className="flex justify-center gap-4 py-4">
                  {[2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => setData({ ...data, body_breaks_target: n })}
                      className={`w-14 h-14 rounded-2xl border text-lg font-bold transition-all ${
                        data.body_breaks_target === n
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/40 text-xs mb-1">Piano</p>
                  <p className="text-white font-semibold">
                    {data.body_breaks_target} pause attive durante la giornata
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Circa 1 ogni {Math.round((8 * 60) / data.body_breaks_target)} minuti
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 0 ? "Annulla" : "Indietro"}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold"
          >
            {step === 2 ? "Inizia!" : "Avanti"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}