// ─── NeuralForge AI Engine ─────────────────────────────────────────────────
// Uses free public AI APIs that work from Vercel serverless functions
// Image: Pollinations.ai (free, no API key)
// Video: Pollinations.ai (requires API key + credits) OR HuggingFace Spaces (free)

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
  { id: 'flux', name: 'Flux', provider: 'pollinations', type: 'image', description: 'Best all-rounder for any style', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'flux-realism', name: 'Flux Realism', provider: 'pollinations', type: 'image', description: 'Photorealistic portraits & scenes', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'flux-anime', name: 'Flux Anime', provider: 'pollinations', type: 'image', description: 'Anime, manga & illustration', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'flux-3d', name: 'Flux 3D', provider: 'pollinations', type: 'image', description: '3D render with realistic lighting', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'flux-cablyai', name: 'Flux CablyAI', provider: 'pollinations', type: 'image', description: 'Enhanced creative & artistic', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'flux-pro', name: 'Flux Pro', provider: 'pollinations', type: 'image', description: 'Premium quality, best detail', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'turbo', name: 'Turbo', provider: 'pollinations', type: 'image', description: 'Ultra-fast generation', maxResolution: '1024x1024', speed: 'fast', quality: 'standard', free: true, noApiKey: true },
  { id: 'any-dark', name: 'AnyDark', provider: 'pollinations', type: 'image', description: 'Gothic, noir & dark aesthetics', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'nanobanana-2', name: 'NanoBanana 2', provider: 'pollinations', type: 'image', description: 'Fast & fun creative AI', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'nanobanana-pro', name: 'NanoBanana Pro', provider: 'pollinations', type: 'image', description: 'Premium NanoBanana detail', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', type: 'image', description: 'Strong prompt understanding', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', type: 'image', description: 'Maximum detail & resolution', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'gpt-image-2', name: 'GPT Image 2', provider: 'pollinations', type: 'image', description: 'Next-gen with text rendering', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'seedream5', name: 'SeeDream 5', provider: 'pollinations', type: 'image', description: 'Vibrant colors & composition', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'zimage', name: 'ZImage', provider: 'pollinations', type: 'image', description: 'Balanced quality & speed', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'qwen-image', name: 'Qwen Image', provider: 'pollinations', type: 'image', description: 'Multilingual prompt support', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'grok-imagine', name: 'Grok Imagine', provider: 'pollinations', type: 'image', description: 'Witty & creative outputs', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'grok-imagine-pro', name: 'Grok Imagine Pro', provider: 'pollinations', type: 'image', description: 'Enhanced detail & composition', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'nova-canvas', name: 'Nova Canvas', provider: 'pollinations', type: 'image', description: 'Clean, professional images', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'klein', name: 'Klein', provider: 'pollinations', type: 'image', description: 'Unique artistic interpretation', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'p-image', name: 'P-Image', provider: 'pollinations', type: 'image', description: 'Pollinations native creative', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
];

// ─── Real Video Models (Pollinations gen.pollinations.ai) ─────────────────
export const REAL_VIDEO_MODELS = [
  { id: 'ltx-2', name: 'LTX Video 2.3', description: 'Fast AI video, cheapest option', speed: 'Fast', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['480p'] },
  { id: 'nova-reel', name: 'Nova Reel', description: '6-120s professional video, 720p', speed: 'Medium', badge: 'HD', needsApiKey: true, free: true, maxDuration: 30, qualities: ['720p'] },
  { id: 'wan-fast', name: 'Wan Fast', description: 'Quick 5s video generation', speed: 'Fast', badge: 'Speed', needsApiKey: true, free: false, maxDuration: 5, qualities: ['480p'] },
  { id: 'wan', name: 'Wan 2.6', description: 'High quality with audio, up to 1080p', speed: 'Medium', badge: 'HD', needsApiKey: true, free: false, maxDuration: 15, qualities: ['480p', '720p', '1080p'] },
  { id: 'seedance-pro', name: 'Seedance Pro', description: 'Better prompt adherence, 720p', speed: 'Medium', badge: 'Pro', needsApiKey: true, free: false, maxDuration: 10, qualities: ['720p'] },
  { id: 'seedance-2.0', name: 'Seedance 2.0', description: 'ByteDance multimodal video', speed: 'Slow', badge: 'Ultra', needsApiKey: true, free: false, maxDuration: 15, qualities: ['720p'] },
  { id: 'veo', name: 'Veo 3.1', description: 'Google Veo with audio output', speed: 'Slow', badge: 'Ultra', needsApiKey: true, free: false, maxDuration: 8, qualities: ['720p', '1080p'] },
  { id: 'grok-video-pro', name: 'Grok Video Pro', description: 'xAI creative video, 1-15s', speed: 'Medium', badge: 'Creative', needsApiKey: true, free: false, maxDuration: 15, qualities: ['720p'] },
  { id: 'p-video', name: 'Pruna Video', description: 'Up to 1080p quality', speed: 'Medium', badge: 'HD', needsApiKey: true, free: false, maxDuration: 10, qualities: ['720p', '1080p'] },
] as const;

// ─── Enhanced Style Enhancement Maps ────────────────────────────────────────
const STYLE_MAP: Record<string, string> = {
  'Photorealistic': 'photorealistic, ultra detailed, 8k uhd, sharp focus, DSLR photo, natural lighting, high dynamic range, professional photography',
  'Anime': 'anime style, cel shaded, vibrant colors, manga art, studio ghibli, detailed anime illustration, clean lineart',
  'Digital Art': 'digital art, concept art, detailed illustration, artstation trending, vibrant, polished',
  'Oil Painting': 'oil painting, classical art, rich textures, visible brush strokes, canvas texture, renaissance style',
  'Watercolor': 'watercolor painting, soft flowing colors, wet on wet technique, delicate, ethereal',
  'Sketch': 'pencil sketch, hand drawn, detailed line art, graphite shading, cross-hatching',
  'Cyberpunk': 'cyberpunk, neon lights, futuristic cityscape, dark atmosphere, high tech low life, blade runner, volumetric fog',
  'Fantasy': 'fantasy art, magical, epic scale, ethereal lighting, mystical atmosphere, enchanted',
  '3D Render': '3d render, octane render, realistic materials, cinematic lighting, ray tracing, volumetric',
  'Pixel Art': 'pixel art, 16-bit, retro game style, sprite art, clean pixels, limited palette',
  'Minimalist': 'minimalist, clean lines, simple composition, modern design, flat colors, negative space',
  'Surreal': 'surrealism, dreamlike, abstract forms, impossible geometry, salvador dali inspired, melting',
  'Cinematic': 'cinematic, movie still, dramatic lighting, shallow depth of field, anamorphic lens, color graded',
  'Social Media': 'social media content, vibrant, eye-catching, professional, clean layout, trending aesthetic',
};

// ─── Negative Prompt Enhancements ──────────────────────────────────────────
const DEFAULT_NEGATIVES = 'blurry, low quality, distorted, deformed, disfigured, bad anatomy, bad hands, missing fingers, extra fingers, watermark, text, logo, signature, jpeg artifacts, noise, grainy, overexposed, underexposed, cropped, out of frame, worst quality';

// ─── Social Media Presets ───────────────────────────────────────────────────
export const SOCIAL_MEDIA_PRESETS = {
  'instagram-reel': { name: 'Instagram Reel', width: 768, height: 1344, aspectRatio: '9:16', icon: '📱', description: 'Vertical 9:16 for Instagram Reels' },
  'tiktok': { name: 'TikTok', width: 768, height: 1344, aspectRatio: '9:16', icon: '🎵', description: 'Vertical 9:16 for TikTok' },
  'youtube-shorts': { name: 'YouTube Shorts', width: 768, height: 1344, aspectRatio: '9:16', icon: '🎬', description: 'Vertical 9:16 for YouTube Shorts' },
  'youtube-video': { name: 'YouTube Video', width: 1344, height: 768, aspectRatio: '16:9', icon: '▶️', description: 'Landscape 16:9 for YouTube' },
  'instagram-post': { name: 'Instagram Post', width: 1024, height: 1024, aspectRatio: '1:1', icon: '📸', description: 'Square 1:1 for Instagram Feed' },
  'instagram-story': { name: 'Instagram Story', width: 768, height: 1344, aspectRatio: '9:16', icon: '📱', description: 'Vertical 9:16 for Stories' },
  'facebook-reel': { name: 'Facebook Reel', width: 768, height: 1344, aspectRatio: '9:16', icon: '📘', description: 'Vertical 9:16 for Facebook Reels' },
  'twitter-video': { name: 'X/Twitter Video', width: 1344, height: 768, aspectRatio: '16:9', icon: '🐦', description: 'Landscape 16:9 for X/Twitter' },
} as const;

export type SocialMediaPreset = keyof typeof SOCIAL_MEDIA_PRESETS;

// ─── Pollinations.ai Image API ──────────────────────────────────────────────
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
  params.set('t', String(Date.now()));
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

// ─── Pollinations.ai Video API URL Builder ──────────────────────────────────
// Correct format: GET /video/{prompt} with Authorization header
// Query params: model, duration, nologo, seed, aspectRatio
function buildVideoApiUrl(
  prompt: string,
  model: string,
  duration: number,
  aspectRatio?: string,
  seed?: number,
): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams();
  params.set('model', model);
  params.set('duration', String(duration));
  if (aspectRatio) params.set('aspectRatio', aspectRatio);
  if (seed !== undefined && seed !== null) params.set('seed', String(seed));
  params.set('nologo', 'true');
  return `https://gen.pollinations.ai/video/${encodedPrompt}?${params.toString()}`;
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

// ─── Fetch video from Pollinations API ──────────────────────────────────
// Uses Authorization: Bearer header (NOT key= query param)
async function fetchVideoFromPollinations(
  url: string,
  apiKey: string,
  timeout = 300000, // 5 minutes for video generation
): Promise<{ videoBase64: string; mime: string }> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'video/mp4,*/*',
    },
  });

  // Check if we got an error
  if (!response.ok) {
    let errorMsg = `Video API returned ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData?.error?.message || errData?.detail || errorMsg;
    } catch {}

    if (response.status === 402) {
      throw new Error('INSUFFICIENT_CREDITS: Your Pollinations account needs more credits for video generation. Visit pollinations.ai to add credits or wait for your free tier reset.');
    }
    throw new Error(errorMsg);
  }

  // Verify we actually got a video, not an image
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('image/')) {
    throw new Error('VIDEO_FALLBACK_IMAGE: The API returned an image instead of a video. This usually means insufficient credits. Try adding credits at pollinations.ai or use a different model.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const mime = contentType.includes('webm') ? 'video/webm' : 'video/mp4';
  return { videoBase64: base64, mime };
}

// ─── Fetch video from HuggingFace Spaces (FREE, no API key) ──────────────
async function fetchVideoFromHuggingFace(
  prompt: string,
  timeout = 300000,
): Promise<{ videoBase64: string; mime: string }> {
  // Use Hugging Face's free inference API with CogVideoX or similar model
  // This is a FREE alternative that doesn't require an API key
  const models = [
    'tencent/CogVideoX-5b',
    'tencent/CogVideoX-2b',
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      console.log(`[NeuralForge] Trying HuggingFace video model: ${model}`);
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_frames: 48,
              num_inference_steps: 25,
            },
          }),
          signal: AbortSignal.timeout(timeout),
        },
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const arrayBuffer = await response.arrayBuffer();

        // HuggingFace might return JSON error even with 200
        if (contentType.includes('application/json')) {
          const text = new TextDecoder().decode(arrayBuffer);
          const data = JSON.parse(text);
          if (data.error) {
            lastError = new Error(data.error);
            continue;
          }
        }

        if (arrayBuffer.byteLength > 10000) { // Valid video should be > 10KB
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mime = contentType.includes('webm') ? 'video/webm' : 'video/mp4';
          console.log(`[NeuralForge] HuggingFace video generated successfully with ${model}`);
          return { videoBase64: base64, mime };
        }
      } else {
        const errText = await response.text().catch(() => '');
        lastError = new Error(`HuggingFace ${model} returned ${response.status}: ${errText.slice(0, 200)}`);
      }
    } catch (err: any) {
      lastError = err;
      console.log(`[NeuralForge] HuggingFace model ${model} failed: ${err.message}`);
    }
  }

  throw new Error(lastError?.message || 'HuggingFace video generation failed');
}

// ─── Enhanced Prompt Builder ────────────────────────────────────────────────
function buildEnhancedPrompt(
  prompt: string,
  style: string = 'Photorealistic',
  negativePrompt: string = '',
  isVideo: boolean = false,
): string {
  const stylePrefix = STYLE_MAP[style] || STYLE_MAP['Photorealistic'];
  const negatives = negativePrompt ? `${DEFAULT_NEGATIVES}, ${negativePrompt}` : DEFAULT_NEGATIVES;

  let enhanced = `${prompt}, ${stylePrefix}`;

  if (isVideo) {
    enhanced += ', cinematic motion, smooth camera movement, dynamic scene, fluid animation, realistic motion, natural movement';
  }

  // Add positive guidance
  enhanced += ', well-composed, sharp, high quality, detailed';

  return enhanced;
}

// ─── Main Image Generation Function ───────────────────────────────────────
export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  style: string = 'Photorealistic',
  width: number = 1024,
  height: number = 1024,
  modelId: string = 'flux',
  seed?: number,
  negativePrompt: string = '',
): Promise<{ imageUrl: string; isReal: boolean; provider: string; modelUsed: string }> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, false);

  const model = FREE_AI_MODELS.find(m => m.id === modelId);
  const provider = model?.provider || 'pollinations';

  try {
    switch (provider) {
      case 'pollinations': {
        const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, modelId, width, height, seed || undefined);

        try {
          const base64Image = await fetchImageAsBase64(pollinationsUrl, 55000);
          return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: modelId };
        } catch (fetchErr: any) {
          console.log(`[NeuralForge] Base64 fetch failed for ${modelId}: ${fetchErr.message}. Trying flux fallback...`);

          try {
            const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed || undefined);
            const base64Image = await fetchImageAsBase64(fallbackUrl, 30000);
            return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: 'flux' };
          } catch {
            console.log('[NeuralForge] Returning direct URL for browser-side loading');
            return { imageUrl: pollinationsUrl, isReal: true, provider: 'pollinations', modelUsed: modelId };
          }
        }
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`[NeuralForge] All generation failed:`, error.message);
    const placeholder = generatePlaceholderImage(prompt, style, width, height);
    return { imageUrl: placeholder, isReal: false, provider: 'placeholder', modelUsed: 'SVG Placeholder' };
  }
}

// ─── Real AI Video Generation (gen.pollinations.ai) ─────────────────────────
// This generates ACTUAL AI video using Pollinations' video models
export async function generateRealVideo(
  prompt: string,
  style: string = 'Cinematic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'ltx-2',
  duration: number = 5,
  apiKey: string,
  seed?: number,
  negativePrompt: string = '',
): Promise<{
  videoBase64: string;
  isReal: boolean;
  provider: string;
  modelUsed: string;
  duration: number;
  width: number;
  height: number;
  mime: string;
}> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);

  // Determine aspect ratio from dimensions
  const aspectRatio = height > width ? '9:16' : width > height ? '16:9' : '1:1';

  // Clamp duration based on model limits
  const modelInfo = REAL_VIDEO_MODELS.find(m => m.id === modelId);
  const maxDuration = modelInfo?.maxDuration || 10;
  const clampedDuration = Math.min(Math.max(duration, 2), maxDuration);

  const videoUrl = buildVideoApiUrl(
    enhancedPrompt,
    modelId,
    clampedDuration,
    aspectRatio,
    seed || undefined,
  );

  console.log(`[NeuralForge] Requesting real AI video from ${modelId}, duration=${clampedDuration}s, aspect=${aspectRatio}`);
  console.log(`[NeuralForge] Video URL: ${videoUrl}`);

  try {
    const result = await fetchVideoFromPollinations(videoUrl, apiKey, 300000);
    return {
      videoBase64: result.videoBase64,
      isReal: true,
      provider: 'pollinations-video',
      modelUsed: modelId,
      duration: clampedDuration,
      width,
      height,
      mime: result.mime,
    };
  } catch (error: any) {
    // If Pollinations fails with insufficient credits, try HuggingFace as fallback
    if (error.message.includes('INSUFFICIENT_CREDITS') || error.message.includes('VIDEO_FALLBACK_IMAGE')) {
      console.log(`[NeuralForge] Pollinations credits issue, trying HuggingFace as free fallback...`);
      try {
        const hfResult = await fetchVideoFromHuggingFace(enhancedPrompt, 300000);
        return {
          videoBase64: hfResult.videoBase64,
          isReal: true,
          provider: 'huggingface-video',
          modelUsed: 'CogVideoX',
          duration: clampedDuration,
          width,
          height,
          mime: hfResult.mime,
        };
      } catch (hfError: any) {
        console.error(`[NeuralForge] HuggingFace fallback also failed:`, hfError.message);
        throw new Error(`Video generation failed: ${error.message}. Free HuggingFace fallback also failed: ${hfError.message}. Try again later or add credits at pollinations.ai.`);
      }
    }
    console.error(`[NeuralForge] Real video generation failed:`, error.message);
    throw error;
  }
}

// ─── Free AI Video Generation (HuggingFace, no API key) ────────────────────
export async function generateFreeVideo(
  prompt: string,
  style: string = 'Cinematic',
  width: number = 1344,
  height: number = 768,
  negativePrompt: string = '',
): Promise<{
  videoBase64: string;
  isReal: boolean;
  provider: string;
  modelUsed: string;
  duration: number;
  width: number;
  height: number;
  mime: string;
}> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);

  const result = await fetchVideoFromHuggingFace(enhancedPrompt, 300000);
  return {
    videoBase64: result.videoBase64,
    isReal: true,
    provider: 'huggingface-video',
    modelUsed: 'CogVideoX',
    duration: 3,
    width,
    height,
    mime: result.mime,
  };
}

// ─── Motion Video Generation (Free, No API Key) ────────────────────────────
// Generates a high-quality image for client-side motion encoding
export async function generateMotionVideoSource(
  prompt: string,
  style: string = 'Cinematic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'flux',
  negativePrompt: string = '',
): Promise<{
  imageBase64: string;
  isReal: boolean;
  provider: string;
  modelUsed: string;
  width: number;
  height: number;
  mode: 'motion';
}> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);
  const seed = seed_base(prompt);

  const url = buildPollinationsUrl(enhancedPrompt, modelId, width, height, seed);

  try {
    const imageBase64 = await fetchImageAsBase64(url, 60000);
    return {
      imageBase64,
      isReal: true,
      provider: 'pollinations-motion',
      modelUsed: modelId,
      width,
      height,
      mode: 'motion',
    };
  } catch (fetchErr: any) {
    console.log(`[NeuralForge] Image fetch failed for ${modelId}: ${fetchErr.message}. Trying flux fallback...`);
    try {
      const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed);
      const imageBase64 = await fetchImageAsBase64(fallbackUrl, 30000);
      return {
        imageBase64,
        isReal: true,
        provider: 'pollinations-motion',
        modelUsed: 'flux',
        width,
        height,
        mode: 'motion',
      };
    } catch {
      throw new Error('Failed to generate source image for motion video');
    }
  }
}

// ─── Deterministic seed from prompt string ─────────────────────────────────
function seed_base(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
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
    'Cinematic': ['#1e1b4b', '#7c3aed'],
    'Social Media': ['#ec4899', '#8b5cf6'],
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
