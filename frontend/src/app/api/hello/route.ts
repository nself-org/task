import { NextResponse } from 'next/server';

// force-static makes GET compatible with Next.js static export (Capacitor builds).
// Query params and POST body are not available at build time — this is a demo endpoint.
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    message: 'Hello, World!',
    backend: process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'nself',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      message: 'Data received successfully',
      data: body,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}
