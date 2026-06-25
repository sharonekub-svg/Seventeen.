# Aptitude — micro-learning for Israeli aptitude tests

A Duolingo-style app for **דפ"ר / מבחן מיון** and **פסיכומטרי**: one question a
day, deep explanations, a structured learning path, and full gamification
(streaks, streak freezes, leaderboards, friends).

```
mobile/      Expo (React Native) app — iOS first
supabase/    Postgres schema (migrations), RLS, Edge Functions
```

## Architecture

- **Supabase** — Postgres + Auth + Row Level Security. Public gamification
  fields live in `profiles`; the push token is isolated in `profiles_private`.
- **Edge Functions** — answers are checked server-side so the correct option is
  never sent to the client before answering:
  - `daily-question` — assigns/returns today's question (no `is_correct`).
  - `submit-answer` — checks the answer, updates adaptive Elo, XP and streak,
    returns correctness + explanation.
  - `send-daily-push` — nightly Expo push reminder (protected by `CRON_SECRET`).
- **Adaptive engine** — per-user `user_ability` and per-question `elo`
  (Elo, K=32); `next_adaptive_question()` serves the question closest to the
  user's current ability.

## 1. Supabase setup

1. Create a project at https://supabase.com (region **`eu-central-1`** —
   Frankfurt, closest to Israel / GDPR).
2. Install the CLI and link the project:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref <YOUR_PROJECT_REF>
   ```
3. Apply the schema and seed:
   ```bash
   supabase db push
   ```
   This creates all tables + RLS and seeds 15 units with 10 levels each (150).
4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy daily-question
   supabase functions deploy submit-answer
   supabase functions deploy send-daily-push
   ```
5. The shared secret used by the nightly push is **provisioned automatically**
   by migration `0004_cron_secret_store.sql` (a random value stored in the
   service-role-only `app_config` table), so no manual `supabase secrets set`
   step is required. The function still falls back to a `CRON_SECRET` env var if
   you prefer Supabase function secrets:
   ```bash
   supabase secrets set CRON_SECRET=$(openssl rand -hex 16)
   ```
   (`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
   injected into functions automatically.)

### Nightly jobs (run once in the SQL editor)

Enable the extensions and schedule streak processing + the push. Only
`<PROJECT_REF>` needs substituting — the secret is read from `app_config`, so the
cron job and the function can never drift out of sync.

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Reset/freeze streaks just after midnight Israel time (~22:00 UTC).
select cron.schedule('process-streaks', '0 22 * * *', $$ select process_streaks() $$);

-- Daily reminder push at 17:00 Israel time (~14:00 UTC).
select cron.schedule(
  'daily-push', '0 14 * * *',
  $$ select net.http_post(
       url     := 'https://<PROJECT_REF>.functions.supabase.co/send-daily-push',
       headers := jsonb_build_object(
         'Content-Type','application/json',
         'x-cron-secret',(select value from public.app_config where key='cron_secret'))
     ) $$
);
```

## 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env          # fill EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
npx expo start                # open in Expo Go or a dev build
```

### Build & ship to the App Store (EAS)

Requires an Apple Developer account (99 USD/yr). Fill the placeholders in
`mobile/eas.json` (`appleId`, `ascAppId`, `appleTeamId`).

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview      # TestFlight / internal testing
eas build --platform ios --profile production   # store build
eas submit --platform ios
```

Start with **TestFlight** before a public release. Note: education / test-prep
apps need a clear privacy policy in App Store Connect.

### Accounts, entitlements & privacy
- **Account deletion** (Apple requirement): **Profile → Delete account** calls the
  `delete-account` Edge Function, which removes the `auth.users` row and cascades
  to all of the user's data.
- **Entitlements** (issue #5): `profiles.is_pro` / `pro_until` + the
  `has_pro_access()` helper gate premium content server-side. The paywall screen
  (`app/paywall.tsx`) presents the offer; hooking up StoreKit/IAP needs an Apple
  Developer account + App Store subscription products.
- **Privacy policy**: draft in [`PRIVACY.md`](./PRIVACY.md) — host it at a public
  URL and add that URL in App Store Connect.

## Tests & CI

Backend scoring logic (adaptive Elo, XP, streak transitions) is pure and unit
tested:

```bash
deno test supabase/functions/_shared/scoring_test.ts
```

GitHub Actions (`.github/workflows/ci.yml`) runs the Deno tests + a `deno check`
on the shared modules, and typechecks the Expo app (`npm ci` + `tsc --noEmit`)
on every push and PR.

## Section tests (end-of-subject exam)

The final level of every unit is a **10-minute timed test** (`levels.kind =
'section_test'`) that draws a random sample of questions from across the whole
unit via the `section_test(unit_id, limit)` RPC. It runs against a countdown
with no per-question feedback and shows a single score + stars at the end —
modelled on a real psychometric section (the official test uses 20-minute,
20–23-question sections). It unlocks only once every practice level in the unit
is completed.

## Analytics & monitoring

- **PostHog** (`mobile/lib/analytics.ts`) — initialised from
  `EXPO_PUBLIC_POSTHOG_KEY`; identifies the signed-in user and captures
  `level_completed`, `section_test_completed`, etc. No-ops when unset.
- **Error capture** (`mobile/lib/monitoring.ts`) — `captureError()` routes caught
  errors to PostHog as `app_error` events. A `EXPO_PUBLIC_SENTRY_DSN` seam is in
  place for a dedicated Sentry project once one is provisioned.

## 3. Content (questions)

Questions are **not** scraped from prep institutes (מכון נועם etc.) — that is a
copyright/ToS problem that would jeopardize the whole app. Instead:

1. Provide your own seed questions (questions you wrote or are licensed to use).
2. Generate **original** questions in the same *format and difficulty* (e.g. with
   an LLM under human review) — never light paraphrases of existing material.
3. Insert with `is_active = false`, review (QA), then flip to `true`:

```sql
insert into questions (track, level_id, difficulty, body, explanation, is_active)
values ('psychometric', <level_id>, 3, 'גוף השאלה', 'הסבר מעמיק', false)
returning id;

insert into answer_options (question_id, label, body, is_correct, position) values
  (<qid>, '1', 'אפשרות א', false, 0),
  (<qid>, '2', 'אפשרות ב', true,  1),
  (<qid>, '3', 'אפשרות ג', false, 2),
  (<qid>, '4', 'אפשרות ד', false, 3);
```

## Data model (high level)

| Table | Purpose |
|-------|---------|
| `profiles` / `profiles_private` | user + gamification / push token (split for privacy) |
| `units` → `levels` → `questions` → `answer_options` | learning path + bank |
| `user_answers` | solved history (`unique(user, question)` = solve-once lock) |
| `user_level_progress` | locked / unlocked / completed + stars |
| `user_ability` | adaptive ability per unit |
| `daily_assignments` | one question per day per user |
| `friendships` | friend requests / accepted |

Leaderboards: `global_leaderboard(limit)` and `friends_leaderboard()` (SQL
functions). Streak freezes: `profiles.streak_freezes`, spent by
`process_streaks()`.
