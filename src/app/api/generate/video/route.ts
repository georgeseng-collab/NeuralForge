import { NextRequest, NextResponse } from 'next/server';
import { generateRealVideo, generateFalVideo, generateReplicateVideo, generateMotionVideoSource } from '@/lib/ai';

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
  reason?: string;
  requestedMode?: string;
};

function normalizeMotionModel(modelId: string): string {
  const videoModelIds = new Set([
    'replicate-luma', 'replicate-wan', 'replicate-kling', 'replicate-hailuo',
    'fal-wan', 'fal-hailuo', 'fal-kling', 'fal-luma',
    'ltx-2', 'nova-reel', 'wan-fast', 'wan', 'seedance-pro', 'seedance-2.0', 'veo', 'grok-video-pro', 'p-video',
  ]);

  return videoModelIds.has(modelId) ? 'gptimage' : modelId;
}

async function createMotionFallbackResponse(options: MotionFallbackOptions) {
  const motionResult = await generateMotionVideoSource(
    options.prompt,
    options.style,
    options.width,
    options.height,
    normalizeMotionModel(options.modelId),
    options.negativePrompt,
  );

  return NextResponse.json({
    image_base64: motionResult.imageBase64,
    is_real_generation: false,
    mode: 'motion',
    provider: motionResult.provider,
    requested_mode: options.requestedMode,
    fallback_reason: options.reason,
    model_used: motionResult.modelUsed,
    width: motionResult.width,
    height: motionResult.height,
    motion_effect: options.motionEffect || 'ken-burns',
    duration: Math.min(Math.max(options.duration, 2), 60),
    fps: options.fps,
    prompt: options.prompt,
    note: 'Free fallback: a high-quality AI image was generated and the browser will encode it into a motion video.',
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
      modelId = 'replicate-luma',
      width = 1344,
      height = 768,
      negativePrompt = '',
      pollinationsApiKey = '',
      falApiKey = '',
      replicateApiKey = '',
      videoMode = 'replicate', // 'real', 'fal', 'replicate', or 'motion'
      motionEffect = 'ken-burns',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // ─── Mode 1: Replicate Video Generation (free credits for new users) ──
    if (videoMode === 'replicate') {
      if (!replicateApiKey.trim()) {
        return createMotionFallbackResponse({
          prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
          requestedMode: 'replicate',
          reason: 'No Replicate API key was provided, so NeuralForge used the free no-key motion generator.',
        });
      }

      try {
        const result = await generateReplicateVideo(
          prompt,
          style,
          width,
          height,
          modelId,
          replicateApiKey,
          negativePrompt,
        );

        return NextResponse.json({
          video_base64: result.videoBase64,
          video_mime: result.mime || 'video/mp4',
          video_url: result.videoUrl,
          is_real_generation: true,
          mode: 'replicate-video',
          provider: result.provider,
          model_used: result.modelUsed,
          duration: result.duration,
          width: result.width,
          height: result.height,
          prompt,
        });
      } catch (error: any) {
        console.error('[NeuralForge] Replicate video generation failed:', error.message);

        return createMotionFallbackResponse({
          prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
          requestedMode: 'replicate',
          reason: `Replicate failed: ${error.message}`,
        });
      }
    }

    // ─── Mode 2: Fal.ai Video Generation (free $10-20 credits) ────────────
    if (videoMode === 'fal') {
      if (!falApiKey.trim()) {
        return createMotionFallbackResponse({
          prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
          requestedMode: 'fal',
          reason: 'No Fal.ai API key was provided, so NeuralForge used the free no-key motion generator.',
        });
      }

      try {
        const result = await generateFalVideo(
          prompt,
          style,
          width,
          height,
          modelId,
          falApiKey,
          negativePrompt,
        );

        return NextResponse.json({
          video_base64: result.videoBase64,
          video_mime: result.mime || 'video/mp4',
          video_url: result.videoUrl,
          is_real_generation: true,
          mode: 'fal-video',
          provider: result.provider,
          model_used: result.modelUsed,
          duration: result.duration,
          width: result.width,
          height: result.height,
          prompt,
        });
      } catch (error: any) {
        console.error('[NeuralForge] Fal.ai video generation failed:', error.message);

        return createMotionFallbackResponse({
          prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
          requestedMode: 'fal',
          reason: `Fal.ai failed: ${error.message}`,
        });
      }
    }

    // ─── Mode 3: Pollinations Video Generation (requires API key + credits) ──
    if (videoMode === 'real') {
      try {
        const result = await generateRealVideo(
          prompt,
          style,
          width,
          height,
          modelId,
          duration,
          pollinationsApiKey,
          undefined,
          negativePrompt,
        );

        return NextResponse.json({
          video_base64: result.videoBase64,
          video_mime: result.mime || 'video/mp4',
          is_real_generation: true,
          mode: 'pollinations-video',
          provider: result.provider,
          model_used: result.modelUsed,
          duration: result.duration,
          width: result.width,
          height: result.height,
          prompt,
        });
      } catch (error: any) {
        console.error('[NeuralForge] Pollinations video generation failed:', error.message);
        return createMotionFallbackResponse({
          prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
          requestedMode: 'pollinations',
          reason: `Pollinations video failed: ${error.message}`,
        });
      }
    }

    // ─── Mode 4: Motion Video (Free, No API Key) ──────────────────────────
    // Generates a high-quality image that will be animated client-side
    return createMotionFallbackResponse({
      prompt, style, width, height, modelId, negativePrompt, motionEffect, duration, fps,
      requestedMode: 'motion',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
