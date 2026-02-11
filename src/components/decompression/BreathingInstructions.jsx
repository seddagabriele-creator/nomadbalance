import React from "react";
import { motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BreathingInstructions({ technique, onClose }) {
  const is478 = technique === "4-7-8";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-white font-bold text-lg">
              {is478 ? "4-7-8 Technique" : "Box Breathing"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Preparation */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-cyan-400 font-semibold mb-3 text-sm">Preparation</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-cyan-400">•</span>
                <span>Sit with your back straight</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">•</span>
                <span>Place your tongue tip against the roof of your mouth, just behind your upper front teeth (keep it there throughout)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">•</span>
                <span>Exhale completely through your mouth making a "whoosh" sound</span>
              </li>
            </ul>
          </div>

          {/* Technique */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-cyan-400 font-semibold mb-3 text-sm">The Cycle</h3>
            {is478 ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Breathe In</p>
                    <p className="text-white/60 text-xs mt-1">Close your mouth and inhale silently through your nose counting to 4</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold shrink-0">
                    7
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Hold</p>
                    <p className="text-white/60 text-xs mt-1">Hold your breath counting to 7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold shrink-0">
                    8
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Breathe Out</p>
                    <p className="text-white/60 text-xs mt-1">Exhale completely through your mouth making a "whoosh" sound, counting to 8</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Breathe In</p>
                    <p className="text-white/60 text-xs mt-1">Through your nose, slowly filling your belly, counting to 4</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Hold</p>
                    <p className="text-white/60 text-xs mt-1">Keep your lungs full, counting to 4</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Breathe Out</p>
                    <p className="text-white/60 text-xs mt-1">Through your mouth or nose, emptying everything, counting to 4</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Pause</p>
                    <p className="text-white/60 text-xs mt-1">Keep your lungs empty, counting to 4</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <h3 className="text-amber-400 font-semibold mb-2 text-sm">Important Tips</h3>
            <ul className="space-y-2 text-xs text-white/60">
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>Don't force it - if you can't hold for the full count, reduce the times while keeping the ratio</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>Feeling lightheaded the first few times is normal - stop and breathe normally if needed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>The exhalation should be longer than the inhalation for maximum calm</span>
              </li>
            </ul>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full h-12 mt-6 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400"
        >
          Start Session
        </Button>
      </motion.div>
    </motion.div>
  );
}