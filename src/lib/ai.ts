// ─── NeuralForge AI Engine ─────────────────────────────────────────────────
// Uses free public AI APIs that work from Vercel serverless functions
// No API keys required!

// ─── Supported Free AI Models ──────────────────────────────────────────────
export interface FreeAIModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'huggingface';
  type: 'image' | 'video';
  description: string;
  maxResolution: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'ultra';
  free: boolean;
  noApiKey: boolean;
}

export const FREE_AI_MODELS: FreeAIModel[] = [
  // ─── Image Models ─────────────────────────────────────────────
  {
    id: 'flux',
    name: 'Flux',
    provider: 'pollinations',
    type: 'image',
    description: 'High-quality general purpose model with excellent photorealism and artistic styles.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-realism',
    name: 'Flux Realism',
    provider: 'pollinations',
    type: 'image',
    description: 'Photorealistic image generation with stunning detail and lifelike textures.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-anime',
    name: 'Flux Anime',
    provider: 'pollinations',
    type: 'image',
    description: 'Anime and manga style generation with vibrant colors and cel-shading.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-3d',
    name: 'Flux 3D',
    provider: 'pollinations',
    type: 'image',
    description: '3D render style generation with realistic lighting and materials.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-cablyai',
    name: 'Flux CablyAI',
    provider: 'pollinations',
    type: 'image',
    description: 'Enhanced creative model for artistic and stylized outputs.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-pro',
    name: 'Flux Pro',
    provider: 'pollinations',
    type: 'image',
    description: 'Premium quality generation with the best detail and composition.',
    maxResolution: '1024x1024',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'turbo',
    name: 'Turbo',
    provider: 'pollinations',
    type: 'image',
    description: 'Ultra-fast generation with decent quality. Perfect for rapid prototyping.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'standard',
    free: true,
    noApiKey: true,
  },
  {
    id: 'any-dark',
    name: 'AnyDark',
    provider: 'pollinations',
    type: 'image',
    description: 'Dark and moody aesthetic generation. Great for gothic, noir, and shadowy scenes.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nanobanana-2',
    name: 'NanoBanana 2',
    provider: 'pollinations',
    type: 'image',
    description: 'Fast and creative AI model with unique artistic style. Great for fun generations.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nanobanana-pro',
    name: 'NanoBanana Pro',
    provider: 'pollinations',
    type: 'image',
    description: 'Premium NanoBanana model with enhanced detail and quality outputs.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gptimage',
    name: 'GPT Image',
    provider: 'pollinations',
    type: 'image',
    description: 'OpenAI GPT-based image generation with strong prompt understanding.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gptimage-large',
    name: 'GPT Image Large',
    provider: 'pollinations',
    type: 'image',
    description: 'Large GPT image model with maximum detail and resolution.',
    maxResolution: '1024x1024',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    provider: 'pollinations',
    type: 'image',
    description: 'Next-gen GPT image model with improved composition and text rendering.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedream5',
    name: 'SeeDream 5',
    provider: 'pollinations',
    type: 'image',
    description: 'Alibaba SeeDream model with vibrant colors and creative composition.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'zimage',
    name: 'ZImage',
    provider: 'pollinations',
    type: 'image',
    description: 'ZImage model with balanced quality and speed for general use.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'qwen-image',
    name: 'Qwen Image',
    provider: 'pollinations',
    type: 'image',
    description: 'Alibaba Qwen vision model with strong multilingual prompt support.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'pollinations',
    type: 'image',
    description: 'xAI Grok image generation with witty and creative outputs.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'grok-imagine-pro',
    name: 'Grok Imagine Pro',
    provider: 'pollinations',
    type: 'image',
    description: 'Premium Grok image model with enhanced detail and composition.',
    maxResolution: '1024x1024',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nova-canvas',
    name: 'Nova Canvas',
    provider: 'pollinations',
    type: 'image',
    description: 'Amazon Nova model with clean, professional image outputs.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'klein',
    name: 'Klein',
    provider: 'pollinations',
    type: 'image',
    description: 'Klein model with unique artistic interpretation and style.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'p-image',
    name: 'P-Image',
    provider: 'pollinations',
    type: 'image',
    description: 'Pollinations native image model with creative, vibrant outputs.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  // ─── Video-Capable Models (used for keyframe + video generation) ──
  {
    id: 'wan-image',
    name: 'Wan Image',
    provider: 'pollinations',
    type: 'image',
    description: 'Wan model great for cinematic frames and video-like compositions.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'wan-image-pro',
    name: 'Wan Image Pro',
    provider: 'pollinations',
    type: 'image',
    description: 'Premium Wan model with cinematic quality and video-ready frames.',
    maxResolution: '1344x768',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedance-2.0',
    name: 'SeeDance 2.0',
    provider: 'pollinations',
    type: 'image',
    description: 'Alibaba SeeDance model optimized for motion and cinematic frames.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedance-pro',
    name: 'SeeDance Pro',
    provider: 'pollinations',
    type: 'image',
    description: 'Premium SeeDance model with best cinematic and motion-style frames.',
    maxResolution: '1344x768',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'ltx-2',
    name: 'LTX Video 2',
    provider: 'pollinations',
    type: 'image',
    description: 'Lightricks video model with strong cinematic keyframe generation.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
];

export const FREE_VIDEO_MODELS: FreeAIModel[] = [
  {
    id: 'wan',
    name: 'Wan Video',
    provider: 'pollinations',
    type: 'video',
    description: 'Generate cinematic video keyframes from text using Wan model.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'wan-fast',
    name: 'Wan Fast',
    provider: 'pollinations',
    type: 'video',
    description: 'Fast video keyframe generation for quick previews.',
    maxResolution: '1344x768',
    speed: 'fast',
    quality: 'standard',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedance-2.0',
    name: 'SeeDance 2.0',
    provider: 'pollinations',
    type: 'video',
    description: 'Alibaba SeeDance for motion-rich cinematic keyframes.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedance-pro',
    name: 'SeeDance Pro',
    provider: 'pollinations',
    type: 'video',
    description: 'Premium SeeDance model for high-quality video keyframes.',
    maxResolution: '1344x768',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'ltx-2',
    name: 'LTX Video 2',
    provider: 'pollinations',
    type: 'video',
    description: 'Lightricks video model for cinematic keyframe generation.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux',
    name: 'Flux Video',
    provider: 'pollinations',
    type: 'video',
    description: 'Flux model for high-quality video keyframe generation.',
    maxResolution: '1344x768',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gptimage',
    name: 'GPT Video',
    provider: 'pollinations',
    type: 'video',
    description: 'GPT Image model for detailed video keyframes.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'veo',
    name: 'Veo Video',
    provider: 'pollinations',
    type: 'video',
    description: 'Google Veo-style model for cinematic video keyframes.',
    maxResolution: '1344x768',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'grok-video-pro',
    name: 'Grok Video Pro',
    provider: 'pollinations',
    type: 'video',
    description: 'xAI Grok video model with creative and dynamic keyframes.',
    maxResolution: '1344x768',
    speed: 'slow',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
  {
    id: 'p-video',
    name: 'P-Video',
    provider: 'pollinations',
    type: 'video',
    description: 'Pollinations native video model for dynamic keyframes.',
    maxResolution: '1344x768',
    speed: 'fast',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nova-reel',
    name: 'Nova Reel',
    provider: 'pollinations',
    type: 'video',
    description: 'Amazon Nova video model for professional cinematic keyframes.',
    maxResolution: '1344x768',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
];

// ─── Style Enhancement Maps ────────────────────────────────────────────────
const STYLE_MAP: Record<string, string> = {
  'Photorealistic': 'photorealistic, ultra detailed, 8k, sharp focus, DSLR photo',
  'Anime': 'anime style, cel shaded, vibrant colors, manga art, studio ghibli',
  'Digital Art': 'digital art, concept art, detailed illustration, artstation',
  'Oil Painting': 'oil painting, classical art, rich textures, brush strokes, canvas',
  'Watercolor': 'watercolor painting, soft colors, flowing, delicate, wet on wet',
  'Sketch': 'pencil sketch, hand drawn, detailed line art, graphite',
  'Cyberpunk': 'cyberpunk, neon lights, futuristic, dark atmosphere, high tech, blade runner',
  'Fantasy': 'fantasy art, magical, epic, ethereal lighting, mystical',
  '3D Render': '3d render, octane render, realistic lighting, cinematic',
  'Pixel Art': 'pixel art, 16-bit, retro game style, sprite art',
  'Minimalist': 'minimalist, clean lines, simple, modern design, flat',
  'Surreal': 'surrealism, dreamlike, abstract, salvador dali inspired',
};

// ─── Pollinations.ai API ───────────────────────────────────────────────────
function buildPollinationsUrl(
  prompt: string,
  model: string,
  width: number,
  height: number,
  seed?: number,
  nologo: boolean = true,
): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams();
  params.set('width', String(width));
  params.set('height', String(height));
  params.set('model', model);
  if (nologo) params.set('nologo', 'true');
  if (seed !== undefined && seed !== null) params.set('seed', String(seed));
  // Cache-buster
  params.set('t', String(Date.now()));
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

// ─── Fetch image from URL and convert to base64 ─────────────────────────
async function fetchImageAsBase64(url: string, timeout = 90000): Promise<string> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

  const contentType = response.headers.get('content-type') || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const mime = contentType.includes('jpeg') || contentType.includes('jpg') ? 'image/jpeg'
    : contentType.includes('webp') ? 'image/webp'
    : 'image/png';

  return `data:${mime};base64,${base64}`;
}

// ─── Hugging Face Inference API ────────────────────────────────────────────
const HF_MODEL_MAP: Record<string, string> = {
  'stable-diffusion-xl': 'stabilityai/stable-diffusion-xl-base-1.0',
  'playground-v2': 'playgroundai/playground-v2.5-1024px-aesthetic',
};

async function generateWithHuggingFace(
  prompt: string,
  modelId: string,
  width: number,
  height: number,
): Promise<string> {
  const hfModel = HF_MODEL_MAP[modelId];
  if (!hfModel) throw new Error(`Unknown HuggingFace model: ${modelId}`);

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${hfModel}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: Math.min(width, 1024),
          height: Math.min(height, 1024),
        },
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/png;base64,${base64}`;
}

// ─── Main Image Generation Function ───────────────────────────────────────
export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  style: string = 'Photorealistic',
  width: number = 512,
  height: number = 512,
  modelId: string = 'flux',
  seed?: number,
): Promise<{ imageUrl: string; isReal: boolean; provider: string; modelUsed: string }> {
  const stylePrefix = STYLE_MAP[style] || STYLE_MAP['Photorealistic'];
  const enhancedPrompt = `${prompt}, ${stylePrefix}`;

  const model = FREE_AI_MODELS.find(m => m.id === modelId);
  const provider = model?.provider || 'pollinations';

  try {
    switch (provider) {
      case 'pollinations': {
        const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, modelId, width, height, seed || undefined);

        // Strategy: Try to fetch as base64 first (reliable display)
        // If it times out, return the direct URL and let the browser load it
        try {
          const base64Image = await fetchImageAsBase64(pollinationsUrl, 55000);
          return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: modelId };
        } catch (fetchErr: any) {
          console.log(`[NeuralForge] Base64 fetch failed for ${modelId}: ${fetchErr.message}. Trying flux fallback...`);

          // Try flux as fallback with shorter timeout
          try {
            const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed || undefined);
            const base64Image = await fetchImageAsBase64(fallbackUrl, 30000);
            return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: 'flux' };
          } catch {
            // Last resort: return the direct URL for the browser to load
            console.log('[NeuralForge] Returning direct URL for browser-side loading');
            return { imageUrl: pollinationsUrl, isReal: true, provider: 'pollinations', modelUsed: modelId };
          }
        }
      }

      case 'huggingface': {
        try {
          const base64Image = await generateWithHuggingFace(enhancedPrompt, modelId, width, height);
          return { imageUrl: base64Image, isReal: true, provider: 'huggingface', modelUsed: modelId };
        } catch {
          // Fallback to Pollinations
          const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed || undefined);
          return { imageUrl: fallbackUrl, isReal: true, provider: 'pollinations', modelUsed: 'flux (hf fallback)' };
        }
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`[NeuralForge] All generation failed:`, error.message);
    // Ultimate fallback - generate SVG placeholder
    const placeholder = generatePlaceholderImage(prompt, style, width, height);
    return { imageUrl: placeholder, isReal: false, provider: 'placeholder', modelUsed: 'SVG Placeholder' };
  }
}

// ─── Video Generation (generates multi-frame animated video) ──────────────

// Scene progression prompts for video-like animation
const SCENE_PROGRESSION = [
  'beginning of the scene, establishing shot',
  'early moments, scene starts to unfold',
  'mid-scene, action developing',
  'climactic moment, peak action',
  'scene winding down, resolution',
  'final moment, scene conclusion',
];

export async function generateVideo(
  prompt: string,
  style: string = 'Photorealistic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'wan',
  numFrames: number = 4,
): Promise<{
  frames: string[];
  gifUrl: string | null;
  thumbnailUrl: string;
  isReal: boolean;
  provider: string;
  modelUsed: string;
}> {
  const stylePrefix = STYLE_MAP[style] || STYLE_MAP['Photorealistic'];

  // Map video model IDs to their Pollinations image equivalents
  const videoModelMap: Record<string, string> = {
    'wan': 'wan',
    'wan-fast': 'wan-fast',
    'seedance-2.0': 'seedance-2.0',
    'seedance-pro': 'seedance-pro',
    'ltx-2': 'ltx-2',
    'flux': 'flux',
    'gptimage': 'gptimage',
    'veo': 'veo',
    'grok-video-pro': 'grok-video-pro',
    'p-video': 'p-video',
    'nova-reel': 'nova-reel',
  };

  const pollinationsModel = videoModelMap[modelId] || 'wan';
  const frames: string[] = [];
  const actualFrames = Math.min(numFrames, 6); // Cap at 6 frames

  // Generate multiple keyframes with scene progression
  const framePromises = [];
  for (let i = 0; i < actualFrames; i++) {
    const sceneDesc = SCENE_PROGRESSION[i] || `scene frame ${i + 1}`;
    const framePrompt = `${prompt}, ${stylePrefix}, cinematic frame, ${sceneDesc}, dramatic lighting, 16:9 aspect ratio, film grain`;
    const seed = 1000 + i * 100; // Deterministic but different seeds per frame

    const url = buildPollinationsUrl(framePrompt, pollinationsModel, width, height, seed);
    framePromises.push(
      fetchImageAsBase64(url, 55000)
        .catch(async () => {
          // Fallback to flux model
          const fallbackUrl = buildPollinationsUrl(framePrompt, 'flux', width, height, seed);
          return fetchImageAsBase64(fallbackUrl, 30000).catch(() => url);
        })
    );
  }

  // Fetch all frames in parallel
  const results = await Promise.allSettled(framePromises);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      frames.push(result.value);
    }
  }

  // If no frames were generated, try a single frame with simpler prompt
  if (frames.length === 0) {
    const fallbackPrompt = `${prompt}, ${stylePrefix}, cinematic frame`;
    const url = buildPollinationsUrl(fallbackPrompt, 'flux', width, height, undefined);
    try {
      const base64Image = await fetchImageAsBase64(url, 55000);
      frames.push(base64Image);
    } catch {
      const placeholder = generatePlaceholderImage(prompt, style, width, height);
      frames.push(placeholder);
      return {
        frames,
        gifUrl: null,
        thumbnailUrl: frames[0] || placeholder,
        isReal: false,
        provider: 'placeholder',
        modelUsed: 'SVG Placeholder',
      };
    }
  }

  // Try to create an animated GIF using sharp
  let gifUrl: string | null = null;
  try {
    gifUrl = await createAnimatedGif(frames);
  } catch (err: any) {
    console.log(`[NeuralForge] GIF creation failed: ${err.message}`);
  }

  return {
    frames,
    gifUrl,
    thumbnailUrl: frames[0],
    isReal: true,
    provider: 'pollinations',
    modelUsed: modelId,
  };
}

// ─── Create Animated GIF from frames ──────────────────────────────────────
async function createAnimatedGif(frameDataUrls: string[]): Promise<string> {
  const sharp = await import('sharp');

  // Decode base64 frames to buffers
  const frameBuffers: Buffer[] = [];
  for (const dataUrl of frameDataUrls) {
    if (dataUrl.startsWith('data:')) {
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        frameBuffers.push(Buffer.from(base64Data, 'base64'));
      }
    } else if (dataUrl.startsWith('http')) {
      // Fetch the URL
      const response = await fetch(dataUrl, { signal: AbortSignal.timeout(30000) });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        frameBuffers.push(Buffer.from(arrayBuffer));
      }
    }
  }

  if (frameBuffers.length === 0) throw new Error('No frames to create GIF');

  // Resize all frames to same dimensions and convert to GIF-compatible format
  const targetWidth = 512;
  const targetHeight = Math.round(targetWidth * 9 / 16); // 16:9 ratio

  const resizedFrames: Buffer[] = [];
  for (const buf of frameBuffers) {
    const resized = await sharp.default(buf)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .gif()
      .toBuffer();
    resizedFrames.push(resized);
  }

  // Create animated GIF using sharp's composite/animation features
  // Each frame displays for ~800ms (adjustable)
  const delayMs = 800;

  if (resizedFrames.length === 1) {
    // Single frame - just return as base64 GIF
    return `data:image/gif;base64,${resizedFrames[0].toString('base64')}`;
  }

  // Use sharp to create animated GIF
  // sharp supports animated GIF via joinChannel
  const gifOptions: Record<string, unknown> = {
    delay: Array(resizedFrames.length).fill(delayMs),
    loop: 0, // Infinite loop
  };

  // Create the composite input for animation
  const compositeInputs = resizedFrames.slice(1).map((frame) => ({
    input: frame,
    delay: delayMs,
  }));

  const animatedGif = await sharp.default(resizedFrames[0])
    .gif(gifOptions)
    .joinChannel(compositeInputs.map(c => c.input), gifOptions)
    .toBuffer();

  return `data:image/gif;base64,${animatedGif.toString('base64')}`;
}

// ─── Legacy: Single keyframe generation (kept for compatibility) ──────────
export async function generateVideoKeyframe(
  prompt: string,
  style: string = 'Photorealistic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'wan',
): Promise<{ imageUrl: string; isReal: boolean; provider: string; modelUsed: string }> {
  const result = await generateVideo(prompt, style, width, height, modelId, 1);
  return {
    imageUrl: result.frames[0] || result.thumbnailUrl,
    isReal: result.isReal,
    provider: result.provider,
    modelUsed: result.modelUsed,
  };
}

// ─── Health Check ──────────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ reachable: boolean; mode: string; providers: string[] }> {
  const providers: string[] = ['pollinations'];

  try {
    const res = await fetch('https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true&t=' + Date.now(), {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) providers.push('pollinations (verified)');
  } catch {}

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok || res.status === 503) providers.push('huggingface');
  } catch {}

  return {
    reachable: providers.length > 0,
    mode: 'cloud',
    providers,
  };
}

// ─── Placeholder Generator ─────────────────────────────────────────────────
function generatePlaceholderImage(prompt: string, style: string, width: number, height: number): string {
  const colors: Record<string, string[]> = {
    'Photorealistic': ['#6d28d9', '#ec4899'],
    'Anime': ['#f43f5e', '#f97316'],
    'Digital Art': ['#8b5cf6', '#06b6d4'],
    'Oil Painting': ['#92400e', '#b45309'],
    'Watercolor': ['#0ea5e9', '#a78bfa'],
    'Sketch': ['#6b7280', '#9ca3af'],
    'Cyberpunk': ['#7c3aed', '#06b6d4'],
    'Fantasy': ['#059669', '#7c3aed'],
    '3D Render': ['#2563eb', '#7c3aed'],
    'Pixel Art': ['#10b981', '#f59e0b'],
    'Minimalist': ['#6b7280', '#d1d5db'],
    'Surreal': ['#dc2626', '#7c3aed'],
  };
  const [c1, c2] = colors[style] || colors['Photorealistic'];
  const shortPrompt = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt;
  const escapedPrompt = shortPrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width/2}" y="${height/2 - 20}" font-family="system-ui, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.9">AI Generated Preview</text>
  <text x="${width/2}" y="${height/2 + 20}" font-family="system-ui, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">${escapedPrompt}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
