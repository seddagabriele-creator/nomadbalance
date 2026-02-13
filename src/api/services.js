import { base44 } from "./base44Client";

// DaySession service
export const daySessionService = {
  getByDate: (date) => base44.entities.DaySession.filter({ date }),
  create: (data) => base44.entities.DaySession.create(data),
  update: (id, data) => base44.entities.DaySession.update(id, data),
  listRecent: (limit = 30) => base44.entities.DaySession.list("-date", limit),
};

// Task service
export const taskService = {
  getBySession: (sessionId) => base44.entities.Task.filter({ session_id: sessionId }),
  getUnassigned: () => base44.entities.Task.filter({ session_id: null }),
  listAll: (sort = "-order") => base44.entities.Task.list(sort),
  listCompleted: () => base44.entities.Task.list("-completed_at"),
  create: (data) => base44.entities.Task.create(data),
  update: (id, data) => base44.entities.Task.update(id, data),
  delete: (id) => base44.entities.Task.delete(id),
};

// Exercise service
export const exerciseService = {
  listAll: () => base44.entities.Exercise.list("order"),
};

// UserSettings service
export const userSettingsService = {
  list: () => base44.entities.UserSettings.list(),
  create: (data) => base44.entities.UserSettings.create(data),
  update: (id, data) => base44.entities.UserSettings.update(id, data),
  save: (settings, existingId) => {
    if (existingId) {
      return base44.entities.UserSettings.update(existingId, settings);
    }
    return base44.entities.UserSettings.create(settings);
  },
};

// Auth service
export const authService = {
  me: () => base44.auth.me(),
};
