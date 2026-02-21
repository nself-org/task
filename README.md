# ɳDemo

**The "code once, deploy everywhere" boilerplate for modern applications.**

A production-ready monorepo boilerplate with a self-hosted backend (ɳSelf) and a universal Next.js frontend. Build your backend with Docker + Hasura + Postgres, build your frontend with any AI agent or by hand, deploy to any platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## What Is This?

This is a **production-ready demo application** showcasing the ɳSelf platform. Use it as a reference implementation and boilerplate. It provides:

- A complete **backend stack** (PostgreSQL + Hasura + Auth + Storage) that runs anywhere Docker runs
- A universal **frontend app** (Next.js + TypeScript + Tailwind) that deploys to web, desktop, and mobile
- A **backend abstraction layer** so you can swap between ɳSelf, Supabase, Nhost, or Bolt without changing application code
- Full compatibility with **AI coding agents** (Bolt.new, Lovable, AI agents, Cursor, etc.)

Clone it. Configure it. Build your app on top of it.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Backend (`/backend`)](#backend)
5. [Frontend (Root)](#frontend)
6. [Backend Providers](#backend-providers)
7. [Environment Configuration](#environment-configuration)
8. [Using with AI Agents](#using-with-ai-agents)
9. [Deployment Guide](#deployment-guide)
10. [Customization Checklist](#customization-checklist)
11. [Platform Targets](#platform-targets)
12. [Developer Tools](#developer-tools)
13. [Scripts Reference](#scripts-reference)
14. [Tech Stack](#tech-stack)
15. [Contributing](#contributing)

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                         YOUR APP                                 |
+------------------------------------------------------------------+
|                                                                  |
|  /backend                        /frontend                       |
|  ┌──────────────────────┐        ┌────────────────────────────┐  |
|  │ PostgreSQL 16        │        │ Next.js 15 (App Router)    │  |
|  │ Hasura GraphQL Engine│ <----> │ Backend Abstraction Layer  │  |
|  │ Hasura Auth (JWT)    │        │ React 19 + TypeScript      │  |
|  │ Hasura Storage (S3)  │        │ Tailwind CSS + shadcn/ui   │  |
|  │ MinIO (Object Store) │        │ Multi-platform support     │  |
|  │ Traefik (HTTPS)      │        │ PWA + Desktop + Mobile     │  |
|  └──────────────────────┘        └────────────────────────────┘  |
|                                                                  |
|  Runs on: VPS, bare metal,      Deploys to: Vercel, Netlify,     |
|  Docker, localhost               Desktop (Tauri), Mobile (Cap)   |
+------------------------------------------------------------------+
```

The key insight: **your frontend code never imports backend SDKs directly.** Everything goes through a unified abstraction layer with hooks like `useAuth`, `useQuery`, `useMutation`, `useStorage`, and `useRealtime`. Change your backend provider with a single environment variable.

---

## ⚡ Quick Start

**Get a production-ready full-stack app running in under 2 minutes:**

### Prerequisites

- [ɳSelf CLI](https://github.com/nself-org/cli) installed:
  ```bash
  curl -sSL https://install.nself.org | bash
  ```
- [Docker](https://docs.docker.com/get-docker/) running
- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/installation)

### Start Your App

```bash
# 1. Clone the repo
git clone https://github.com/nself-org/demo.git my-app
cd my-app

# 2. Start the backend (one command - auto-builds on first run!)
nself start

# 3. Start the frontend (in new terminal)
cd frontend
pnpm install && pnpm dev
```

**That's it!** Your complete application with database, GraphQL API, auth, storage, and frontend is now running.

### 🎯 Access Your App

| Service | URL | Description |
|---------|-----|-------------|
| **🌐 App** | http://localhost:3000 | Your Next.js frontend |
| **🚀 GraphQL API** | https://api.local.nself.org/v1/graphql | Hasura GraphQL endpoint |
| **📊 Console** | https://console.local.nself.org | Hasura admin console |
| **🔐 Auth** | https://auth.local.nself.org | Auth service API |
| **📦 Storage** | https://storage.local.nself.org | File storage API |
| **📧 Email (dev)** | https://mail.local.nself.org | Email testing UI |

All `*.local.nself.org` domains work with **automatic SSL certificates** (no browser warnings!) thanks to ɳSelf's smart SSL system.

**First time?** Run `nself trust` to install the SSL certificate (one-time setup).

### What `nself start` Does

When you run this command, ɳSelf automatically:

- ✅ **Launches PostgreSQL** with all extensions configured
- ✅ **Starts Hasura GraphQL Engine** with your schema and permissions
- ✅ **Starts Auth service** with email + OAuth providers ready
- ✅ **Starts Storage service** with S3-compatible object storage (MinIO)
- ✅ **Applies database migrations** and creates your tables
- ✅ **Sets up real-time WebSocket subscriptions** for collaborative features
- ✅ **Configures SSL certificates** for all `*.local.nself.org` domains
- ✅ **Sets up nginx reverse proxy** with intelligent routing

**Zero configuration required.** Everything just works out of the box.

> **Note**: On first run, `nself start` will automatically run `nself build` to generate the Docker Compose configuration. This takes about 30 seconds the first time, then subsequent starts are instant.

### First Login

After starting the app, you can either:

1. **Register a new account** at <http://localhost:3000/register>
2. **Use demo accounts** (run seed script first: `cd backend && pnpm run seed`):
   - `owner@nself.org` / `password` (Owner role)
   - `admin@nself.org` / `password` (Admin role)
   - `user@nself.org` / `password` (User role)

Demo accounts come with sample lists and todos to explore the features.

### Alternative: Using Docker Compose Directly

If you prefer traditional Docker Compose (without ɳSelf CLI):

```bash
# Backend - uses the ready-to-go docker-compose.yml
cd backend
cp .env.example .env  # Copy environment file
make up               # Start all services

# Frontend (in new terminal)
cd frontend
pnpm install && pnpm dev
```

**Access points when using Docker Compose directly**:
- App: http://localhost:3000
- GraphQL API: http://localhost:8080/v1/graphql
- Hasura Console: http://localhost:8080/console
- Auth: http://localhost:4000

> **Note**: The `backend/` folder contains a complete, ready-to-use Docker Compose setup as a reference example. This is useful for developers who want to understand the infrastructure or deploy without the ɳSelf CLI.

### ⚙️ What Just Happened?

The `nself start` command:
- ✅ Launched PostgreSQL database
- ✅ Started Hasura GraphQL Engine
- ✅ Initialized authentication service
- ✅ Set up MinIO object storage
- ✅ Configured automatic SSL certificates
- ✅ Created all database tables (`app_lists`, `app_todos`, `app_profiles`, `app_list_shares`, `app_list_presence`, etc.)
- ✅ Applied permissions and RLS policies
- ✅ Set up real-time subscriptions for collaborative features
- ✅ Started email service (MailPit for dev)

**Everything is production-ready** with zero configuration!

---

## 🔧 Alternative Setup Options

### Option A: Using Docker Compose (Without ɳSelf CLI)

If you don't want to use the ɳSelf CLI:

```bash
cd backend
docker-compose up -d
cd ../frontend
pnpm install && pnpm dev
```

**Access:**
- App: http://localhost:3000
- Hasura: http://localhost:8080/console
- Auth: http://localhost:4000

### Option B: Frontend Only (Managed Backend)

Using Supabase or Nhost? Skip the backend entirely:

```bash
git clone https://github.com/nself-org/demo.git my-app
cd my-app/frontend

# Configure your backend
cp env/.env.local.example env/.env.local
# Edit env/.env.local:
#   NEXT_PUBLIC_BACKEND_PROVIDER=supabase
#   NEXT_PUBLIC_SUPABASE_URL=your-project-url
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

pnpm install && pnpm dev
```

---

## 📖 Next Steps

1. **Explore the Collaborative Lists App**
   - Create multiple todo lists with custom colors and descriptions
   - Share lists with other users (owner/editor/viewer permissions)
   - See real-time presence - know who's viewing or editing
   - Collaborate in real-time with instant updates
2. **Customize Your Database** - Add your own tables via Hasura Console
3. **Build Your Features** - Use the lists app as a reference implementation
4. **Deploy to Production** - See [Deployment Guide](.wiki/Deployment.md)

---

## ✨ Key Features

### 🎯 **Google Docs-like Collaborative Todo Lists**

This is not just a simple todo app - it's a **production-ready collaborative task management system** with 35+ advanced features:

#### **📋 List Management**
- **Multiple Lists**: Create unlimited lists with custom colors, icons, and descriptions
- **Smart Organization**: Drag-and-drop reordering, default list support
- **List Templates**: Shopping list, work tasks, travel checklist, etc.
- **Location-Based Lists**: Attach geo-coordinates to lists (e.g., "Grocery - Whole Foods")
- **Arrival Reminders**: Get notified when entering a list's location radius (100m default)

#### **✅ Advanced Todo Features**
- **Rich Task Metadata**:
  - 📅 **Due Dates** with natural language input ("tomorrow", "next monday", "in 3 days")
  - 🎨 **Priority Levels**: None, Low, Medium, High (color-coded)
  - 🏷️ **Tags**: Autocomplete, multi-select, filter by tags
  - 📝 **Notes**: Long-form notes attached to each todo
  - 📎 **Attachments**: Multiple files per todo (images, PDFs, etc.)
  - 📍 **Location**: Geolocation with radius-based reminders
  - 🔁 **Recurring Tasks**: Daily, weekly, monthly patterns

- **Smart Features**:
  - ⏰ Auto-reset recurring tasks at 3:00 AM daily
  - 🔔 Due date reminders (customizable: 60/30/15 mins before)
  - 🌆 Evening digest at 8:00 PM with tomorrow's tasks
  - 🗺️ Location-based reminders (uses Haversine distance calculation)
  - 📊 Overdue highlighting with color-coded urgency

#### **👥 Real-Time Collaboration**
- **Live Presence**: See who's viewing/editing each list in real-time
- **User Avatars**: Overlapping avatar stack (max 5 visible, "+N" for overflow)
- **Editing Indicators**: Visual cues when someone is editing a specific todo
- **Instant Sync**: Changes propagate to all collaborators within 500ms
- **Conflict Resolution**: Last-write-wins with optimistic updates

#### **🔐 Advanced Sharing**
- **Granular Permissions**:
  - 👑 **Owner**: Full control (edit, delete, share, manage permissions)
  - ✏️ **Editor**: Can add/edit/complete todos
  - 👁️ **Viewer**: Read-only access
- **Invite System**: Email-based invites with pending/accepted workflow
- **Public Links**: Generate shareable links for lists
- **Permission Management**: Change permissions or revoke access anytime
- **Shared Lists Dashboard**: Dedicated view for lists shared with you

#### **🔍 Advanced Search & Filtering**
- **Real-time Search**: Instantly search across todos, notes, and tags
- **Multi-faceted Filters**:
  - Filter by completion status (Active/Completed)
  - Filter by priority level (High/Medium/Low)
  - Filter by tags (multi-select)
  - Filter by due date range
- **Active Filter Badges**: Visual indicators showing active filters with quick remove
- **Filter Persistence**: Filters stay active while navigating

#### **📊 Smart Sorting**

- **7 Sort Options**:
  - Position (manual drag-and-drop order)
  - Created (Newest first / Oldest first)
  - Due Date (Soonest first / Latest first)
  - Priority (High to Low)
  - Title (A-Z alphabetically)
- **Persistent Sort**: Sort preference remembered across sessions
- **Visual Sort Indicator**: Clear indication of current sort order

#### **⚡ Bulk Operations**

- **Multi-Select Mode**: Toggle selection mode with one click
- **Floating Action Toolbar**: Appears when items are selected
- **Bulk Actions**:
  - Complete multiple todos at once
  - Uncomplete multiple todos
  - Delete multiple todos (with confirmation)
  - Move todos between lists (coming soon)
- **Selection Count Badge**: Shows number of selected items
- **Visual Selection**: Selected items highlighted with primary color

#### **📅 Smart Views**

- **Today View** (`/today`):
  - See all todos due today across all lists
  - Grouped by list with color indicators
  - Current date prominently displayed
- **Overdue View** (`/overdue`):
  - All past-due incomplete todos
  - Sorted by due date (most overdue first)
  - Shows "overdue by X" time indicators
  - Warning-styled UI for urgency
- **Calendar View** (`/calendar`):
  - Week-at-a-glance layout (Sunday-Saturday)
  - Navigate between weeks with prev/next/today buttons
  - Todos displayed in day columns
  - Color-coded by list
  - Today's column highlighted
  - Task count badges on each day

#### **📎 Attachment Management**

- **Drag-and-Drop Upload**: Drop files directly onto todos
- **File Preview**: Icons for different file types (images, documents, etc.)
- **Download & Delete**: Full file lifecycle management
- **File Metadata**: Shows size, upload date, and mime type
- **Upload Progress**: Visual feedback during uploads
- **10MB Limit**: Configurable size limits per attachment

#### **🔔 Smart Notifications**
- **6 Notification Types**:
  1. New todo assigned to you
  2. Due date reminders (configurable timing)
  3. List shared with you
  4. Evening reminder (daily digest)
  5. Location reminder (when arriving at list location)
  6. List updated by collaborators
- **Multi-Channel**: Push (web), email, in-app notifications
- **Notification Center**: Bell icon with unread badge, dropdown UI
- **Smart Batching**: Prevents notification spam

#### **⚙️ User Preferences**
- **Time Format**: 12-hour vs 24-hour display
- **Auto-Hide Completed**: Toggle to hide/show completed tasks
- **Theme**: Light, dark, system-based
- **Default List**: Set which list opens first
- **Notification Settings**: Granular control over each notification type
- **Evening Reminder Time**: Customize daily digest time
- **Due Reminder Timing**: Set how far in advance (15, 30, 60 mins)

#### **📱 Progressive Web App (PWA)**
- **Installable**: Add to home screen on any platform
- **Offline-First**: Service workers cache everything
- **Background Sync**: Changes sync when connection restored
- **Push Notifications**: Web Push API integration
- **App Shortcuts**: Quick actions from home screen
- **Manifest**: Full PWA manifest with 8 icon sizes

#### **🌍 Cross-Platform Support**

Works seamlessly on:

- **Web** (PWA - any modern browser, installable)
- **Desktop** (Tauri - macOS, Windows, Linux native apps)
- **iOS** (Capacitor - native iOS app)
- **Android** (Capacitor - native Android app)
- **Offline Mode** (Service workers with smart caching strategies)

---

## 🎓 Learn More

- **[Full Documentation](.wiki/Home.md)** - Complete guides and reference
- **[Frontend Guide](frontend/README.md)** - Frontend architecture deep-dive
- **[Monorepo Setup](.wiki/Monorepo-Setup.md)** - Multi-app configuration
- **[Backend Setup](.wiki/Backend-Setup.md)** - Backend services explained
- **[Database Schema](.wiki/Database-Schema.md)** - Understanding the data model

### Option C: AI Agent Development

Open this repo in Bolt.new, Lovable, or any AI coding agent. The `.bolt/prompt`, `.cursorrules`, and project configuration tell the agent exactly how this codebase works. See [Using with AI Agents](#using-with-ai-agents) for details.

---

## Project Structure

```
nself-demo/
├── .ai/                              # AI agent workspace (gitignored)
#   ├── agent-workspace/                       # AI agent files
│   ├── agent-b/                        # Agent B files
│   ├── shared/                       # Cross-agent context
│   ├── planning/                     # Task handoffs
│   └── INSTRUCTIONS.md                     # Project instructions (canonical)
│
├── .ai/agent-workspace → .ai/agent-workspace              # Symlink (gitignored, hidden)
├── .agent-b → .ai/agent-b                # Symlink (gitignored, hidden)
├── .github/                          # GitHub Actions, templates
├── .vscode/                          # Editor settings
├── .wiki/                            # All public documentation
│
├── backend/                          # BACKEND - ɳSelf CLI + services
│   ├── docker-compose.yml            # Local dev services
│   ├── docker-compose.staging.yml    # Staging configuration
│   ├── docker-compose.production.yml # Production configuration
│   ├── .env.example                  # Backend environment template
│   ├── Makefile                      # Quick commands (make up, make down)
│   ├── hasura/                       # Hasura metadata + migrations
│   ├── postgres/                     # Database initialization
│   └── scripts/                      # Automation scripts
│       ├── bootstrap.sh              # One-command setup
│       ├── reset.sh                  # Environment reset
│       └── seed.ts                   # Database seeding
│
├── frontend/                         # FRONTEND - Code once, deploy everywhere
│   ├── README.md                     # Frontend documentation
│   │
│   ├── src/                          # Shared Next.js source
│   │   ├── app/                      # Next.js App Router
│   │   ├── components/               # React components
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── auth/                 # Auth components
│   │   │   ├── todos/                # Todo app components
│   │   │   ├── profile/              # Profile components
│   │   │   └── layout/               # Layout components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Services, backend adapters
│   │   │   ├── backend/              # Multi-backend adapters
│   │   │   │   ├── nself/            # ɳSelf adapter
│   │   │   │   ├── supabase/         # Supabase adapter
│   │   │   │   └── nhost/            # Nhost adapter
│   │   │   ├── providers/            # React contexts
│   │   │   ├── services/             # Business logic
│   │   │   └── types/                # TypeScript interfaces
│   │   ├── styles/                   # Global styles, theme
│   │   ├── types/                    # TypeScript types
│   │   ├── utils/                    # Utility functions
│   │   └── middleware.ts             # Next.js middleware
│   │
│   ├── platforms/                    # Platform-specific wrappers
│   │   ├── desktop/tauri/            # Tauri (macOS, Windows, Linux)
│   │   ├── mobile/                   # Capacitor (iOS, Android)
│   │   └── supabase/                 # Supabase backend files
│   │
│   ├── variants/                     # Platform-specific UI components
│   │   ├── tv-ui/                    # 10-foot UI for TV platforms
│   │   ├── display-ui/               # Smart display UI
│   │   └── shared/                   # Shared variant utilities
│   │
│   ├── public/                       # Static assets
│   ├── tests/                        # Test suites
│   ├── docs/                         # Frontend documentation
│   │
│   ├── config/                       # Tool configurations
│   │   ├── components.json           # shadcn/ui config
│   │   ├── .eslintrc.json            # ESLint
│   │   ├── .prettierrc.json          # Prettier
│   │   ├── playwright.config.ts      # Playwright
│   │   ├── vitest.config.ts          # Vitest
│   │   └── renovate.json             # Dependency updates
│   │
│   ├── deployment/                   # Deployment configs
│   │   ├── Dockerfile                # Docker build
│   │   ├── .dockerignore             # Docker ignore
│   │   └── netlify.toml              # Netlify config
│   │
│   ├── env/                          # Environment templates
│   │   ├── .env.example              # All backends
│   │   ├── .env.local.example        # Local development
│   │   ├── .env.production.example   # Production
│   │   └── .env.staging.example      # Staging
│   │
│   ├── package.json                  # Dependencies
│   ├── pnpm-lock.yaml                # Lock file
│   ├── next.config.js                # Next.js config
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.ts            # Tailwind CSS config
│   └── postcss.config.js             # PostCSS config
│
├── .gitignore                        # Git ignore patterns
├── LICENSE                           # nself.org Personal Use License
└── README.md                         # This file
│   ├── tauri.conf.json               # Window size, permissions, bundle ID
│   └── src/main.rs                   # Tauri entry point
│
├── scripts/
│   └── seed.ts                       # Database seeding script
│
├── e2e/                              # End-to-end tests (Playwright)
├── tests/                            # Unit test setup (Vitest)
│
├── .env                              # Active environment (gitignored)
├── .env.example                      # Full env reference with all providers
├── .env.local.example                # ɳSelf local dev template
├── .env.staging.example              # Staging template
├── .env.production.example           # Production template
│
├── .bolt/prompt                      # Bolt.new AI instructions
├── .cursorrules                      # Cursor AI instructions
│
├── middleware.ts                     # Auth middleware (route protection)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── docker-compose.yml                # Frontend-only Docker (for deployment)
├── Dockerfile                        # Frontend Docker build
├── netlify.toml                      # Netlify deployment config
└── package.json                      # Dependencies and scripts
```

---

## Backend

The `/backend` directory contains the complete ɳSelf backend stack. It runs PostgreSQL, Hasura GraphQL Engine, Hasura Auth, Hasura Storage, and MinIO -- all orchestrated with Docker Compose.

**Full documentation: [`backend/README.md`](backend/README.md)**

### TL;DR

```bash
cd backend
cp .env.example .env         # Configure passwords and secrets
make up                      # Start everything
make status                  # Check health
make console                 # Open Hasura Console (database admin)
make psql                    # PostgreSQL shell
make logs                    # View logs
make down                    # Stop everything
```

### Key Endpoints

| Service         | Local URL                          | Description              |
| --------------- | ---------------------------------- | ------------------------ |
| GraphQL API     | `http://localhost:8080/v1/graphql` | Hasura GraphQL endpoint  |
| Hasura Console  | `http://localhost:8080/console`    | Database admin UI        |
| Auth Service    | `http://localhost:4000`            | Authentication API       |
| Storage Service | `http://localhost:8484`            | File upload/download API |
| MinIO Console   | `http://localhost:9001`            | Object storage admin     |
| PostgreSQL      | `localhost:5432`                   | Direct database access   |
| Mailhog         | `http://localhost:8025`            | Local email testing UI   |

### Environments

| Environment    | Command           | Features                                                     |
| -------------- | ----------------- | ------------------------------------------------------------ |
| **Local**      | `make up`         | All ports exposed, Hasura Console enabled, Mailhog for email |
| **Staging**    | `make staging-up` | Traefik HTTPS, Console disabled, real SMTP                   |
| **Production** | `make prod-up`    | HTTPS, backups, resource limits, no dev tools                |

---

## Frontend

The root directory IS the frontend -- a Next.js 13 application with App Router.

### Key Files to Customize

| File                        | What to Change                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `lib/app.config.ts`         | App name, tagline, description, branding paths, theme colors, social links, SEO |
| `.env` / `.env.local`       | Backend provider, URLs, API keys                                                |
| `public/icon.svg`           | App icon (replace with your own SVG)                                            |
| `public/logo.svg`           | Logo for light mode                                                             |
| `public/logo-dark.svg`      | Logo for dark mode                                                              |
| `public/og-image.svg`       | Social sharing image (convert to PNG for production)                            |
| `public/manifest.json`      | PWA name, colors, icons                                                         |
| `app/globals.css`           | Theme colors (CSS custom properties)                                            |
| `tailwind.config.ts`        | Tailwind theme extensions                                                       |
| `src-tauri/tauri.conf.json` | Desktop app window, bundle ID, permissions                                      |
| `middleware.ts`             | Protected routes, auth redirects                                                |

### Authentication

Built-in email/password auth. Enable additional methods in `lib/auth-config.ts`:

```typescript
configureAuthMethods({
  'email-password': true, // Default, always available
  'magic-link': false, // Passwordless email
  google: false, // Google OAuth
  github: false, // GitHub OAuth
  apple: false, // Apple Sign In
});
```

### Using the Backend Abstraction

**Never import backend SDKs directly.** Always use the hooks and providers:

```typescript
// Auth
import { useAuth } from '@/lib/providers';
const { user, signIn, signOut, signUp } = useAuth();

// Database queries
import { useQuery, useMutation } from '@/hooks';
const { data, loading, error } = useQuery('todos');
const { mutate: createTodo } = useMutation('todos', 'insert');

// File storage
import { useStorage } from '@/hooks';
const { upload, uploading } = useStorage('avatars');

// Real-time
import { useRealtime } from '@/hooks';
useRealtime('messages', payload => {
  /* handle event */
});
```

---

## Backend Providers

Switch backend by changing one environment variable:

```bash
NEXT_PUBLIC_BACKEND_PROVIDER=nself      # Self-hosted (DEFAULT)
NEXT_PUBLIC_BACKEND_PROVIDER=supabase   # Supabase (cloud or self-hosted)
NEXT_PUBLIC_BACKEND_PROVIDER=bolt       # Bolt.new cloud sandbox
NEXT_PUBLIC_BACKEND_PROVIDER=nhost      # Nhost (managed Hasura)
```

### Comparison

| Feature          | ɳSelf                        | Supabase                    | Nhost                        | Bolt                  |
| ---------------- | ---------------------------- | --------------------------- | ---------------------------- | --------------------- |
| **Database**     | Hasura GraphQL over Postgres | PostgREST over Postgres     | Hasura GraphQL over Postgres | PostgREST (managed)   |
| **Auth**         | Hasura Auth (JWT)            | Supabase Auth (JWT)         | Hasura Auth (JWT)            | Supabase Auth (JWT)   |
| **Storage**      | MinIO (S3-compatible)        | Supabase Storage (S3)       | Hasura Storage (S3)          | Supabase Storage (S3) |
| **Realtime**     | WebSocket (Hasura)           | Supabase Channels           | GraphQL Subscriptions        | Supabase Channels     |
| **Functions**    | Custom (Next.js API routes)  | Edge Functions (Deno)       | Serverless Functions         | Edge Functions (Deno) |
| **Hosting**      | Any Docker host              | Supabase Cloud or self-host | Nhost Cloud                  | Bolt.new sandbox      |
| **Cost**         | Infrastructure cost only     | Free tier + paid            | Free tier + paid             | Free tier + paid      |
| **Data Control** | Full (you own everything)    | Depends on plan             | Depends on plan              | Limited               |
| **Offline**      | Full (WebSocket reconnect)   | Partial (polling)           | Full (subscriptions)         | Partial               |

### When to Use Which

- **ɳSelf**: You want full control, own your data, self-host everything. Best for production apps where you need to scale on your own terms.
- **Supabase**: You want a managed service with a generous free tier. Great for prototyping and small-to-medium apps.
- **Nhost**: You want managed Hasura without running your own infrastructure. Good balance of control and convenience.
- **Bolt**: You're prototyping in Bolt.new and want instant backend. Switch to ɳSelf or Supabase when going to production.

---

## Environment Configuration

### File Hierarchy

Environment files are loaded in this order (later files override earlier ones):

```
.env                  # Base defaults (committed to repo)
.env.local            # Local overrides (gitignored)
.env.staging          # Staging-specific
.env.production       # Production-specific
```

### Complete Variable Reference

```bash
# ===== CORE =====
NEXT_PUBLIC_BACKEND_PROVIDER=nself    # nself | bolt | supabase | nhost
NEXT_PUBLIC_ENVIRONMENT=local         # local | staging | production
NEXT_PUBLIC_PLATFORM=web              # web | desktop | mobile

# ===== APP METADATA =====
NEXT_PUBLIC_APP_NAME=MyApp            # Shown in header, title, manifest
NEXT_PUBLIC_APP_TAGLINE=              # Subtitle on landing page
NEXT_PUBLIC_APP_DESCRIPTION=          # Meta description, manifest
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Canonical URL
NEXT_PUBLIC_APP_VERSION=0.1.0         # Shown in footer/dashboard
NEXT_PUBLIC_DEBUG=false               # Enable debug logging

# ===== NSELF BACKEND =====
NEXT_PUBLIC_NSELF_GRAPHQL_URL=        # Hasura GraphQL endpoint
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=     # Hasura WebSocket endpoint
NEXT_PUBLIC_NSELF_HASURA_ADMIN_SECRET= # Hasura admin secret (dev only!)
NEXT_PUBLIC_NSELF_AUTH_URL=           # Hasura Auth endpoint
NEXT_PUBLIC_NSELF_STORAGE_URL=        # Hasura Storage endpoint
NEXT_PUBLIC_NSELF_REALTIME_URL=       # WebSocket for subscriptions
NEXT_PUBLIC_NSELF_FUNCTIONS_URL=      # Custom functions endpoint

# ===== SUPABASE / BOLT =====
NEXT_PUBLIC_SUPABASE_URL=             # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Supabase anonymous key

# ===== NHOST =====
NEXT_PUBLIC_NHOST_SUBDOMAIN=          # Nhost project subdomain
NEXT_PUBLIC_NHOST_REGION=             # Nhost region
NEXT_PUBLIC_NHOST_BACKEND_URL=        # Nhost backend URL
NEXT_PUBLIC_NHOST_GRAPHQL_URL=        # Nhost GraphQL endpoint
NEXT_PUBLIC_NHOST_GRAPHQL_WS_URL=     # Nhost WebSocket endpoint
NEXT_PUBLIC_NHOST_AUTH_URL=           # Nhost auth endpoint
NEXT_PUBLIC_NHOST_STORAGE_URL=        # Nhost storage endpoint
NEXT_PUBLIC_NHOST_FUNCTIONS_URL=      # Nhost functions endpoint
NEXT_PUBLIC_NHOST_ADMIN_SECRET=       # Nhost admin secret (dev only!)
```

### Environment Templates

| File                      | Use Case                          | Provider |
| ------------------------- | --------------------------------- | -------- |
| `.env.example`            | Complete reference, all variables | All      |
| `.env.local.example`      | Local development                 | ɳSelf    |
| `.env.staging.example`    | Staging server                    | ɳSelf    |
| `.env.production.example` | Production deployment             | ɳSelf    |

---

## Using with AI Agents

This boilerplate is designed to work with AI coding assistants. Each agent gets instructions via configuration files that teach it the project architecture.

### Bolt.new

The `.bolt/prompt` file contains instructions for Bolt. When you open this project in Bolt.new:

1. Bolt reads the prompt and understands the abstraction layer
2. It knows to use hooks like `useAuth`, `useQuery`, `useMutation` instead of raw SDK calls
3. It respects the component structure and file organization

**To develop in Bolt.new:**

1. Import this repo into Bolt.new
2. The `.env` ships with `NEXT_PUBLIC_BACKEND_PROVIDER=bolt` and Supabase credentials for the cloud sandbox
3. Start building -- Bolt will use the Supabase backend automatically
4. When ready for production, switch to `nself` and deploy the backend stack

**What to tell Bolt:**

```
This project uses the ɳDemo boilerplate with a backend abstraction layer.
Never import @supabase/supabase-js or any backend SDK directly.
Use hooks from @/hooks and @/lib/providers for all operations.
See .cursorrules for the full coding guide.
```

### Lovable

Lovable works similarly. Import the repo and tell it:

```
This is an ɳDemo boilerplate project. The backend is abstracted behind
hooks and providers in lib/backend, lib/providers, and hooks/.
Never use backend SDKs directly. Use useAuth(), useQuery(), useMutation(),
useStorage(), and useRealtime() hooks.
Components use shadcn/ui, Tailwind CSS, and Lucide React icons.
```

### AI agents (AI Company)

When using AI agents (via API, AI platforms, or AI Code):

```
I'm working on an ɳDemo project. It has a backend abstraction layer.
The key files are:
- lib/backend/index.ts (backend factory)
- lib/types/backend.ts (TypeScript interfaces)
- lib/providers/ (React contexts)
- hooks/ (data hooks)
- .cursorrules (full coding guide)

Never import backend SDKs. Use the abstraction layer hooks.
```

### Cursor IDE

The `.cursorrules` file is automatically loaded by Cursor. It contains:

- Complete coding guidelines
- Import rules (always use abstraction layer)
- Component structure patterns
- File organization rules
- Code examples for auth, queries, mutations, storage, realtime
- Do's and don'ts

Just open the project in Cursor and start coding. The rules are applied automatically.

### AI Code Assistants

Add this to your repository's `.github/ai-instructions.md` (or use the built-in `.cursorrules`):

```
This project uses a backend abstraction layer.
All database operations use hooks from @/hooks (useQuery, useMutation).
Authentication uses useAuth from @/lib/providers.
Never import @supabase/supabase-js, graphql-request, or other SDKs directly.
```

### Windsurf / Aider / Other Agents

Most AI agents read project files for context. Point them to:

1. `.cursorrules` -- Complete coding rules
2. `lib/types/backend.ts` -- The abstraction interfaces
3. `lib/backend/index.ts` -- How providers are selected
4. `hooks/index.ts` -- Available hooks

---

## Deployment Guide

### Frontend Deployment

#### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_PROVIDER=nself
# NEXT_PUBLIC_ENVIRONMENT=production
# NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
# ... (all NSELF variables pointing to your production backend)
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

The `netlify.toml` is pre-configured.

#### Docker (Self-Hosted Frontend)

```bash
docker build -t myapp-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_PROVIDER=nself \
  -e NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql \
  myapp-frontend
```

### Backend Deployment

#### Local Development

```bash
cd backend
cp .env.example .env
make up          # Starts all services on localhost
```

#### Staging (VPS with HTTPS)

```bash
cd backend
# Edit .env with staging passwords and domain
make staging-up  # Starts with Traefik HTTPS
```

**Prerequisites:**

- VPS with Docker (Ubuntu 22.04+ recommended)
- DNS pointing `api.staging.yourdomain.com`, `auth.staging.yourdomain.com`, `storage.staging.yourdomain.com` to VPS IP
- Ports 80 and 443 open

#### Production (VPS with HTTPS + Backups)

```bash
cd backend
# Edit .env with STRONG passwords and real SMTP
make prod-up     # Starts with HTTPS, backups, resource limits
```

**Prerequisites:**

- Production VPS (4+ GB RAM recommended)
- DNS A records for `api.yourdomain.com`, `auth.yourdomain.com`, `storage.yourdomain.com`
- Real SMTP provider (Resend, Postmark, SendGrid, or AWS SES)
- Strong passwords in `.env` (change ALL defaults!)

### Full Stack Deployment Map

```
                    ┌───────────────────────────────────────────────┐
                    │               PRODUCTION                      │
                    │                                               │
                    │  Frontend (Vercel/Netlify/CDN)                │
                    │  └── NEXT_PUBLIC_BACKEND_PROVIDER=nself       │
                    │  └── Points to api.yourdomain.com             │
                    │                                               │
                    │  Backend (VPS / Docker)                       │
                    │  └── api.yourdomain.com     (Hasura GraphQL)  │
                    │  └── auth.yourdomain.com    (Authentication)  │
                    │  └── storage.yourdomain.com (File Storage)    │
                    │  └── Traefik handles HTTPS automatically      │
                    │  └── Daily PostgreSQL backups                 │
                    └───────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────┐
                    │               STAGING                         │
                    │                                               │
                    │  Frontend (Vercel preview / VPS)              │
                    │  └── NEXT_PUBLIC_ENVIRONMENT=staging          │
                    │  └── Points to api.staging.yourdomain.com     │
                    │                                               │
                    │  Backend (Same or separate VPS)               │
                    │  └── api.staging.yourdomain.com               │
                    │  └── auth.staging.yourdomain.com              │
                    │  └── storage.staging.yourdomain.com           │
                    └───────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────┐
                    │               LOCAL DEV                       │
                    │                                               │
                    │  Frontend: pnpm dev (localhost:3000)          │
                    │  Backend:  make up     (localhost:8080, etc.) │
                    │  Email:    Mailhog     (localhost:8025)       │
                    └───────────────────────────────────────────────┘
```

---

## Customization Checklist

When you clone this boilerplate to start a real app, work through this list:

### 1. Branding

- [ ] Replace `public/icon.svg` with your app icon
- [ ] Replace `public/logo.svg` with your logo (light mode)
- [ ] Replace `public/logo-dark.svg` with your logo (dark mode)
- [ ] Replace `public/og-image.svg` with your social sharing image (convert to PNG, 1200x630)
- [ ] Replace `public/apple-touch-icon.svg` with your Apple touch icon
- [ ] Update `public/manifest.json` with your app name, colors, and icons
- [ ] Update `lib/app.config.ts` with your app name, tagline, description, URLs

### 2. Theme

- [ ] Update CSS custom properties in `app/globals.css` (colors, fonts)
- [ ] Update `tailwind.config.ts` if adding custom theme extensions
- [ ] Update `lib/app.config.ts` theme colors (`primaryColor`, `accentColor`)

### 3. Environment

- [ ] Copy `.env.example` to `.env` and set your backend provider
- [ ] If using ɳSelf: copy `backend/.env.example` to `backend/.env` and set passwords
- [ ] Change ALL default passwords and secrets before any non-local deployment
- [ ] Set up your domain and DNS records for staging/production

### 4. Backend

- [ ] If using ɳSelf: customize `backend/postgres/init.sql` with your tables
- [ ] Update `backend/hasura/metadata/databases/default/tables/tables.yaml` with permissions
- [ ] If using Supabase: create tables in Supabase Dashboard or via migrations
- [ ] Set up storage buckets for your file types

### 5. Authentication

- [ ] Configure auth methods in `lib/auth-config.ts`
- [ ] Set up OAuth providers if needed (Google, GitHub, Apple, etc.)
- [ ] Update `middleware.ts` with your protected route patterns
- [ ] If using ɳSelf: configure OAuth in `backend/.env`

### 6. SEO & Legal

- [ ] Update `lib/app.config.ts` SEO settings (title template, keywords, author)
- [ ] Update `public/robots.txt` with your domain
- [ ] Create `/privacy` and `/terms` pages (referenced in `app.config.ts`)
- [ ] Update `app/sitemap.ts` with your actual routes

### 7. Deployment

- [ ] Set up Vercel/Netlify project with environment variables
- [ ] If self-hosting backend: set up VPS, DNS, and SSL
- [ ] Configure real SMTP (Resend, Postmark, etc.) for production emails
- [ ] Set up monitoring and alerts

### 8. Cleanup

- [ ] Remove example todo components if not using them (`components/todos/`, `app/todos/`)
- [ ] Remove the skins showcase page (`app/skins/`)
- [ ] Update this README.md with your own project documentation
- [ ] Remove example e2e tests and write your own
- [ ] Update `.wiki/Changelog.md` with your version history
- [ ] Update `package.json` name, description, author, repository

---

## Platform Targets

### Web (Default)

Standard Next.js web application. Works out of the box with any hosting provider.

### Desktop (Tauri)

Build native desktop apps for Windows, macOS, and Linux:

```bash
# Install Rust (one-time)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Development
pnpm build
cd src-tauri
cargo tauri dev

# Build distributable
cargo tauri build
```

Configure in `src-tauri/tauri.conf.json`:

- Window size and title
- Bundle identifier (e.g., `com.yourcompany.yourapp`)
- Allowed APIs (filesystem, notifications, clipboard, etc.)
- App icons

### PWA (Progressive Web App)

Automatically configured with:

- Service worker (`public/sw.js`) for offline caching
- Web app manifest (`public/manifest.json`) for install prompts
- Workbox for cache strategies

Users can install your web app on their home screen.

---

## Developer Tools

### Dev Mode Indicator

A small badge appears in the corner showing the current environment and backend provider. Only visible in `local` and `staging` environments.

### Faux Sign-In

In local development, three test accounts are available on the login page for quick testing without creating real users:

| Email               | Role  |
| ------------------- | ----- |
| `admin@example.com` | Admin |
| `test@example.com`  | User  |
| `demo@example.com`  | Demo  |

This is only available when `NEXT_PUBLIC_ENVIRONMENT=local`.

### Health Check

`GET /api/health` returns backend connectivity status and latency.

### Hasura Console

When running ɳSelf locally, the Hasura Console at `http://localhost:8080/console` provides:

- Visual table editor
- GraphQL playground
- Permission manager
- Migration tools

---

## Scripts Reference

### Frontend Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Start development server (localhost:3000) |
| `pnpm build`         | Production build                          |
| `pnpm start`         | Start production server                   |
| `pnpm lint`          | Run ESLint                                |
| `pnpm lint:fix`      | Auto-fix lint errors                      |
| `pnpm format`        | Format all files with Prettier            |
| `pnpm typecheck`     | TypeScript type checking                  |
| `pnpm test`          | Unit tests (watch mode)                   |
| `pnpm test:run`      | Unit tests (single run)                   |
| `pnpm test:coverage` | Unit tests with coverage report           |
| `pnpm test:e2e`      | End-to-end tests (Playwright)             |
| `pnpm test:e2e:ui`   | E2E tests with Playwright UI              |
| `pnpm db:seed`       | Seed the database with sample data        |

### Backend Scripts (Makefile)

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `make up`               | Start all backend services         |
| `make down`             | Stop all services                  |
| `make restart`          | Restart all services               |
| `make logs`             | View all service logs              |
| `make status`           | Show service health                |
| `make health`           | Ping all health endpoints          |
| `make psql`             | Open PostgreSQL shell              |
| `make console`          | Open Hasura Console (requires CLI) |
| `make migrate`          | Apply Hasura migrations            |
| `make metadata-apply`   | Apply Hasura metadata              |
| `make backup`           | Create database backup             |
| `make restore FILE=...` | Restore from backup                |
| `make staging-up`       | Start staging stack                |
| `make prod-up`          | Start production stack             |
| `make clean`            | Remove all data (destructive!)     |

---

## Tech Stack

| Category       | Technology                  | Purpose                          |
| -------------- | --------------------------- | -------------------------------- |
| **Framework**  | Next.js 13                  | App Router, SSR, API routes      |
| **Language**   | TypeScript 5                | Type safety (strict mode)        |
| **Styling**    | Tailwind CSS 3              | Utility-first CSS                |
| **Components** | shadcn/ui                   | 40+ accessible components        |
| **Icons**      | Lucide React                | 1000+ SVG icons                  |
| **Forms**      | React Hook Form + Zod       | Validation and submission        |
| **State**      | React Context + Hooks       | No external state library        |
| **Database**   | PostgreSQL 16               | Via Hasura or Supabase           |
| **GraphQL**    | Hasura + graphql-request    | For ɳSelf and Nhost              |
| **Auth**       | Hasura Auth / Supabase Auth | JWT-based authentication         |
| **Storage**    | MinIO / Supabase Storage    | S3-compatible file storage       |
| **Desktop**    | Tauri v2                    | Native desktop apps              |
| **PWA**        | Workbox                     | Offline support, install prompts |
| **Offline**    | idb-keyval (IndexedDB)      | Client-side data caching         |
| **Testing**    | Vitest + Playwright         | Unit and E2E tests               |
| **Linting**    | ESLint + Prettier           | Code quality and formatting      |
| **Git Hooks**  | Husky + lint-staged         | Pre-commit checks                |
| **Commits**    | Commitlint                  | Conventional commit messages     |
| **CI/CD**      | GitHub Actions              | Automated testing and deployment |
| **Deploy**     | Docker + Traefik            | Self-hosted with auto HTTPS      |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](.wiki/Contributing.md) before submitting PRs.

For complete documentation, visit the [Wiki](https://github.com/nself-org/demo/wiki).

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write code following `.cursorrules` guidelines
4. Test across at least two backend providers
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

Built by the ɳSelf community.

Part of the **n ecosystem**:

- [ɳSelf](https://github.com/nself-org/cli) - Self-hosted backend stack
- [ɳDemo](https://github.com/nself-org/demo) - Application boilerplate (this repo)
- [nChat](https://github.com/nself-org/chat) - Real-time chat application
