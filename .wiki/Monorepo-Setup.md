# Monorepo Setup

This boilerplate is designed to work seamlessly in monorepo scenarios where multiple apps share a single backend.

---

## Overview

The ɳApp boilerplate uses **configurable table prefixes** to avoid database table conflicts when multiple apps share one backend database.

### Default Behavior (Single App)

By default, tables use the `app_` prefix:
- `app_todos`
- `app_profiles`
- `app_todo_shares`

This works perfectly for single-app deployments.

### Monorepo Behavior (Multiple Apps)

When adding this boilerplate to a monorepo with multiple apps, each app should use a **unique table prefix** to avoid conflicts.

---

## Quick Start: Adding to a Monorepo

### 1. Clone or Copy the Boilerplate

```bash
# In your monorepo
cd apps/
git clone https://github.com/nself-org/demo.git my-app-name
cd my-app-name
```

### 2. Set a Unique Table Prefix

Edit `frontend/env/.env.local`:

```bash
# Unique prefix for this app
NEXT_PUBLIC_TABLE_PREFIX=myapp

# Backend endpoints (shared across all apps)
NEXT_PUBLIC_BACKEND_PROVIDER=nself
NEXT_PUBLIC_NSELF_GRAPHQL_URL=http://localhost:8080/v1/graphql
# ... other backend config
```

### 3. Run Database Migrations

The boilerplate will automatically use your prefix for all table operations. You need to create the tables with your prefix:

```bash
# Option 1: Update backend/postgres/init.sql with your prefix
# Replace "app_" with "myapp_" in all table names

# Option 2: Use environment variable in docker-compose
cd backend
export TABLE_PREFIX=myapp
docker-compose up -d
```

### 4. Verify Tables

Your tables will be created as:
- `myapp_todos`
- `myapp_profiles`
- `myapp_todo_shares`

---

## Example: Three Apps Sharing One Backend

```
monorepo/
├── apps/
│   ├── dashboard/          # App 1
│   │   └── frontend/
│   │       └── env/
│   │           └── .env.local  # NEXT_PUBLIC_TABLE_PREFIX=dashboard
│   ├── admin/              # App 2
│   │   └── frontend/
│   │       └── env/
│   │           └── .env.local  # NEXT_PUBLIC_TABLE_PREFIX=admin
│   └── customer/           # App 3
│       └── frontend/
│           └── env/
│               └── .env.local  # NEXT_PUBLIC_TABLE_PREFIX=customer
└── backend/                # Shared backend
    ├── postgres/
    └── docker-compose.yml
```

### Database Tables

After setup, your database will have:

```sql
-- Dashboard app tables
dashboard_todos
dashboard_profiles
dashboard_todo_shares

-- Admin app tables
admin_todos
admin_profiles
admin_todo_shares

-- Customer app tables
customer_todos
customer_profiles
customer_todo_shares
```

All apps share the same Hasura/Postgres backend but have isolated data!

---

## Configuration Reference

### Environment Variable

```bash
NEXT_PUBLIC_TABLE_PREFIX=<your_unique_prefix>
```

- **Type**: String
- **Default**: `app`
- **Required**: No (defaults to `app`)
- **Format**: Lowercase letters, no spaces (e.g., `myapp`, `dashboard`, `admin`)

### Where It's Used

The prefix is applied automatically in:

1. **Service Layer** (`frontend/src/lib/services/`)
   - All database queries use the prefix
   - No code changes needed

2. **Database Adapter** (`frontend/src/lib/backend/nself/database.ts`)
   - Table field mappings use the prefix
   - GraphQL queries are generated with the prefix

3. **Utility Helper** (`frontend/src/lib/utils/tables.ts`)
   - Central location for all table names
   - Exports `Tables` constant with prefixed names

---

## Database Migration

### Option 1: Manual Migration (Recommended)

Update `backend/postgres/init.sql`:

```sql
-- Replace all instances of "app_" with your prefix
CREATE TABLE IF NOT EXISTS public.myapp_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Repeat for all tables: myapp_profiles, myapp_todo_shares, etc.
```

### Option 2: Environment Variable (Advanced)

Modify `backend/docker-compose.yml` to support dynamic prefixes:

```yaml
services:
  postgres:
    environment:
      TABLE_PREFIX: ${TABLE_PREFIX:-app}
    volumes:
      - ./postgres/init-dynamic.sql:/docker-entrypoint-initdb.d/init.sql
```

Create `backend/postgres/init-dynamic.sql` that uses `${TABLE_PREFIX}` placeholders.

---

## Hasura Configuration

### Tracking Tables

After creating prefixed tables, track them in Hasura:

1. Open Hasura Console: http://localhost:8080/console
2. Go to **Data** → **public** schema
3. Click **Track** for each prefixed table:
   - `yourprefix_todos`
   - `yourprefix_profiles`
   - `yourprefix_todo_shares`

### Permissions

Set up the same permissions for each prefixed table as shown in the default setup.

---

## Testing Your Setup

### 1. Verify Table Names

```typescript
// frontend/src/lib/utils/tables.ts
import { Tables } from '@/lib/utils/tables';

console.log(Tables.TODOS);     // => 'myapp_todos'
console.log(Tables.PROFILES);  // => 'myapp_profiles'
```

### 2. Test Database Query

```typescript
// Should query 'myapp_todos' automatically
const todos = await todoService.getTodos();
```

### 3. Check Hasura Console

Open http://localhost:8080/console/api/explorer and run:

```graphql
query {
  myapp_todos {
    id
    title
    completed
  }
}
```

---

## Best Practices

### 1. Consistent Naming

Use clear, descriptive prefixes:
- ✅ `dashboard`, `admin`, `customer`, `public`
- ❌ `app1`, `test`, `new`, `v2`

### 2. Document Your Prefixes

Create a `MONOREPO.md` in your repository root:

```markdown
# App Prefixes

| App | Prefix | Purpose |
|-----|--------|---------|
| Dashboard | `dashboard` | Admin dashboard |
| Admin Panel | `admin` | Super admin tools |
| Customer Portal | `customer` | Customer-facing app |
```

### 3. Shared Backend Configuration

Keep backend URLs consistent across all apps:

```bash
# Same for all apps
NEXT_PUBLIC_NSELF_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_NSELF_AUTH_URL=http://localhost:4000
```

### 4. Environment-Specific Prefixes

Consider using environment-specific prefixes:

```bash
# Development
NEXT_PUBLIC_TABLE_PREFIX=dev_dashboard

# Staging
NEXT_PUBLIC_TABLE_PREFIX=staging_dashboard

# Production
NEXT_PUBLIC_TABLE_PREFIX=dashboard
```

---

## Troubleshooting

### Tables Not Found

**Problem**: GraphQL query fails with "table not found"

**Solution**:
1. Verify tables exist in database: `\dt public.myapp_*` in psql
2. Check tables are tracked in Hasura Console
3. Verify `NEXT_PUBLIC_TABLE_PREFIX` matches your table names

### Wrong Tables Being Queried

**Problem**: App queries `app_todos` instead of `myapp_todos`

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_TABLE_PREFIX=myapp`
2. Restart Next.js dev server after changing env vars
3. Clear `.next` cache: `rm -rf .next`

### Permission Denied

**Problem**: "permission denied for table myapp_todos"

**Solution**:
1. Open Hasura Console
2. Go to **Data** → **myapp_todos** → **Permissions**
3. Add `user` role with select/insert/update/delete permissions
4. Add appropriate `where` clauses (e.g., `{user_id: {_eq: X-Hasura-User-Id}}`)

---

## Migration from Single App to Monorepo

Already deployed with the default `app_` prefix? Here's how to migrate:

### Option 1: Keep Existing Tables (Recommended)

Leave your production tables as `app_*` and only use custom prefixes for new apps:

```
Production app: app_todos (existing)
New app 1:      dashboard_todos
New app 2:      admin_todos
```

### Option 2: Rename Tables (Risky)

Only do this if you understand the implications:

```sql
ALTER TABLE app_todos RENAME TO myapp_todos;
ALTER TABLE app_profiles RENAME TO myapp_profiles;
ALTER TABLE app_todo_shares RENAME TO myapp_todo_shares;

-- Update all foreign key constraints
-- Update Hasura tracking
```

---

## Summary

✅ **Monorepo-ready** - Use unique `NEXT_PUBLIC_TABLE_PREFIX` per app
✅ **No code changes** - Prefix handled automatically
✅ **Shared backend** - All apps use the same Hasura/Postgres
✅ **Isolated data** - Each app has its own tables
✅ **Production-ready** - Used in real monorepo deployments

Need help? Open an issue or discussion on GitHub!
