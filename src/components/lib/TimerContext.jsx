import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { audioManager } from "./audioManager";
import { DEFAULT_WORK_MINUTES, DEFAULT_BREAK_MINUTES, ONE_SECOND_MS, getAudioUrl } from "../../constants";
import { getDailyDefaults } from "../../hooks/useDailyDefaults";

const EXTEND_FOCUS_MINUTES = 15;

const TimerContext = createContext();

const TIMER_STORAGE_KEY = "nomadbalance:timer-state:v1";

// Load persisted timer state and compute elapsed time since it was saved.
// Handles multi-phase transitions: if enough time elapsed for the focus
// phase to end AND the break phase to start (or even finish), the returned
// state reflects the correct phase — so the caller doesn't need to replay
// tick-by-tick.  Returns null if no valid state exists.
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
    let isBreak = !!parsed.isBreak;
    const mode = parsed.mode === "relax" ? "relax" : "focus";
    const relaxPaused = !!parsed.relaxPaused;
    let sessionComplete = !!parsed.sessionComplete;
    let focusEndedWhileAway = false;

    const breakDuration = typeof parsed.breakMinutes === "number"
      ? parsed.breakMinutes * 60
      : DEFAULT_BREAK_MINUTES * 60;

    if (mode === "focus" && isRunning && !isBreak) {
      // Was in focus phase — advance by elapsed time
      timeLeft = timeLeft - elapsedSec;
      if (timeLeft <= 0) {
        // Focus ended while away
        focusEndedWhileAway = true;
        const overflowSec = Math.abs(timeLeft);
        if (overflowSec >= breakDuration) {
          // Both focus AND break elapsed — session complete
          timeLeft = 0;
          isRunning = false;
          isBreak = false;
          sessionComplete = true;
        } else {
          // Focus ended, now in break phase
          timeLeft = breakDuration - overflowSec;
          isBreak = true;
          isRunning = true;
        }
      }
    } else if (mode === "focus" && isRunning && isBreak) {
      // Was in break phase — advance by elapsed time
      timeLeft = timeLeft - elapsedSec;
      if (timeLeft <= 0) {
        // Break ended — session complete
        timeLeft = 0;
        isRunning = false;
        isBreak = false;
        sessionComplete = true;
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
      sessionComplete,
      focusEndedWhileAway,
      savedFocusTime: typeof parsed.savedFocusTime === "number" ? parsed.savedFocusTime : 0,
      savedFocusRunning: !!parsed.savedFocusRunning,
      savedFocusBreak: !!parsed.savedFocusBreak,
    };
  } catch {
    return null;
  }
}

export function TimerProvider({ children }) {
  const initial = typeof window !== "undefined" ? loadPersistedState() : null;

  const [timeLeft, setTimeLeft] = useState(initial?.timeLeft ?? 0);
  const [isRunning, setIsRunning] = useState(initial?.isRunning ?? false);
  const [isBreak, setIsBreak] = useState(initial?.isBreak ?? false);
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [onSessionComplete, setOnSessionComplete] = useState(null);
  const [focusSoundId, setFocusSoundId] = useState("40hz-wind");
  const [relaxSoundId, setRelaxSoundId] = useState("10hz-binaural-ocean");

  const [mode, setMode] = useState(initial?.mode ?? "focus");
  const [relaxTime, setRelaxTime] = useState(initial?.relaxTime ?? 0);
  const [relaxPaused, setRelaxPaused] = useState(initial?.relaxPaused ?? false);
  const savedFocusTimeRef = useRef(initial?.savedFocusTime ?? 0);
  const savedFocusRunningRef = useRef(initial?.savedFocusRunning ?? false);
  const savedFocusBreakRef = useRef(initial?.savedFocusBreak ?? false);

  const sessionCompleteRef = useRef(initial?.sessionComplete ?? false);

  const intervalRef = useRef(null);
  const relaxIntervalRef = useRef(null);
  const isRunningRef = useRef(isRunning);
  const onSessionCompleteRef = useRef(null);
  const workMinutesRef = useRef(workMinutes);
  const breakMinutesRef = useRef(breakMinutes);
  const isBreakRef = useRef(isBreak);
  const timeLeftRef = useRef(timeLeft);
  const modeRef = useRef(mode);
  const relaxTimeRef = useRef(relaxTime);
  const relaxPausedRef = useRef(relaxPaused);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);
  useEffect(() => { workMinutesRef.current = workMinutes; }, [workMinutes]);
  useEffect(() => { breakMinutesRef.current = breakMinutes; }, [breakMinutes]);
  useEffect(() => { isBreakRef.current = isBreak; }, [isBreak]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { relaxTimeRef.current = relaxTime; }, [relaxTime]);
  useEffect(() => { relaxPausedRef.current = relaxPaused; }, [relaxPaused]);

  // Persist state to localStorage. Uses refs so it always reads the latest
  // values and has a stable reference (no deps → no re-creation).
  const persistNow = useCallback(() => {
    try {
      const payload = {
        timeLeft: timeLeftRef.current,
        isRunning: isRunningRef.current,
        isBreak: isBreakRef.current,
        mode: modeRef.current,
        relaxTime: relaxTimeRef.current,
        relaxPaused: relaxPausedRef.current,
        sessionComplete: sessionCompleteRef.current,
        workMinutes: workMinutesRef.current,
        breakMinutes: breakMinutesRef.current,
        savedFocusTime: savedFocusTimeRef.current,
        savedFocusRunning: savedFocusRunningRef.current,
        savedFocusBreak: savedFocusBreakRef.current,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, []);

  // Persist on meaningful state changes, but ONLY when the tab is visible.
  // When the tab is hidden there are no ticks and no state changes — we
  // persist once on hide via the visibility handler below.
  useEffect(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    persistNow();
  }, [timeLeft, isRunning, isBreak, mode, relaxTime, relaxPaused, persistNow]);

  // ─── Dual-mode visibility handler ──────────────────────────────────
  // HIDDEN: stop all display intervals (zero JS overhead in background).
  //         Audio keeps playing via Web Audio API without any JS help.
  //         Persist a state snapshot with a wall-clock timestamp.
  // VISIBLE: load persisted state, compute elapsed time (handling
  //          focus→break→complete transitions), apply in one shot.
  //          The interval effects restart automatically via deps.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ── TAB HIDDEN ──
        // Stop display intervals (zero JS overhead in background).
        // Audio keeps playing via Web Audio API — it doesn't need JS
        // ticks and Chrome won't kill tabs that are producing audio.
        clearInterval(intervalRef.current);
        clearInterval(relaxIntervalRef.current);
        persistNow();
      } else {
        // ── TAB VISIBLE ──
        const restored = loadPersistedState();
        if (!restored) return;

        if (restored.sessionComplete) {
          sessionCompleteRef.current = true;
        }

        setTimeLeft(restored.timeLeft);
        setIsRunning(restored.isRunning);
        setIsBreak(restored.isBreak);

        if (restored.mode === "relax") {
          setRelaxTime(restored.relaxTime);
        }

        // If the focus phase ended while the tab was hidden, fire the
        // session-complete callback now so Dashboard can update the
        // session counter and trigger break notifications.
        if (restored.focusEndedWhileAway) {
          onSessionCompleteRef.current?.();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [persistNow]);

  // ─── Focus timer interval ──────────────────────────────────────────
  // Only runs when the tab is visible. When hidden the visibility handler
  // stops it, and when the tab comes back the state changes from the
  // reconciliation above trigger the effect to restart.
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
            return breakMinutesRef.current * 60;
          } else {
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

  // Relax timer interval (counts up) — also only when visible
  useEffect(() => {
    if (mode !== "relax" || relaxPaused) return;
    relaxIntervalRef.current = setInterval(() => {
      setRelaxTime((prev) => prev + 1);
    }, ONE_SECOND_MS);
    return () => clearInterval(relaxIntervalRef.current);
  }, [mode, relaxPaused]);

  // ─── Audio control ─────────────────────────────────────────────────
  // No visibility guard here: the audio must keep playing when the tab
  // is backgrounded. The crossfade is lightweight (<10 ms) so there's
  // no risk of blocking the main thread on decode.
  useEffect(() => {
    if (mode === "relax" && !relaxPaused) {
      const url = getAudioUrl(relaxSoundId) || getAudioUrl("10hz-binaural-ocean");
      if (url) audioManager.play(url);
    } else if (mode === "relax" && relaxPaused) {
      audioManager.pause();
    } else if (isRunning && isBreak) {
      const autoRelax = getDailyDefaults().auto_relax_on_break !== false;
      if (autoRelax) {
        const url = getAudioUrl(relaxSoundId) || getAudioUrl("10hz-binaural-ocean");
        if (url) audioManager.play(url);
      } else {
        audioManager.pause();
      }
    } else if (isRunning && !isBreak) {
      const url = getAudioUrl(focusSoundId) || getAudioUrl("40hz-wind");
      if (url) audioManager.play(url);
    } else {
      audioManager.pause();
    }
  }, [isRunning, isBreak, focusSoundId, relaxSoundId, mode, relaxPaused]);

  // ─── User actions ──────────────────────────────────────────────────

  const toggleTimer = () => {
    if (mode === "relax") return;
    if (timeLeft === 0) {
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

    if (sessionCompleteRef.current) return;

    if (timeLeftRef.current === 0 || (!isRunningRef.current && prevWork !== work)) {
      setTimeLeft(work * 60);
    }
  }, []);

  const pauseTimer = () => {
    setIsRunning(false);
    audioManager.pause();
  };

  const extendFocus = useCallback((minutes = EXTEND_FOCUS_MINUTES) => {
    if (!isBreakRef.current) return;
    sessionCompleteRef.current = false;
    setIsBreak(false);
    setTimeLeft(minutes * 60);
    setIsRunning(true);
  }, []);

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const toggleRelaxPause = useCallback(() => {
    setRelaxPaused((prev) => !prev);
  }, []);

  const switchToRelax = useCallback(() => {
    savedFocusTimeRef.current = timeLeftRef.current;
    savedFocusRunningRef.current = isRunningRef.current;
    savedFocusBreakRef.current = isBreakRef.current;

    setIsRunning(false);
    clearInterval(intervalRef.current);

    setRelaxTime(0);
    setRelaxPaused(false);
    setMode("relax");
  }, []);

  const switchToFocus = useCallback(() => {
    clearInterval(relaxIntervalRef.current);
    setMode("focus");
    setRelaxTime(0);
    setRelaxPaused(false);

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
        extendFocus,
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
