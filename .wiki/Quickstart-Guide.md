# ɳApp Quickstart Guide

Get your app running in under 5 minutes.

## Download from Bolt.new

If you're viewing this project on Bolt.new:

1. **Download the project**
   - Click the download icon in the top right corner
   - Or use Bolt's export feature to download as ZIP

2. **Extract and navigate**

   ```bash
   unzip nself-demo.zip
   cd nself-demo
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Configure your backend**

   ```bash
   cp .env.example .env
   ```

5. **Choose your backend provider**

   Edit `.env` and set:

   ```bash
   # For local nSelf development (default)
   NEXT_PUBLIC_BACKEND_PROVIDER=nself

   # For Supabase
   NEXT_PUBLIC_BACKEND_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # For Nhost
   NEXT_PUBLIC_BACKEND_PROVIDER=nhost
   NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
   NEXT_PUBLIC_NHOST_REGION=your-region
   ```

6. **Start development server**

   ```bash
   pnpm dev
   ```

7. **Open your browser**
   - Navigate to http://localhost:3000
   - You should see the ɳApp home page

## First Steps

### 1. White-Label Your App

Edit `lib/app.config.ts`:

```typescript
export const appConfig = {
  name: 'Your App Name', // ✏️ Change this
  tagline: 'Your tagline', // ✏️ Change this
  description: 'Your description', // ✏️ Change this

  branding: {
    icon: '/icon.svg', // Replace with your 64x64 icon
    logo: '/logo.svg', // Replace with your logo
  },

  social: {
    twitter: 'https://twitter.com/yourhandle', // ✏️ Change this
    github: 'https://github.com/yourorg', // ✏️ Change this
  },
};
```

### 2. Replace Placeholder Assets

Replace these files in `/public`:

- `icon.svg` - 64x64 app icon
- `logo.svg` - Horizontal logo (light mode)
- `logo-dark.svg` - Horizontal logo (dark mode)
- `og-image.svg` - Social sharing image (1200x630)
- `apple-touch-icon.svg` - iOS home screen icon

### 3. Test Authentication

1. Start your dev server: `pnpm dev`
2. Navigate to http://localhost:3000/register
3. Create a test account
4. Sign in at http://localhost:3000/login
5. Access protected pages at http://localhost:3000/dashboard

### 4. Add Your First Feature

Create a new page:

```typescript
// app/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">My Feature</h1>
      <p>Start building here!</p>
    </div>
  );
}
```

Automatically available at http://localhost:3000/my-feature

## Backend Setup

### Option 1: nSelf (Self-Hosted) -- DEFAULT

The backend stack is included in this repo under `backend/`. Requires Docker.

```bash
# Start the nSelf backend
cd backend
cp .env.example .env         # Edit passwords for non-local environments
make up                      # Starts PostgreSQL, Hasura, Auth, Storage, MinIO

# Configure the frontend
cd ..
cp .env.local.example .env.local
pnpm dev
```

Services will be available at:

- Hasura Console: http://localhost:8080/console
- GraphQL API: http://localhost:8080/v1/graphql
- Auth: http://localhost:4000
- Storage: http://localhost:8484
- MinIO Console: http://localhost:9001
- Mailhog (email testing): http://localhost:8025

See [`backend/README.md`](backend/README.md) for full backend documentation.

### Option 2: Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key
3. Update `.env`:

```bash
NEXT_PUBLIC_BACKEND_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Option 3: Nhost

1. Create an Nhost project at https://nhost.io
2. Get your subdomain and region
3. Update `.env`:

```bash
NEXT_PUBLIC_BACKEND_PROVIDER=nhost
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=us-east-1
```

## Common Tasks

### Add a Database Table

For Supabase/Bolt:

1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Create your table
4. Enable RLS (Row Level Security)
5. Add policies for select/insert/update/delete

For nSelf/Nhost:

1. Open Hasura Console (http://localhost:8080)
2. Navigate to Data tab
3. Create your table
4. Set permissions for each role

### Query the Database

```typescript
import { useQuery } from '@/hooks';

function MyComponent() {
  const { data, loading, error } = useQuery('my_table');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

### Insert Data

```typescript
import { useMutation } from '@/hooks';

function MyForm() {
  const { mutate: insert } = useMutation('my_table', 'insert');

  async function handleSubmit(formData: any) {
    await insert(formData);
  }
}
```

### Enable Realtime

```typescript
import { useRealtime } from '@/hooks';

function LiveFeed() {
  useRealtime('my_table', payload => {
    console.log('Change detected:', payload);
  });
}
```

## Troubleshooting

### Backend Connection Issues

1. Check `.env` file has correct values
2. Verify backend services are running
3. Check browser console for errors
4. Verify CORS settings on backend

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm build
```

### Type Errors

```bash
# Run type checker
pnpm typecheck
```

## Next Steps

1. ✅ Read the full [README.md](README.md)
2. ✅ Review [BACKEND.md](BACKEND.md) for backend switching
3. ✅ Explore the [project structure](README.md#project-structure)
4. ✅ Check out [hooks documentation](README.md#available-hooks)
5. ✅ Join discussions on [GitHub](https://github.com/nself-org/demo/discussions)

## Getting Help

- **Documentation**: Check README.md and BACKEND.md
- **Issues**: https://github.com/nself-org/demo/issues
- **Discussions**: https://github.com/nself-org/demo/discussions

---

**Happy coding!** 🚀
