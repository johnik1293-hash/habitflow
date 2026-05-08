import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Habit, User } from "../types";

export function useHabits(user?: User) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setHabits(await api.getHabits(user));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload().catch(console.error);
  }, [reload]);

  return { habits, setHabits, loading, reload };
}

