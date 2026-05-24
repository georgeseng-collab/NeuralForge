import { NextRequest, NextResponse } from 'next/server';
import { generateRealVideo, generateFreeVideo, generateMotionVideoSource } from '@/lib/ai';

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 5,
      fps = 8,
      style = 'Cinematic',
      modelId = 'ltx-2',
      width = 1344,
      height = 768,
      negativePrompt = '',
      pollinationsApiKey = '',
      videoMode = 'real', // 'real', 'free', or 'motion'
      motionEffect = 'ken-burns',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // ─── Mode 1: Real AI Video via Pollinations (requires API key + credits) ──
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
          video_base64: result.videoBase64, // Raw base64 without data URL prefix
          video_mime: result.mime || 'video/mp4',
          is_real_generation: true,
          mode: 'ai-video',
          provider: result.provider,
          model_used: result.modelUsed,
          duration: result.duration,
          width: result.width,
          height: result.height,
          prompt,
        });
      } catch (error: any) {
        console.error('[NeuralForge] Real video generation failed:', error.message);

        // If it's a credits issue, suggest alternatives
        if (error.message.includes('INSUFFICIENT_CREDITS') || error.message.includes('VIDEO_FALLBACK_IMAGE')) {
          return NextResponse.json({
            detail: `Video generation requires credits on your Pollinations account. ${error.message}. Try the "Free AI Video" mode instead (uses HuggingFace, no credits needed).`,
            suggestion: 'free',
          }, { status: 402 });
        }

        return NextResponse.json({
          detail: `AI Video generation failed: ${error.message}. Try a different model or use Free AI Video mode.`,
          fallback_mode: 'free',
        }, { status: 502 });
      }
    }

    // ─── Mode 2: Free AI Video via HuggingFace (no API key needed) ──────────
    if (videoMode === 'free' || (videoMode === 'real' && !pollinationsApiKey)) {
      try {
        const result = await generateFreeVideo(
          prompt,
          style,
          width,
          height,
          negativePrompt,
        );

        return NextResponse.json({
          video_base64: result.videoBase64,
          video_mime: result.mime || 'video/mp4',
          is_real_generation: true,
          mode: 'free-ai-video',
          provider: result.provider,
          model_used: result.modelUsed,
          duration: result.duration,
          width: result.width,
          height: result.height,
          prompt,
        });
      } catch (error: any) {
        console.error('[NeuralForge] Free video generation failed:', error.message);
        // Fall back to motion mode
        return NextResponse.json({
          detail: `Free AI video generation failed: ${error.message}. Falling back to motion mode.`,
          fallback_mode: 'motion',
        }, { status: 502 });
      }
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
