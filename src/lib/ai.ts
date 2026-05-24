// ─── NeuralForge AI Engine ─────────────────────────────────────────────────
// Uses free public AI APIs that work from Vercel serverless functions
// Image: Pollinations.ai (free, no API key)
// Video: Pollinations.ai (API key + credits) OR Fal.ai (free credits) OR Motion fallback

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

// ─── Video Model Definitions ─────────────────────────────────────────────
export interface VideoModelDef {
  id: string;
  name: string;
  provider: 'pollinations' | 'fal';
  description: string;
  speed: string;
  badge: string;
  needsApiKey: boolean;
  free: boolean;
  maxDuration: number;
  qualities: string[];
  falModelId?: string;  // For fal.ai models
}

export const VIDEO_MODELS: VideoModelDef[] = [
  // ─── Pollinations Video Models ─────────────────────────────
  { id: 'ltx-2', name: 'LTX Video 2.3', provider: 'pollinations', description: 'Fast AI video, cheapest credits', speed: 'Fast', badge: 'Credit', needsApiKey: true, free: false, maxDuration: 5, qualities: ['480p'] },
  { id: 'nova-reel', name: 'Nova Reel', provider: 'pollinations', description: '6-120s professional video, 720p', speed: 'Medium', badge: 'HD', needsApiKey: true, free: false, maxDuration: 30, qualities: ['720p'] },
  { id: 'wan-fast', name: 'Wan Fast', provider: 'pollinations', description: 'Quick 5s video generation', speed: 'Fast', badge: 'Speed', needsApiKey: true, free: false, maxDuration: 5, qualities: ['480p'] },
  { id: 'wan', name: 'Wan 2.6', provider: 'pollinations', description: 'High quality with audio, up to 1080p', speed: 'Medium', badge: 'HD', needsApiKey: true, free: false, maxDuration: 15, qualities: ['480p', '720p', '1080p'] },
  { id: 'seedance-pro', name: 'Seedance Pro', provider: 'pollinations', description: 'Better prompt adherence, 720p', speed: 'Medium', badge: 'Pro', needsApiKey: true, free: false, maxDuration: 10, qualities: ['720p'] },
  { id: 'seedance-2.0', name: 'Seedance 2.0', provider: 'pollinations', description: 'ByteDance multimodal video', speed: 'Slow', badge: 'Ultra', needsApiKey: true, free: false, maxDuration: 15, qualities: ['720p'] },
  { id: 'veo', name: 'Veo 3.1', provider: 'pollinations', description: 'Google Veo with audio output', speed: 'Slow', badge: 'Ultra', needsApiKey: true, free: false, maxDuration: 8, qualities: ['720p', '1080p'] },
  { id: 'grok-video-pro', name: 'Grok Video Pro', provider: 'pollinations', description: 'xAI creative video, 1-15s', speed: 'Medium', badge: 'Creative', needsApiKey: true, free: false, maxDuration: 15, qualities: ['720p'] },
  { id: 'p-video', name: 'Pruna Video', provider: 'pollinations', description: 'Up to 1080p quality', speed: 'Medium', badge: 'HD', needsApiKey: true, free: false, maxDuration: 10, qualities: ['720p', '1080p'] },
  // ─── Fal.ai Video Models (free $10-20 credits) ────────────────
  { id: 'fal-wan', name: 'Wan 2.1 (Fal)', provider: 'fal', description: 'FREE credits! Text-to-video on Fal.ai', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['480p', '720p'], falModelId: 'fal-ai/wan/v2.1/text-to-video' },
  { id: 'fal-hailuo', name: 'Hailuo 02 (Fal)', provider: 'fal', description: 'FREE credits! MiniMax Hailuo AI video', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 6, qualities: ['720p'], falModelId: 'fal-ai/minimax/hailuo-02' },
  { id: 'fal-kling', name: 'Kling v1 (Fal)', provider: 'fal', description: 'FREE credits! Kling video generation', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['720p'], falModelId: 'fal-ai/kling-video/v1/standard/text-to-video' },
  { id: 'fal-luma', name: 'Luma Dream (Fal)', provider: 'fal', description: 'FREE credits! Luma Dream Machine', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['720p'], falModelId: 'fal-ai/luma-dream-machine' },
  // ─── Replicate Video Models (free credits for new users) ─────
  { id: 'replicate-luma', name: 'Luma Dream (Replicate)', provider: 'replicate', description: 'FREE credits! Luma Dream Machine on Replicate', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['720p'] },
  { id: 'replicate-wan', name: 'Wan 2.1 (Replicate)', provider: 'replicate', description: 'FREE credits! Wan text-to-video on Replicate', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['720p'] },
  { id: 'replicate-kling', name: 'Kling v1 (Replicate)', provider: 'replicate', description: 'FREE credits! Kling video on Replicate', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 5, qualities: ['720p'] },
  { id: 'replicate-hailuo', name: 'Hailuo (Replicate)', provider: 'replicate', description: 'FREE credits! MiniMax Hailuo on Replicate', speed: 'Medium', badge: 'Free', needsApiKey: true, free: true, maxDuration: 6, qualities: ['720p'] },
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

// ─── Replicate Video Generation (free credits for new users) ────────────────
async function generateVideoWithReplicate(
  prompt: string,
  replicateApiKey: string,
  model: string = 'luma-dream-machine',
  timeout = 300000,
): Promise<{ videoBase64: string; mime: string; videoUrl: string }> {
  console.log(`[NeuralForge] Submitting video job to Replicate model: ${model}`);

  // Model mapping for Replicate
  const REPLICATE_MODELS: Record<string, { version: string; owner: string; name: string }> = {
    'luma-dream-machine': { version: '', owner: 'luma', name: 'dream-machine' },
    'wan-v2.1': { version: '', owner: 'wan-ai', name: 'wan2.1-t2v-14b' },
    'minimax-hailuo': { version: '', owner: 'minimax', name: 'video-01' },
    'kling-v1': { version: '', owner: 'kwai-vgi', name: 'kling-v1.0-pro' },
  };

  const modelInfo = REPLICATE_MODELS[model] || REPLICATE_MODELS['luma-dream-machine'];

  // Step 1: Create prediction
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${replicateApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `${modelInfo.owner}/${modelInfo.name}`,
      input: { prompt },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    let errorMsg = `Replicate returned ${createRes.status}`;
    try { const errData = JSON.parse(errText); errorMsg = errData.detail || errData.error || errorMsg; } catch {}
    if (createRes.status === 401) errorMsg = 'REPLICATE_INVALID_KEY: Invalid Replicate API key. Get a free key at replicate.com';
    if (createRes.status === 402) errorMsg = 'REPLICATE_INSUFFICIENT_CREDITS: Your Replicate credits are exhausted. Visit replicate.com to check balance';
    throw new Error(errorMsg);
  }

  const prediction = await createRes.json() as { id: string; status: string; urls: { get: string } };
  console.log(`[NeuralForge] Replicate prediction created: ${prediction.id}`);

  // Step 2: Poll for result
  const pollStart = Date.now();
  while (Date.now() - pollStart < timeout) {
    await new Promise(r => setTimeout(r, 5000));

    const statusRes = await fetch(prediction.urls.get, {
      headers: { 'Authorization': `Bearer ${replicateApiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!statusRes.ok) continue;
    const status = await statusRes.json() as { status: string; output?: string | string[]; error?: string };

    if (status.status === 'succeeded') {
      const videoUrl = Array.isArray(status.output) ? status.output[0] : status.output || '';
      if (!videoUrl) throw new Error('Replicate completed but no video URL in response');

      console.log(`[NeuralForge] Replicate video URL: ${videoUrl}`);
      const videoRes = await fetch(videoUrl, { signal: AbortSignal.timeout(120000) });
      if (!videoRes.ok) throw new Error(`Failed to download Replicate video: ${videoRes.status}`);

      const arrayBuffer = await videoRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mime = 'video/mp4';
      console.log(`[NeuralForge] Replicate video downloaded: ${arrayBuffer.byteLength} bytes`);
      return { videoBase64: base64, mime, videoUrl };
    }

    if (status.status === 'failed') {
      throw new Error(`Replicate generation failed: ${status.error || 'Unknown error'}`);
    }

    console.log(`[NeuralForge] Replicate prediction ${prediction.id} status: ${status.status}...`);
  }

  throw new Error('Replicate video generation timed out.');
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
async function fetchVideoFromPollinations(
  url: string,
  apiKey: string,
  timeout = 300000,
): Promise<{ videoBase64: string; mime: string }> {
  console.log(`[NeuralForge] Fetching video from Pollinations: ${url}`);

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
      throw new Error('INSUFFICIENT_CREDITS: Your Pollinations account needs more credits for video generation. Visit enter.pollinations.ai to add credits, or try Fal.ai / Replicate mode instead (free credits available).');
    }
    throw new Error(errorMsg);
  }

  // Verify we actually got a video, not an image
  const contentType = response.headers.get('content-type') || '';
  const modelUsed = response.headers.get('x-model-used') || '';
  
  if (contentType.includes('image/') || modelUsed.includes('image') || 
      (!contentType.includes('video/') && !contentType.includes('octet-stream') && arrayBufferIsImage(await response.clone().arrayBuffer()))) {
    throw new Error('VIDEO_FALLBACK_IMAGE: The Pollinations API returned an image instead of a video. This happens when your account has insufficient credits for video generation. Solutions: (1) Add credits at enter.pollinations.ai, (2) Use Fal.ai mode (free $10-20 credits at fal.ai), or (3) Use Replicate mode (free credits at replicate.com).');
  }

  const arrayBuffer = await response.arrayBuffer();

  // Validate video file size (should be at least 10KB for a real video)
  if (arrayBuffer.byteLength < 10000) {
    throw new Error('VIDEO_TOO_SMALL: The generated video is too small and likely corrupted. This may be a credits issue. Try Fal.ai or Replicate mode instead.');
  }

  // Check for image file signatures (JPEG starts with 0xFFD8, PNG starts with 0x89504E47)
  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 4));
  const isJpeg = firstBytes[0] === 0xFF && firstBytes[1] === 0xD8;
  const isPng = firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4E && firstBytes[3] === 0x47;
  if (isJpeg || isPng) {
    throw new Error('VIDEO_FALLBACK_IMAGE: The Pollinations API returned an image instead of video. Your credits may be insufficient. Try Fal.ai (free credits) or Replicate mode.');
  }

  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mime = contentType.includes('webm') ? 'video/webm' : 'video/mp4';
  console.log(`[NeuralForge] Pollinations video received: ${arrayBuffer.byteLength} bytes, type: ${mime}`);
  return { videoBase64: base64, mime };
}

// Helper: check if ArrayBuffer starts with image signature
function arrayBufferIsImage(buf: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buf.slice(0, 4));
  return (bytes[0] === 0xFF && bytes[1] === 0xD8) || // JPEG
         (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47); // PNG
}

// ─── Fal.ai Video Generation (free $10-20 credits) ────────────────────────
async function generateVideoWithFal(
  prompt: string,
  falApiKey: string,
  falModelId: string,
  timeout = 300000,
): Promise<{ videoBase64: string; mime: string; videoUrl: string }> {
  console.log(`[NeuralForge] Submitting video job to Fal.ai model: ${falModelId}`);

  // Step 1: Submit the job to Fal.ai queue
  const submitRes = await fetch(`https://queue.fal.run/${falModelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      num_frames: 41,  // ~5 seconds at 8fps
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => '');
    let errorMsg = `Fal.ai returned ${submitRes.status}`;
    try { const errData = JSON.parse(errText); errorMsg = errData.detail || errData.error || errorMsg; } catch {}
    if (submitRes.status === 401) errorMsg = 'FAL_INVALID_KEY: Invalid Fal.ai API key. Get a free key at fal.ai/dashboard';
    if (submitRes.status === 402) errorMsg = 'FAL_INSUFFICIENT_CREDITS: Your Fal.ai credits are exhausted. Visit fal.ai/dashboard to check balance';
    throw new Error(errorMsg);
  }

  const { request_id } = await submitRes.json() as { request_id: string };
  console.log(`[NeuralForge] Fal.ai job submitted: ${request_id}`);

  // Step 2: Poll for the result
  const pollStart = Date.now();
  const pollInterval = 5000; // 5 seconds between polls

  while (Date.now() - pollStart < timeout) {
    await new Promise(r => setTimeout(r, pollInterval));

    const statusRes = await fetch(`https://queue.fal.run/${falModelId}/status/${request_id}`, {
      headers: { 'Authorization': `Key ${falApiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!statusRes.ok) continue;

    const status = await statusRes.json() as { status: string };

    if (status.status === 'COMPLETED') {
      // Step 3: Get the result
      const resultRes = await fetch(`https://queue.fal.run/${falModelId}/requests/${request_id}`, {
        headers: { 'Authorization': `Key ${falApiKey}` },
        signal: AbortSignal.timeout(60000),
      });

      if (!resultRes.ok) {
        throw new Error(`Fal.ai result fetch failed: ${resultRes.status}`);
      }

      const result = await resultRes.json() as {
        video?: { url: string };
        output?: { video?: string };
      };

      // Extract video URL from various response formats
      const videoUrl = result.video?.url || result.output?.video || '';

      if (!videoUrl) {
        throw new Error('Fal.ai completed but no video URL in response. The model may have changed its output format.');
      }

      console.log(`[NeuralForge] Fal.ai video URL: ${videoUrl}`);

      // Step 4: Download the video and convert to base64
      const videoRes = await fetch(videoUrl, {
        signal: AbortSignal.timeout(120000),
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to download video from Fal.ai: ${videoRes.status}`);
      }

      const arrayBuffer = await videoRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = videoRes.headers.get('content-type') || 'video/mp4';
      const mime = contentType.includes('webm') ? 'video/webm' : 'video/mp4';

      console.log(`[NeuralForge] Fal.ai video downloaded: ${arrayBuffer.byteLength} bytes`);
      return { videoBase64: base64, mime, videoUrl };
    }

    if (status.status === 'FAILED') {
      throw new Error('Fal.ai video generation failed. The model may be overloaded. Try again or use a different model.');
    }

    console.log(`[NeuralForge] Fal.ai job ${request_id} status: ${status.status}...`);
  }

  throw new Error('Fal.ai video generation timed out. Try a shorter video or different model.');
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

// ─── Real AI Video Generation via Pollinations ──────────────────────────────
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
  const modelInfo = VIDEO_MODELS.find(m => m.id === modelId);
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
}

// ─── Fal.ai Video Generation ────────────────────────────────────────────────
export async function generateFalVideo(
  prompt: string,
  style: string = 'Cinematic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'fal-wan',
  falApiKey: string,
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
  videoUrl: string;
}> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);

  const modelInfo = VIDEO_MODELS.find(m => m.id === modelId);
  const falModelId = modelInfo?.falModelId || 'fal-ai/wan/v2.1/text-to-video';

  const result = await generateVideoWithFal(enhancedPrompt, falApiKey, falModelId, 300000);
  return {
    videoBase64: result.videoBase64,
    isReal: true,
    provider: 'fal-video',
    modelUsed: modelId,
    duration: 5,
    width,
    height,
    mime: result.mime,
    videoUrl: result.videoUrl,
  };
}

// ─── Replicate Video Generation ─────────────────────────────────────────────
export async function generateReplicateVideo(
  prompt: string,
  style: string = 'Cinematic',
  width: number = 1344,
  height: number = 768,
  modelId: string = 'replicate-luma',
  replicateApiKey: string,
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
  videoUrl: string;
}> {
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, negativePrompt, true);

  // Map modelId to Replicate model name
  const REPLICATE_MODEL_MAP: Record<string, string> = {
    'replicate-luma': 'luma-dream-machine',
    'replicate-wan': 'wan-v2.1',
    'replicate-kling': 'kling-v1',
    'replicate-hailuo': 'minimax-hailuo',
  };

  const replicateModel = REPLICATE_MODEL_MAP[modelId] || 'luma-dream-machine';

  const result = await generateVideoWithReplicate(enhancedPrompt, replicateApiKey, replicateModel, 300000);
  return {
    videoBase64: result.videoBase64,
    isReal: true,
    provider: 'replicate-video',
    modelUsed: modelId,
    duration: 5,
    width,
    height,
    mime: result.mime,
    videoUrl: result.videoUrl,
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

  const url = buildPollinationsUrl(enhancedPrompt, modelId, w, h, seed);

  try {
    const imageBase64 = await fetchImageAsBase64(url, 60000);
    return {
      imageBase64,
      isReal: true,
      provider: 'pollinations-motion',
      modelUsed: modelId,
      width: w,
      height: h,
      mode: 'motion',
    };
  } catch (fetchErr: any) {
    console.log(`[NeuralForge] Image fetch failed for ${modelId}: ${fetchErr.message}. Trying flux fallback...`);
    try {
      const fallbackUrl = buildPollinationsUrl(enhancedPrompt, 'flux', w, h, seed);
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
