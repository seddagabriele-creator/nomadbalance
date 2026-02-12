import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { audioManager } from "./audioManager";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [onSessionComplete, setOnSessionComplete] = useState(null);
  const intervalRef = useRef(null);

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
              audioManager.pause();
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
  }, [isRunning, timeLeft, isBreak, workMinutes, breakMinutes, onSessionComplete]);

  useEffect(() => {
    if (isRunning && !isBreak) {
      audioManager.play("https://files.catbox.moe/f0pwi6.mp3");
    } else if (!isRunning) {
      audioManager.pause();
    }
  }, [isRunning, isBreak]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(workMinutes * 60);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    audioManager.pause();
    clearInterval(intervalRef.current);
  };

  const initializeTimer = (work, breakTime, callback) => {
    setWorkMinutes(work);
    setBreakMinutes(breakTime);
    if (callback) setOnSessionComplete(() => callback);
    
    // CHANGE IS HERE: Allow update if timer is simply NOT running (paused/stopped), 
    // instead of only when it is 0.
    if (!isRunning) {
      setTimeLeft(work * 60);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    audioManager.pause();
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isRunning,
        isBreak,
        workMinutes,
        breakMinutes,
        toggleTimer,
        resetTimer,
        initializeTimer,
        pauseTimer,
        resumeTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
}