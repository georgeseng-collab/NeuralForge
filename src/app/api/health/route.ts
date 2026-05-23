import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    backendConnected: true,
    version: '1.0.0',
    gpu_available: true,
    gpu_name: 'Cloud AI Engine',
    models_loaded: ['sd-turbo', 'sdxl-base'],
  });
}
