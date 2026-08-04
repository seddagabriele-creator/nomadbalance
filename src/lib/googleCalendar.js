// Google Calendar sync — client side.
//
// Design rules that keep this from ever slowing the app down:
//   • No SDK. OAuth is a plain redirect, sync is a single fetch. Zero bundle cost.
//   • Every sync call is fire-and-forget: the UI updates optimistically and
//     never awaits Google. A failed sync is logged, never surfaced as a block.
//   • Users who haven't connected make zero network calls.

import { supabase } from "@/api/supabaseClient";

// Public value — presence of the client id is the feature flag for the UI.
export const calendarFeatureAvailable = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

// Starts the OAuth consent flow. Resolves only if it fails to start —
// on success the browser navigates away to Google.
export async function connectGoogleCalendar() {
  const headers = await authHeaders();
  if (!headers) throw new Error("Not signed in");

  const res = await fetch("/api/google/auth-url", { method: "POST", headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not start Google authorization");
  }
  const { url } = await res.json();
  window.location.href = url;
}

export async function disconnectGoogleCalendar() {
  const headers = await authHeaders();
  if (!headers) throw new Error("Not signed in");
  const res = await fetch("/api/google/disconnect", { method: "POST", headers });
  if (!res.ok) throw new Error("Could not disconnect");
}

// Mirror a task into Google Calendar. Fire-and-forget by design — callers
// must NOT await this in a UI path.
export function syncTaskToCalendar(taskId, { date, action, eventId } = {}) {
  if (!calendarFeatureAvailable || (!taskId && !eventId)) return;

  void (async () => {
    try {
      const headers = await authHeaders();
      if (!headers) return;
      await fetch("/api/google/sync-task", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          date,
          action,
          eventId,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
    } catch (err) {
      // Never bubble up: calendar sync is a nice-to-have, not a blocker.
      console.warn("[calendar] sync failed", err);
    }
  })();
}
