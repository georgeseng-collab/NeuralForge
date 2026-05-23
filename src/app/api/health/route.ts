import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const port = searchParams.get('XTransformPort') || '5000';

  try {
    const res = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        status: 'offline',
        backendConnected: false,
        version: '',
        gpu_available: false,
        gpu_name: '',
        models_loaded: [],
      },
      { status: 503 }
    );
  }
}
