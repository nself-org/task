# Getting Started

Get ɳDemo boilerplate running on your machine in minutes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (for self-hosted backend)
- **Git** - For cloning the repository

Optional:
- **Make** - For backend commands (usually pre-installed on macOS/Linux)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nself-org/demo.git my-app
cd my-app
```

### 2. Choose Your Backend

You have two options: **self-hosted** (recommended for learning) or **managed** (faster for production).

#### Option A: Self-Hosted Backend (nSelf)

Start the complete backend stack locally with Docker:

```bash
# Navigate to backend directory
cd backend

# Create environment file
cp .env.example .env

# Start all services (PostgreSQL, Hasura, Auth, Storage, MinIO)
make up

# Wait for services to start (about 30 seconds)
# Verify everything is running
make health
```

Your backend services are now running:
- **GraphQL API**: http://localhost:8080/v1/graphql
- **Hasura Console**: http://localhost:8080/console
- **Auth API**: http://localhost:4000
- **Storage API**: http://localhost:8484

Return to project root: `cd ..`

#### Option B: Managed Backend (Supabase/Nhost)

Skip Docker and use a managed backend:

**For Supabase:**
1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Set `NEXT_PUBLIC_BACKEND_PROVIDER=supabase`
4. Add your Supabase URL and anon key

**For Nhost:**
1. Create a project at [nhost.io](https://nhost.io)
2. Copy `.env.example` to `.env`
3. Set `NEXT_PUBLIC_BACKEND_PROVIDER=nhost`
4. Add your Nhost subdomain and region

See [Backend Setup](Backend-Setup) for detailed instructions.

### 3. Install Frontend Dependencies

```bash
# Install npm packages
pnpm install
```

### 4. Configure Environment

```bash
# Create local environment file
cp .env.example .env

# For self-hosted (default):
# NEXT_PUBLIC_BACKEND_PROVIDER=nself
# Already configured for localhost!

# For Supabase:
# NEXT_PUBLIC_BACKEND_PROVIDER=supabase
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# For Nhost:
# NEXT_PUBLIC_BACKEND_PROVIDER=nhost
# Fill in NEXT_PUBLIC_NHOST_* variables
```

### 5. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## First Steps

### 1. Register an Account

1. Click **"Get Started"** or **"Sign in"**
2. Navigate to **Register**
3. Create an account with email/password
4. You'll be automatically signed in

### 2. Explore the Dashboard

After signing in, you'll see:
- **Backend status** - Which backend you're using
- **Environment info** - Local/staging/production
- **Quick stats** - Your data overview

### 3. Try the Todo Example

1. Click **"Todos"** in the navigation
2. **Create a todo** - Add your first item
3. **Toggle completion** - Mark it done
4. **Share a todo** - Click the share icon:
   - Toggle public/private
   - Copy the shareable link
   - Share by email with permissions
5. **View public todo** - Open the link in a private/incognito window

This demonstrates the complete feature set: CRUD operations, authentication, row-level security, and sharing.

---

## Project Structure

Here's what you just installed:

```
my-app/
├── app/              # Next.js pages (App Router)
│   ├── page.tsx      # Home page
│   ├── login/        # Auth pages
│   ├── dashboard/    # Protected dashboard
│   └── todos/        # Todo app example
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   ├── todos/        # Todo-specific components
│   └── layout/       # Header, footer, navigation
├── lib/
│   ├── backend/      # Backend adapters (nself, supabase, nhost)
│   ├── services/     # Business logic (todos, profiles)
│   ├── providers/    # React context (auth, backend, theme)
│   └── config.ts     # App configuration
├── hooks/            # Custom React hooks
├── backend/          # Self-hosted backend (Docker)
│   ├── docker-compose.yml
│   ├── postgres/     # Database init scripts
│   └── hasura/       # GraphQL metadata
├── .env.example      # Environment template
└── package.json      # Dependencies
```

---

## What's Next?

Now that you're up and running:

1. **[Understand the Architecture](Architecture)** - Learn how it all works
2. **[Explore the Database](Database-Schema)** - See the data structure
3. **[Customize Your App](Customization)** - Make it your own
4. **[Deploy to Production](Deployment)** - Ship it!

---

## Common Issues

### Docker Services Won't Start

```bash
# Check if ports are already in use
docker ps

# Stop all containers and start fresh
cd backend && make down && make up
```

### "Port already in use" Error

Another app is using port 3000, 8080, or 5432. Either:
- Stop the conflicting app
- Change ports in `.env` and `docker-compose.yml`

### Frontend Can't Connect to Backend

1. Verify backend is running: `cd backend && make health`
2. Check `.env` has correct URLs for your backend
3. Restart frontend: Stop dev server (Ctrl+C) and run `pnpm dev` again

See [Troubleshooting](Troubleshooting) for more help.

---

**Having trouble?** [Open an issue](https://github.com/nself-org/demo/issues) or check the [Troubleshooting guide](Troubleshooting).

**Next:** [Backend Setup →](Backend-Setup)
