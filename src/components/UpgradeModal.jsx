import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BarChart3, Mic, Music, CalendarDays, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/SubscriptionContext";

const PRO_FEATURES = [
  { icon: BarChart3, label: "Full Reports", desc: "Weekly trends, badges, personal records" },
  { icon: CalendarDays, label: "Task history", desc: "Unlimited history with calendar view" },
  { icon: Mic, label: "AI voice assistant", desc: "Natural-language commands powered by Claude" },
  { icon: Music, label: "Full audio library", desc: "All binaural focus & relax soundscapes" },
];

export default function UpgradeModal() {
  const { showUpgradeModal, closeUpgrade, purchase, purchasing, trialActive, trialDaysLeft } = useSubscription();
  const [period, setPeriod] = useState("annual");

  const handlePurchase = async () => {
    try {
      const ok = await purchase(period);
      if (ok) toast.success("Welcome to NomadBalance Pro! 🎉");
    } catch (err) {
      // User closing the checkout isn't an error worth shouting about
      if (!/cancel/i.test(err?.message || "")) {
        console.error("[Upgrade] purchase error:", err);
        toast.error(err?.message || "Purchase failed. Please try again.");
      }
    }
  };

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[96] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeUpgrade}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-violet-950/40 backdrop-blur-xl rounded-3xl border border-violet-500/25 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/40 to-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">NomadBalance Pro</h2>
                  <p className="text-xs text-white/40">Your memory + your AI copilot</p>
                </div>
              </div>
              <button onClick={closeUpgrade} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {trialActive && (
              <div className="mt-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 px-3 py-2 text-xs text-cyan-300">
                You're on the free trial — {trialDaysLeft} day{trialDaysLeft > 1 ? "s" : ""} of Pro left. Subscribe to keep everything.
              </div>
            )}

            <div className="mt-4 space-y-2.5">
              {PRO_FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                    <p className="text-[11px] text-white/40">{desc}</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0 mt-1" />
                </div>
              ))}
            </div>

            {/* Plan selector */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPeriod("annual")}
                className={`relative rounded-2xl border p-3 text-left transition-all ${
                  period === "annual"
                    ? "bg-violet-500/20 border-violet-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="absolute -top-2 right-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-white">
                  SAVE 50%
                </span>
                <p className="text-white font-bold text-base">$24<span className="text-xs font-normal text-white/40">/year</span></p>
                <p className="text-[10px] text-white/40">$2 per month</p>
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  period === "monthly"
                    ? "bg-violet-500/20 border-violet-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <p className="text-white font-bold text-base">$4<span className="text-xs font-normal text-white/40">/month</span></p>
                <p className="text-[10px] text-white/40">Cancel anytime</p>
              </button>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={purchasing}
              className="mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-semibold disabled:opacity-60"
            >
              {purchasing ? "Opening checkout…" : "Upgrade to Pro"}
            </Button>
            <p className="mt-2 text-center text-[10px] text-white/30">
              Secure payment · Cancel anytime · Instant access
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
