import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

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

function getKlingConfig() {
  const accessKey = process.env.KLING_ACCESS_KEY || '';
  const secretKey = process.env.KLING_SECRET_KEY || '';
  const baseUrl = (process.env.KLING_API_BASE_URL || 'https://api.klingai.com/v1').replace(/\/$/, '');
  return {
    accessKey,
    secretKey,
    baseUrl,
    configured: Boolean(accessKey && secretKey),
  };
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createKlingJwt(accessKey: string, secretKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: accessKey,
    exp: now + 1800,
    nbf: now - 5,
  };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secretKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  return `${encodedHeader}.${encodedPayload}.${base64Url(signature)}`;
}

function aspectRatioFromResolution(resolution: '720p' | '1080p') {
  return resolution === '1080p' ? '9:16' : '9:16';
}

function buildKlingPayload(scene: KlingScene, mode: 'standard' | 'professional', resolution: '720p' | '1080p') {
  return {
    model_name: 'kling-v2-6',
    prompt: scene.prompt,
    negative_prompt: 'blurry, low quality, distorted, watermark, bad anatomy, deformed, flicker',
    duration: String(scene.duration === 10 ? 10 : 5),
    aspect_ratio: aspectRatioFromResolution(resolution),
    mode,
    cfg_scale: 0.5,
  };
}

async function submitKlingScene(scene: KlingScene, mode: 'standard' | 'professional', resolution: '720p' | '1080p') {
  const config = getKlingConfig();
  const token = createKlingJwt(config.accessKey, config.secretKey);
  const response = await fetch(`${config.baseUrl}/videos/text2video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildKlingPayload(scene, mode, resolution)),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json().catch(async () => ({ raw: await response.text().catch(() => '') }));

  if (!response.ok) {
    throw new Error(`Kling scene ${scene.order} failed (${response.status}): ${JSON.stringify(data).slice(0, 240)}`);
  }

  const taskId = data?.data?.task_id || data?.task_id || data?.id || data?.data?.id;
  return {
    sceneId: scene.id,
    order: scene.order,
    title: scene.title,
    taskId,
    raw: data,
  };
}

async function pollKlingTask(taskId: string, endpoint: string = 'text2video') {
  const config = getKlingConfig();
  const token = createKlingJwt(config.accessKey, config.secretKey);
  const response = await fetch(`${config.baseUrl}/videos/${endpoint}/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(async () => ({ raw: await response.text().catch(() => '') }));

  if (!response.ok) {
    throw new Error(`Kling task poll failed (${response.status}): ${JSON.stringify(data).slice(0, 240)}`);
  }

  return data;
}

export async function GET(request: NextRequest) {
  const config = getKlingConfig();
  const taskId = request.nextUrl.searchParams.get('taskId');
  const endpoint = request.nextUrl.searchParams.get('endpoint') || 'text2video';

  if (taskId) {
    if (!config.configured) {
      return NextResponse.json(
        {
          provider: 'kling',
          configured: false,
          status: 'needs_configuration',
          detail: 'Kling access/secret keys are not configured server-side.',
        },
        { status: 409 },
      );
    }

    try {
      const task = await pollKlingTask(taskId, endpoint);
      return NextResponse.json({
        provider: 'kling',
        configured: true,
        task,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          provider: 'kling',
          configured: true,
          detail: error.message || 'Failed to poll Kling task',
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({
    provider: 'kling',
    configured: config.configured,
    baseUrl: config.baseUrl,
    requiredEnv: ['KLING_ACCESS_KEY', 'KLING_SECRET_KEY', 'KLING_API_BASE_URL'],
    supportedDurations: [5, 10],
    recommendedLongForm: [60, 90],
    note: config.configured
      ? 'Kling access/secret keys detected. Paid scene submission is available server-side.'
      : 'Set KLING_ACCESS_KEY and KLING_SECRET_KEY server-side before enabling paid true-motion generation.',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    mode = 'standard',
    resolution = '720p',
    scenes = [],
    confirmSpend = false,
  }: {
    mode?: 'standard' | 'professional';
    resolution?: '720p' | '1080p';
    scenes?: KlingScene[];
    confirmSpend?: boolean;
  } = body;

  const config = getKlingConfig();
  const totalSeconds = scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
  const unitCost = KLING_PRICE_PER_SECOND_USD[`${mode}:${resolution}`] ?? KLING_PRICE_PER_SECOND_USD['standard:720p'];
  const estimatedCostUsd = Number((totalSeconds * unitCost).toFixed(2));

  if (!config.configured) {
    return NextResponse.json(
      {
        provider: 'kling',
        configured: false,
        status: 'needs_configuration',
        estimatedCostUsd,
        totalSeconds,
        detail: 'Kling credentials are not configured. Add KLING_ACCESS_KEY and KLING_SECRET_KEY server-side before submitting paid true-motion jobs.',
      },
      { status: 409 },
    );
  }

  if (!confirmSpend) {
    return NextResponse.json({
      provider: 'kling',
      configured: true,
      status: 'dry_run_ready',
      estimatedCostUsd,
      totalSeconds,
      scenesQueued: scenes.length,
      detail: 'Dry run only. Send confirmSpend=true to submit paid Kling scene jobs.',
    });
  }

  try {
    const taskResults = [];
    for (const scene of scenes) {
      taskResults.push(await submitKlingScene(scene, mode, resolution));
    }

    return NextResponse.json({
      provider: 'kling',
      configured: true,
      status: 'submitted',
      estimatedCostUsd,
      totalSeconds,
      scenesQueued: scenes.length,
      tasks: taskResults,
      detail: 'Kling scene jobs submitted. Poll each taskId until it succeeds, then stitch clips in order.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        provider: 'kling',
        configured: true,
        status: 'submit_failed',
        estimatedCostUsd,
        totalSeconds,
        detail: error.message || 'Failed to submit Kling scene jobs.',
      },
      { status: 502 },
    );
  }

}
