import React, { useEffect } from "react";
import { Play, Pause, RotateCcw, Wind, Waves, Shell, Moon, Sun, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTimer } from "../lib/TimerContext";
import { getDailyDefaults } from "../../hooks/useDailyDefaults";
import { DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES } from "../../constants";

const FOCUS_SOUNDS = [
  { id: "40hz-wind", label: "Wind", icon: Wind },
  { id: "40hz-ocean", label: "Ocean", icon: Waves },
];

const RELAX_SOUNDS = [
  { id: "10hz-binaural-ocean", label: "Ocean", icon: Waves },
  { id: "10hz-binaural-wind", label: "Wind", icon: Shell },
];

export default function FlowCard({ session, onSessionComplete, onSoundChange }) {
  const {
    timeLeft, isRunning, isBreak, toggleTimer, resetTimer, initializeTimer,
    setFocusSoundId, setRelaxSoundId, focusSoundId, relaxSoundId,
    mode, relaxTime, relaxPaused, switchToRelax, switchToFocus, toggleRelaxPause,
    extendFocus,
  } = useTimer();

  const userDuration = (() => {
    const defaults = getDailyDefaults();
    return {
      work: defaults.focus_work_minutes || DEFAULT_WORK_MINUTES,
      break: defaults.focus_break_minutes || DEFAULT_BREAK_MINUTES,
    };
  })();

  const sessionWorkMinutes = session?.focus_work_minutes || userDuration.work;
  const sessionBreakMinutes = session?.focus_break_minutes || userDuration.break;

  useEffect(() => {
    initializeTimer(sessionWorkMinutes, sessionBreakMinutes, onSessionComplete);
  }, [sessionWorkMinutes, sessionBreakMinutes, onSessionComplete, initializeTimer]);

  useEffect(() => {
    if (session?.focus_sound) setFocusSoundId(session.focus_sound);
  }, [session?.focus_sound, setFocusSoundId]);

  useEffect(() => {
    if (session?.relax_sound) setRelaxSoundId(session.relax_sound);
  }, [session?.relax_sound, setRelaxSoundId]);

  const isRelaxMode = mode === "relax";

  // Timer display
  const displayTime = isRelaxMode ? relaxTime : timeLeft;
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  // Sound cycling — within current category only
  const currentSounds = isRelaxMode ? RELAX_SOUNDS : FOCUS_SOUNDS;
  const currentSoundId = isRelaxMode ? (session?.relax_sound || relaxSoundId) : (session?.focus_sound || focusSoundId);
  const activeSoundObj = currentSounds.find(s => s.id === currentSoundId) || currentSounds[0];

  const handleCycleSound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || !onSoundChange) return;

    const currentIndex = currentSounds.findIndex(s => s.id === currentSoundId);
    const nextIndex = (currentIndex + 1) % currentSounds.length;
    const nextSound = currentSounds[nextIndex];

    if (isRelaxMode) {
      onSoundChange({ relax_sound: nextSound.id });
      setRelaxSoundId(nextSound.id);
    } else {
      onSoundChange({ focus_sound: nextSound.id });
      setFocusSoundId(nextSound.id);
    }
  };

  const handleModeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRelaxMode) {
      switchToFocus();
    } else {
      switchToRelax();
    }
  };

  const SoundIcon = activeSoundObj.icon;
  const soundLabel = isRelaxMode
    ? `Relax: ${activeSoundObj.label}`
    : `Focus: ${activeSoundObj.label}`;

  const accentColor = isRelaxMode ? "cyan" : "violet";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden h-full p-5 flex flex-col"
      role="region"
      aria-label="Focus timer"
    >
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${isRelaxMode ? "bg-cyan-500/20" : "bg-violet-500/20"} flex items-center justify-center`}>
            {isRelaxMode
              ? <Moon className="w-3 h-3 text-cyan-400" />
              : <Play className="w-3 h-3 text-violet-400" />
            }
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${isRelaxMode ? "text-cyan-400" : "text-violet-400"}`}>
            {isRelaxMode ? "Relax" : "Flow"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isBreak && !isRelaxMode && (
            <span className="text-[9px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-medium">
              BREAK
            </span>
          )}
          {session && (
            <button
              onClick={handleModeToggle}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors ${
                isRelaxMode
                  ? "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
                  : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
              }`}
              aria-label={isRelaxMode ? "Switch to focus" : "Switch to relax"}
            >
              {isRelaxMode ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
              {isRelaxMode ? "Focus" : "Relax"}
            </button>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center py-3">
        <div className="text-3xl font-bold text-white tabular-nums tracking-tight" aria-live="polite" aria-atomic="true">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className={`text-[10px] uppercase tracking-wider mt-1 ${isRelaxMode ? "text-cyan-400/50" : "text-white/30"}`}>
          {isRelaxMode ? "Relaxing" : isBreak ? "Break" : "Focus"}
        </div>

        {/* Extend-focus escape hatch: only during break phase, lets the user
            abandon the break and jump back into a fresh 15-min focus block
            when they feel they're in the middle of something important. */}
        {isBreak && !isRelaxMode && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              extendFocus(15);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-medium transition-colors"
            aria-label="Skip break and extend focus by 15 minutes"
          >
            <Plus className="w-2.5 h-2.5" />
            +15 min focus
          </button>
        )}
      </div>

      {/* Controls + Sound */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isRelaxMode) {
                toggleRelaxPause();
              } else {
                toggleTimer();
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={`w-7 h-7 rounded-full ${isRelaxMode ? "bg-cyan-600 hover:bg-cyan-500" : "bg-violet-600 hover:bg-violet-500"} flex items-center justify-center transition-colors`}
            aria-label={isRelaxMode ? (relaxPaused ? "Resume relax" : "Pause relax") : (isRunning ? "Pause timer" : "Start timer")}
          >
            {(isRelaxMode ? !relaxPaused : isRunning)
              ? <Pause className="w-3 h-3 text-white" />
              : <Play className="w-3 h-3 text-white ml-0.5" />
            }
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetTimer(); }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-3 h-3 text-white/30" />
          </button>
        </div>
        {session && (
          <button
            onClick={handleCycleSound}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={`Sound: ${soundLabel}. Tap to switch.`}
          >
            <SoundIcon className="w-3 h-3 text-white/25" />
            <span className="text-[9px] text-white/25">{soundLabel}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
