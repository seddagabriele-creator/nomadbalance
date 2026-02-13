import { useState, useCallback } from "react";
import { INITIAL_DAILY_DEFAULTS } from "../constants";

const STORAGE_KEY = "dailyDefaults";

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function getDailyDefaults() {
  return loadFromStorage() || INITIAL_DAILY_DEFAULTS;
}

export function hasDailyDefaults() {
  return !!loadFromStorage();
}

export default function useDailyDefaults() {
  const [defaults, setDefaultsState] = useState(() => getDailyDefaults());

  const setDefaults = useCallback((newDefaults) => {
    const updated = typeof newDefaults === "function"
      ? newDefaults(getDailyDefaults())
      : newDefaults;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDefaultsState(updated);
  }, []);

  const updateDefaults = useCallback((partial) => {
    setDefaults((prev) => ({ ...prev, ...partial }));
  }, [setDefaults]);

  const clearDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDefaultsState(INITIAL_DAILY_DEFAULTS);
  }, []);

  return {
    defaults,
    setDefaults,
    updateDefaults,
    clearDefaults,
    hasDefaults: !!loadFromStorage(),
  };
}
