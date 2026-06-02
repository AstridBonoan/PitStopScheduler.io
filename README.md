# Pit Stop Scheduler

Modern, mobile-first online booking for automotive service businesses. Built with React, TypeScript, Tailwind CSS, Supabase, Resend, and Google Calendar integration.

**Live demo:** After deployment, enable GitHub Pages at [github.com/AstridBonoan/PitStopScheduler.io](https://github.com/AstridBonoan/PitStopScheduler.io) → **Settings → Pages → Deploy from branch** → Branch: `gh-pages` → Folder: `/ (root)`.

## Features

- 7-step customer booking flow (service → date → time → vehicle → contact → review → confirmation)
- Real-time slot availability and double-booking prevention
- Customer dashboard with magic link auth
- Admin dashboard (overview, calendar day/week/month, availability management)
- Supabase database, auth, and edge functions
- Resend email (confirmation, reminders, reschedule, cancel)
- Google Calendar sync (via edge function)
- SMS-ready architecture (`sms_reminder_sent` column, Twilio-ready notes)
- GitHub Actions CI deploy to `gh-pages` branch

## Tech stack

React · TypeScript · Vite · Tailwind CSS · React Router · React Hook Form · Zod · Supabase · Resend · Google Calendar API · Framer Motion

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Without Supabase env vars, the app runs in **demo mode** using localStorage for bookings. Admin demo login: any email containing `admin` and password 8+ characters.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Deploy edge functions: `send-email`, `sync-calendar`, `send-reminders`.
4. Set secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `GOOGLE_*`, `SHOP_PHONE`.
5. Promote an admin: update `profiles.role` to `admin` for your user.
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` and GitHub Actions secrets.

## GitHub Pages (Deploy from branch)

1. Push to `main` — the workflow builds and publishes `dist` to the **`gh-pages`** branch.
2. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Select branch **`gh-pages`**, folder **`/ (root)`**, save.

## Project structure

```
src/
  components/   # UI, booking steps, layout
  pages/        # Home, book, account, admin
  services/     # Booking & API logic
  contexts/     # Auth & booking state
supabase/
  migrations/   # Database schema
  functions/    # Email, calendar, reminders
.github/workflows/deploy.yml
```

## License

MIT
