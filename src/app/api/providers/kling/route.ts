import { NextRequest, NextResponse } from 'next/server';

type KlingScene = {
  id: string;
  order: number;
  duration: number;
  title: string;
  prompt: string;
};

const KLING_PRICE_PER_SECOND_USD: Record<string, number> = {
  'standard:720p': 0.075,
  'standard:1080p': 0.1,
  'professional:720p': 0.1125,
  'professional:1080p': 0.15,
};

export async function GET() {
  const configured = Boolean(process.env.KLING_API_KEY);

  return NextResponse.json({
    provider: 'kling',
    configured,
    requiredEnv: ['KLING_API_KEY'],
    supportedDurations: [5, 10],
    recommendedLongForm: [60, 90],
    note: configured
      ? 'Kling provider key detected. Generation endpoints can be enabled server-side.'
      : 'Set KLING_API_KEY server-side before enabling paid true-motion generation.',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    mode = 'standard',
    resolution = '720p',
    scenes = [],
  }: {
    mode?: 'standard' | 'professional';
    resolution?: '720p' | '1080p';
    scenes?: KlingScene[];
  } = body;

  const totalSeconds = scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
  const unitCost = KLING_PRICE_PER_SECOND_USD[`${mode}:${resolution}`] ?? KLING_PRICE_PER_SECOND_USD['standard:720p'];
  const estimatedCostUsd = Number((totalSeconds * unitCost).toFixed(2));

  if (!process.env.KLING_API_KEY) {
    return NextResponse.json(
      {
        provider: 'kling',
        configured: false,
        status: 'needs_configuration',
        estimatedCostUsd,
        totalSeconds,
        detail: 'Kling API key is not configured. Add KLING_API_KEY server-side before submitting paid true-motion jobs.',
      },
      { status: 409 },
    );
  }

  // Provider-specific job submission will be wired here once the selected Kling
  // API route/account is finalized. Keeping this server-side protects secrets.
  return NextResponse.json({
    provider: 'kling',
    configured: true,
    status: 'ready_for_provider_adapter',
    estimatedCostUsd,
    totalSeconds,
    scenesQueued: scenes.length,
    detail: 'Kling key detected. Implement the selected Kling API adapter here to create and poll scene jobs.',
  });
}
