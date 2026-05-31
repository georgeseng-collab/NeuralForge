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
  type CharacterProfile,
  type CampaignDraft,
  type ScheduledPost,
  type AutoScheduleSettings,
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
  characters: CharacterProfile[];
  addCharacter: (character: CharacterProfile) => void;
  updateCharacter: (id: string, updates: Partial<CharacterProfile>) => void;
  removeCharacter: (id: string) => void;
  activeCharacterId: string;
  setActiveCharacter: (id: string) => void;
  campaignDrafts: CampaignDraft[];
  addCampaignDraft: (draft: CampaignDraft) => void;
  removeCampaignDraft: (id: string) => void;
  scheduledPosts: ScheduledPost[];
  addScheduledPost: (post: ScheduledPost) => void;
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => void;
  autoScheduleSettings: AutoScheduleSettings;
  updateAutoScheduleSettings: (settings: Partial<AutoScheduleSettings>) => void;
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
    businessName: 'NeuralForge SG Creator',
    industry: 'Organic content and social growth',
    targetAudience: 'Singapore viewers who enjoy useful, entertaining and relatable local content',
    offer: 'Daily organic posts that bring viewers to my profile link or DM',
    uniqueSellingPoint: 'Singapore-localized recurring characters, regular posting, and link-driven organic growth',
    tone: 'friendly',
    language: 'singlish-light',
    singaporeZones: ['Tampines', 'Jurong', 'Woodlands', 'CBD'],
    primaryGoal: 'awareness',
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
  characters: [
    {
      id: 'aunty-deal-hunter',
      name: 'Aunty Deal Hunter',
      type: 'virtual-influencer',
      role: 'Singapore organic content host who finds useful things and explains why people should care',
      personality: 'Funny, direct, warm, slightly kaypoh, Singlish-light but still brand-safe',
      visualDescription: 'Friendly Singaporean aunty, expressive face, approachable smile, social-media host energy',
      outfitStyle: 'Casual heartland outfit with neat styling and bright accent colors',
      voiceTone: 'Conversational, practical, funny, trustworthy',
      catchphrases: ['Good thing must share', 'Don’t say bojio', 'This one actually useful'],
      contentThemes: ['daily useful finds', 'Singapore lifestyle tips', 'problem-solution stories', 'link-in-bio CTA'],
      doRules: 'Keep it friendly, useful, local, and organic. Make the character recurring and memorable.',
      dontRules: 'Avoid hard-selling, offensive stereotypes, exaggerated income claims, or misleading urgency.',
      referenceImageUrl: '',
      active: true,
    },
    {
      id: 'sg-founder-avatar',
      name: 'SG Founder Avatar',
      type: 'founder-avatar',
      role: 'Founder-style persona that builds trust and explains the story behind each post',
      personality: 'Sincere, hardworking, knowledgeable, relatable',
      visualDescription: 'Modern Singapore small business owner, confident but approachable, clean social video look',
      outfitStyle: 'Smart casual, neutral colors, clean background',
      voiceTone: 'Helpful, honest, concise',
      catchphrases: ['Here’s what I learned', 'Let me show you', 'This is why it matters'],
      contentThemes: ['behind the scenes', 'founder story', 'educational tips', 'trust building'],
      doRules: 'Make the founder feel real, helpful, and consistent.',
      dontRules: 'Avoid fake guarantees, over-polished corporate tone, or unrealistic testimonials.',
      referenceImageUrl: '',
      active: false,
    },
  ],
  addCharacter: (character) => set((state) => ({ characters: [character, ...state.characters] })),
  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((character) => character.id === id ? { ...character, ...updates } : character),
    })),
  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((character) => character.id !== id),
      activeCharacterId: state.activeCharacterId === id ? state.characters.find((character) => character.id !== id)?.id || '' : state.activeCharacterId,
    })),
  activeCharacterId: 'aunty-deal-hunter',
  setActiveCharacter: (id) =>
    set((state) => ({
      activeCharacterId: id,
      characters: state.characters.map((character) => ({ ...character, active: character.id === id })),
    })),
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
  autoScheduleSettings: {
    videosPerDay: 2,
    imagesPerDay: 1,
    daysToPlan: 7,
    activePlatforms: ['tiktok', 'instagram', 'facebook'],
    preferredTimes: ['12:30', '20:00', '22:00'],
    rotatePlatforms: true,
    requireApprovalBeforePublish: true,
  },
  updateAutoScheduleSettings: (settings) =>
    set((state) => ({ autoScheduleSettings: { ...state.autoScheduleSettings, ...settings } })),
  aiVideoProviderSettings: {
    preferredProvider: 'kling',
    budgetMode: 'standard',
    monthlyBudgetSgd: '300',
    requireApprovalBeforeSpend: true,
    trueMotionEnabled: true,
    targetDurationSeconds: 60,
    sceneLengthSeconds: 10,
    klingMode: 'standard',
    klingResolution: '720p',
    estimatedCostUsd: '4.50',
    scenePlan: [
      {
        id: 'scene-hook',
        order: 1,
        duration: 10,
        title: 'Hook',
        prompt: 'Open with an attention-grabbing Singapore social media hook, energetic camera motion, clear subject.',
        status: 'planned',
      },
      {
        id: 'scene-problem',
        order: 2,
        duration: 10,
        title: 'Problem',
        prompt: 'Show the customer problem in a relatable Singapore lifestyle setting.',
        status: 'planned',
      },
      {
        id: 'scene-product',
        order: 3,
        duration: 10,
        title: 'Product',
        prompt: 'Introduce the offer or link topic with smooth motion and organic social framing.',
        status: 'planned',
      },
      {
        id: 'scene-benefits',
        order: 4,
        duration: 10,
        title: 'Benefits',
        prompt: 'Show the key benefits with dynamic close-ups and practical use cases.',
        status: 'planned',
      },
      {
        id: 'scene-proof',
        order: 5,
        duration: 10,
        title: 'Proof',
        prompt: 'Show social proof, trust cues, or happy customer-style reaction.',
        status: 'planned',
      },
      {
        id: 'scene-cta',
        order: 6,
        duration: 10,
        title: 'CTA',
        prompt: 'End with a strong call-to-action for WhatsApp, Shopee, Lazada, TikTok Shop, or DM.',
        status: 'planned',
      },
    ],
  },
  updateAiVideoProviderSettings: (settings) =>
    set((state) => ({ aiVideoProviderSettings: { ...state.aiVideoProviderSettings, ...settings } })),
  workspaceSession: {
    userId: '',
    workspaceId: '',
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
