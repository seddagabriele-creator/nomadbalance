import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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
  const isRunningRef = useRef(false);
  const onSessionCompleteRef = useRef(null);
  const workMinutesRef = useRef(workMinutes);
  const breakMinutesRef = useRef(breakMinutes);
  const isBreakRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);
  useEffect(() => { workMinutesRef.current = workMinutes; }, [workMinutes]);
  useEffect(() => { breakMinutesRef.current = breakMinutes; }, [breakMinutes]);
  useEffect(() => { isBreakRef.current = isBreak; }, [isBreak]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (!isBreakRef.current) {
              onSessionCompleteRef.current?.();
              setIsBreak(true);
              setIsRunning(true);
              audioManager.pause();
              return breakMinutesRef.current * 60;
            } else {
              setIsBreak(false);
              setIsRunning(false);
              return workMinutesRef.current * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

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

  const initializeTimer = useCallback((work, breakTime, callback) => {
    setWorkMinutes(work);
    setBreakMinutes(breakTime);
    if (callback) setOnSessionComplete(() => callback);

    if (!isRunningRef.current) {
      setTimeLeft(work * 60);
    }
  }, []);

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