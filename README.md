# coCalendar

**A beautifully designed personal calendar app for iOS and Android that makes scheduling and sharing effortless.**

coCalendar is a premium mobile calendar application that prioritizes exceptional design and user experience. Built for anyone who values organized time management and seamless sharing, it transforms how you schedule and collaborate on appointments with friends, family, and colleagues.

## Key Features

**🎨 Beautiful Design First**
- Stunning visual interface with intuitive avatars for instant day overview
- Premium UX/UI focused on simplicity and elegance
- Color-coded slots for immediate visual recognition

**👥 Smart Sharing**
- Share specific time slots directly with anyone
- Maintain privacy with personal slots while selectively sharing others
- Perfect for coordinating with friends, family, or working together
- Invite others to view your scheduled activities

**⚡ Effortless Setup**
- Quick and intuitive onboarding process
- Seamless synchronization across devices
- No complex configuration required

**🤝 Collaborative Planning**
- Share slots for better coordination and accountability
- Read-only access for shared users ensures data integrity
- Direct user-to-user invitations for specific time slots
- Perfect transparency without compromising privacy

**🔒 Privacy Control**
- Personal slots remain completely private by default
- Shared slots create transparency when needed
- Perfect for family coordination (appointments, activities, events)
- Great for professionals tracking time with others

Whether you're coordinating family schedules, planning with friends, or managing professional commitments, coCalendar serves as your shared source of truth for time management.

## 🔄 **Peer-to-Peer Model**

coCalendar uses a **peer-to-peer sharing system** where all users have equal status:

### **How Sharing Works:**
1. **Create slots** - All your slots are private by default
2. **Invite specific users** - Send direct invitations for individual slots  
3. **Granular control** - Share only what you want, when you want
4. **Read-only participants** - Shared slots are view-only for participants

### **Example Use Cases:**
- **Family**: Share "Soccer Practice" with family members for coordination
- **Social**: Share "Birthday Party" planning with friend group  
- **Work**: Share "Team Meeting" with colleagues for transparency
- **Professional**: Share appointment or work slots for accountability
- **Healthcare**: Share medical appointments with caregivers

### **Privacy by Design:**
- **No participants** = Private slot (owner only)
- **Has participants** = Shared slot (owner + invited users)
- **Owner always** has full edit control
- **Participants always** have read-only access

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

## Data Model (Supabase) - Peer-to-Peer Architecture

### **Core Tables:**
```sql
-- All users are equal (no roles)
profiles(id, display_name, created_at)

-- Slots with owner-based permissions  
slots(id, owner_id, title, start_at, end_at, color, image, voice_*, completed, without_time, created_at)
-- Index: (owner_id, start_at)

-- Peer-to-peer sharing via junction table
slot_participants(slot_id, user_id, invited_by, created_at)
-- Primary key: (slot_id, user_id)
-- Index: (user_id) for "show me shared slots"

-- Task management within slots
slot_tasks(id, slot_id, text, is_done, position, created_at)

-- Notification system
reminders(id, slot_id, minutes_before, target, created_at)
-- target: 'owner' | 'participants'

-- Push notification tokens
push_tokens(user_id, expo_token, platform)

-- Direct user-to-user invitations for specific slots
invites(id, inviter_id, invitee_id, slot_id, invitee_email, token, status, created_at, expires_at)
-- Either invitee_id OR invitee_email (for users without accounts)
-- Index: (invitee_id) for "show me my invites"
```

### **Privacy Model:**
```sql
-- Private slot (owner only)
SELECT COUNT(*) FROM slot_participants WHERE slot_id = ? -- Returns: 0

-- Shared slot (has participants)  
SELECT COUNT(*) FROM slot_participants WHERE slot_id = ? -- Returns: 1+
```

### **Access Control (RLS):**
- **Slot Owner**: Full read/write access (`owner_id = auth.uid()`)
- **Slot Participant**: Read-only access via `slot_participants` table
- **Tasks & Reminders**: Owner manages, participants have read-only access
- **Invitations**: Inviters manage sent invites, invitees see received invites

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
*Note: This will apply the new peer-to-peer model migrations*

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
- **Group Calendars**: Multi-user collaborative calendars for teams and families
- **Enhanced Sharing**: Bulk sharing and calendar templates
- **Social Features**: Activity feeds and shared calendar discovery
- **Advanced Notifications**: Smart scheduling suggestions and conflict detection

### Technical Enhancements
- **Advanced Theming**: Dark mode and customizable color schemes
- **Offline Support**: Local data caching and sync
- **Performance**: Enhanced animations and faster load times
- **Platform Features**: Deep iOS and Android integration

### Professional Features
- **Time Tracking**: Optional time tracking for professional use cases
- **Export Capabilities**: PDF reports, CSV exports for planning and billing
- **Integration**: Connect with popular calendar and productivity systems
- **Advanced Permissions**: Granular sharing controls and time-limited access
