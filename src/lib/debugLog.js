// Lightweight diagnostic logger.
// Writes a ring-buffer of the last 200 entries to localStorage so evidence
// survives page reloads and Chrome renderer kills. Open the browser console
// and run:
//
//   JSON.parse(localStorage.getItem('nomadbalance:debug-log'))
//
// to inspect the log after a disconnection.

const STORAGE_KEY = "nomadbalance:debug-log";
const MAX_ENTRIES = 200;

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function write(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded — drop oldest half
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.slice(entries.length / 2))
      );
    } catch {
      // give up silently
    }
  }
}

export function debugLog(category, message, data) {
  const entry = {
    t: new Date().toISOString(),
    cat: category,
    msg: message,
  };
  if (data !== undefined) {
    // Keep data small — stringify and truncate at 500 chars
    try {
      const s = typeof data === "string" ? data : JSON.stringify(data);
      entry.data = s.length > 500 ? s.slice(0, 500) + "..." : s;
    } catch {
      entry.data = String(data);
    }
  }
  const log = read();
  log.push(entry);
  if (log.length > MAX_ENTRIES) log.splice(0, log.length - MAX_ENTRIES);
  write(log);
}

// Helper to dump the log to the console (useful for quick inspection)
export function dumpDebugLog() {
  const log = read();
  console.table(log);
  return log;
}

// Expose globally so the user can type dumpDebugLog() in the console
if (typeof window !== "undefined") {
  window.dumpDebugLog = dumpDebugLog;
}
