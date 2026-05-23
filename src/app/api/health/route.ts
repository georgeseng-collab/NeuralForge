import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:5000/health', {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: 'offline', backendConnected: false },
      { status: 503 }
    );
  }
}
