// ─── NeuralForge Types ────────────────────────────────────────────────────────

export type AppTab = 'image' | 'video' | 'growth' | 'gallery' | 'models' | 'safety' | 'settings';

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
  realVideoModelId: string;
  socialPreset: string;
  negativePrompt: string;
  generationMode: 'real' | 'motion';
  motionEffect: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'ken-burns' | 'drift';
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

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'
  | 'shopee'
  | 'lazada'
  | 'tiktokShop'
  | 'carousell'
  | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
  connected: boolean;
  oauthStatus: 'manual-link' | 'not-connected' | 'pending-review' | 'connected';
}

export interface BrandProfile {
  businessName: string;
  industry: string;
  targetAudience: string;
  offer: string;
  uniqueSellingPoint: string;
  tone: 'professional' | 'friendly' | 'singlish-light' | 'premium' | 'urgent';
  language: 'english' | 'singlish-light' | 'mandarin-friendly' | 'malay-friendly';
  singaporeZones: string[];
  primaryGoal: 'leads' | 'ecommerce' | 'awareness' | 'engagement';
  whatsappNumber: string;
  pdpaConsentPurpose: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  promoPrice: string;
  stock: string;
  benefits: string;
  targetBuyer: string;
  orderLink: string;
  deliveryInfo: string;
}

export interface CampaignDraft {
  id: string;
  title: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  contentType: 'image' | 'video' | 'carousel';
  goal: 'leads' | 'ecommerce' | 'awareness' | 'engagement';
  hook: string;
  caption: string;
  prompt: string;
  cta: string;
  hashtags: string[];
  productId?: string;
  createdAt: number;
}

export interface ScheduledPost {
  id: string;
  draftId: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  caption: string;
  assetType: 'image' | 'video' | 'carousel';
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'needs-oauth' | 'published' | 'failed';
  notes: string;
}

export interface AiVideoProviderSettings {
  preferredProvider: 'replicate' | 'fal' | 'kling' | 'seedance';
  budgetMode: 'draft' | 'standard' | 'premium';
  monthlyBudgetSgd: string;
  requireApprovalBeforeSpend: boolean;
  trueMotionEnabled: boolean;
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
  { label: '1024 x 1024 (Square)', width: 1024, height: 1024 },
  { label: '768 x 1344 (Portrait 9:16)', width: 768, height: 1344 },
  { label: '1344 x 768 (Landscape 16:9)', width: 1344, height: 768 },
  { label: '864 x 1152 (Portrait 3:4)', width: 864, height: 1152 },
  { label: '1152 x 864 (Landscape 4:3)', width: 1152, height: 864 },
] as const;

export const DURATION_OPTIONS = [2, 3, 5, 6, 8, 10, 15, 30, 45, 60] as const;
export const FPS_OPTIONS = [2, 3, 4, 6, 8, 12, 24, 30] as const;

export const REAL_VIDEO_DURATION_OPTIONS = [3, 5, 6, 8] as const;

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

// ─── Motion Effect Options (for free mode) ───────────────────────────────
export const MOTION_EFFECT_OPTIONS = [
  { id: 'ken-burns' as const, name: 'Ken Burns', description: 'Classic cinematic zoom + pan', icon: '🎬' },
  { id: 'zoom-in' as const, name: 'Zoom In', description: 'Slow zoom into the scene', icon: '🔍' },
  { id: 'zoom-out' as const, name: 'Zoom Out', description: 'Reveal from close-up to wide', icon: '🔎' },
  { id: 'pan-left' as const, name: 'Pan Left', description: 'Smooth pan across the scene', icon: '⬅️' },
  { id: 'pan-right' as const, name: 'Pan Right', description: 'Smooth pan across the scene', icon: '➡️' },
  { id: 'drift' as const, name: 'Drift', description: 'Gentle floating drift effect', icon: '🌊' },
] as const;

export const IMAGE_MODEL_OPTIONS = [
  // ─── Popular / Core Models ─────────────────────────────────
  { id: 'flux', name: 'Flux', description: 'Stable general-purpose image model', speed: 'Fast', badge: 'Popular' },
  { id: 'gptimage', name: 'GPT Image', description: 'Strong prompt understanding', speed: 'Medium', badge: 'Smart' },
  { id: 'gptimage-large', name: 'GPT Image Large', description: 'Maximum detail & resolution', speed: 'Slow', badge: 'HD' },
  { id: 'gpt-image-2', name: 'GPT Image 2', description: 'Next-gen with text rendering', speed: 'Medium', badge: 'Smart' },
  { id: 'seedream5', name: 'SeeDream 5', description: 'Vibrant colors & composition', speed: 'Medium', badge: 'Creative' },
  { id: 'seedream-pro', name: 'SeeDream Pro', description: 'High-detail creative images', speed: 'Medium', badge: 'Pro' },
  { id: 'zimage', name: 'ZImage', description: 'Balanced quality & speed', speed: 'Fast', badge: 'Speed' },
  { id: 'qwen-image', name: 'Qwen Image', description: 'Multilingual prompt support', speed: 'Medium', badge: 'Smart' },
  { id: 'wan-image', name: 'Wan Image', description: 'Great source frames for motion video', speed: 'Medium', badge: 'HD' },
  { id: 'wan-image-pro', name: 'Wan Image Pro', description: 'Higher-detail source frames', speed: 'Slow', badge: 'Pro' },
  { id: 'nova-canvas', name: 'Nova Canvas', description: 'Clean, professional images', speed: 'Medium', badge: 'Pro' },
  { id: 'kontext', name: 'Kontext', description: 'Context-aware composition', speed: 'Medium', badge: 'Smart' },
  // ─── NanoBanana Models ─────────────────────────────────────
  { id: 'nanobanana', name: 'NanoBanana', description: 'Fast creative AI model', speed: 'Fast', badge: 'Fun' },
  { id: 'nanobanana-2', name: 'NanoBanana 2', description: 'Fast & fun creative AI', speed: 'Fast', badge: 'Fun' },
  { id: 'nanobanana-pro', name: 'NanoBanana Pro', description: 'Premium NanoBanana detail', speed: 'Medium', badge: 'Pro' },
  // ─── Other Models ──────────────────────────────────────────
  { id: 'grok-imagine', name: 'Grok Imagine', description: 'Witty & creative outputs', speed: 'Fast', badge: 'Creative' },
  { id: 'grok-imagine-pro', name: 'Grok Imagine Pro', description: 'Enhanced detail & composition', speed: 'Slow', badge: 'Pro' },
  { id: 'klein', name: 'Klein', description: 'Unique artistic interpretation', speed: 'Fast', badge: 'Creative' },
  { id: 'p-image', name: 'P-Image', description: 'Pollinations native creative', speed: 'Fast', badge: 'Popular' },
] as const;

// ─── Image models for Motion Video (free, no API key) ─────────────────────
export const MOTION_SOURCE_MODEL_OPTIONS = [
  { id: 'gptimage', name: 'GPT Image', description: 'Best prompt understanding for source frames', speed: 'Medium', badge: 'Best' },
  { id: 'flux', name: 'Flux', description: 'Stable and fast source frames', speed: 'Fast', badge: 'Popular' },
  { id: 'seedream5', name: 'SeeDream 5', description: 'Vibrant cinematic source frames', speed: 'Medium', badge: 'Creative' },
  { id: 'wan-image', name: 'Wan Image', description: 'Designed for video-friendly images', speed: 'Medium', badge: 'HD' },
  { id: 'wan-image-pro', name: 'Wan Image Pro', description: 'Higher-detail video source frames', speed: 'Slow', badge: 'Pro' },
  { id: 'qwen-image', name: 'Qwen Image', description: 'Good multilingual prompt following', speed: 'Medium', badge: 'Smart' },
  { id: 'nova-canvas', name: 'Nova Canvas', description: 'Clean social/video compositions', speed: 'Medium', badge: 'Pro' },
  { id: 'zimage', name: 'ZImage', description: 'Balanced quality and speed', speed: 'Fast', badge: 'Speed' },
] as const;

// ─── No-key action sequence styles for multi-keyframe video clips ───────────
export const REAL_VIDEO_MODEL_OPTIONS = [
  { id: 'wan-fast', name: 'Dance / Action', description: 'Best for dancing, jumping, and playful movement prompts', speed: 'Fast', badge: 'Best', maxDuration: 5 },
  { id: 'ltx-2', name: 'Fast Movement', description: 'Quick pose changes for energetic actions', speed: 'Fast', badge: 'Speed', maxDuration: 5 },
  { id: 'seedance-pro', name: 'Cinematic Movement', description: 'More cinematic keyframe progression', speed: 'Medium', badge: 'Pro', maxDuration: 8 },
  { id: 'p-video', name: 'Playful Movement', description: 'Alternative style for expressive action sequences', speed: 'Medium', badge: 'Creative', maxDuration: 8 },
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
    id: 'seedream5',
    name: 'SeeDream 5',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Vibrant creative image generation.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'seedream5',
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
    id: 'qwen-image',
    name: 'Qwen Image',
    type: 'image',
    size: 'Cloud',
    sizeBytes: 0,
    description: 'Multilingual prompt support.',
    downloaded: true,
    active: false,
    progress: 100,
    huggingFaceId: 'qwen-image',
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
