import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Coffee, Monitor } from "lucide-react";
import { ONE_SECOND_MS } from "../../constants";

export default function DeskStatusToggle({ isAway, awaySince, onToggle }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Track elapsed away time — only tick when the tab is visible
  useEffect(() => {
    if (isAway && awaySince) {
      const calcElapsed = () => {
        const start = new Date(awaySince).getTime();
        return Math.floor((Date.now() - start) / 1000);
      };
      setElapsedSeconds(calcElapsed());
      intervalRef.current = setInterval(() => {
        if (!document.hidden) setElapsedSeconds(calcElapsed());
      }, ONE_SECOND_MS);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAway, awaySince]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return "just now";
  };

  return (
    <div className="relative flex-1 group">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
        className={`w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isAway
            ? "bg-sky-500/20 border border-sky-500/30 text-sky-300"
            : "bg-white/10 border border-white/10 text-white/70 hover:bg-white/15"
        }`}
      >
        {isAway ? (
          <>
            <Coffee className="w-4 h-4" />
            <span>Away</span>
            <span className="text-sky-400/70 text-xs font-mono ml-1">
              {formatDuration(elapsedSeconds)}
            </span>
          </>
        ) : (
          <>
            <Monitor className="w-4 h-4" />
            <span>At Desk</span>
          </>
        )}
      </motion.button>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl bg-gray-900/95 border border-white/10 px-3 py-2 text-xs text-white/80 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-50">
        {isAway
          ? "Tap to return — exercise timers will resume"
          : "Step away from your desk — exercise timers pause automatically"}
      </div>
    </div>
  );
}
