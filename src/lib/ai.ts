// ─── NeuralForge AI Engine ─────────────────────────────────────────────────
// Uses free public AI APIs that work from Vercel serverless functions
// Image: Pollinations.ai (free, no API key)
// Video: free browser-encoded motion from Pollinations.ai source images

// ─── Supported Free AI Models ──────────────────────────────────────────────
export interface FreeAIModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'fal';
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
  { id: 'flux', name: 'Flux', provider: 'pollinations', type: 'image', description: 'Stable general-purpose image model', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', type: 'image', description: 'Strong prompt understanding', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', type: 'image', description: 'Maximum detail & resolution', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'gpt-image-2', name: 'GPT Image 2', provider: 'pollinations', type: 'image', description: 'Next-gen with text rendering', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'seedream5', name: 'SeeDream 5', provider: 'pollinations', type: 'image', description: 'Vibrant colors & composition', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'seedream-pro', name: 'SeeDream Pro', provider: 'pollinations', type: 'image', description: 'High-detail creative images', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'zimage', name: 'ZImage', provider: 'pollinations', type: 'image', description: 'Balanced quality & speed', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'qwen-image', name: 'Qwen Image', provider: 'pollinations', type: 'image', description: 'Multilingual prompt support', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'wan-image', name: 'Wan Image', provider: 'pollinations', type: 'image', description: 'Image model suited for video source frames', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'wan-image-pro', name: 'Wan Image Pro', provider: 'pollinations', type: 'image', description: 'Higher-detail video source frames', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'nova-canvas', name: 'Nova Canvas', provider: 'pollinations', type: 'image', description: 'Clean, professional images', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'kontext', name: 'Kontext', provider: 'pollinations', type: 'image', description: 'Context-aware composition', maxResolution: '1024x1024', speed: 'medium', quality: 'high', free: true, noApiKey: true },
  { id: 'nanobanana', name: 'NanoBanana', provider: 'pollinations', type: 'image', description: 'Fast & fun creative AI', maxResolution: '1024x1024', speed: 'fast', quality: 'standard', free: true, noApiKey: true },
  { id: 'nanobanana-2', name: 'NanoBanana 2', provider: 'pollinations', type: 'image', description: 'Fast & fun creative AI', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'nanobanana-pro', name: 'NanoBanana Pro', provider: 'pollinations', type: 'image', description: 'Premium NanoBanana detail', maxResolution: '1024x1024', speed: 'medium', quality: 'ultra', free: true, noApiKey: true },
  { id: 'grok-imagine', name: 'Grok Imagine', provider: 'pollinations', type: 'image', description: 'Witty & creative outputs', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'grok-imagine-pro', name: 'Grok Imagine Pro', provider: 'pollinations', type: 'image', description: 'Enhanced detail & composition', maxResolution: '1024x1024', speed: 'slow', quality: 'ultra', free: true, noApiKey: true },
  { id: 'klein', name: 'Klein', provider: 'pollinations', type: 'image', description: 'Unique artistic interpretation', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
  { id: 'p-image', name: 'P-Image', provider: 'pollinations', type: 'image', description: 'Pollinations native creative', maxResolution: '1024x1024', speed: 'fast', quality: 'high', free: true, noApiKey: true },
];

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
  negativePrompt: string = '',
  nologo: boolean = true,
): string {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams();
  params.set('width', String(width));
  params.set('height', String(height));
  params.set('model', model);
  params.set('enhance', 'true');
  params.set('quality', 'high');
  params.set('private', 'true');
  params.set('safe', 'true');
  if (negativePrompt.trim()) {
    params.set('negativePrompt', negativePrompt.trim());
    params.set('negative_prompt', negativePrompt.trim());
  }
  if (nologo) params.set('nologo', 'true');
  if (seed !== undefined && seed !== null) params.set('seed', String(seed));
  params.set('t', String(Date.now()));
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

function resolveImageModel(modelId: string, style: string): string {
  if (FREE_AI_MODELS.some(model => model.id === modelId)) return modelId;

  const styleDefaults: Record<string, string> = {
    Photorealistic: 'gptimage',
    Cinematic: 'gptimage',
    Anime: 'qwen-image',
    'Digital Art': 'seedream5',
    'Oil Painting': 'seedream5',
    Watercolor: 'seedream5',
    Sketch: 'flux',
    Cyberpunk: 'gptimage',
    Fantasy: 'seedream5',
    '3D Render': 'wan-image',
    'Pixel Art': 'flux',
    Minimalist: 'nova-canvas',
    Surreal: 'seedream5',
    'Social Media': 'nova-canvas',
  };

  return styleDefaults[style] || 'flux';
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

// ─── Enhanced Prompt Builder ────────────────────────────────────────────────
function buildEnhancedPrompt(
  prompt: string,
  style: string = 'Photorealistic',
  negativePrompt: string = '',
  isVideo: boolean = false,
): string {
  const cleanPrompt = prompt.trim().replace(/\s+/g, ' ');
  const stylePrefix = STYLE_MAP[style] || STYLE_MAP['Photorealistic'];

  let enhanced = `${cleanPrompt}, ${stylePrefix}`;

  if (isVideo) {
    enhanced += ', cinematic motion, smooth camera movement, dynamic scene, fluid animation, realistic motion, natural movement, coherent subject throughout the shot';
  }

  // Add positive guidance
  enhanced += ', faithful to the prompt, clear main subject, well-composed, sharp, high quality, detailed';

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
        const resolvedModelId = resolveImageModel(modelId, style);
        const negative = negativePrompt ? `${DEFAULT_NEGATIVES}, ${negativePrompt}` : DEFAULT_NEGATIVES;
        const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, resolvedModelId, width, height, seed || undefined, negative);

        try {
          const base64Image = await fetchImageAsBase64(pollinationsUrl, 55000);
          return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: resolvedModelId };
        } catch (fetchErr: any) {
          console.log(`[NeuralForge] Base64 fetch failed for ${resolvedModelId}: ${fetchErr.message}. Trying flux fallback...`);

          try {
            const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed || undefined, negative);
            const base64Image = await fetchImageAsBase64(fallbackUrl, 30000);
            return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: 'flux' };
          } catch {
            console.log('[NeuralForge] Returning direct URL for browser-side loading');
            return { imageUrl: pollinationsUrl, isReal: true, provider: 'pollinations', modelUsed: resolvedModelId };
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
  // Reduce canvas size for motion video to avoid browser memory issues
  // Max 1024 on the longest side for reliable encoding
  const maxDim = 1024;
  let w = width;
  let h = height;
  if (Math.max(w, h) > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  // Ensure even dimensions for video encoding
  w = w % 2 === 0 ? w : w + 1;
  h = h % 2 === 0 ? h : h + 1;

  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);
  const seed = seed_base(prompt);
  const resolvedModelId = resolveImageModel(modelId, style);
  const negative = negativePrompt ? `${DEFAULT_NEGATIVES}, ${negativePrompt}` : DEFAULT_NEGATIVES;

  const url = buildPollinationsUrl(enhancedPrompt, resolvedModelId, w, h, seed, negative);

  try {
    const imageBase64 = await fetchImageAsBase64(url, 60000);
    return {
      imageBase64,
      isReal: true,
      provider: 'pollinations-motion',
      modelUsed: resolvedModelId,
      width: w,
      height: h,
      mode: 'motion',
    };
  } catch (fetchErr: any) {
    console.log(`[NeuralForge] Image fetch failed for ${resolvedModelId}: ${fetchErr.message}. Trying flux fallback...`);
    try {
      const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', w, h, seed, negative);
      const imageBase64 = await fetchImageAsBase64(fallbackUrl, 30000);
      return {
        imageBase64,
        isReal: true,
        provider: 'pollinations-motion',
        modelUsed: 'flux',
        width: w,
        height: h,
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
