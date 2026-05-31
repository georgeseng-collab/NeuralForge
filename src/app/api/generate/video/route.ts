import { NextRequest, NextResponse } from 'next/server';
import { generateMotionVideoSource } from '@/lib/ai';

export const maxDuration = 300; // 5 minutes for video generation

type MotionFallbackOptions = {
  prompt: string;
  style: string;
  width: number;
  height: number;
  modelId: string;
  negativePrompt: string;
  motionEffect: string;
  duration: number;
  fps: number;
};

function buildActionFramePrompts(prompt: string, actionStyle: string): string[] {
  const cleanPrompt = prompt.trim();
  const styleHints: Record<string, string> = {
    'wan-fast': 'dance/action choreography, playful body movement',
    'ltx-2': 'fast energetic movement, dynamic action poses',
    'seedance-pro': 'cinematic movement progression, expressive motion',
    'p-video': 'playful animated movement, lively expressive poses',
  };
  const styleHint = styleHints[actionStyle] || styleHints['wan-fast'];
  return [
    `${cleanPrompt}, ${styleHint}, action sequence frame 1, starting pose, full body visible, centered subject`,
    `${cleanPrompt}, ${styleHint}, action sequence frame 2, first movement, different pose, full body visible, centered subject`,
    `${cleanPrompt}, ${styleHint}, action sequence frame 3, energetic motion, different pose, full body visible, centered subject`,
    `${cleanPrompt}, ${styleHint}, action sequence frame 4, peak action pose, different pose, full body visible, centered subject`,
    `${cleanPrompt}, ${styleHint}, action sequence frame 5, follow through motion, different pose, full body visible, centered subject`,
    `${cleanPrompt}, ${styleHint}, action sequence frame 6, ending pose, different pose, full body visible, centered subject`,
  ];
}

async function createFreeMotionResponse(options: MotionFallbackOptions) {
  const motionResult = await generateMotionVideoSource(
    options.prompt,
    options.style,
    options.width,
    options.height,
    options.modelId,
    options.negativePrompt,
  );

  return NextResponse.json({
    image_base64: motionResult.imageBase64,
    is_real_generation: false,
    mode: 'motion',
    provider: motionResult.provider,
    model_used: motionResult.modelUsed,
    width: motionResult.width,
    height: motionResult.height,
    motion_effect: options.motionEffect || 'ken-burns',
    duration: Math.min(Math.max(options.duration, 2), 60),
    fps: options.fps,
    prompt: options.prompt,
    note: 'Free no-key mode: a high-quality AI image was generated and the browser will encode it into a motion video.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 5,
      fps = 8,
      style = 'Cinematic',
      modelId = 'gptimage',
      realVideoModelId = 'wan-fast',
      width = 1344,
      height = 768,
      negativePrompt = '',
      generationMode = 'real',
      motionEffect = 'ken-burns',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (generationMode === 'real') {
      const framePrompts = buildActionFramePrompts(prompt, realVideoModelId);
      const frameResults = await Promise.allSettled(
        framePrompts.map((framePrompt) =>
          generateMotionVideoSource(
            framePrompt,
            style,
            width,
            height,
            modelId,
            negativePrompt,
          )
        )
      );
      const frames = frameResults
        .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof generateMotionVideoSource>>> => result.status === 'fulfilled')
        .map((result) => result.value);

      if (frames.length < 2) {
        throw new Error('Could not generate enough action frames. Try again with a simpler prompt.');
      }

      return NextResponse.json({
        image_frames: frames.map((frame, index) => ({
          image_base64: frame.imageBase64,
          model_used: frame.modelUsed,
          width: frame.width,
          height: frame.height,
          frame: index + 1,
        })),
        is_real_generation: false,
        mode: 'sequence',
        provider: 'pollinations-action-sequence',
        model_used: frames.map((frame) => frame.modelUsed).join(', '),
        width: frames[0]?.width || width,
        height: frames[0]?.height || height,
        duration: Math.min(Math.max(duration, 3), 8),
        fps,
        prompt,
        note: 'No-key action sequence: multiple AI keyframes are encoded in the browser. True text-to-video currently requires an authenticated provider.',
      });
    }

    // Long free no-key path. The browser turns this source image into video.
    return createFreeMotionResponse({
      prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
