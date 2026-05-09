export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  timezone: string;
  subscription_tier?: "free" | "premium";
  subscription_expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  emoji: string;
  target_frequency: number;
  reminder_time?: string | null;
  reminder_interval?: number | null;
  reminder_end?: string | null;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  user_id: number;
  date: string;
  notes?: string;
}

export interface Overview {
  total_habits: number;
  active_streaks: number;
  completion_rate: number;
  longest_streak: number;
}

