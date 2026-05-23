import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/ai';

export async function GET() {
  const health = await checkHealth();
  const isCloud = health.mode === 'cloud';

  return NextResponse.json({
    status: 'online',
    backendConnected: true,
    version: '2.0.0',
    gpu_available: !isCloud,
    gpu_name: isCloud ? 'Cloud AI (Free)' : 'Local + Cloud AI',
    models_loaded: isCloud
      ? ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'flux-cablyai', 'flux-pro', 'turbo', 'any-dark']
      : ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'flux-cablyai', 'flux-pro', 'turbo', 'any-dark', 'sdxl', 'zai-engine'],
    mode: health.mode,
    providers: health.providers,
    free_tier: true,
    no_api_key_required: true,
  });
}
