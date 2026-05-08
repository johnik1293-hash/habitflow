import type { Habit, HabitLog, Overview, User } from "../types";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function request<T>(path: string, init: RequestInit = {}, user?: User): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (user?.id) headers.set("x-user-id", String(user.id));
  if (user?.telegram_id) headers.set("x-telegram-id", String(user.telegram_id));

  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  getProfile: (telegramId: number) =>
    request<User>("/user/profile", { headers: { "x-telegram-id": String(telegramId) } }),
  updateProfile: (user: User, payload: Partial<User>) =>
    request<User>("/user/profile", { method: "PUT", body: JSON.stringify(payload) }, user),

  getHabits: (user: User) => request<Habit[]>("/habits", {}, user),
  createHabit: (user: User, payload: Partial<Habit>) =>
    request<Habit>("/habits", { method: "POST", body: JSON.stringify(payload) }, user),
  updateHabit: (user: User, id: number, payload: Partial<Habit>) =>
    request<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(payload) }, user),
  deleteHabit: (user: User, id: number) => request<void>(`/habits/${id}`, { method: "DELETE" }, user),
  getStreak: (user: User, id: number) => request<{ current_streak: number }>(`/habits/${id}/streak`, {}, user),

  logHabit: (user: User, id: number, notes?: string) =>
    request<HabitLog>(`/habits/${id}/log`, { method: "POST", body: JSON.stringify({ notes }) }, user),
  unlogHabit: (user: User, id: number) =>
    request<void>(`/habits/${id}/log`, { method: "DELETE" }, user),
  getLogs: (user: User, id: number) => request<HabitLog[]>(`/habits/${id}/logs`, {}, user),

  getOverview: (user: User) => request<Overview>("/analytics/overview", {}, user),
  getHabitAnalytics: (user: User, id: number) => request(`/analytics/habits/${id}`, {}, user),
  getCalendar: (user: User, month: string) => request(`/analytics/calendar/${month}`, {}, user)
};

