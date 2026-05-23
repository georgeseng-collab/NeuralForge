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

    // Calculate number of frames based on duration
    // Cap at 4 frames to stay within Vercel's 60s timeout
    const numFrames = Math.min(Math.max(Math.ceil(duration / 3), 2), 4);

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
      video_url: result.frames[0],
      thumbnail_url: result.thumbnailUrl,
      frames: result.frames,
      frame_count: result.frames.length,
      is_nsfw: false,
      prompt,
      duration,
      fps,
      is_real_generation: result.isReal,
      mode: result.isReal ? 'ai-generated' : 'demo-preview',
      provider: result.provider,
      model_used: result.modelUsed,
      note: `${result.frames.length} cinematic frames generated using ${result.modelUsed}. Frames animate automatically in the video player.`,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
