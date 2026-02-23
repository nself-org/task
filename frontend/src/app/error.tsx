'use client';

import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error instanceof Error ? error.message : 'Unknown error');
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mb-8 text-base text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    </div>
  );
}
