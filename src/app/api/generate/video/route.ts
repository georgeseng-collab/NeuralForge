import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const port = searchParams.get('XTransformPort') || '5000';

  try {
    const body = await request.json();
    const res = await fetch(`http://localhost:${port}/generate/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        detail: 'Backend unreachable. Make sure the NeuralForge Python backend is running.',
        error: error.message || 'Connection refused',
      },
      { status: 503 }
    );
  }
}
