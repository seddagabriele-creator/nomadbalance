import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const SOUND_URL = "https://drive.google.com/uc?export=download&id=1MPfMRcZVDFE7jMIbz8y_oFrn0Oi_EADw";

export default function FlowCard({ session, onSessionComplete }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const workMinutes = session?.focus_work_minutes || 45;
  const breakMinutes = session?.focus_break_minutes || 5;
  const totalSeconds = isBreak ? breakMinutes * 60 : workMinutes * 60;

  useEffect(() => {
    if (session?.status === "active" && !isRunning && timeLeft === 0) {
      setTimeLeft(workMinutes * 60);
    }
  }, [session]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (!isBreak) {
              onSessionComplete?.();
              setIsBreak(true);
              setIsRunning(true);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              return breakMinutes * 60;
            } else {
              setIsBreak(false);
              setIsRunning(false);
              return workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak]);

  useEffect(() => {
    if (isRunning && !isBreak) {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.7;
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Audio play failed:", err);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isRunning, isBreak]);

  const toggleTimer = () => {
    if (session?.status !== "active") return;
    if (timeLeft === 0) setTimeLeft(workMinutes * 60);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    clearInterval(intervalRef.current);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 flex flex-col items-center justify-between h-full cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-24 h-24 bg-violet-400/10 rounded-full -translate-y-6 -translate-x-6" />
      <div className="flex items-center gap-2 mb-2 self-start">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Flow</span>
        {isBreak && (
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
            BREAK
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-center flex-1">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
          <circle
            cx="40" cy="40" r="34"
            stroke={isBreak ? "#f59e0b" : "#8b5cf6"}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTimer();
          }}
          disabled={session?.status !== "active"}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-30"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetTimer();
          }}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>
    </motion.div>
  );
}