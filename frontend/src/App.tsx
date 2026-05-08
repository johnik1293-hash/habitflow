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

export function App() {
  const { telegramUser } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [streakByHabitId, setStreakByHabitId] = useState<Record<number, number>>({});

  useEffect(() => {
    const telegramId = telegramUser?.id ?? Number(import.meta.env.VITE_DEV_TELEGRAM_ID ?? 1);
    api.getProfile(telegramId).then(setUser).catch(console.error);
  }, [telegramUser]);

  const { habits, reload } = useHabits(user ?? undefined);
  const { overview } = useAnalytics(user ?? undefined);

  useEffect(() => {
    if (!user || !habits.length) return;
    Promise.all(habits.map((habit) => api.getStreak(user, habit.id)))
      .then((values) => {
        const map: Record<number, number> = {};
        habits.forEach((habit, index) => {
          map[habit.id] = values[index].current_streak;
        });
        setStreakByHabitId(map);
      })
      .catch(console.error);
  }, [user, habits]);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  async function createHabit(draft: Partial<Habit>) {
    if (!user) return;
    await api.createHabit(user, draft);
    await reload();
    setView("habits");
  }

  async function doneHabit(habitId: number) {
    if (!user) return;
    await api.logHabit(user, habitId);
    await reload();
  }

  async function openHabit(habitId: number) {
    if (!user) return;
    const logs = await api.getLogs(user, habitId);
    setHabitLogs(logs);
    setSelectedHabitId(habitId);
    setView("habit_detail");
  }

  async function updateTimezone(timezone: string) {
    if (!user) return;
    const next = await api.updateProfile(user, { timezone });
    setUser(next);
  }

  async function toggleHabit(habit: Habit) {
    if (!user) return;
    await api.updateHabit(user, habit.id, { is_active: habit.is_active ? 0 : 1 });
    await reload();
  }

  async function deleteHabit(id: number) {
    if (!user) return;
    await api.deleteHabit(user, id);
    await reload();
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
        />
      </Layout>
    );
  }

  return (
    <Layout title="HabitFlow" page={view as MainPage} onNavigate={(page) => setView(page)}>
      {view === "dashboard" && (
        <Dashboard
          habits={habits}
          streakByHabitId={streakByHabitId}
          overview={overview}
          onDoneHabit={(id) => doneHabit(id).catch(console.error)}
          onOpenHabit={(id) => openHabit(id).catch(console.error)}
          onCreateHabit={() => setView("habit_form")}
        />
      )}
      {view === "habits" && (
        <HabitsManager
          habits={habits}
          onCreate={createHabit}
          onToggle={toggleHabit}
          onDelete={deleteHabit}
        />
      )}
      {view === "analytics" && <Analytics overview={overview} habits={habits} streakByHabitId={streakByHabitId} />}
      {view === "settings" && <Settings user={user} onUpdateTimezone={updateTimezone} />}
    </Layout>
  );
}
