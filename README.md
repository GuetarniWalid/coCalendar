# coCalendar

**A beautifully designed personal calendar app for iOS and Android that makes scheduling effortless.**

coCalendar is a premium mobile calendar application that prioritizes exceptional design and user experience. Built for professionals, families, and anyone who values organized time management, it transforms how you schedule and share appointments.

## Key Features

**🎨 Beautiful Design First**
- Stunning visual interface with intuitive avatars for instant day overview
- Premium UX/UI focused on simplicity and elegance
- Color-coded slots for immediate visual recognition

**👥 Smart Sharing**
- Share specific time slots with friends, family, or professional clients
- Maintain privacy with personal slots while selectively sharing others
- Perfect for professionals tracking billable hours with clients

**⚡ Effortless Setup**
- Quick and intuitive onboarding process
- Seamless synchronization across devices
- No complex configuration required

**📊 Professional Tools**
- Automatic time tracking for client billing
- Shared accountability between you and your clients
- Future features: mileage tracking for tax purposes, client statistics, and detailed analytics

**🔒 Flexible Privacy**
- Personal slots remain completely private
- Shared slots create transparency without compromising privacy
- Perfect for parent-child coordination (doctor appointments, activities)
- Ideal for professional-client relationships

Whether you're a consultant tracking billable hours, a parent coordinating family schedules, or a professional maintaining client relationships, coCalendar serves as your shared source of truth for time management.

## Stack

- **Frontend**: React Native + Expo (+ EAS builds)
- **Navigation**: React Navigation v7 (Native Stack)
- **State Management**: Teaful (global state)
- **Auth**: Google (Supabase Auth)
- **Database**: Supabase (Postgres + RLS)
- **Push Notifications**: Expo Notifications
- **Calendar UI**: Flash Calendar (`@marceloterreiro/flash-calendar`)
- **Lists**: FlashList (`@shopify/flash-list`)
- **Date Handling**: Day.js + Moment.js
- **Deep Links**: Expo Linking (scheme: `cocalendar`)
- **Icons**: Expo Vector Icons + Custom SVG icons
- **Internationalization**: Custom i18n setup
- **TypeScript**: Full TypeScript support

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
│   │   │   ├── bottom-navigation/ # Bottom navigation component
│   │   │   ├── calendar-view/ # Calendar interface
│   │   │   ├── day-view/     # Day timeline view with slots
│   │   │   ├── home-view/    # Home screen
│   │   │   ├── shared/       # Shared utilities & state
│   │   │   │   ├── store/    # Teaful global state management
│   │   │   │   ├── theme/    # Design tokens & theming
│   │   │   │   ├── types/    # Shared TypeScript types
│   │   │   │   ├── ui/       # Shared UI components
│   │   │   │   └── utils/    # Common utilities
│   │   │   ├── icons/        # App-specific SVG icons
│   │   │   ├── i18n/         # Internationalization setup
│   │   │   └── slot-form-view/ # Slot creation/editing forms
│   │   └── types/            # Global TypeScript definitions
├── supabase/                 # Database & backend
│   ├── config.toml           # Supabase project config
│   ├── migrations/           # Database schema migrations
│   └── functions/            # Edge functions
│       ├── send_reminders/   # Notification reminders
│       ├── redeem_invite/    # Invite redemption
│       └── monthly_recap/    # Monthly reports
├── .gitignore               # Git ignore rules
├── setup.ps1               # Windows setup script
└── README.md
```

## Architecture

The app uses a **workspace-based package architecture** with npm workspaces. Each feature is organized as a separate package with the `@project/package-name` convention, promoting modularity and clear separation of concerns.

### Key Architectural Decisions

- **Feature-based organization** over technical layers
- **Teaful for state management** instead of React's useState
- **Single responsibility components** with clear naming conventions
- **Centralized theming** with design tokens
- **Modular package structure** for scalability

## Data Model (Supabase)

- `profiles(id, role, display_name, created_at)`
- `clients(id, pro_id, display_name, email, user_id, created_at)`
- `slots(id, pro_id, client_id, title, start_at, end_at, visibility, color, created_at)` with index `(pro_id, start_at)`
- `slot_tasks(id, slot_id, title, completed, created_at)`
- `slot_shared_content(slot_id PK, shared_note, shared_checklist)`
- `slot_private_content(slot_id PK, private_note, private_checklist)`
- `reminders(id, slot_id, minutes_before, target, created_at)`
- `push_tokens(user_id, expo_token, platform)` unique `(user_id, expo_token)`
- `invites(id, pro_id, client_id, token unique, status, created_at, expires_at)`

**RLS (Row Level Security)** essentials implemented in the migration:
- **Pro**: full access where `pro_id = auth.uid()`
- **Client**: can select only slots where `visibility = 'public'` and `client_id` belongs to them (via `clients.user_id = auth.uid()`)
- `slot_private_content`: pro-only; `slot_shared_content`: pro + linked client

## Setup

### Prerequisites

- **Node.js 18+** and npm
- **Expo CLI**: `npm i -g @expo/cli`
- **Supabase CLI**: `npm i -g supabase`
- **Deno** (for Edge Functions)

### 1) Environment

Create `app/.env` with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
```

Set **Supabase Auth Redirect URLs** (Dashboard → Authentication → URL Configuration):
- `cocalendar://auth/callback`
- Your Expo dev redirect (generated dynamically by the app during dev)

### 2) Database Setup

For **cloud Supabase** (recommended):
```bash
cd supabase
supabase db push
```

For **local development**:
```bash
cd supabase
supabase start
supabase db reset --debug
```

### 3) Edge Functions

```bash
supabase functions deploy send_reminders
supabase functions deploy redeem_invite
supabase functions deploy monthly_recap
```

### 4) Mobile App

```bash
cd app
npm install
npm start
```

## Development

### Scripts

- `npm start` - Start Expo development server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run check-all` - Run both type checking and linting
- `npm run db:push` - Push database changes to Supabase

### Git Workflow

The project uses **Conventional Commits** format:
```
<type>(<scope>): <title>

<description or todo list>
```

Example:
```
feat(day-view): add slot drag and drop functionality

- Implement drag and drop for time slots
- Add visual feedback during drag operations
- Update slot positioning logic
```

## Calendar UI

- **Month grid**: Flash Calendar with `markedDates` for pink/blue slot markers
- **Day view**: Custom timeline with slot bubbles, duration labels, and progress indicators
- **Date selection**: Integrated date picker with month/year navigation

## Deep Links

- **Scheme**: `cocalendar`
- **Auth callback**: `cocalendar://auth/callback`
- Dynamic redirect URI generation for development environments

## Push Notifications

- Uses **Expo Notifications** with platform-specific permissions
- Tokens stored in `push_tokens` table
- Reminder notifications via Edge Functions

## State Management

- **Teaful** for global state management
- Store modules: `auth`, `calendar`, `theme`, `slot-form`
- Teaful listeners instead of React's useEffect for state changes

## Internationalization

- Custom i18n setup with locale management
- Formatters for dates, numbers, and text
- All UI strings externalized (no hardcoded text)

## Roadmap

### Upcoming Features
- **Mileage Tracking**: Automatic distance calculation for tax deduction purposes
- **Client Analytics**: Detailed statistics and reporting per client
- **Advanced Billing**: Automated invoicing based on tracked hours
- **Enhanced Sharing**: Group calendars for teams and families

### Technical Enhancements
- **Advanced Theming**: Dark mode and customizable color schemes
- **Offline Support**: Local data caching and sync
- **Performance**: Enhanced animations and faster load times
- **Platform Features**: Deep iOS and Android integration

### Professional Tools
- **Export Capabilities**: PDF reports, CSV exports for accounting
- **Integration**: Connect with popular billing and CRM systems
- **Advanced Notifications**: Smart reminders and scheduling suggestions
- **Multi-timezone**: Global professional support
