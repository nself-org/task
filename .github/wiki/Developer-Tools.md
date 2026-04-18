# Development Tools

ɳTasks includes a development environment detection system with built-in developer tools for faster iteration and testing.

## Environment Detection

The app automatically detects the environment based on the hostname:

- **Development**: `localhost`, `127.0.0.1`, `*.local`
- **Staging**: URLs containing `staging`, `preview`, or `dev`
- **Production**: Everything else

### Using Environment Detection

```typescript
import { env, isDevEnvironment, shouldEnableFauxSignin } from '@/lib/env';

// Check the current environment
if (env.isDevelopment) {
  console.log('Running in development mode');
}

// Use utility functions
if (isDevEnvironment()) {
  // Show dev-only features
}

// Check if specific features should be enabled
if (shouldEnableFauxSignin()) {
  // Enable quick sign-in
}
```

## Dev Mode Indicator

A floating badge appears in the bottom-right corner showing the current environment:

- **Development**: Green badge with pulsing dot
- **Staging**: Amber badge with pulsing dot
- **Production**: Red badge (only visible to detect misconfiguration)

The indicator is automatically hidden in production unless explicitly enabled.

## Faux Sign-In (Quick Sign-In)

In development mode, the login page displays a "Quick Sign In" section with pre-configured test accounts. Click any account to instantly sign in without typing credentials.

### Test Accounts

Three test accounts are available by default:

| Email             | Password | Description           |
| ----------------- | -------- | --------------------- |
| admin@example.com | admin123 | Full admin access     |
| test@example.com  | test123  | Standard test account |
| demo@example.com  | demo123  | Demo purposes         |

### Security

Faux sign-in is **automatically disabled** in production. The feature checks the environment and will not display test accounts or allow quick sign-in unless running in development mode.

### Adding Custom Test Accounts

Edit `lib/faux-signin.ts` to add more test accounts:

```typescript
export const FAUX_ACCOUNTS: FauxAccount[] = [
  {
    email: 'your-test@example.com',
    password: 'password123',
    displayName: 'Your Test User',
    description: 'Your custom test account',
  },
  // ... existing accounts
];
```

## Dashboard Dev Tools

When in development or staging mode, the dashboard displays an additional "Developer Tools" section with:

- Current environment name
- Number of available test accounts
- Quick reference for test account credentials
- Environment-specific information

## Using Dev Mode in Your Features

You can use the environment detection system throughout your app:

```typescript
import { env } from '@/lib/env';

export function MyComponent() {
  if (env.enableDevTools) {
    return (
      <div className="dev-only-feature">
        <DebugPanel />
      </div>
    );
  }

  return <ProductionComponent />;
}
```

## Best Practices

1. **Always use the env utility** instead of checking `process.env.NODE_ENV` directly
2. **Never commit sensitive credentials** even in dev mode
3. **Test both dev and production modes** before deploying
4. **Use faux-signin accounts** instead of creating fake user accounts in the database
5. **Hide dev tools in production** by checking `env.enableDevTools`

## Environment Configuration

The environment detection system provides these flags:

| Flag                   | Description                              |
| ---------------------- | ---------------------------------------- |
| `env.isDevelopment`    | True if running locally                  |
| `env.isStaging`        | True if running on staging/preview       |
| `env.isProduction`     | True if running in production            |
| `env.enableDevTools`   | True in dev/staging, false in production |
| `env.enableFauxSignin` | True in dev only, false elsewhere        |
| `env.isServer`         | True on server-side, false on client     |
| `env.isClient`         | True on client-side, false on server     |

## Debugging

To verify environment detection:

1. Check the dev mode indicator badge (bottom-right)
2. View the dashboard's Developer Tools section
3. Check browser console for environment logs
4. Look at the login page for faux-signin options

## Production Safety

All development tools are designed to be **production-safe**:

- Faux-signin is disabled in production
- Dev tools sections are hidden in production
- Environment indicator is minimal in production
- Test accounts cannot be accessed in production

The system uses client-side hostname detection in addition to build-time environment variables, ensuring proper behavior across all deployment targets.
