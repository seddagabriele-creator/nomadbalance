import { supabase } from "./supabaseClient";

// Helper: get current user id.
//
// PERFORMANCE: this used to call supabase.auth.getUser(), which is a network
// round-trip to the Auth server (~300-800 ms) — and it ran before EVERY data
// query, roughly doubling the latency of every read and write in the app.
// getSession() reads the locally persisted session instead (no network), and
// we additionally cache the id in memory. onAuthStateChange keeps the cache
// honest across login/logout/user switches.
let cachedUserId = null;

supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user?.id ?? null;
});

const getUserId = async () => {
  if (cachedUserId) return cachedUserId;
  const { data: { session } } = await supabase.auth.getSession();
  const id = session?.user?.id;
  if (!id) throw new Error("Not authenticated");
  cachedUserId = id;
  return id;
};

// Helper: unwrap Supabase response — throws on error, returns data
const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// DaySession service
export const daySessionService = {
  getByDate: async (date) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
    );
  },

  create: async (data) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .insert({ ...data, user_id: userId })
        .select()
        .single()
    );
  },

  update: async (id, data) => {
    return unwrap(
      await supabase
        .from("day_sessions")
        .update(data)
        .eq("id", id)
        .select()
        .single()
    );
  },

  listAll: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
    );
  },

  deleteAll: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .delete()
        .eq("user_id", userId)
    );
  },

  listRecent: async (limit = 30) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(limit)
    );
  },

  // Lightweight: only the `date` column, for streak computation.
  // Avoids shipping the full row payload (schedules, meals, JSON blobs)
  // just to know which days have a session.
  listDates: async (limit = 400) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("day_sessions")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(limit)
    );
  },
};

// Task service
export const taskService = {
  getBySession: async (sessionId) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("session_id", sessionId)
    );
  },

  getUnassigned: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .is("session_id", null)
    );
  },

  listAll: async (sort = "-order") => {
    const userId = await getUserId();
    const ascending = !sort.startsWith("-");
    const column = sort.replace(/^-/, "");
    return unwrap(
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order(column, { ascending })
    );
  },

  // Only uncompleted tasks — small payload that doesn't grow with history.
  listUncompleted: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", false)
        .order("order", { ascending: false })
    );
  },

  listCompleted: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false })
    );
  },

  create: async (data) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("tasks")
        .insert({ ...data, user_id: userId })
        .select()
        .single()
    );
  },

  update: async (id, data) => {
    return unwrap(
      await supabase
        .from("tasks")
        .update(data)
        .eq("id", id)
        .select()
        .single()
    );
  },

  delete: async (id) => {
    return unwrap(
      await supabase.from("tasks").delete().eq("id", id)
    );
  },

  deleteBySession: async (sessionId) => {
    const userId = await getUserId();
    return unwrap(
      await supabase.from("tasks").delete().eq("user_id", userId).eq("session_id", sessionId)
    );
  },

  deleteAll: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase.from("tasks").delete().eq("user_id", userId)
    );
  },
};

// Exercise service
export const exerciseService = {
  listAll: async () => {
    return unwrap(
      await supabase
        .from("exercises")
        .select("*")
        .order("order", { ascending: true })
    );
  },
};

// UserSettings service
export const userSettingsService = {
  list: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
    );
  },

  create: async (data) => {
    const userId = await getUserId();
    return unwrap(
      await supabase
        .from("user_settings")
        .insert({ ...data, user_id: userId })
        .select()
        .single()
    );
  },

  update: async (id, data) => {
    return unwrap(
      await supabase
        .from("user_settings")
        .update(data)
        .eq("id", id)
        .select()
        .single()
    );
  },

  save: async (settings, existingId) => {
    const userId = await getUserId();
    // Remove fields that shouldn't be sent to Supabase
    const { id: _id, user_id: _uid, created_at: _ca, ...cleanSettings } = settings;
    if (existingId) {
      return unwrap(
        await supabase
          .from("user_settings")
          .update(cleanSettings)
          .eq("id", existingId)
          .select()
          .single()
      );
    }
    return unwrap(
      await supabase
        .from("user_settings")
        .insert({ ...cleanSettings, user_id: userId })
        .select()
        .single()
    );
  },

  deleteAll: async () => {
    const userId = await getUserId();
    return unwrap(
      await supabase.from("user_settings").delete().eq("user_id", userId)
    );
  },
};
