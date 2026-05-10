import { useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { useAnalytics } from "./hooks/useAnalytics";
import { useHabits } from "./hooks/useHabits";
import { useTelegram } from "./hooks/useTelegram";
import { Analytics } from "./pages/Analytics";
import { Dashboard } from "./pages/Dashboard";
import { HabitDetail } from "./pages/HabitDetail";
import { HabitFormPage } from "./pages/HabitForm";
import { HabitsManager } from "./pages/HabitsManager";
import { Settings } from "./pages/Settings";
import { api } from "./services/api";
import type { Habit, HabitLog, User } from "./types";

type MainPage = "dashboard" | "habits" | "analytics" | "settings";
type View = MainPage | "habit_detail" | "habit_form";
const STORAGE_HABITS = "habitflow_local_habits";
const STORAGE_LOGS = "habitflow_local_logs";

function loadLocalHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_HABITS);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

function saveLocalHabits(habits: Habit[]): void {
  localStorage.setItem(STORAGE_HABITS, JSON.stringify(habits));
}

function loadLocalLogs(): Record<number, HabitLog[]> {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS);
    return raw ? (JSON.parse(raw) as Record<number, HabitLog[]>) : {};
  } catch {
    return {};
  }
}

function saveLocalLogs(logs: Record<number, HabitLog[]>): void {
  localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs));
}

export function App() {
  const { telegramUser } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [streakByHabitId, setStreakByHabitId] = useState<Record<number, number>>({});
  const [localHabits, setLocalHabits] = useState<Habit[]>(() => loadLocalHabits());
  const [localLogsByHabit, setLocalLogsByHabit] = useState<Record<number, HabitLog[]>>(() => loadLocalLogs());
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);

  useEffect(() => {
    const telegramId = telegramUser?.id ?? Number(import.meta.env.VITE_DEV_TELEGRAM_ID ?? 1);
    api
      .getProfile(telegramId)
      .then((profile) => {
        setUser(profile);
        setIsOffline(false);
      })
      .catch(() => {
        setIsOffline(true);
        setUser({
          id: 1,
          telegram_id: telegramId,
          timezone: "UTC",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
  }, [telegramUser]);

  const { habits, reload } = useHabits(user ?? undefined);
  const { overview } = useAnalytics(user ?? undefined);
  const shownHabits = isOffline ? localHabits : habits;

  const localOverview = useMemo(() => {
    if (!isOffline) return null;
    const total = localHabits.filter((h) => Boolean(h.is_active)).length;
    const longest = Math.max(0, ...Object.values(streakByHabitId));
    return {
      total_habits: total,
      active_streaks: Object.values(streakByHabitId).filter((x) => x > 0).length,
      completion_rate: total ? Math.min(100, Math.round((Object.keys(localLogsByHabit).length / total) * 100)) : 0,
      longest_streak: longest
    };
  }, [isOffline, localHabits, localLogsByHabit, streakByHabitId]);

  useEffect(() => {
    if (!shownHabits.length) return;
    if (isOffline) {
      const map: Record<number, number> = {};
      shownHabits.forEach((habit) => {
        map[habit.id] = (localLogsByHabit[habit.id] ?? []).length;
      });
      setStreakByHabitId(map);
      return;
    }
    if (!user) return;
    Promise.all(shownHabits.map((habit) => api.getStreak(user, habit.id)))
      .then((values) => {
        const map: Record<number, number> = {};
        shownHabits.forEach((habit, index) => {
          map[habit.id] = values[index].current_streak;
        });
        setStreakByHabitId(map);
      })
      .catch(() => setIsOffline(true));
  }, [user, shownHabits, isOffline, localLogsByHabit]);

  const selectedHabit = useMemo(
    () => shownHabits.find((habit) => habit.id === selectedHabitId) ?? null,
    [shownHabits, selectedHabitId]
  );

  async function createHabit(draft: Partial<Habit>) {
    if (isOffline || !user) {
      const habit: Habit = {
        id: Date.now(),
        user_id: user?.id ?? 1,
        title: draft.title ?? "Новая привычка",
        description: draft.description,
        emoji: draft.emoji ?? "⭐",
        target_frequency: 1,
        reminder_time: draft.reminder_time,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const next = [habit, ...localHabits];
      setLocalHabits(next);
      saveLocalHabits(next);
      setView("habits");
      return;
    }
    try {
      await api.createHabit(user, draft);
      await reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("free_limit_reached")) {
        setShowPremiumBanner(true);
        return;
      }
      setIsOffline(true);
      return createHabit(draft);
    }
    setView("habits");
  }

  async function doneHabit(habitId: number) {
    if (isOffline || !user) {
      const today = new Date().toISOString().slice(0, 10);
      const current = localLogsByHabit[habitId] ?? [];
      if (!current.find((log) => log.date === today)) {
        const nextLogs = {
          ...localLogsByHabit,
          [habitId]: [...current, { id: Date.now(), habit_id: habitId, user_id: user?.id ?? 1, date: today }]
        };
        setLocalLogsByHabit(nextLogs);
        saveLocalLogs(nextLogs);
      }
      return;
    }
    try {
      await api.logHabit(user, habitId);
      await reload();
    } catch {
      setIsOffline(true);
      await doneHabit(habitId);
    }
  }

  async function openHabit(habitId: number) {
    if (isOffline || !user) {
      setHabitLogs(localLogsByHabit[habitId] ?? []);
    } else {
      try {
        const logs = await api.getLogs(user, habitId);
        setHabitLogs(logs);
      } catch {
        setIsOffline(true);
        setHabitLogs(localLogsByHabit[habitId] ?? []);
      }
    }
    setSelectedHabitId(habitId);
    setView("habit_detail");
  }

  async function reloadProfile() {
    if (!user) return;
    try {
      const fresh = await api.getProfile(user.telegram_id);
      setUser(fresh);
    } catch { /* ignore */ }
  }

  async function updateTimezone(timezone: string) {
    if (!user) return;
    if (isOffline) {
      setUser({ ...user, timezone });
      return;
    }
    try {
      const next = await api.updateProfile(user, { timezone });
      setUser(next);
    } catch {
      setIsOffline(true);
      setUser({ ...user, timezone });
    }
  }

  async function toggleHabit(habit: Habit) {
    if (isOffline || !user) {
      const next = localHabits.map((h) => (h.id === habit.id ? { ...h, is_active: h.is_active ? 0 : 1 } : h));
      setLocalHabits(next);
      saveLocalHabits(next);
      return;
    }
    try {
      await api.updateHabit(user, habit.id, { is_active: habit.is_active ? 0 : 1 });
      await reload();
    } catch {
      setIsOffline(true);
      await toggleHabit(habit);
    }
  }

  async function deleteHabit(id: number) {
    if (isOffline || !user) {
      const next = localHabits.filter((h) => h.id !== id);
      setLocalHabits(next);
      saveLocalHabits(next);
      return;
    }
    try {
      await api.deleteHabit(user, id);
      await reload();
    } catch {
      setIsOffline(true);
      await deleteHabit(id);
    }
  }

  if (view === "habit_form") {
    return (
      <Layout title="HabitFlow" page="habits" onNavigate={(page) => setView(page)}>
        <HabitFormPage onCreate={createHabit} onBack={() => setView("dashboard")} />
      </Layout>
    );
  }

  if (view === "habit_detail" && selectedHabit) {
    return (
      <Layout title="HabitFlow" page="dashboard" onNavigate={(page) => setView(page)}>
        <HabitDetail
          habit={selectedHabit}
          logs={habitLogs}
          streak={streakByHabitId[selectedHabit.id] ?? 0}
          onBack={() => setView("dashboard")}
          onUpdate={async (patch) => {
            if (!user) return;
            await api.updateHabit(user, selectedHabit.id, patch);
            await reload();
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout title="HabitFlow" page={view as MainPage} onNavigate={(page) => setView(page)}>
      {showPremiumBanner && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "24px"
        }}>
          <div style={{
            background: "var(--tg-theme-bg-color, #fff)",
            borderRadius: "20px", padding: "28px 24px",
            maxWidth: "340px", width: "100%", textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
            <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
              Лимит бесплатного плана
            </div>
            <div style={{ fontSize: "14px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "20px", lineHeight: 1.5 }}>
              На бесплатном плане можно вести до 2 привычек.<br />
              Купи Premium, чтобы добавлять неограниченно.
            </div>
            <button
              onClick={() => { setShowPremiumBanner(false); setView("settings"); }}
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                color: "#fff", border: "none", borderRadius: "12px",
                fontWeight: 700, fontSize: "15px", cursor: "pointer", marginBottom: "10px"
              }}
            >
              Купить Premium — 250 ⭐
            </button>
            <button
              onClick={() => setShowPremiumBanner(false)}
              style={{
                background: "none", border: "none", color: "var(--tg-theme-hint-color, #999)",
                cursor: "pointer", fontSize: "14px"
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      {view === "dashboard" && (
        <Dashboard
          habits={shownHabits}
          streakByHabitId={streakByHabitId}
          overview={isOffline ? localOverview : overview}
          onDoneHabit={(id) => doneHabit(id).catch(console.error)}
          onOpenHabit={(id) => openHabit(id).catch(console.error)}
          onCreateHabit={() => setView("habit_form")}
        />
      )}
      {view === "habits" && (
        <HabitsManager
          habits={shownHabits}
          onCreate={createHabit}
          onToggle={toggleHabit}
          onDelete={deleteHabit}
        />
      )}
      {view === "analytics" && (
        <Analytics overview={isOffline ? localOverview : overview} habits={shownHabits} streakByHabitId={streakByHabitId} user={user} />
      )}
      {view === "settings" && (
        <Settings
          user={user}
          onUpdateTimezone={updateTimezone}
          onPremiumActivated={() => {
            reloadProfile();
            reload();
          }}
        />
      )}
    </Layout>
  );
}
