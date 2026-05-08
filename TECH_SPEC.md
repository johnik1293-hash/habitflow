# HabitFlow — Техническое задание (MVP)

Готовая спецификация для разработки Telegram Mini App + Bot companion.

## 1) Продукт и формат решения

- **Продукт:** HabitFlow  
- **Формат:** Telegram Bot + Telegram Mini App  
- **Роль бота:** уведомления, быстрые действия, inline-взаимодействие  
- **Роль Mini App:** детальный трекинг привычек, аналитика, управление

## 2) Цели MVP

- Создание и управление привычками
- Ежедневные напоминания через Telegram-бота
- Быстрая отметка выполнения в 1 тап
- Базовый streak tracking
- Базовая аналитика в Mini App

### Что входит в MVP

- Создание/редактирование/удаление привычек
- Daily reminders
- Быстрые действия в боте (`✅ Выполнено`, `⏰ Напомнить позже`)
- Dashboard + ключевые экраны Mini App
- Общая статистика и простая аналитика

### Что не входит в MVP

- Социальные челленджи
- Продвинутая аналитика
- Кастомные эмодзи
- Экспорт данных
- Внешние интеграции
- Монетизация

## 3) Технологический стек

### Backend

- Node.js + TypeScript
- Express
- SQLite
- Telegram Bot API
- Webhook-прием updates

### Frontend (Mini App)

- React + TypeScript
- Vite
- Tailwind CSS
- `@twa-dev/sdk` для Telegram WebApp интеграции

### Deploy

- Backend: Railway / Render / Vercel Functions
- Frontend static: Netlify / Vercel
- Telegram Bot: webhook на backend endpoint

## 4) Целевой user journey

### Onboarding

1. Пользователь запускает бота (`/start`)
2. Выбирает 1-3 стартовые привычки из популярных
3. Устанавливает время напоминаний
4. Получает первое уведомление через час

### Daily flow

1. Бот присылает напоминание
2. Пользователь нажимает `✅ Done` или `⏰ Remind later`
3. Бот показывает текущий streak
4. Бот предлагает открыть Mini App для деталей

### Analytics flow

1. Пользователь открывает Mini App
2. Смотрит календарь выполнения и метрики
3. Редактирует привычки / делится прогрессом

## 5) Файловая структура проекта

```text
habitflow/
├── backend/
│   ├── src/
│   │   ├── bot/
│   │   │   ├── handlers/
│   │   │   │   ├── start.ts
│   │   │   │   ├── habits.ts
│   │   │   │   ├── logging.ts
│   │   │   │   └── inline.ts
│   │   │   ├── keyboards.ts
│   │   │   ├── messages.ts
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── habits.ts
│   │   │   │   ├── logging.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── user.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── validation.ts
│   │   │   └── index.ts
│   │   ├── database/
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Habit.ts
│   │   │   │   ├── HabitLog.ts
│   │   │   │   └── Notification.ts
│   │   │   ├── migrations/
│   │   │   │   └── init.sql
│   │   │   └── db.ts
│   │   ├── services/
│   │   │   ├── notificationService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── streakService.ts
│   │   ├── utils/
│   │   │   ├── telegram.ts
│   │   │   └── validation.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HabitCard.tsx
    │   │   ├── StreakDisplay.tsx
    │   │   ├── ProgressChart.tsx
    │   │   ├── HabitForm.tsx
    │   │   └── Layout.tsx
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── HabitsManager.tsx
    │   │   ├── Analytics.tsx
    │   │   ├── HabitDetail.tsx
    │   │   └── Settings.tsx
    │   ├── hooks/
    │   │   ├── useTelegram.ts
    │   │   ├── useHabits.ts
    │   │   └── useAnalytics.ts
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## 6) База данных (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '⭐',
  target_frequency INTEGER DEFAULT 1,
  reminder_time TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE habit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (habit_id) REFERENCES habits (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (habit_id, date)
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  habit_id INTEGER NOT NULL,
  scheduled_time DATETIME NOT NULL,
  sent_at DATETIME,
  is_sent BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (habit_id) REFERENCES habits (id)
);

CREATE INDEX idx_users_telegram_id ON users (telegram_id);
CREATE INDEX idx_habits_user_id ON habits (user_id);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs (habit_id, date);
CREATE INDEX idx_notifications_scheduled ON notifications (scheduled_time, is_sent);
```

## 7) API-контракт (12 endpoints)

### Habits

- `GET /api/habits` — все привычки пользователя
- `POST /api/habits` — создать привычку
- `PUT /api/habits/:id` — обновить привычку
- `DELETE /api/habits/:id` — удалить привычку
- `GET /api/habits/:id/streak` — текущий streak

### Logging

- `POST /api/habits/:id/log` — отметить выполнение
- `DELETE /api/habits/:id/log` — снять отметку за сегодня
- `GET /api/habits/:id/logs` — история выполнения

### Analytics

- `GET /api/analytics/overview` — общая статистика
- `GET /api/analytics/habits/:id` — аналитика по конкретной привычке
- `GET /api/analytics/calendar/:month` — календарь выполнения за месяц

### User

- `GET /api/user/profile` — профиль пользователя
- `PUT /api/user/profile` — обновление профиля

## 8) Типы данных (TypeScript)

```ts
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_streak?: number;
  completion_rate?: number;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  user_id: number;
  completed_at: string;
  date: string;
  notes?: string;
}

export interface AnalyticsData {
  total_habits: number;
  active_streaks: number;
  completion_rate: number;
  longest_streak: number;
  habits_by_completion: Array<{
    habit: Habit;
    streak: number;
    completion_rate: number;
  }>;
}
```

## 9) Bot-команды и обработчики

### Команды бота

- `/start` — регистрация + welcome
- `/habits` — активные привычки + быстрые кнопки
- `/newhabit` — создание привычки
- `/stats` — быстрая статистика
- `/app` — открыть Mini App

### Inline режим

- `@habitflowbot streak` — поделиться streak’ами
- `@habitflowbot progress [habit]` — поделиться прогрессом по привычке

### Обработчики

- `start.ts` — регистрация, welcome, CTA кнопки
- `habits.ts` — создание привычек + пресеты
- `logging.ts` — быстрые отметки (`✅`, `⏰`)
- `inline.ts` — inline результаты для шаринга

## 10) Mini App экраны (6)

- `Dashboard` — приветствие, карточки привычек, quick stats, CTA добавления
- `HabitsManager` — список привычек, редактирование, toggle активности, удаление
- `Analytics` — календарь, графики, completion by weekday
- `HabitDetail` — история + детальный streak по привычке
- `Settings` — timezone, уведомления, defaults
- `HabitForm` — создание/редактирование привычки

## 11) Ключевые UI-компоненты

- `HabitCard` — карточка с emoji, названием, streak, weekly progress, quick action
- `StreakDisplay` — визуал streak + milestone progress
- `ProgressChart` — line/bar + календарная heatmap
- `HabitForm` — форма создания/редактирования
- `Layout` — общий shell приложения

## 12) Notification logic (4 сценария)

1. **Обычное напоминание** — в установленное время
2. **Snooze** — повтор через 1 час после `⏰ +1 час`
3. **Мотивационное** — при streak > 3 дней
4. **Последний шанс** — за 2 часа до конца дня

### Поведение сервиса

- Ежечасный cron проверяет `notifications`
- Находит записи на текущий час и `is_sent = 0`
- Отправляет персонализированный текст
- Добавляет inline кнопки: `✅ Выполнено`, `⏰ +1 час`, `❌ Пропустить`
- Помечает отправленные уведомления как `is_sent = 1`

## 13) Streak logic

- Текущий streak = число последовательных дней с отметкой до сегодня
- Если сегодня не отмечено, streak не обнуляется до конца дня
- Если пропущен вчерашний день, streak = 0
- Лучший streak = максимум за весь период
- Milestones: `3, 7, 14, 30, 50, 100`

## 14) Telegram Mini App интеграция

### Backend (`utils/telegram.ts`)

- Валидация `initData` (signature check)
- Извлечение Telegram user данных
- Маппинг Telegram user -> `users` таблица

### Frontend (`useTelegram.ts`)

- Получение `initDataUnsafe.user`
- Работа с `MainButton`
- `HapticFeedback` для ключевых действий
- Корректное закрытие Mini App

## 15) Конфигурация окружения

### Backend `.env`

```env
BOT_TOKEN=your_bot_token
WEBHOOK_URL=https://your-domain.com/webhook
MINI_APP_URL=https://your-frontend-domain.com
DATABASE_PATH=./database.sqlite
PORT=3000
```

### Frontend `.env`

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_BOT_USERNAME=habitflowbot
```

## 16) Roadmap реализации (порядок работ)

1. Backend foundation: DB, models, CRUD habits, auth middleware
2. Bot MVP: `/start`, `/habits`, `/newhabit`, webhook wiring
3. Mini App MVP: базовый `Dashboard` + list habits
4. Logging + streak service
5. Notification service + cron
6. Analytics endpoints + UI charts
7. Deploy + smoke testing end-to-end

## 17) Критерии готовности MVP

- Пользователь может создать привычку через bot или Mini App
- Пользователь получает ежедневное напоминание
- Быстрая отметка из бота обновляет данные в Mini App
- Streak корректно считается и отображается
- Dashboard и Analytics показывают актуальные данные
- Webhook и Mini App работают на production URL

---

Этот документ можно использовать как единый source of truth для команды и для поэтапной генерации кода в Cursor.
