import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioManager } from "./audioManager";
import { DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, ONE_SECOND_MS, getAudioUrl } from "../../constants";

const TimerContext = createContext();

// localStorage key for persisting timer state across remounts / tab backgrounding
const TIMER_STORAGE_KEY = "nomadbalance:timer-state:v1";

// Load persisted timer state and compute elapsed time since it was saved.
// Returns null if no valid state exists. The timer interval is throttled
// when the tab is backgrounded, so we rely on wall-clock time to stay accurate.
function loadPersistedState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now();
    const elapsedSec = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));

    let timeLeft = typeof parsed.timeLeft === "number" ? parsed.timeLeft : 0;
    let relaxTime = typeof parsed.relaxTime === "number" ? parsed.relaxTime : 0;
    let isRunning = !!parsed.isRunning;
    const isBreak = !!parsed.isBreak;
    const mode = parsed.mode === "relax" ? "relax" : "focus";
    const relaxPaused = !!parsed.relaxPaused;

    // Advance countdown by elapsed time if the timer was running in focus mode
    if (mode === "focus" && isRunning) {
      timeLeft = timeLeft - elapsedSec;
      if (timeLeft <= 0) {
        // Session already completed while the tab was in the background.
        // Reset to a clean idle state — the user will see the timer ready
        // instead of a silent rollover we can't audibly signal now.
        timeLeft = 0;
        isRunning = false;
      }
    }

    // Advance count-up relax timer if it was running
    if (mode === "relax" && !relaxPaused) {
      relaxTime = relaxTime + elapsedSec;
    }

    return {
      timeLeft,
      isRunning,
      isBreak,
      mode,
      relaxTime,
      relaxPaused,
      sessionComplete: !!parsed.sessionComplete,
      savedFocusTime: typeof parsed.savedFocusTime === "number" ? parsed.savedFocusTime : 0,
      savedFocusRunning: !!parsed.savedFocusRunning,
      savedFocusBreak: !!parsed.savedFocusBreak,
    };
  } catch {
    return null;
  }
}

export function TimerProvider({ children }) {
  // Lazy-init from localStorage so a remount (e.g. caused by an auth state
  // change or route switch) restores the active focus session instead of
  // silently losing it.
  const initial = typeof window !== "undefined" ? loadPersistedState() : null;

  const [timeLeft, setTimeLeft] = useState(initial?.timeLeft ?? 0);
  const [isRunning, setIsRunning] = useState(initial?.isRunning ?? false);
  const [isBreak, setIsBreak] = useState(initial?.isBreak ?? false);
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [onSessionComplete, setOnSessionComplete] = useState(null);
  const [focusSoundId, setFocusSoundId] = useState("40hz-wind");
  const [relaxSoundId, setRelaxSoundId] = useState("10hz-binaural-ocean");

  // Relax mode: user manually switches to relax mid-focus
  const [mode, setMode] = useState(initial?.mode ?? "focus"); // "focus" | "relax"
  const [relaxTime, setRelaxTime] = useState(initial?.relaxTime ?? 0); // counts up in relax mode
  const [relaxPaused, setRelaxPaused] = useState(initial?.relaxPaused ?? false);
  const savedFocusTimeRef = useRef(initial?.savedFocusTime ?? 0);
  const savedFocusRunningRef = useRef(initial?.savedFocusRunning ?? false);
  const savedFocusBreakRef = useRef(initial?.savedFocusBreak ?? false);

  // Tracks whether the previous focus+break cycle has just ended. While this
  // is true, initializeTimer must NOT re-arm the timer to workMinutes*60,
  // otherwise an unattended cycle (user in another tab) would look like a
  // "reset" when they come back. Cleared by explicit user action (play/reset).
  const sessionCompleteRef = useRef(initial?.sessionComplete ?? false);

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

  // Persist timer state whenever it changes, so a remount can recover it.
  // We store a wall-clock timestamp (savedAt) to compensate for the fact that
  // setInterval is throttled/paused in background tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        timeLeft,
        isRunning,
        isBreak,
        mode,
        relaxTime,
        relaxPaused,
        sessionComplete: sessionCompleteRef.current,
        savedFocusTime: savedFocusTimeRef.current,
        savedFocusRunning: savedFocusRunningRef.current,
        savedFocusBreak: savedFocusBreakRef.current,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage may be unavailable (private mode, quota). Fail silently.
    }
  }, [timeLeft, isRunning, isBreak, mode, relaxTime, relaxPaused]);

  // When the tab becomes visible again, reconcile the timer against the
  // wall clock. Chrome throttles setInterval in background tabs to ~1/min,
  // so without this the user would see a stale countdown that then "jumps".
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) return;
      const restored = loadPersistedState();
      if (!restored) return;

      if (restored.mode === "focus" && restored.isRunning) {
        setTimeLeft(restored.timeLeft);
        if (restored.timeLeft <= 0) {
          setIsRunning(false);
        }
      } else if (restored.mode === "relax" && !restored.relaxPaused) {
        setRelaxTime(restored.relaxTime);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Focus timer interval
  // NOTE: `isBreak` is in the dep array on purpose. When the focus phase
  // ends we flip isBreak from false → true inside the interval callback
  // and clearInterval() it manually. Without isBreak as a dep, neither
  // isRunning nor mode would change, so this effect would not re-run and
  // the break phase would never get its own interval — the UI would show
  // 5:00 in "running" state but the timer would never tick down.
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
            // End of break: do NOT auto-rearm to workMinutes*60. Stop at 0
            // and mark the cycle as complete so initializeTimer can't
            // bounce it back up. The user explicitly starts the next
            // session by pressing play (handled by toggleTimer).
            sessionCompleteRef.current = true;
            setIsBreak(false);
            setIsRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, ONE_SECOND_MS);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, isBreak]);

  // Relax timer interval (counts up)
  useEffect(() => {
    if (mode !== "relax" || relaxPaused) return;
    relaxIntervalRef.current = setInterval(() => {
      setRelaxTime((prev) => prev + 1);
    }, ONE_SECOND_MS);
    return () => clearInterval(relaxIntervalRef.current);
  }, [mode, relaxPaused]);

  // Audio control — always fall back to a valid sound ID
  useEffect(() => {
    if (mode === "relax" && !relaxPaused) {
      const url = getAudioUrl(relaxSoundId) || getAudioUrl("10hz-binaural-ocean");
      if (url) audioManager.play(url);
    } else if (mode === "relax" && relaxPaused) {
      audioManager.pause();
    } else if (isRunning && !isBreak) {
      const url = getAudioUrl(focusSoundId) || getAudioUrl("40hz-wind");
      if (url) audioManager.play(url);
    } else {
      audioManager.pause();
    }
  }, [isRunning, isBreak, focusSoundId, relaxSoundId, mode, relaxPaused]);

  const toggleTimer = () => {
    if (mode === "relax") return; // In relax mode, use switchToFocus instead
    if (timeLeft === 0) {
      // Explicit user action starts a fresh cycle: clear the
      // session-complete flag so initializeTimer stops guarding.
      sessionCompleteRef.current = false;
      setIsBreak(false);
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
    sessionCompleteRef.current = false;
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

    // Don't auto-arm the timer while a cycle is sitting in the "just
    // completed" state — the user has to press play explicitly. Without
    // this guard, a cycle that ended unattended (user in another tab)
    // would look like the timer "reset" itself.
    if (sessionCompleteRef.current) return;

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
