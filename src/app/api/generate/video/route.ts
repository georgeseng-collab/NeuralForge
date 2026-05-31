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
      width = 1344,
      height = 768,
      negativePrompt = '',
      motionEffect = 'ken-burns',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Always use the free no-key path. The browser turns this source image into video.
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
