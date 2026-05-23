import { create } from 'zustand';
import {
  type AppTab,
  type ImageSettings,
  type VideoSettings,
  type GalleryItem,
  type AIModel,
  type SafetySettings,
  type AppSettings,
  type ConnectionStatus,
  type GenerationProgress,
  DEFAULT_MODELS,
  DEFAULT_BLOCKED_PROMPTS,
} from './types';

interface NeuralForgeStore {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Image Generation
  imageSettings: ImageSettings;
  updateImageSettings: (settings: Partial<ImageSettings>) => void;
  imageProgress: GenerationProgress;
  setImageProgress: (progress: Partial<GenerationProgress>) => void;
  generatedImage: string | null;
  setGeneratedImage: (url: string | null) => void;

  // Video Generation
  videoSettings: VideoSettings;
  updateVideoSettings: (settings: Partial<VideoSettings>) => void;
  videoProgress: GenerationProgress;
  setVideoProgress: (progress: Partial<GenerationProgress>) => void;
  generatedVideo: string | null;
  setGeneratedVideo: (url: string | null) => void;
  generatedVideoUrl: string | null;
  setGeneratedVideoUrl: (url: string | null) => void;

  // Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: GalleryItem) => void;
  removeGalleryItem: (id: string) => void;
  galleryFilter: 'all' | 'image' | 'video';
  setGalleryFilter: (filter: 'all' | 'image' | 'video') => void;
  gallerySearch: string;
  setGallerySearch: (search: string) => void;

  // Models
  models: AIModel[];
  updateModel: (id: string, updates: Partial<AIModel>) => void;
  activateModel: (id: string) => void;

  // Safety
  safetySettings: SafetySettings;
  updateSafetySettings: (settings: Partial<SafetySettings>) => void;
  addSafetyLog: (entry: SafetySettings['safetyLog'][0]) => void;
  clearSafetyLog: () => void;

  // App Settings
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;

  // Connection
  connectionStatus: ConnectionStatus;
  updateConnectionStatus: (status: Partial<ConnectionStatus>) => void;
}

export const useNeuralForgeStore = create<NeuralForgeStore>((set) => ({
  // Navigation
  activeTab: 'image',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Image Generation
  imageSettings: {
    prompt: '',
    negativePrompt: 'blurry, low quality, distorted, watermark, text',
    width: 1024,
    height: 1024,
    steps: 20,
    cfgScale: 7,
    style: 'Photorealistic',
    seed: null,
    modelId: 'flux',
  },
  updateImageSettings: (settings) =>
    set((state) => ({ imageSettings: { ...state.imageSettings, ...settings } })),
  imageProgress: {
    isGenerating: false,
    type: 'image',
    currentStep: 0,
    totalSteps: 0,
    currentFrame: 0,
    totalFrames: 0,
    message: '',
  },
  setImageProgress: (progress) =>
    set((state) => ({ imageProgress: { ...state.imageProgress, ...progress } })),
  generatedImage: null,
  setGeneratedImage: (url) => set({ generatedImage: url }),

  // Video Generation
  videoSettings: {
    prompt: '',
    duration: 5,
    fps: 3,
    width: 1344,
    height: 768,
    imageToVideo: false,
    sourceImage: null,
    modelId: 'flux',
    socialPreset: 'youtube-video',
    negativePrompt: 'blurry, low quality, distorted, watermark, text',
  },
  updateVideoSettings: (settings) =>
    set((state) => ({ videoSettings: { ...state.videoSettings, ...settings } })),
  videoProgress: {
    isGenerating: false,
    type: 'video',
    currentStep: 0,
    totalSteps: 0,
    currentFrame: 0,
    totalFrames: 0,
    message: '',
  },
  setVideoProgress: (progress) =>
    set((state) => ({ videoProgress: { ...state.videoProgress, ...progress } })),
  generatedVideo: null,
  setGeneratedVideo: (url) => set({ generatedVideo: url }),
  generatedVideoUrl: null,
  setGeneratedVideoUrl: (url) => set({ generatedVideoUrl: url }),

  // Gallery
  gallery: [],
  addGalleryItem: (item) =>
    set((state) => ({ gallery: [item, ...state.gallery] })),
  removeGalleryItem: (id) =>
    set((state) => ({ gallery: state.gallery.filter((i) => i.id !== id) })),
  galleryFilter: 'all',
  setGalleryFilter: (filter) => set({ galleryFilter: filter }),
  gallerySearch: '',
  setGallerySearch: (search) => set({ gallerySearch: search }),

  // Models
  models: DEFAULT_MODELS,
  updateModel: (id, updates) =>
    set((state) => ({
      models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  activateModel: (id) =>
    set((state) => ({
      models: state.models.map((m) => ({
        ...m,
        active: m.id === id,
      })),
    })),

  // Safety
  safetySettings: {
    contentFilterEnabled: true,
    nsfwDetectionEnabled: true,
    blockedPrompts: [...DEFAULT_BLOCKED_PROMPTS],
    safetyLog: [],
  },
  updateSafetySettings: (settings) =>
    set((state) => ({
      safetySettings: { ...state.safetySettings, ...settings },
    })),
  addSafetyLog: (entry) =>
    set((state) => ({
      safetySettings: {
        ...state.safetySettings,
        safetyLog: [entry, ...state.safetySettings.safetyLog].slice(0, 100),
      },
    })),
  clearSafetyLog: () =>
    set((state) => ({
      safetySettings: { ...state.safetySettings, safetyLog: [] },
    })),

  // App Settings
  appSettings: {
    backendUrl: 'cloud',
    theme: 'dark',
    defaultSteps: 20,
    defaultCfgScale: 7,
    defaultResolution: '1024x1024',
    storagePath: './neuralforge-data',
  },
  updateAppSettings: (settings) =>
    set((state) => ({ appSettings: { ...state.appSettings, ...settings } })),

  // Connection
  connectionStatus: {
    online: true,
    backendConnected: true,
    backendVersion: '2.0.0',
    gpuAvailable: true,
    gpuName: 'Cloud AI Engine',
    modelsLoaded: ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo', 'any-dark'],
  },
  updateConnectionStatus: (status) =>
    set((state) => ({
      connectionStatus: { ...state.connectionStatus, ...status },
    })),
}));
