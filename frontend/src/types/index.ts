export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  timezone: string;
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
  reminder_time?: string;
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

