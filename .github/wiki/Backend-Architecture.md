# Backend Configuration

ɳTask supports multiple backend providers through a single environment variable. By default, it uses **nSelf** (self-hosted stack), but can be switched to any supported provider for development in sandboxed environments.

## Supported Backends

| Provider | Value      | Description                                                |
| -------- | ---------- | ---------------------------------------------------------- |
| nSelf    | `nself`    | Self-hosted stack (Hasura + custom services) - **DEFAULT** |
| Supabase | `supabase` | Supabase cloud or self-hosted                              |
| Bolt     | `bolt`     | Bolt.new sandbox (Supabase-compatible)                     |
| Nhost    | `nhost`    | Nhost cloud (Hasura-based)                                 |

## Quick Switch

Set the `NEXT_PUBLIC_BACKEND_PROVIDER` environment variable:

```bash
# Default (nSelf)
NEXT_PUBLIC_BACKEND_PROVIDER=nself

# Supabase
NEXT_PUBLIC_BACKEND_PROVIDER=supabase

# Bolt.new sandbox
NEXT_PUBLIC_BACKEND_PROVIDER=bolt

# Nhost
NEXT_PUBLIC_BACKEND_PROVIDER=nhost
```

## Vibe Coding Instructions

When using AI assistants in sandboxed environments, include these instructions in your prompt:

### For Bolt.new

```
This project uses ɳTask boilerplate with backend abstraction.
Current environment: Bolt.new sandbox
Backend is set to: bolt (Supabase-compatible)
Use the existing backend abstraction in lib/backend/ - do not import Supabase directly.
All auth, database, storage, and realtime operations should use the hooks and providers.
```

### For Local Development with nSelf

```
This project uses ɳTask boilerplate with nSelf backend.
Backend is set to: nself (default)
Use the existing backend abstraction in lib/backend/ - do not import services directly.
All operations should use useAuth, useBackend, and related hooks.
```

### For Cursor / Copilot / Other AI Tools

Add to your project instructions or `.cursorrules`:

```
# ɳTask Backend Abstraction

This project uses a backend abstraction layer. Never import backend SDKs directly.

ALWAYS USE:
- useAuth() for authentication (signIn, signUp, signOut, user state)
- useBackend() for database, storage, realtime, functions
- toast() from sonner for notifications

NEVER USE:
- Direct @supabase/supabase-js imports in components
- Direct Nhost SDK imports
- Custom fetch calls to auth endpoints

The backend provider is configured via NEXT_PUBLIC_BACKEND_PROVIDER env var.
```

## Provider-Specific Configuration

### nSelf (Default)

The nSelf backend stack lives in the `backend/` directory. See [`backend/README.md`](backend/README.md) for full setup instructions.

```bash
# Start the backend
cd backend && make up

# Frontend .env
NEXT_PUBLIC_BACKEND_PROVIDER=nself
NEXT_PUBLIC_NSELF_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=ws://localhost:8080/v1/graphql
NEXT_PUBLIC_NSELF_AUTH_URL=http://localhost:4000
NEXT_PUBLIC_NSELF_STORAGE_URL=http://localhost:8484
NEXT_PUBLIC_NSELF_FUNCTIONS_URL=http://localhost:3010
```

For staging/production, replace localhost URLs with your domain subdomains:

```env
NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=wss://api.yourdomain.com/v1/graphql
NEXT_PUBLIC_NSELF_AUTH_URL=https://auth.yourdomain.com
NEXT_PUBLIC_NSELF_STORAGE_URL=https://storage.yourdomain.com
NEXT_PUBLIC_NSELF_FUNCTIONS_URL=https://functions.yourdomain.com
```

### Supabase

```env
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Bolt.new

```env
NEXT_PUBLIC_BACKEND_PROVIDER=bolt
# Bolt automatically provides SUPABASE_URL and SUPABASE_ANON_KEY
```

### Nhost

```env
NEXT_PUBLIC_BACKEND_PROVIDER=nhost
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=your-region
```

## Architecture

```
lib/backend/
├── index.ts          # Factory: creates client based on provider
├── supabase/         # Supabase adapter (also used for Bolt)
│   ├── auth.ts
│   ├── database.ts
│   ├── storage.ts
│   ├── realtime.ts
│   └── functions.ts
├── nhost/            # Nhost adapter
│   └── ...
└── nself/            # nSelf adapter
    └── ...

lib/providers/
├── auth-provider.tsx   # React context for auth state
├── backend-provider.tsx # React context for backend client
└── ...

lib/types/
└── backend.ts         # Shared interfaces for all adapters
```

## Usage in Components

```tsx
import { useAuth, useBackend } from '@/lib/providers';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  const { db, storage, realtime } = useBackend();

  // Database query
  const { data } = await db.query('todos', { where: { user_id: user?.id } });

  // File upload
  const { url } = await storage.upload('avatars', `${user.id}.png`, file);

  // Realtime subscription
  const channel = realtime.channel('todos');
  channel.on('INSERT', payload => console.log(payload));
  channel.subscribe();
}
```

## Switching Backends

To switch from one backend to another:

1. Update `NEXT_PUBLIC_BACKEND_PROVIDER` in `.env`
2. Add the required environment variables for the new provider
3. Restart the dev server

No code changes required - the abstraction layer handles everything.
