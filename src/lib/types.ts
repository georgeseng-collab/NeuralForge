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
  socialPreset: string;
  negativePrompt: string;
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
  videoUrl?: string;
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
  'Cinematic',
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
  'Social Media',
] as const;

export const RESOLUTION_OPTIONS = [
  { label: '1024 × 1024 (Square)', width: 1024, height: 1024 },
  { label: '768 × 1344 (Portrait 9:16)', width: 768, height: 1344 },
  { label: '1344 × 768 (Landscape 16:9)', width: 1344, height: 768 },
  { label: '864 × 1152 (Portrait 3:4)', width: 864, height: 1152 },
  { label: '1152 × 864 (Landscape 4:3)', width: 1152, height: 864 },
] as const;

export const DURATION_OPTIONS = [2, 3, 5, 8, 10] as const;
export const FPS_OPTIONS = [2, 3, 4, 6, 8, 12] as const;

// ─── Social Media Video Presets ────────────────────────────────────────────
export const VIDEO_PRESET_OPTIONS = [
  { id: 'instagram-reel', name: 'Instagram Reel', icon: '📱', width: 768, height: 1344, aspect: '9:16', desc: 'Vertical for Reels' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', width: 768, height: 1344, aspect: '9:16', desc: 'Vertical 9:16' },
  { id: 'youtube-shorts', name: 'YouTube Shorts', icon: '🎬', width: 768, height: 1344, aspect: '9:16', desc: 'Vertical for Shorts' },
  { id: 'youtube-video', name: 'YouTube Video', icon: '▶️', width: 1344, height: 768, aspect: '16:9', desc: 'Landscape 16:9' },
  { id: 'instagram-post', name: 'Instagram Post', icon: '📸', width: 1024, height: 1024, aspect: '1:1', desc: 'Square 1:1' },
  { id: 'instagram-story', name: 'Instagram Story', icon: '📱', width: 768, height: 1344, aspect: '9:16', desc: 'Vertical for Stories' },
  { id: 'facebook-reel', name: 'Facebook Reel', icon: '📘', width: 768, height: 1344, aspect: '9:16', desc: 'Vertical for Reels' },
  { id: 'twitter-video', name: 'X/Twitter Video', icon: '🐦', width: 1344, height: 768, aspect: '16:9', desc: 'Landscape 16:9' },
  { id: 'custom', name: 'Custom', icon: '⚙️', width: 1344, height: 768, aspect: 'Custom', desc: 'Custom dimensions' },
] as const;

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
] as const;

export const VIDEO_MODEL_OPTIONS = [
  { id: 'flux', name: 'Flux Video', description: 'High-quality video frames, best detail', speed: 'Fast', badge: 'Popular' },
  { id: 'flux-realism', name: 'Flux Realism Video', description: 'Photorealistic cinematic frames', speed: 'Medium', badge: 'HD' },
  { id: 'flux-anime', name: 'Flux Anime Video', description: 'Anime-style animated video', speed: 'Fast', badge: 'Anime' },
  { id: 'gptimage', name: 'GPT Video', description: 'Detailed video keyframes', speed: 'Medium', badge: 'Smart' },
  { id: 'seedream5', name: 'SeeDream Video', description: 'Vibrant cinematic frames', speed: 'Medium', badge: 'Creative' },
  { id: 'grok-imagine', name: 'Grok Video', description: 'Creative & dynamic frames', speed: 'Fast', badge: 'Creative' },
  { id: 'nanobanana-2', name: 'NanoBanana Video', description: 'Fast & fun video generation', speed: 'Fast', badge: 'Fun' },
  { id: 'nova-canvas', name: 'Nova Canvas Video', description: 'Professional cinematic video', speed: 'Medium', badge: 'Pro' },
  { id: 'turbo', name: 'Turbo Video', description: 'Ultra-fast video frame preview', speed: 'Very Fast', badge: 'Speed' },
] as const;

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'flux',
    name: 'Flux',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'High-quality general purpose model.',
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
    description: 'Photorealistic image generation.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'black-forest-labs/flux-realism',
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
    description: 'Fast creative AI model.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'nanobanana-2',
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
    description: 'Strong prompt understanding.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'gptimage',
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
    description: 'Anime and manga style.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'flux-anime',
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
