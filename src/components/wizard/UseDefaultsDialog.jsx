import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Settings } from "lucide-react";

export default function UseDefaultsDialog({ onUseDefaults, onManualSetup, onCancel }) {
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
        className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Start Your Day</h2>
        </div>
        
        <p className="text-white/70 mb-6">
          Would you like to use your saved default settings for today?
        </p>

        <div className="space-y-3">
          <Button
            onClick={onUseDefaults}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold"
          >
            <Zap className="w-4 h-4 mr-2" />
            Yes, use my defaults
          </Button>
          
          <Button
            variant="outline"
            onClick={onManualSetup}
            className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            No, customize today
          </Button>

          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}