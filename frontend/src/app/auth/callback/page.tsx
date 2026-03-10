'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useBackend } from '@/lib/providers';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { auth } = useBackend();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auth.getSessionFromUrl().then(({ error: authError }) => {
      if (authError) {
        setError(authError);
      } else {
        router.replace('/dashboard');
      }
    });
  }, [auth, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="mb-2 text-xl font-bold tracking-tight">Authentication Error</h1>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
