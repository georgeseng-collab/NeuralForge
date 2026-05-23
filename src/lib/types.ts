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
  { id: 'flux', name: 'Flux', description: 'High-quality general purpose', speed: 'Fast', badge: 'Popular' },
  { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic with stunning detail', speed: 'Medium', badge: 'HD' },
  { id: 'flux-anime', name: 'Flux Anime', description: 'Anime & manga style', speed: 'Fast', badge: 'Anime' },
  { id: 'flux-3d', name: 'Flux 3D', description: '3D render style with realistic lighting', speed: 'Medium', badge: '3D' },
  { id: 'flux-cablyai', name: 'Flux CablyAI', description: 'Enhanced creative & artistic', speed: 'Fast', badge: 'Creative' },
  { id: 'flux-pro', name: 'Flux Pro', description: 'Premium quality, best detail', speed: 'Slow', badge: 'Pro' },
  { id: 'turbo', name: 'Turbo', description: 'Ultra-fast generation', speed: 'Very Fast', badge: 'Speed' },
  { id: 'any-dark', name: 'AnyDark', description: 'Dark & moody aesthetic', speed: 'Fast', badge: 'Dark' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', description: 'Open-source, diverse styles', speed: 'Medium', badge: 'Open Source' },
  { id: 'playground-v2', name: 'Playground v2.5', description: 'Vibrant creative outputs', speed: 'Medium', badge: 'Creative' },
] as const;

export const VIDEO_MODEL_OPTIONS = [
  { id: 'flux-video', name: 'Flux Video', description: 'AI video from text prompts', speed: 'Slow', badge: 'Video' },
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
    id: 'flux-cablyai',
    name: 'Flux CablyAI',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Enhanced creative model for artistic and stylized outputs.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'cablyai/flux',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'flux-pro',
    name: 'Flux Pro',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Premium quality generation with the best detail and composition.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'black-forest-labs/flux-pro',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'turbo',
    name: 'Turbo',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Ultra-fast generation with decent quality. Perfect for rapid prototyping.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'stabilityai/sd-turbo',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'any-dark',
    name: 'AnyDark',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Dark and moody aesthetic generation. Great for gothic, noir, and shadowy scenes.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'any-dark',
    provider: 'pollinations',
    free: true,
    noApiKey: true,
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Open-source high quality model. Great for diverse styles and subjects.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'stabilityai/stable-diffusion-xl-base-1.0',
    provider: 'huggingface',
    free: true,
    noApiKey: true,
  },
  {
    id: 'playground-v2',
    name: 'Playground v2.5',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Playground AI model with vibrant, creative outputs and strong composition.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'playgroundai/playground-v2.5-1024px-aesthetic',
    provider: 'huggingface',
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
