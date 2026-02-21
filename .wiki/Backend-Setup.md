# Backend Setup

Complete guide to setting up and configuring your backend.

---

## Self-Hosted Backend (nSelf)

The self-hosted option gives you complete control and runs entirely on your machine using Docker.

### What You Get

- **PostgreSQL 16** - Your database
- **Hasura GraphQL Engine** - Instant GraphQL API
- **Hasura Auth** - Email/password + OAuth
- **Hasura Storage** - S3-compatible file storage
- **MinIO** - Object storage (S3-compatible)
- **Mailhog** - Email testing (development only)
- **Traefik** - Reverse proxy (staging/production)

### Start the Backend

```bash
cd backend

# Create environment file
cp .env.example .env

# Start all services
make up

# Check status
make health
```

Services will be available at:
- GraphQL API: http://localhost:8080/v1/graphql
- Hasura Console: http://localhost:8080/console
- Auth API: http://localhost:4000
- Storage API: http://localhost:8484
- MinIO Console: http://localhost:9001
- Mailhog UI: http://localhost:8025

### Useful Commands

```bash
# Start backend
make up

# Stop backend
make down

# View logs
make logs

# Restart all services
make restart

# Check health
make health

# Access PostgreSQL shell
make psql
```

### Database Initialization

On first start, `postgres/init.sql` runs automatically and creates:
- Required extensions (uuid-ossp, pgcrypto, citext)
- Schemas (auth, storage, public)
- Application tables (app_profiles, app_todos, app_todo_shares)
- Indexes for performance
- Triggers for updated_at timestamps
- Auto-profile creation on user signup

### Hasura Console

Access at http://localhost:8080/console

Use it to:
- Explore your GraphQL schema
- Run queries and mutations
- Test subscriptions
- Manage permissions
- View database structure
- Create migrations

---

## Managed Backend (Supabase)

Use Supabase for a fully managed backend.

### Setup Steps

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization, name, region, password

2. **Get Credentials**
   - Go to Project Settings > API
   - Copy **Project URL** and **anon/public key**

3. **Configure Frontend**
   ```bash
   # In .env
   NEXT_PUBLIC_BACKEND_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Run Migrations**
   ```bash
   # Install Supabase CLI
   pnpm install -g supabase

   # Link project
   supabase link --project-ref your_project_ref

   # Apply migrations
   supabase db push
   ```

Migrations are in `supabase/migrations/` and create the same schema as nSelf.

---

## Managed Backend (Nhost)

Use Nhost for Hasura + Auth managed for you.

### Setup Steps

1. **Create Project**
   - Go to [nhost.io](https://nhost.io)
   - Click "Create Project"
   - Choose region and plan

2. **Get Configuration**
   - Go to project dashboard
   - Copy all service URLs:
     - Backend URL
     - GraphQL URL
     - Auth URL
     - Storage URL
     - Functions URL

3. **Configure Frontend**
   ```bash
   # In .env
   NEXT_PUBLIC_BACKEND_PROVIDER=nhost
   NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
   NEXT_PUBLIC_NHOST_REGION=us-east-1
   NEXT_PUBLIC_NHOST_BACKEND_URL=https://xxx.nhost.run
   NEXT_PUBLIC_NHOST_GRAPHQL_URL=https://xxx.hasura.nhost.run/v1/graphql
   NEXT_PUBLIC_NHOST_AUTH_URL=https://xxx.auth.nhost.run/v1
   NEXT_PUBLIC_NHOST_STORAGE_URL=https://xxx.storage.nhost.run/v1
   ```

4. **Apply Database Schema**
   - Use Nhost Console to run `backend/postgres/init.sql`
   - Or use Hasura migrations via CLI

---

## Environment Configuration

### Required Variables

For **nSelf** (default):
```bash
NEXT_PUBLIC_BACKEND_PROVIDER=nself
NEXT_PUBLIC_NSELF_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=ws://localhost:8080/v1/graphql
NEXT_PUBLIC_NSELF_AUTH_URL=http://localhost:4000
NEXT_PUBLIC_NSELF_STORAGE_URL=http://localhost:8484
```

For **Supabase**:
```bash
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

For **Nhost**:
```bash
NEXT_PUBLIC_BACKEND_PROVIDER=nhost
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=us-east-1
# ... (other Nhost URLs)
```

See [Environment Variables](Environment-Variables) for complete reference.

---

## Switching Backends

To switch between backends, just change one environment variable:

```bash
# Use self-hosted
NEXT_PUBLIC_BACKEND_PROVIDER=nself

# Use Supabase
NEXT_PUBLIC_BACKEND_PROVIDER=supabase

# Use Nhost
NEXT_PUBLIC_BACKEND_PROVIDER=nhost
```

Restart your dev server, and the app works with the new backend. No code changes needed!

---

## Next Steps

- [Database Schema](Database-Schema) - Understand your data structure
- [Authentication](Authentication) - How auth works
- [Frontend Setup](Frontend-Setup) - Configure the frontend
- [Deployment](Deployment) - Deploy to production

---

**Need help?** Check [Troubleshooting](Troubleshooting) or [open an issue](https://github.com/nself-org/demo/issues).
