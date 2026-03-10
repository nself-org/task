import { NextResponse } from 'next/server';

// force-static makes this route compatible with Next.js static export (Capacitor builds).
// Dynamic values like process.uptime() are omitted — they're server-side only.
export const dynamic = 'force-static';

export async function GET() {
  const health = {
    status: 'ok',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'local',
    backend: process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'nself',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  };

  return NextResponse.json(health);
}
