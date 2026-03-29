import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioManager } from "./audioManager";
import { DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, ONE_SECOND_MS, getAudioUrl } from "../../constants";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [onSessionComplete, setOnSessionComplete] = useState(null);
  const [focusSoundId, setFocusSoundId] = useState("40hz-wind");
  const [relaxSoundId, setRelaxSoundId] = useState("10hz-binaural-ocean");

  // Relax mode: user manually switches to relax mid-focus
  const [mode, setMode] = useState("focus"); // "focus" | "relax"
  const [relaxTime, setRelaxTime] = useState(0); // counts up in relax mode
  const [relaxPaused, setRelaxPaused] = useState(false);
  const savedFocusTimeRef = useRef(0);
  const savedFocusRunningRef = useRef(false);
  const savedFocusBreakRef = useRef(false);

  const intervalRef = useRef(null);
  const relaxIntervalRef = useRef(null);
  const isRunningRef = useRef(false);
  const onSessionCompleteRef = useRef(null);
  const workMinutesRef = useRef(workMinutes);
  const breakMinutesRef = useRef(breakMinutes);
  const isBreakRef = useRef(false);
  const timeLeftRef = useRef(0);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);
  useEffect(() => { workMinutesRef.current = workMinutes; }, [workMinutes]);
  useEffect(() => { breakMinutesRef.current = breakMinutes; }, [breakMinutes]);
  useEffect(() => { isBreakRef.current = isBreak; }, [isBreak]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // Focus timer interval
  useEffect(() => {
    if (!isRunning || mode !== "focus") return;
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
    }, ONE_SECOND_MS);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  // Relax timer interval (counts up)
  useEffect(() => {
    if (mode !== "relax" || relaxPaused) return;
    relaxIntervalRef.current = setInterval(() => {
      setRelaxTime((prev) => prev + 1);
    }, ONE_SECOND_MS);
    return () => clearInterval(relaxIntervalRef.current);
  }, [mode, relaxPaused]);

  // Audio control
  useEffect(() => {
    if (mode === "relax" && !relaxPaused) {
      const url = getAudioUrl(relaxSoundId);
      if (url) audioManager.play(url);
    } else if (mode === "relax" && relaxPaused) {
      audioManager.pause();
    } else if (isRunning && !isBreak) {
      const url = getAudioUrl(focusSoundId);
      if (url) audioManager.play(url);
    } else {
      audioManager.pause();
    }
  }, [isRunning, isBreak, focusSoundId, relaxSoundId, mode, relaxPaused]);

  const toggleTimer = () => {
    if (mode === "relax") return; // In relax mode, use switchToFocus instead
    if (timeLeft === 0) {
      setTimeLeft(workMinutes * 60);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    if (mode === "relax") {
      // Reset back to focus mode
      switchToFocus();
      return;
    }
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    audioManager.pause();
    clearInterval(intervalRef.current);
  };

  const initializeTimer = useCallback((work, breakTime, callback) => {
    const prevWork = workMinutesRef.current;
    setWorkMinutes(work);
    setBreakMinutes(breakTime);
    if (callback) setOnSessionComplete(() => callback);

    if (timeLeftRef.current === 0 || (!isRunningRef.current && prevWork !== work)) {
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

  const toggleRelaxPause = useCallback(() => {
    setRelaxPaused((prev) => !prev);
  }, []);

  // Switch to relax mode: freeze focus timer, start relax
  const switchToRelax = useCallback(() => {
    // Save focus state
    savedFocusTimeRef.current = timeLeftRef.current;
    savedFocusRunningRef.current = isRunningRef.current;
    savedFocusBreakRef.current = isBreakRef.current;

    // Stop focus timer
    setIsRunning(false);
    clearInterval(intervalRef.current);

    // Start relax mode
    setRelaxTime(0);
    setRelaxPaused(false);
    setMode("relax");
  }, []);

  // Switch back to focus mode: restore focus timer
  const switchToFocus = useCallback(() => {
    // Stop relax
    clearInterval(relaxIntervalRef.current);
    setMode("focus");
    setRelaxTime(0);
    setRelaxPaused(false);

    // Restore focus state
    const savedTime = savedFocusTimeRef.current;
    const wasRunning = savedFocusRunningRef.current;
    const wasBreak = savedFocusBreakRef.current;

    if (savedTime > 0) {
      setTimeLeft(savedTime);
      setIsBreak(wasBreak);
      if (wasRunning) {
        setIsRunning(true);
      }
    }
    // If no saved state, audio effect will handle pausing
  }, []);

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
        focusSoundId,
        setFocusSoundId,
        relaxSoundId,
        setRelaxSoundId,
        mode,
        relaxTime,
        relaxPaused,
        switchToRelax,
        switchToFocus,
        toggleRelaxPause,
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
