import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      style = 'Photorealistic',
      seed,
      modelId = 'flux',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Determine image size string for Pollinations
    let size = '1024x1024';
    if (width <= 512 && height <= 512) size = '1024x1024';
    else if (height > width) size = '768x1344';
    else if (width > height) size = '1344x768';
    else if (width >= 1024) size = '1024x1024';

    const { imageUrl, isReal, provider, modelUsed } = await generateImage(
      prompt,
      size,
      style,
      width,
      height,
      modelId,
      seed || undefined,
      negativePrompt,
    );

    return NextResponse.json({
      image_url: imageUrl,
      is_nsfw: false,
      prompt,
      settings: { width, height, style, seed, modelId, negativePrompt },
      is_real_generation: isReal,
      mode: isReal ? 'ai-generated' : 'demo-preview',
      provider,
      model_used: modelUsed,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Image generation failed. Please try again with a simpler prompt.' },
      { status: 500 }
    );
  }
}
