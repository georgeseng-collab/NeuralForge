import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 5,
      fps = 12,
      style = 'Photorealistic',
      modelId = 'wan',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Calculate number of frames based on duration (more frames for longer videos)
    // Cap at 6 frames max for serverless function performance
    const numFrames = Math.min(Math.max(Math.ceil(duration / 2), 2), 6);

    // Generate multi-frame animated video
    const result = await generateVideo(
      prompt,
      style,
      1344,
      768,
      modelId,
      numFrames,
    );

    return NextResponse.json({
      video_url: result.gifUrl || result.frames[0],
      thumbnail_url: result.thumbnailUrl,
      frames: result.frames,
      is_animated: result.gifUrl !== null,
      frame_count: result.frames.length,
      is_nsfw: false,
      prompt,
      duration,
      fps,
      is_real_generation: result.isReal,
      mode: result.isReal ? 'ai-generated' : 'demo-preview',
      provider: result.provider,
      model_used: result.modelUsed,
      note: result.gifUrl
        ? `Animated GIF with ${result.frames.length} frames generated using ${result.modelUsed}`
        : `${result.frames.length} keyframes generated using ${result.modelUsed}. Frames animate in the player.`,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
