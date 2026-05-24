import { NextRequest, NextResponse } from 'next/server';
import { generateRealVideo, generateFalVideo, generateMotionVideoSource } from '@/lib/ai';

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 5,
      fps = 8,
      style = 'Cinematic',
      modelId = 'fal-wan',
      width = 1344,
      height = 768,
      negativePrompt = '',
      pollinationsApiKey = '',
      falApiKey = '',
      videoMode = 'fal', // 'real', 'fal', or 'motion'
      motionEffect = 'ken-burns',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // ─── Mode 1: Fal.ai Video Generation (free $10-20 credits) ────────────
    if (videoMode === 'fal') {
      if (!falApiKey.trim()) {
        return NextResponse.json({
          detail: 'Fal.ai API key required. Sign up at fal.ai/dashboard for free $10-20 credits (no credit card needed).',
          code: 'FAL_KEY_REQUIRED',
        }, { status: 400 });
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

        if (error.message.includes('FAL_INVALID_KEY')) {
          return NextResponse.json({
            detail: 'Invalid Fal.ai API key. Please check your key at fal.ai/dashboard',
            code: 'FAL_INVALID_KEY',
          }, { status: 401 });
        }

        if (error.message.includes('FAL_INSUFFICIENT_CREDITS')) {
          return NextResponse.json({
            detail: 'Your Fal.ai credits are exhausted. Visit fal.ai/dashboard to check balance or create a new account.',
            code: 'FAL_INSUFFICIENT_CREDITS',
          }, { status: 402 });
        }

        return NextResponse.json({
          detail: `Fal.ai video generation failed: ${error.message}. Try a different model or use Motion mode as fallback.`,
          fallback_mode: 'motion',
        }, { status: 502 });
      }
    }

    // ─── Mode 2: Pollinations Video Generation (requires API key + credits) ──
    if (videoMode === 'real' && pollinationsApiKey) {
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

        if (error.message.includes('INSUFFICIENT_CREDITS') || error.message.includes('VIDEO_FALLBACK_IMAGE')) {
          return NextResponse.json({
            detail: `Pollinations credits insufficient for video. ${error.message}. Try Fal.ai mode instead (free credits at fal.ai).`,
            suggestion: 'fal',
          }, { status: 402 });
        }

        return NextResponse.json({
          detail: `Pollinations video generation failed: ${error.message}. Try Fal.ai mode or use Motion mode.`,
          fallback_mode: 'motion',
        }, { status: 502 });
      }
    }

    // If real mode but no API key
    if (videoMode === 'real' && !pollinationsApiKey) {
      return NextResponse.json({
        detail: 'Pollinations API key required for this mode. Enter your key or switch to Fal.ai mode (free credits).',
        code: 'API_KEY_REQUIRED',
      }, { status: 400 });
    }

    // ─── Mode 3: Motion Video (Free, No API Key) ──────────────────────────
    // Generates a high-quality image that will be animated client-side
    const motionResult = await generateMotionVideoSource(
      prompt,
      style,
      width,
      height,
      modelId === 'ltx-2' || modelId === 'nova-reel' || modelId === 'wan' || modelId === 'wan-fast'
        ? 'flux-realism'
        : modelId,
      negativePrompt,
    );

    return NextResponse.json({
      image_base64: motionResult.imageBase64,
      is_real_generation: false,
      mode: 'motion',
      provider: motionResult.provider,
      model_used: motionResult.modelUsed,
      width: motionResult.width,
      height: motionResult.height,
      motion_effect: motionEffect || 'ken-burns',
      duration,
      fps,
      prompt,
      note: 'High-quality AI image generated. Client will apply cinematic motion effects and encode to video.',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
