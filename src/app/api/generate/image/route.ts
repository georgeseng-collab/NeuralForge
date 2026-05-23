import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      negativePrompt = '',
      width = 512,
      height = 512,
      style = 'Photorealistic',
      seed,
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build enhanced prompt with style
    const styleMap: Record<string, string> = {
      'Photorealistic': 'photorealistic, ultra detailed, 8k, sharp focus',
      'Anime': 'anime style, cel shaded, vibrant colors, manga art',
      'Digital Art': 'digital art, concept art, detailed illustration',
      'Oil Painting': 'oil painting, classical art, rich textures, brush strokes',
      'Watercolor': 'watercolor painting, soft colors, flowing, delicate',
      'Sketch': 'pencil sketch, hand drawn, detailed line art',
      'Cyberpunk': 'cyberpunk, neon lights, futuristic, dark atmosphere, high tech',
      'Fantasy': 'fantasy art, magical, epic, ethereal lighting',
    };

    const stylePrefix = styleMap[style] || styleMap['Photorealistic'];
    const enhancedPrompt = `${prompt}, ${stylePrefix}${negativePrompt ? `, NOT ${negativePrompt}` : ''}`;

    // Determine image size (z-ai supported sizes)
    let size = '1024x1024';
    if (width <= 512 && height <= 512) size = '1024x1024';
    else if (height > width) size = '768x1344';
    else if (width > height) size = '1344x768';
    else if (width >= 1024) size = '1024x1024';

    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size,
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      throw new Error('No image data returned from AI engine');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({
      image_url: imageUrl,
      is_nsfw: false,
      prompt: enhancedPrompt,
      settings: { width, height, style, seed },
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        detail: error.message || 'Image generation failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
