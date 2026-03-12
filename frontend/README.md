# ɳApp Frontend

**Code once, deploy everywhere** - Next.js frontend for web, desktop, mobile, and TV platforms.

---

## 📁 Structure

```
frontend/
├── README.md               # This file
├── src/                    # Shared Next.js source (code once)
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Services, backend adapters, state
│   ├── styles/           # Global styles, theme
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Pure utility functions
│   └── middleware.ts     # Next.js middleware (auth, routing)
├── platforms/             # Platform-specific wrappers (deploy everywhere)
│   ├── desktop/tauri/    # Tauri (macOS, Windows, Linux)
│   ├── mobile/           # Capacitor (iOS, Android)
│   └── supabase/         # Supabase backend alternative
├── variants/              # Platform-specific UI components
│   ├── tv-ui/            # 10-foot UI components
│   ├── display-ui/       # Smart display components
│   └── shared/           # Shared variant utilities
├── public/                # Static assets
├── tests/                 # Test suites (e2e, tests/)
├── docs/                  # Frontend-specific documentation
├── config/                # Tool configurations
│   ├── components.json   # shadcn/ui config
│   ├── .eslintrc.json    # ESLint config
│   ├── .prettierrc.json  # Prettier config
│   ├── playwright.config.ts  # Playwright config
│   ├── vitest.config.ts  # Vitest config
│   ├── renovate.json     # Dependency updates
│   └── .lintstagedrc.json
├── deployment/            # Deployment configurations
│   ├── Dockerfile        # Docker build
│   ├── .dockerignore     # Docker ignore patterns
│   └── netlify.toml      # Netlify config
├── env/                   # Environment templates
│   ├── .env.example      # All backends template
│   ├── .env.local        # Local development (gitignored)
│   ├── .env.local.example
│   ├── .env.production.example
│   └── .env.staging.example
├── package.json           # Dependencies (Next.js requires root)
├── pnpm-lock.yaml         # Lock file
├── next.config.js         # Next.js config (required in root)
├── next-env.d.ts          # Next.js TypeScript (auto-generated)
├── tsconfig.json          # TypeScript config (required in root)
├── tailwind.config.ts     # Tailwind CSS config
└── postcss.config.js      # PostCSS config
```

---

## 🚀 Quick Start

### Development

```bash
# From repository root
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Setup

Copy environment template:

```bash
cp env/.env.local.example env/.env.local
# Edit env/.env.local with your backend endpoints
```

---

## 🏗️ Architecture

### Multi-Backend Support

The frontend abstracts backend operations through adapters in `src/lib/backend/`:

- **ɳSelf** - Self-hosted (Docker: Hasura + Postgres + Auth + MinIO)
- **Supabase** - Managed PostgreSQL + Auth
- **Nhost** - Managed Hasura + Auth
- **Bolt** - Bolt.new managed backend

Switch backends by setting `NEXT_PUBLIC_BACKEND_PROVIDER` in your `.env.local`.

### Service Layer

Business logic lives in `src/lib/services/`:
- `todos.ts` - Todo CRUD operations
- `profile.ts` - User profile management
- `auth.ts` - Authentication flows

### Custom Hooks

React hooks in `src/hooks/` wrap services with state management:
- `use-todos.ts` - Todo operations with loading/error states
- `use-profile.ts` - Profile data and updates
- `use-auth.ts` - Authentication state

### Component Library

UI components in `src/components/`:
- `ui/` - shadcn/ui components (Radix UI + Tailwind)
- `auth/` - Auth forms and flows
- `todos/` - Todo app components
- `profile/` - Profile management
- `layout/` - Layout components (header, footer, nav)

---

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **CSS Variables** - Theme customization via HSL colors in `src/app/globals.css`
- **Dark Mode** - Automatic dark mode support via `ThemeProvider`

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

---

## 📦 Building

```bash
# Production build
pnpm build

# Preview production build
pnpm start
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel
```

### Docker

```bash
# Build Docker image
docker build -f deployment/Dockerfile -t napp-frontend .

# Run container
docker run -p 3000:3000 napp-frontend
```

### Netlify

Uses `deployment/netlify.toml` for configuration.

---

## 📱 Platform Builds

### Desktop (Tauri)

```bash
cd platforms/desktop/tauri
pnpm tauri build
```

### Mobile (Capacitor)

```bash
cd platforms/mobile
pnpm cap sync
pnpm cap open ios    # or android
```

---

## 🔧 Configuration

### Next.js Config

Edit `next.config.js` for Next.js settings (webpack, redirects, etc.)

### TypeScript Config

Edit `tsconfig.json` for TypeScript compiler options

### Tailwind Config

Edit `tailwind.config.ts` for theme customization and plugins

### shadcn/ui Config

Edit `config/components.json` for component installation paths

---

## 📚 Documentation

- [Getting Started](../docs/Getting-Started.md) - Installation and setup
- [Backend Architecture](../docs/Backend-Architecture.md) - How backends work
- [Database Schema](../docs/Database-Schema.md) - Tables and relationships
- [Deployment](../docs/Deployment.md) - Production deployment

---

## 🆘 Need Help?

- 📖 [Main Documentation](../.wiki/Home.md)
- 🐛 [Issues](https://github.com/nself-org/tasks/issues)
- 💬 [Discussions](https://github.com/nself-org/tasks/discussions)
