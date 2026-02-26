import { supabase } from "./supabaseClient";

// Helper: get current user id
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
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
};
