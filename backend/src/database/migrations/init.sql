CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '⭐',
  target_frequency INTEGER DEFAULT 1,
  reminder_time TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (habit_id) REFERENCES habits (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (habit_id, date)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  habit_id INTEGER NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  is_sent BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (habit_id) REFERENCES habits (id)
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs (habit_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications (scheduled_time, is_sent);
