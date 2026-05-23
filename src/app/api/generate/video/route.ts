import { NextRequest, NextResponse } from 'next/server';
import { generateVideoKeyframe } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 2,
      fps = 12,
      style = 'Photorealistic',
      modelId = 'flux',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate a keyframe image for the video
    const { imageUrl, isReal, provider, modelUsed } = await generateVideoKeyframe(
      prompt,
      style,
      1344,
      768,
      modelId,
    );

    return NextResponse.json({
      video_url: imageUrl,
      thumbnail_url: imageUrl,
      is_nsfw: false,
      prompt,
      duration,
      fps,
      is_real_generation: isReal,
      mode: isReal ? 'ai-generated' : 'demo-preview',
      provider,
      model_used: modelUsed,
      note: 'Video keyframe generated. Full video generation requires local backend with GPU.',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Video generation failed.' },
      { status: 500 }
    );
  }
}
