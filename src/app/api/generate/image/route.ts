import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';

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

    // Determine image size
    let size = '1024x1024';
    if (width <= 512 && height <= 512) size = '1024x1024';
    else if (height > width) size = '768x1344';
    else if (width > height) size = '1344x768';
    else if (width >= 1024) size = '1024x1024';

    const { imageUrl, isReal } = await generateImage(enhancedPrompt, size, style, width, height);

    return NextResponse.json({
      image_url: imageUrl,
      is_nsfw: false,
      prompt: enhancedPrompt,
      settings: { width, height, style, seed },
      is_real_generation: isReal,
      mode: isReal ? 'ai-generated' : 'demo-preview',
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { detail: error.message || 'Image generation failed.' },
      { status: 500 }
    );
  }
}
