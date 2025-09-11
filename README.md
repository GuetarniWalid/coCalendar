# coCalendar

Shared agenda app for professionals and their clients. A pro owns a calendar; slots are either private (pink) or shared with one client (blue). Each slot has a shared section (pro + client) and a private section (pro only).

## Stack

- React Native + Expo (+ EAS builds)
- Auth: Google (Supabase Auth)
- DB: Supabase (Postgres + RLS)
- Push: Expo Notifications
- Calendar UI: `react-native-calendars`
- Deep links: Expo Linking (scheme: `cocalendar`)

## Repo Structure

```
coCalendar/
├── app/                      # Expo React Native app
│   ├── App.tsx               # Main app entry point
│   ├── app.config.js         # Expo configuration (scheme: cocalendar)
│   ├── package.json          # Dependencies & workspace config
│   ├── src/
│   │   ├── packages/         # Modular package structure
│   │   │   ├── auth-view/    # Authentication screens
│   │   │   ├── calendar-view/ # Calendar interface
│   │   │   ├── day-view/     # Day timeline view
│   │   │   ├── home-view/    # Home screen
│   │   │   ├── shared/       # Shared utilities & state
│   │   │   │   ├── store/    # Teaful global state
│   │   │   │   ├── theme/    # Design tokens
│   │   │   │   └── utils/    # Common utilities
│   │   │   ├── icons/        # App icons
│   │   │   ├── i18n/         # Internationalization
│   │   │   └── slot-form-view/ # Slot creation/editing
│   │   └── types/            # TypeScript definitions
│   └── assets/               # Static assets
├── supabase/                 # Database & backend
│   ├── config.toml           # Supabase project config
│   ├── migrations/           # Database schema migrations
│   └── functions/            # Edge functions
│       ├── send_reminders/
│       ├── redeem_invite/
│       └── monthly_recap/
├── .gitignore               # Git ignore rules
├── setup.ps1               # Windows setup script
└── README.md
```

## Data Model (Supabase)

- `profiles(id, role, display_name, created_at)`
- `clients(id, pro_id, display_name, email, user_id, created_at)`
- `slots(id, pro_id, client_id, title, start_at, end_at, visibility, created_at)` with index `(pro_id, start_at)`
- `slot_shared_content(slot_id PK, shared_note, shared_checklist)`
- `slot_private_content(slot_id PK, private_note, private_checklist)`
- `reminders(id, slot_id, minutes_before, target, created_at)`
- `push_tokens(user_id, expo_token, platform)` unique `(user_id, expo_token)`
- `invites(id, pro_id, client_id, token unique, status, created_at, expires_at)`

RLS essentials implemented in the migration:
- Pro: full access where `pro_id = auth.uid()`.
- Client: can select only slots where `visibility = 'public'` and `client_id` belongs to them (via `clients.user_id = auth.uid()`).
- `slot_private_content`: pro-only; `slot_shared_content`: pro + linked client.

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm i -g @expo/cli`
- Supabase CLI: `npm i -g supabase`
- Deno (for Edge Functions)

### 1) Environment

Create `app/.env` with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
```

Set Supabase Auth Redirect URLs (Dashboard → Authentication → URL Configuration):
- `cocalendar://auth/callback`
- Your Expo dev redirect (generated dynamically by the app during dev)

### 2) Database (local dev)

```
cd supabase
supabase start
supabase db reset --debug
```

### 3) Edge Functions

```
supabase functions deploy send_reminders
supabase functions deploy redeem_invite
supabase functions deploy monthly_recap
```

### 4) Mobile App

```
cd app
npm install
npm run start
```

## Calendar UI

- Month grid: `react-native-calendars` using `markedDates` for pink/blue markers.
- Day view: custom timeline (`DayScreen`) with stacked bubbles, inline duration labels.

## Deep Links

- Scheme: `cocalendar`
- Redirect helper uses dynamic dev URLs and `cocalendar://auth/callback` in production.

## Push Notifications

- Uses `expo-notifications`. Add platform-specific permissions as needed. Store tokens in `push_tokens`.

## Roadmap (Post-MVP)

- Kilometric calculation: per-day routing distance and monthly export.
