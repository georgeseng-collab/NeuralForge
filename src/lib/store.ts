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
  type BrandProfile,
  type SocialLink,
  type ProductItem,
  type CampaignDraft,
  type ScheduledPost,
  type AiVideoProviderSettings,
  type WorkspaceSession,
  type LeadRecord,
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

  // SG Growth Studio
  brandProfile: BrandProfile;
  updateBrandProfile: (settings: Partial<BrandProfile>) => void;
  socialLinks: SocialLink[];
  updateSocialLink: (platform: SocialLink['platform'], updates: Partial<SocialLink>) => void;
  products: ProductItem[];
  addProduct: (product: ProductItem) => void;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  removeProduct: (id: string) => void;
  campaignDrafts: CampaignDraft[];
  addCampaignDraft: (draft: CampaignDraft) => void;
  removeCampaignDraft: (id: string) => void;
  scheduledPosts: ScheduledPost[];
  addScheduledPost: (post: ScheduledPost) => void;
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => void;
  aiVideoProviderSettings: AiVideoProviderSettings;
  updateAiVideoProviderSettings: (settings: Partial<AiVideoProviderSettings>) => void;
  workspaceSession: WorkspaceSession;
  updateWorkspaceSession: (settings: Partial<WorkspaceSession>) => void;
  leads: LeadRecord[];
  addLead: (lead: LeadRecord) => void;
  updateLead: (id: string, updates: Partial<LeadRecord>) => void;
  removeLead: (id: string) => void;

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
    fps: 12,
    width: 1344,
    height: 768,
    imageToVideo: false,
    sourceImage: null,
    modelId: 'gptimage',
    realVideoModelId: 'wan-fast',
    socialPreset: 'youtube-video',
    negativePrompt: 'blurry, low quality, distorted, watermark, text',
    generationMode: 'real',
    motionEffect: 'ken-burns',
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

  // SG Growth Studio
  brandProfile: {
    businessName: 'NeuralForge SG Store',
    industry: 'Ecommerce reselling',
    targetAudience: 'Singapore shoppers aged 25-40 looking for value-for-money deals',
    offer: 'Affordable trending products with islandwide delivery',
    uniqueSellingPoint: 'Singapore-localized product recommendations, fast replies, and easy WhatsApp ordering',
    tone: 'friendly',
    language: 'singlish-light',
    singaporeZones: ['Tampines', 'Jurong', 'Woodlands', 'CBD'],
    primaryGoal: 'ecommerce',
    whatsappNumber: '',
    pdpaConsentPurpose: 'To respond to enquiries, process orders, and send opted-in marketing updates.',
  },
  updateBrandProfile: (settings) =>
    set((state) => ({ brandProfile: { ...state.brandProfile, ...settings } })),
  socialLinks: [
    { platform: 'instagram', label: 'Instagram', url: '', connected: false, oauthStatus: 'not-connected' },
    { platform: 'facebook', label: 'Facebook Page', url: '', connected: false, oauthStatus: 'not-connected' },
    { platform: 'tiktok', label: 'TikTok', url: '', connected: false, oauthStatus: 'not-connected' },
    { platform: 'whatsapp', label: 'WhatsApp', url: '', connected: false, oauthStatus: 'manual-link' },
    { platform: 'shopee', label: 'Shopee', url: '', connected: false, oauthStatus: 'manual-link' },
    { platform: 'lazada', label: 'Lazada', url: '', connected: false, oauthStatus: 'manual-link' },
    { platform: 'tiktokShop', label: 'TikTok Shop', url: '', connected: false, oauthStatus: 'manual-link' },
    { platform: 'carousell', label: 'Carousell', url: '', connected: false, oauthStatus: 'manual-link' },
    { platform: 'website', label: 'Website / Landing Page', url: '', connected: false, oauthStatus: 'manual-link' },
  ],
  updateSocialLink: (platform, updates) =>
    set((state) => ({
      socialLinks: state.socialLinks.map((link) =>
        link.platform === platform ? { ...link, ...updates } : link
      ),
    })),
  products: [
    {
      id: 'starter-product',
      name: 'Sample Trending Product',
      category: 'Beauty / Lifestyle',
      price: '29.90',
      promoPrice: '24.90',
      stock: '50',
      benefits: 'Affordable, easy to use, suitable for Singapore daily lifestyle.',
      targetBuyer: 'Busy Singapore shoppers who want convenience and value.',
      orderLink: '',
      deliveryInfo: 'Islandwide delivery available.',
    },
  ],
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((product) => product.id === id ? { ...product, ...updates } : product),
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
  campaignDrafts: [],
  addCampaignDraft: (draft) => set((state) => ({ campaignDrafts: [draft, ...state.campaignDrafts] })),
  removeCampaignDraft: (id) =>
    set((state) => ({ campaignDrafts: state.campaignDrafts.filter((draft) => draft.id !== id) })),
  scheduledPosts: [],
  addScheduledPost: (post) => set((state) => ({ scheduledPosts: [post, ...state.scheduledPosts] })),
  updateScheduledPost: (id, updates) =>
    set((state) => ({
      scheduledPosts: state.scheduledPosts.map((post) => post.id === id ? { ...post, ...updates } : post),
    })),
  aiVideoProviderSettings: {
    preferredProvider: 'replicate',
    budgetMode: 'draft',
    monthlyBudgetSgd: '50',
    requireApprovalBeforeSpend: true,
    trueMotionEnabled: false,
  },
  updateAiVideoProviderSettings: (settings) =>
    set((state) => ({ aiVideoProviderSettings: { ...state.aiVideoProviderSettings, ...settings } })),
  workspaceSession: {
    userName: 'Owner',
    email: '',
    workspaceName: 'NeuralForge SG Workspace',
    authProvider: 'local-preview',
    isLoggedIn: false,
    role: 'owner',
  },
  updateWorkspaceSession: (settings) =>
    set((state) => ({ workspaceSession: { ...state.workspaceSession, ...settings } })),
  leads: [],
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  updateLead: (id, updates) =>
    set((state) => ({ leads: state.leads.map((lead) => lead.id === id ? { ...lead, ...updates } : lead) })),
  removeLead: (id) =>
    set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) })),

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
    modelsLoaded: ['flux', 'gptimage', 'seedream5', 'zimage', 'qwen-image', 'nova-canvas'],
  },
  updateConnectionStatus: (status) =>
    set((state) => ({
      connectionStatus: { ...state.connectionStatus, ...status },
    })),
}));
