import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 5,
      fps = 3,
      style = 'Cinematic',
      modelId = 'flux',
      width = 1344,
      height = 768,
      negativePrompt = '',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Calculate number of frames: more frames for smoother video
    // duration * fps gives total frames, but cap to stay within timeout
    const numFrames = Math.min(Math.max(Math.ceil(duration * fps), 4), 8);

    const result = await generateVideo(
      prompt,
      style,
      width,
      height,
      modelId,
      numFrames,
      negativePrompt,
    );

    return NextResponse.json({
      frames: result.frames,
      frame_count: result.frames.length,
      thumbnail_url: result.thumbnailUrl,
      width: result.width,
      height: result.height,
      target_fps: result.targetFps,
      is_nsfw: false,
      prompt,
      duration,
      fps,
      is_real_generation: result.isReal,
      mode: result.isReal ? 'ai-generated' : 'demo-preview',
      provider: result.provider,
      model_used: result.modelUsed,
      note: `${result.frames.length} cinematic frames generated. Client will encode to video for download.`,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
