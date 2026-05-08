# HabitFlow

Telegram Mini App + bot companion for habit tracking.

## Local run

1. Backend:
   - `cd backend`
   - `cp .env.example .env`
   - fill `BOT_TOKEN`, `MINI_APP_URL`
   - `npm install`
   - `npm run dev`
2. Frontend:
   - `cd frontend`
   - `cp .env.example .env`
   - set `VITE_API_URL` (e.g. `http://localhost:3000/api`)
   - `npm install`
   - `npm run dev`

## Configure Telegram bot

1. Set bot commands:
   - `npm run bot:set-commands --prefix backend`
2. Set webhook:
   - expose backend publicly (Railway/Render/ngrok)
   - set `WEBHOOK_URL` in `backend/.env`
   - `npm run bot:set-webhook --prefix backend`

## Production checklist

- Deploy backend with persistent storage for SQLite (or migrate to Postgres).
- Deploy frontend static build.
- Set `MINI_APP_URL` to deployed frontend URL.
- Re-run `bot:set-webhook` with production webhook URL.
- Verify `/start`, `/app`, and Mini App open flow in Telegram.

