# coCalendar Project Guidelines

This document contains all development guidelines, standards, and best practices for the coCalendar project. It serves as the central reference for maintaining code quality and consistency.

## Table of Contents
1. [Project Structure & Architecture](#project-structure--architecture)
2. [Coding Standards & Best Practices](#coding-standards--best-practices)
3. [React Native & Expo Guidelines](#react-native--expo-guidelines)
4. [Supabase & Database Rules](#supabase--database-rules)
5. [Internationalization (i18n)](#internationalization-i18n)
6. [Development Workflow](#development-workflow)
7. [Git Commit Message Standards](#git-commit-message-standards)

---

## Project Structure & Architecture

<!-- Applies to: All files -->

This is a React Native + Expo project with a modular package architecture using workspaces.

### Main Structure
- **Root**: Contains `app/`, `supabase/`, `.gitignore`, `README.md`, `setup.ps1`
- **App**: `app/` contains the React Native Expo application
- **Database**: `supabase/` contains database migrations and edge functions

### Package Architecture
The app uses a modular package structure in `app/src/packages/`:

- `auth-view/` - Authentication screens and logic
- `calendar-view/` - Calendar interface components
- `day-view/` - Day timeline view with slots
- `home-view/` - Home screen components
- `shared/` - Shared utilities, state management, and theming
  - `store/` - Teaful global state management
  - `theme/` - Design tokens and styling
  - `utils/` - Common utility functions
- `icons/` - App-specific icons
- `i18n/` - Internationalization setup
- `slot-form-view/` - Slot creation and editing forms

### Key Files
- `app/App.tsx` - Main app entry point
- `app/package.json` - Dependencies and workspace configuration
- `app/app.config.js` - Expo configuration

### Workspace Setup
The project uses npm workspaces with packages defined in `app/package.json`. Each package has its own package.json and follows the `@project/package-name` naming convention.

---

## Coding Standards & Best Practices

<!-- Applies to: All files -->

### Code Quality Principles
- Follow DRY (Don't Repeat Yourself), KISS (Keep It Simple, Stupid), and YAGNI (You Aren't Gonna Need It) principles
- Use accurate, clear variable names to prevent confusion
- Code should be easily understandable for newcomers
- Keep proposed code fixes concise

### React/TypeScript Standards
- **NO direct React imports** - Use destructured imports throughout the project
- **Component Responsibility** - Each React component should have a single responsibility
- **Component Naming** - Use well-named, descriptive component names
- **Split Components** - Separate components for clarity and maintainability (e.g., separate date display and progress indicator components)

### State Management
- **Use Teaful exclusively** - Avoid React useState, use Teaful's store functions instead
- **Teaful Listeners** - Always use Teaful's setter functions for listening to changes, NOT React's useEffect
- **Centralized State** - Manage shared data via centralized state rather than prop drilling
- **Store Organization** - State management files are in `app/src/packages/shared/store/`

### Comments and Documentation
- **All code comments must be in English**
- Document complex business logic
- Use clear, descriptive function and variable names to reduce need for comments

### File Organization
- **Feature-based organization** - Organize by features rather than technical layers
- **Clear naming conventions** - Use consistent naming within layers (UI, shared, data, etc.)
- **Separation of concerns** - Enforce modular components and extract business logic into custom hooks
- **Centralized types** - TypeScript types should be centralized for reuse

---

## React Native & Expo Guidelines

<!-- Applies to: *.tsx, *.ts, *.js, *.jsx -->

### Technology Stack
- **React Native** with **Expo** (no native code, pure Expo workflow)
- **Navigation**: React Navigation v7
- **Calendar**: Flash Calendar (prefer Flash Calendar for any calendar functionality)
- **State**: Teaful for global state management
- **Styling**: Custom theme system in `app/src/packages/shared/theme/`

### Expo-Specific Rules
- **No native Android/iOS folders** - Use Expo managed workflow exclusively
- **No direct native code** - All functionality should be achievable through Expo APIs
- **Configuration** in `app/app.config.js`

### Component Architecture
- **UI Components** - Place reusable UI components in their own packages
- **Cross-screen components** - Components used across multiple screens (like bottom navigation) should be in separate packages
- **Package structure** - Each package should have `ui/`, `shared/`, and optionally `data/` directories

### Styling Guidelines
- **Default Font**: Nunito (defined in theme)
- **Font Family**: Only set fontFamily when it differs from default to prevent errors
- **Theme System**: Use centralized theme from `app/src/packages/shared/theme/`
- **No extra CSS files** - Modify existing styles rather than creating new CSS files

### Calendar Implementation
- **Flash Calendar Only** - Any calendar-related functionality should use Flash Calendar exclusively
- **No react-native-calendars** - Migrate away from react-native-calendars to Flash Calendar

### Icons and Assets
- **Icon Organization** - Each icon in its own file, named correctly
- **Icon Location** - App icons in `app/src/packages/icons/app/`
- **Asset Separation** - Keep app icons separate from user asset icons

---

## Supabase & Database Rules

<!-- Applies to: *.sql, supabase/**/* -->

### Environment Configuration
- **Environment Variables**:
  - `EXPO_PUBLIC_SUPABASE_URL` - Supabase endpoint URL
  - `EXPO_PUBLIC_SUPABASE_KEY` - Public key (replaces deprecated anon key)
- **No hardcoded URLs** - Use dynamic solutions for redirect URIs, not hardcoded addresses
- **Cloud Database** - Use cloud Supabase database directly, not local Docker instance

### Database Structure
Located in `supabase/` with:
- `supabase/config.toml` - Project configuration
- `supabase/migrations/` - Database schema migrations
- `supabase/functions/` - Edge functions

### TypeScript Integration
- **Module Resolution** - Set TypeScript's moduleResolution to "node" for automatic SupabaseClient typing
- **Avoid manual type definitions** - Let TypeScript infer types automatically from Supabase

### Data Model
Key tables include:
- `profiles(id, role, display_name, created_at)`
- `clients(id, pro_id, display_name, email, user_id, created_at)`
- `slots(id, pro_id, client_id, title, start_at, end_at, visibility, created_at)`
- `slot_shared_content(slot_id PK, shared_note, shared_checklist)`
- `slot_private_content(slot_id PK, private_note, private_checklist)`

### Row Level Security (RLS)
- **Pro access**: Full access where `pro_id = auth.uid()`
- **Client access**: Can select only slots where `visibility = 'public'` and `client_id` belongs to them
- **Private content**: Pro-only access
- **Shared content**: Pro + linked client access

---

## Internationalization (i18n)

<!-- Applies to: *.tsx, *.ts, *.js, *.jsx -->

### i18n System Location
All internationalization functionality is in `app/src/packages/i18n/`:
- `app/src/packages/i18n/translations/` - Translation files
- `app/src/packages/i18n/locale/` - Locale configuration
- `app/src/packages/i18n/formatters/` - Date/number formatters
- `app/src/packages/i18n/hooks.ts` - i18n hooks

### String Localization Rules
- **NO hardcoded UI strings** - All UI strings must be included in the i18n system
- **Every future implementation** must use localized strings
- **No exceptions** - Even simple text like "Cancel", "Save", etc. must be localized

### Implementation Requirements
- Use i18n hooks from `app/src/packages/i18n/hooks.ts`
- Add new strings to translation files in `app/src/packages/i18n/translations/`
- Follow existing key naming conventions
- Ensure all user-facing text supports multiple languages

### Examples of What Must Be Localized
- Button labels ("Save", "Cancel", "Delete")
- Form labels and placeholders
- Error messages
- Status messages
- Navigation labels
- Any text visible to users

---

## Development Workflow

<!-- Applies to: All files -->

### Problem-Solving Approach
- **Think deeply** - Re-verify solutions before declaring them finished
- **Ask clarifying questions** if explanations are unclear
- **Avoid rebuilding loops** - Take time to understand the problem fully first
- **Read documentation thoroughly** - Verify changes against library documentation before declaring fixes complete

### Command Execution
- **Automatic terminal commands** - Run commands via terminal automatically rather than instructing manual UI actions
- **No manual steps** - Automate wherever possible

### Git and Version Control
- **Clean commits** - Keep git history clean and meaningful
- **Proper .gitignore** - Ensure all unnecessary files are ignored
- **Node modules** - Always ignore node_modules at all levels (`node_modules/` and `**/node_modules/`)

### File Management
- **Edit existing files** - Always prefer editing existing files over creating new ones
- **No unnecessary files** - Don't create files unless absolutely necessary
- **No proactive documentation** - Only create documentation files (*.md) when explicitly requested

### Package Management
- **Workspace structure** - Use npm workspaces as defined in `app/package.json`
- **Package naming** - Use `@project/package-name` convention
- **Dependencies** - Keep dependencies in appropriate package.json files

### Testing and Quality
- **Fix linter errors** - Address linting issues when they're introduced
- **Don't loop excessively** - Stop after 3 attempts to fix linter errors and ask for guidance
- **Type safety** - Maintain TypeScript strict mode compliance

---

## Git Commit Message Standards

<!-- Applies to: All files -->

All commit messages must follow the Conventional Commits specification with this exact format:

```
<type>(<scope>): <title>

<description or todo list>
```

### Commit Types

**Primary Types:**
- `feat`: A new feature for the user
- `fix`: A bug fix for the user
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `style`: Changes that do not affect code meaning (formatting, missing semicolons, etc.)
- `test`: Adding or updating tests
- `docs`: Documentation changes

**Secondary Types:**
- `build`: Changes to build system or dependencies (webpack, npm, etc.)
- `ci`: Changes to CI/CD configuration (GitHub Actions, etc.)
- `chore`: Maintenance tasks (updating dependencies, etc.)
- `revert`: Reverts a previous commit

### Scope Guidelines

Use package names or feature areas as scope:
- `day-view`: Changes to day view package
- `auth-view`: Changes to authentication
- `shared`: Changes to shared utilities
- `calendar-view`: Changes to calendar interface
- `slot-form-view`: Changes to slot forms
- `i18n`: Internationalization changes
- `icons`: Icon-related changes
- `supabase`: Database or backend changes

### Format Examples

```
feat(day-view): add slot drag and drop functionality

- Implement drag and drop for time slots
- Add visual feedback during drag operations
- Update slot positioning logic
```

```
fix(auth-view): resolve login redirect issue

Fixed redirect URI not working in production environment
```

```
refactor(shared): optimize theme performance

- Memoize theme calculations
- Reduce re-renders in theme provider
- Clean up unused theme variables
```

### Breaking Changes

For breaking changes, add `!` after the type/scope:

```
feat(shared)!: update Teaful store structure

BREAKING CHANGE: Store structure has changed, requires migration
```

### Rules

1. **Title**: Keep under 50 characters, use imperative mood ("add" not "added")
2. **Description**: Use bullet points for multiple items, wrap at 72 characters
3. **Scope**: Always use lowercase, match package names when possible
4. **Type**: Must be one of the approved types listed above
5. **Format**: Always include scope in parentheses, even if it's general like `(app)`


### Reanimated Guidelines
- when using reanimated, never use runOnJS but scheduleOnRN instead, runOnJS is deprecated