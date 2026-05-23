import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 2,
      fps = 12,
      style = 'Photorealistic',
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { detail: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate a keyframe image for the video
    const styleMap: Record<string, string> = {
      'Photorealistic': 'photorealistic, cinematic, 8k, dramatic lighting',
      'Anime': 'anime style, cel shaded, vibrant colors, manga art',
      'Digital Art': 'digital art, concept art, detailed illustration',
      'Oil Painting': 'oil painting, classical art, rich textures',
      'Watercolor': 'watercolor painting, soft colors, flowing',
      'Sketch': 'pencil sketch, hand drawn, detailed line art',
      'Cyberpunk': 'cyberpunk, neon lights, futuristic, dark atmosphere',
      'Fantasy': 'fantasy art, magical, epic, ethereal lighting',
    };

    const stylePrefix = styleMap[style] || styleMap['Photorealistic'];
    const enhancedPrompt = `${prompt}, ${stylePrefix}, cinematic frame, movie still`;

    const result = await generateImage(enhancedPrompt, '1344x768');

    const imageBase64 = result.data[0]?.base64;

    if (!imageBase64) {
      throw new Error('No image data returned from AI engine');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({
      video_url: imageUrl,
      thumbnail_url: imageUrl,
      is_nsfw: false,
      prompt: enhancedPrompt,
      duration,
      fps,
      note: 'Video keyframe generated. Full video animation requires local backend with GPU.',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      {
        detail: error.message || 'Video generation failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
