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
}

export interface VideoSettings {
  prompt: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  imageToVideo: boolean;
  sourceImage: string | null;
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
  progress: number; // download progress 0-100
  huggingFaceId: string;
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

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'sd-turbo',
    name: 'SD Turbo',
    type: 'image',
    size: '4.2 GB',
    sizeBytes: 4_200_000_000,
    description: 'Fast image generation with decent quality. Great for rapid prototyping.',
    downloaded: false,
    active: false,
    progress: 0,
    huggingFaceId: 'stabilityai/sd-turbo',
  },
  {
    id: 'sdxl-base',
    name: 'Stable Diffusion XL',
    type: 'image',
    size: '6.5 GB',
    sizeBytes: 6_500_000_000,
    description: 'High quality image generation. Slower but produces stunning results.',
    downloaded: false,
    active: false,
    progress: 0,
    huggingFaceId: 'stabilityai/stable-diffusion-xl-base-1.0',
  },
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    type: 'video',
    size: '3.8 GB',
    sizeBytes: 3_800_000_000,
    description: 'Short video clip generation from text prompts. Creates 2-5 second clips.',
    downloaded: false,
    active: false,
    progress: 0,
    huggingFaceId: 'guoyww/AnimateDiff',
  },
  {
    id: 'svd-xt',
    name: 'SVD XT',
    type: 'video',
    size: '4.1 GB',
    sizeBytes: 4_100_000_000,
    description: 'Stable Video Diffusion — image-to-video generation with smooth motion.',
    downloaded: false,
    active: false,
    progress: 0,
    huggingFaceId: 'stabilityai/stable-video-diffusion-img2vid-xt',
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
