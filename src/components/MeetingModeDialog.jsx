import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Wind, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeetingModeDialog({ onConfirm, onCancel }) {
  const [breathingMinutes, setBreathingMinutes] = useState(3);
  const [showBreathing, setShowBreathing] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Meeting Mode</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
            </Button>
            </div>

            <div className="space-y-4">
            <p className="text-white/70 text-sm">Would you like a breathing session before the meeting?</p>

            <div className="space-y-3">
            <button
              onClick={() => setShowBreathing(true)}
              className={`w-full p-4 rounded-xl border transition-all ${
                showBreathing
                  ? "bg-cyan-500/20 border-cyan-500/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-cyan-400" />
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">Yes, breathe first</p>
                  <p className="text-white/40 text-xs">Prepare mentally</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowBreathing(false)}
              className={`w-full p-4 rounded-xl border transition-all ${
                !showBreathing
                  ? "bg-amber-500/20 border-amber-500/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400" />
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">No, enter now</p>
                  <p className="text-white/40 text-xs">Activate meeting mode now</p>
                </div>
              </div>
            </button>
            </div>

            {showBreathing && (
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Breathing session duration</p>
              <div className="flex gap-2">
                {[1, 3, 5].map((min) => (
                  <button
                    key={min}
                    onClick={() => setBreathingMinutes(min)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      breathingMinutes === min
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(showBreathing ? breathingMinutes : 0)}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400"
          >
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}