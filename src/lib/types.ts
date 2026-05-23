// ─── NeuralForge Types ────────────────────────────────────────────────────────

export type AppTab = 'image' | 'video' | 'gallery' | 'models' | 'safety' | 'settings';

export interface ImageSettings {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  style: string;
  seed: number | null;
  modelId: string;
}

export interface VideoSettings {
  prompt: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  imageToVideo: boolean;
  sourceImage: string | null;
  modelId: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  negativePrompt?: string;
  settings: Record<string, unknown>;
  url: string;
  thumbnailUrl: string;
  timestamp: number;
  isNsfw: boolean;
  modelUsed?: string;
  provider?: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  sizeBytes: number;
  description: string;
  downloaded: boolean;
  active: boolean;
  progress: number;
  huggingFaceId: string;
  provider?: string;
  free?: boolean;
  noApiKey?: boolean;
}

export interface SafetySettings {
  contentFilterEnabled: boolean;
  nsfwDetectionEnabled: boolean;
  blockedPrompts: string[];
  safetyLog: SafetyLogEntry[];
}

export interface SafetyLogEntry {
  id: string;
  prompt: string;
  reason: string;
  timestamp: number;
  action: 'blocked' | 'warning';
}

export interface AppSettings {
  backendUrl: string;
  theme: 'dark' | 'light';
  defaultSteps: number;
  defaultCfgScale: number;
  defaultResolution: string;
  storagePath: string;
}

export interface ConnectionStatus {
  online: boolean;
  backendConnected: boolean;
  backendVersion: string;
  gpuAvailable: boolean;
  gpuName: string;
  modelsLoaded: string[];
  providers?: string[];
}

export interface GenerationProgress {
  isGenerating: boolean;
  type: 'image' | 'video';
  currentStep: number;
  totalSteps: number;
  currentFrame: number;
  totalFrames: number;
  message: string;
}

export const STYLE_OPTIONS = [
  'Photorealistic',
  'Anime',
  'Digital Art',
  'Oil Painting',
  'Watercolor',
  'Sketch',
  'Cyberpunk',
  'Fantasy',
  '3D Render',
  'Pixel Art',
  'Minimalist',
  'Surreal',
] as const;

export const RESOLUTION_OPTIONS = [
  { label: '512 × 512', width: 512, height: 512 },
  { label: '768 × 768', width: 768, height: 768 },
  { label: '1024 × 1024', width: 1024, height: 1024 },
  { label: '768 × 1344 (Portrait)', width: 768, height: 1344 },
  { label: '1344 × 768 (Landscape)', width: 1344, height: 768 },
] as const;

export const DURATION_OPTIONS = [2, 5, 10, 15, 30] as const;
export const FPS_OPTIONS = [8, 12, 24, 30] as const;

export const IMAGE_MODEL_OPTIONS = [
  // ─── Popular / Core Models ─────────────────────────────────
  { id: 'flux', name: 'Flux', description: 'Best all-rounder for any style', speed: 'Fast', badge: 'Popular' },
  { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic portraits & scenes', speed: 'Medium', badge: 'HD' },
  { id: 'flux-anime', name: 'Flux Anime', description: 'Anime, manga & illustration', speed: 'Fast', badge: 'Anime' },
  { id: 'flux-3d', name: 'Flux 3D', description: '3D render with realistic lighting', speed: 'Medium', badge: '3D' },
  { id: 'flux-cablyai', name: 'Flux CablyAI', description: 'Enhanced creative & artistic', speed: 'Fast', badge: 'Creative' },
  { id: 'flux-pro', name: 'Flux Pro', description: 'Premium quality, best detail', speed: 'Slow', badge: 'Pro' },
  { id: 'turbo', name: 'Turbo', description: 'Ultra-fast generation', speed: 'Very Fast', badge: 'Speed' },
  { id: 'any-dark', name: 'AnyDark', description: 'Gothic, noir & dark aesthetics', speed: 'Fast', badge: 'Dark' },
  // ─── NanoBanana Models ─────────────────────────────────────
  { id: 'nanobanana-2', name: 'NanoBanana 2', description: 'Fast & fun creative AI', speed: 'Fast', badge: 'Fun' },
  { id: 'nanobanana-pro', name: 'NanoBanana Pro', description: 'Premium NanoBanana detail', speed: 'Medium', badge: 'Pro' },
  // ─── GPT Models ────────────────────────────────────────────
  { id: 'gptimage', name: 'GPT Image', description: 'Strong prompt understanding', speed: 'Medium', badge: 'Smart' },
  { id: 'gptimage-large', name: 'GPT Image Large', description: 'Maximum detail & resolution', speed: 'Slow', badge: 'HD' },
  { id: 'gpt-image-2', name: 'GPT Image 2', description: 'Next-gen with text rendering', speed: 'Medium', badge: 'Smart' },
  // ─── Other Models ──────────────────────────────────────────
  { id: 'seedream5', name: 'SeeDream 5', description: 'Vibrant colors & composition', speed: 'Medium', badge: 'Creative' },
  { id: 'zimage', name: 'ZImage', description: 'Balanced quality & speed', speed: 'Fast', badge: 'Speed' },
  { id: 'qwen-image', name: 'Qwen Image', description: 'Multilingual prompt support', speed: 'Medium', badge: 'Smart' },
  { id: 'grok-imagine', name: 'Grok Imagine', description: 'Witty & creative outputs', speed: 'Fast', badge: 'Creative' },
  { id: 'grok-imagine-pro', name: 'Grok Imagine Pro', description: 'Enhanced detail & composition', speed: 'Slow', badge: 'Pro' },
  { id: 'nova-canvas', name: 'Nova Canvas', description: 'Clean, professional images', speed: 'Medium', badge: 'Pro' },
  { id: 'klein', name: 'Klein', description: 'Unique artistic interpretation', speed: 'Fast', badge: 'Creative' },
  { id: 'p-image', name: 'P-Image', description: 'Pollinations native creative', speed: 'Fast', badge: 'Popular' },
  { id: 'wan-image', name: 'Wan Image', description: 'Cinematic frames & video-ready', speed: 'Medium', badge: 'Video' },
  { id: 'wan-image-pro', name: 'Wan Image Pro', description: 'Premium cinematic quality', speed: 'Slow', badge: 'HD' },
  { id: 'ltx-2', name: 'LTX Video 2', description: 'Lightricks cinematic keyframes', speed: 'Medium', badge: 'Video' },
  { id: 'seedance-2.0', name: 'SeeDance 2.0', description: 'Motion-optimized cinematic', speed: 'Medium', badge: 'Video' },
  { id: 'seedance-pro', name: 'SeeDance Pro', description: 'Premium motion-style frames', speed: 'Slow', badge: 'Pro' },
] as const;

export const VIDEO_MODEL_OPTIONS = [
  { id: 'wan', name: 'Wan Video', description: 'Cinematic keyframes from text', speed: 'Medium', badge: 'Popular' },
  { id: 'wan-fast', name: 'Wan Fast', description: 'Quick video keyframe preview', speed: 'Fast', badge: 'Speed' },
  { id: 'flux', name: 'Flux Video', description: 'High-quality video keyframes', speed: 'Fast', badge: 'HD' },
  { id: 'gptimage', name: 'GPT Video', description: 'Detailed video keyframes', speed: 'Medium', badge: 'Smart' },
  { id: 'seedance-2.0', name: 'SeeDance 2.0', description: 'Motion-rich cinematic frames', speed: 'Medium', badge: 'Video' },
  { id: 'seedance-pro', name: 'SeeDance Pro', description: 'Premium cinematic keyframes', speed: 'Slow', badge: 'Pro' },
  { id: 'ltx-2', name: 'LTX Video 2', description: 'Lightricks cinematic generation', speed: 'Medium', badge: 'Creative' },
  { id: 'veo', name: 'Veo Video', description: 'Google Veo-style cinematic', speed: 'Slow', badge: 'Pro' },
  { id: 'grok-video-pro', name: 'Grok Video Pro', description: 'Creative & dynamic keyframes', speed: 'Slow', badge: 'Creative' },
  { id: 'p-video', name: 'P-Video', description: 'Pollinations native video', speed: 'Fast', badge: 'Popular' },
  { id: 'nova-reel', name: 'Nova Reel', description: 'Professional cinematic frames', speed: 'Medium', badge: 'Pro' },
] as const;

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'flux',
    name: 'Flux',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'High-quality general purpose model with excellent photorealism and artistic styles.',
    downloaded: true,
    active: true,
    progress: 100,
    huggingFaceId: 'black-forest-labs/flux-schnell',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-realism',
    name: 'Flux Realism',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Photorealistic image generation with stunning detail and lifelike textures.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'black-forest-labs/flux-realism',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-anime',
    name: 'Flux Anime',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Anime and manga style generation with vibrant colors and cel-shading.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'black-forest-labs/flux-anime',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-3d',
    name: 'Flux 3D',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: '3D render style generation with realistic lighting and materials.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'flux-3d',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nanobanana-2',
    name: 'NanoBanana 2',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Fast and creative AI model with unique artistic style.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'nanobanana-2',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'nanobanana-pro',
    name: 'NanoBanana Pro',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Premium NanoBanana model with enhanced detail and quality.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'nanobanana-pro',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gptimage',
    name: 'GPT Image',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'OpenAI GPT-based image generation with strong prompt understanding.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'gptimage',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'gptimage-large',
    name: 'GPT Image Large',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Large GPT image model with maximum detail and resolution.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'gptimage-large',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedream5',
    name: 'SeeDream 5',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Alibaba SeeDream model with vibrant colors and creative composition.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'seedream5',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'xAI Grok image generation with witty and creative outputs.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'grok-imagine',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'wan',
    name: 'Wan Video',
    type: 'video',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Generate cinematic video keyframes from text using Wan model.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'wan',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'seedance-2.0',
    name: 'SeeDance 2.0',
    type: 'video',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Alibaba SeeDance for motion-rich cinematic keyframes.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'seedance-2.0',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'ltx-2',
    name: 'LTX Video 2',
    type: 'video',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Lightricks video model for cinematic keyframe generation.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'ltx-2',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'veo',
    name: 'Veo Video',
    type: 'video',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Google Veo-style model for cinematic video keyframes.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'veo',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'p-video',
    name: 'P-Video',
    type: 'video',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Pollinations native video model for dynamic keyframes.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'p-video',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
];

export const DEFAULT_BLOCKED_PROMPTS = [
  'violence',
  'gore',
  'explicit',
  'nsfw',
  'nude',
  'sexual',
  'hate',
  'racist',
  'illegal',
  'child abuse',
  'self harm',
  'terrorism',
  'weapon',
  'drug',
] as const;
