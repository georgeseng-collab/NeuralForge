// ─── NeuralForge AI Engine ─────────────────────────────────────────────────
// Uses free public AI APIs that work from Vercel serverless functions
// No API keys required!

// ─── Supported Free AI Models ──────────────────────────────────────────────
export interface FreeAIModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'huggingface' | 'zai';
  type: 'image' | 'video';
  description: string;
  maxResolution: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'ultra';
  free: boolean;
  noApiKey: boolean;
}

export const FREE_AI_MODELS: FreeAIModel[] = [
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
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'huggingface',
    type: 'image',
    description: 'Open-source high quality model. Great for diverse styles and subjects.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'playground-v2',
    name: 'Playground v2.5',
    provider: 'huggingface',
    type: 'image',
    description: 'Playground AI model with vibrant, creative outputs and strong composition.',
    maxResolution: '1024x1024',
    speed: 'medium',
    quality: 'high',
    free: true,
    noApiKey: true,
  },
  {
    id: 'zai-default',
    name: 'ZAI Engine (Local)',
    provider: 'zai',
    type: 'image',
    description: 'Local ZAI AI engine — only available when running on the development server.',
    maxResolution: '1024x1024',
    speed: 'fast',
    quality: 'ultra',
    free: true,
    noApiKey: true,
  },
];

export const FREE_VIDEO_MODELS: FreeAIModel[] = [
  {
    id: 'flux-video',
    name: 'Flux Video',
    provider: 'pollinations',
    type: 'video',
    description: 'Generate short video clips from text prompts using AI.',
    maxResolution: '1344x768',
    speed: 'slow',
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

// ─── ZAI Local API ─────────────────────────────────────────────────────────
const ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1';
const ZAI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai';
const ZAI_TOKEN = process.env.ZAI_TOKEN || '';
const ZAI_CHAT_ID = process.env.ZAI_CHAT_ID || '';
const ZAI_USER_ID = process.env.ZAI_USER_ID || '';

async function generateWithZAI(
  prompt: string,
  size: string,
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZAI_API_KEY}`,
    'X-Z-AI-From': 'Z',
  };
  if (ZAI_TOKEN) headers['X-Token'] = ZAI_TOKEN;
  if (ZAI_CHAT_ID) headers['X-Chat-Id'] = ZAI_CHAT_ID;
  if (ZAI_USER_ID) headers['X-User-Id'] = ZAI_USER_ID;

  const response = await fetch(`${ZAI_BASE_URL}/images/generations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, size }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) throw new Error(`ZAI API returned ${response.status}`);

  const result = await response.json();
  const imageBase64 = result.data?.[0]?.base64;
  if (imageBase64) return `data:image/png;base64,${imageBase64}`;

  const imageUrl = result.data?.[0]?.url;
  if (imageUrl) {
    const imgResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
    if (imgResponse.ok) {
      const arrayBuffer = await imgResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return `data:image/png;base64,${base64}`;
    }
  }

  throw new Error('No image data in ZAI response');
}

// ─── Main Generation Function ──────────────────────────────────────────────
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

        // Strategy: Try to fetch as base64 (works when server has time)
        // If it times out, return the direct URL and let the browser load it
        try {
          const base64Image = await fetchImageAsBase64(pollinationsUrl, 50000);
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
            // The browser has more time to load images than the serverless function
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

      case 'zai': {
        try {
          const base64Image = await generateWithZAI(enhancedPrompt, size);
          return { imageUrl: base64Image, isReal: true, provider: 'zai', modelUsed: modelId };
        } catch {
          const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', width, height, seed || undefined);
          return { imageUrl: fallbackUrl, isReal: true, provider: 'pollinations', modelUsed: 'flux (zai fallback)' };
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

// ─── Video Generation (uses image as keyframe) ────────────────────────────
export async function generateVideoKeyframe(
  prompt: string,
  style: string = 'Photorealistic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'flux',
): Promise<{ imageUrl: string; isReal: boolean; provider: string; modelUsed: string }> {
  const stylePrefix = STYLE_MAP[style] || STYLE_MAP['Photorealistic'];
  const enhancedPrompt = `${prompt}, ${stylePrefix}, cinematic frame, movie still, 16:9 aspect ratio`;

  try {
    const pollinationsUrl = buildPollinationsUrl(enhancedPrompt, modelId, width, height, undefined);

    try {
      const base64Image = await fetchImageAsBase64(pollinationsUrl, 50000);
      return { imageUrl: base64Image, isReal: true, provider: 'pollinations', modelUsed: modelId };
    } catch {
      return { imageUrl: pollinationsUrl, isReal: true, provider: 'pollinations', modelUsed: modelId };
    }
  } catch (error: any) {
    const placeholder = generatePlaceholderImage(prompt, style, width, height);
    return { imageUrl: placeholder, isReal: false, provider: 'placeholder', modelUsed: 'SVG Placeholder' };
  }
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

  try {
    const res = await fetch(`${ZAI_BASE_URL}/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) providers.push('zai');
  } catch {}

  return {
    reachable: providers.length > 0,
    mode: providers.includes('zai') ? 'full' : 'cloud',
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
