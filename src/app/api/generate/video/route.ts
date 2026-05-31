import { NextRequest, NextResponse } from 'next/server';
import { generateFreeRealVideo, generateMotionVideoSource } from '@/lib/ai';

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
      const result = await generateFreeRealVideo(
        prompt,
        style,
        width,
        height,
        realVideoModelId,
        duration,
        undefined,
        negativePrompt,
      );

      return NextResponse.json({
        video_base64: result.videoBase64,
        video_mime: result.mime,
        is_real_generation: true,
        mode: 'real',
        provider: result.provider,
        model_used: result.modelUsed,
        duration: result.duration,
        width: result.width,
        height: result.height,
        prompt,
        note: 'Free no-key real AI video clip. Free availability is rate-limited and clips are short.',
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
