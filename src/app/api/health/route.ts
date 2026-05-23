import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/ai';

export async function GET() {
  const health = await checkHealth();
  const isDemo = health.mode === 'cloud-demo';

  return NextResponse.json({
    status: 'online',
    backendConnected: true,
    version: '1.2.0',
    gpu_available: !isDemo,
    gpu_name: isDemo ? 'Cloud Demo Mode' : 'Cloud AI Engine',
    models_loaded: isDemo ? [] : ['sd-turbo', 'sdxl-base'],
    mode: health.mode,
  });
}
