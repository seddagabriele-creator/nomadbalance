import { admin, getAccessToken, isConfigured, verifyUser } from "../_lib/google.js";

const EVENT_MINUTES = 30;
const CAL_API = "https://www.googleapis.com/calendar/v3/calendars";

// "2026-06-16" + "14:30" → { start: "2026-06-16T14:30:00", end: "2026-06-16T15:00:00" }
function eventWindow(date, time) {
  const [h, m] = time.split(":").map(Number);
  const startMin = h * 60 + m;
  const endMin = startMin + EVENT_MINUTES;
  const pad = (n) => String(n).padStart(2, "0");

  const endDate = new Date(`${date}T00:00:00`);
  endDate.setDate(endDate.getDate() + Math.floor(endMin / 1440));
  const endDay = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
  const rolled = endMin % 1440;

  return {
    start: `${date}T${pad(h)}:${pad(m)}:00`,
    end: `${endDay}T${pad(Math.floor(rolled / 60))}:${pad(rolled % 60)}:00`,
  };
}

async function calendarFetch(accessToken, calendarId, path, options = {}) {
  return fetch(`${CAL_API}/${encodeURIComponent(calendarId)}/events${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

// Mirrors one task into the user's Google Calendar. Called fire-and-forget
// by the client, so it always answers quickly and never throws at the caller.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isConfigured()) return res.status(200).json({ skipped: "not-configured" });

  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // `eventId` is only used for deletes, where the task row may already be
  // gone. It can only ever address an event in the caller's own calendar.
  const { taskId, date, timeZone, action, eventId: explicitEventId } = req.body || {};
  if (!taskId && !explicitEventId) return res.status(400).json({ error: "Missing taskId" });

  try {
    const db = admin();

    const { data: creds } = await db
      .from("google_credentials")
      .select("refresh_token, calendar_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!creds) return res.status(200).json({ skipped: "not-connected" });

    const accessToken = await getAccessToken(creds.refresh_token);
    if (!accessToken) {
      // Refresh token revoked from the Google account page — disconnect so
      // the UI stops offering sync and can re-prompt.
      await db.from("google_credentials").delete().eq("user_id", user.id);
      await db.from("user_settings")
        .update({ google_calendar_connected: false, google_calendar_email: null })
        .eq("user_id", user.id);
      return res.status(200).json({ disconnected: true });
    }

    const calendarId = creds.calendar_id || "primary";

    // The task row is the source of truth — the client only says *which*
    // task changed, never what the event should contain.
    const { data: task } = taskId
      ? await db
          .from("tasks")
          .select("id, title, alarm_time, due_date, completed, google_event_id, user_id")
          .eq("id", taskId)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

    const removing = action === "delete" || !task || !task.alarm_time;
    const eventId = task?.google_event_id || explicitEventId;

    if (removing) {
      if (eventId) {
        await calendarFetch(accessToken, calendarId, `/${eventId}`, { method: "DELETE" });
        if (task) {
          await db.from("tasks").update({ google_event_id: null }).eq("id", taskId);
        }
      }
      return res.status(200).json({ removed: true });
    }

    // The task's own due date wins: it's the authoritative value the user
    // picked. `date` is the client's fallback for a task with no due date.
    const day = task.due_date || date || new Date().toISOString().slice(0, 10);
    const { start, end } = eventWindow(day, task.alarm_time);
    const tz = timeZone || "UTC";

    const body = {
      summary: task.completed ? `✓ ${task.title}` : task.title,
      description: "Scheduled from NomadBalance",
      start: { dateTime: start, timeZone: tz },
      end: { dateTime: end, timeZone: tz },
      source: { title: "NomadBalance", url: "https://nomadbalance.app" },
    };

    if (eventId) {
      const patched = await calendarFetch(accessToken, calendarId, `/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (patched.ok) return res.status(200).json({ updated: true });
      // Event deleted from Google's side — fall through and recreate it.
    }

    const created = await calendarFetch(accessToken, calendarId, "", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!created.ok) {
      console.error("[google/sync-task] create failed:", created.status);
      return res.status(200).json({ error: "calendar-write-failed" });
    }

    const event = await created.json();
    await db.from("tasks").update({ google_event_id: event.id }).eq("id", taskId);

    return res.status(200).json({ created: true });
  } catch (err) {
    console.error("[google/sync-task] error:", err);
    return res.status(200).json({ error: "sync-failed" });
  }
}
