'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Film, Image, Database, Shield, Settings, Wifi, WifiOff,
  Cpu, ChevronRight, Zap, Download, Trash2, Search, Play, Pause,
  RotateCcw, Check, AlertTriangle, Plus, X, Server,
  Monitor, HardDrive, RefreshCw, Copy, Volume2,
  Palette, Layers, Clock, Box, Globe, Cloud, Star, Bolt, Moon,
  Wand2, Paintbrush, Camera, Video, Share2
} from 'lucide-react';
import { useNeuralForgeStore } from '@/lib/store';
import {
  RESOLUTION_OPTIONS, DURATION_OPTIONS, FPS_OPTIONS, STYLE_OPTIONS,
  IMAGE_MODEL_OPTIONS, VIDEO_PRESET_OPTIONS,
  MOTION_EFFECT_OPTIONS, MOTION_SOURCE_MODEL_OPTIONS, REAL_VIDEO_DURATION_OPTIONS, REAL_VIDEO_MODEL_OPTIONS,
  type AiVideoProviderSettings, type AutoScheduleSettings, type BrandProfile, type CampaignDraft, type CharacterProfile, type GalleryItem, type LeadRecord, type ProductItem, type SafetyLogEntry, type ScheduledPost,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Sidebar Navigation ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'image' as const, label: 'Image Gen', icon: Image },
  { id: 'video' as const, label: 'Video Gen', icon: Film },
  { id: 'growth' as const, label: 'SG Growth', icon: Share2 },
  { id: 'gallery' as const, label: 'Gallery', icon: Layers },
  { id: 'models' as const, label: 'Models', icon: Database },
  { id: 'safety' as const, label: 'Safety', icon: Shield },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

// ─── Model Badge Colors ─────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  'Popular': 'bg-violet-600/30 text-violet-300',
  'HD': 'bg-blue-600/30 text-blue-300',
  'Anime': 'bg-pink-600/30 text-pink-300',
  '3D': 'bg-cyan-600/30 text-cyan-300',
  'Creative': 'bg-amber-600/30 text-amber-300',
  'Pro': 'bg-emerald-600/30 text-emerald-300',
  'Speed': 'bg-orange-600/30 text-orange-300',
  'Dark': 'bg-gray-600/30 text-gray-300',
  'Fun': 'bg-yellow-600/30 text-yellow-300',
  'Smart': 'bg-indigo-600/30 text-indigo-300',
  'Free': 'bg-emerald-600/30 text-emerald-300',
  'Ultra': 'bg-purple-600/30 text-purple-300',
  'Best': 'bg-amber-600/30 text-amber-300',
  'Credit': 'bg-orange-600/30 text-orange-300',
};

// ─── Motion-to-Video Encoder (Client-Side) ───────────────────────────────────
type MotionEffect = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'ken-burns' | 'drift';

// Convert base64 data URL to Blob URL for better browser compatibility with large images
function dataUrlToBlobUrl(dataUrl: string): string {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl; // Not a data URL, return as-is

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const base64 = parts[1];
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl; // Fallback to original if conversion fails
  }
}

async function encodeMotionToVideo(
  imageSrc: string,
  width: number,
  height: number,
  duration: number,
  fps: number = 24,
  effect: MotionEffect = 'ken-burns',
  onProgress?: (frame: number, totalFrames: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        reject(new Error('Your browser does not support MediaRecorder video encoding. Try Chrome, Edge, or Firefox.'));
        return;
      }

      // Cap canvas dimensions to avoid browser memory issues (max 1024 on longest side)
      const maxDim = 1024;
      let cw = width;
      let ch = height;
      if (Math.max(cw, ch) > maxDim) {
        const scale = maxDim / Math.max(cw, ch);
        cw = Math.round(cw * scale);
        ch = Math.round(ch * scale);
      }
      // Ensure even dimensions for video encoding
      cw = cw % 2 === 0 ? cw : cw + 1;
      ch = ch % 2 === 0 ? ch : ch + 1;

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(fps);
      if (!stream) {
        reject(new Error('Your browser could not capture the canvas stream for video encoding.'));
        return;
      }
      const chunks: Blob[] = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (!blob.size) {
          reject(new Error('Video encoding produced an empty file. Keep this tab active and try again.'));
          return;
        }
        resolve(URL.createObjectURL(blob));
      };

      recorder.onerror = (e) => {
        console.error('[NeuralForge] MediaRecorder error:', e);
        reject(new Error('Video encoding failed — MediaRecorder encountered an error'));
      };

      const img = document.createElement('img');
      
      // CRITICAL FIX: Convert large base64 data URLs to Blob URLs
      // Direct base64 data URLs can be too large for browser <img> elements to load
      // Blob URLs are more memory-efficient and avoid the "Failed to load image" error
      let imgSrc = imageSrc;
      let blobUrlToRevoke: string | null = null;
      
      if (imageSrc.startsWith('data:') && imageSrc.length > 100000) {
        // Large data URL - convert to Blob URL for reliable loading
        blobUrlToRevoke = dataUrlToBlobUrl(imageSrc);
        imgSrc = blobUrlToRevoke;
      }
      
      // IMPORTANT: Do NOT set crossOrigin for data: URIs or blob: URIs
      if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        // Clean up blob URL after image is loaded into canvas
        if (blobUrlToRevoke) {
          URL.revokeObjectURL(blobUrlToRevoke);
        }
        
        recorder.start();

        const totalFrames = duration * fps;
        let frame = 0;
        onProgress?.(0, totalFrames);

        const renderFrame = () => {
          if (frame >= totalFrames) {
            onProgress?.(totalFrames, totalFrames);
            recorder.stop();
            return;
          }

          const progress = frame / totalFrames; // 0 to 1
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, cw, ch);

          // Calculate motion transforms based on effect
          let dx = 0, dy = 0, dw = cw, dh = ch;
          const padding = 0.15; // 15% extra image area for motion

          switch (effect) {
            case 'zoom-in': {
              const scale = 1 + progress * padding * 2;
              const iw = cw * scale;
              const ih = ch * scale;
              dx = (cw - iw) / 2;
              dy = (ch - ih) / 2;
              dw = iw;
              dh = ih;
              break;
            }
            case 'zoom-out': {
              const scale = 1 + (1 - progress) * padding * 2;
              const iw = cw * scale;
              const ih = ch * scale;
              dx = (cw - iw) / 2;
              dy = (ch - ih) / 2;
              dw = iw;
              dh = ih;
              break;
            }
            case 'pan-left': {
              const panAmount = padding * cw;
              const scale = 1 + padding;
              dx = -progress * panAmount;
              dy = -(ch * scale - ch) / 2;
              dw = cw * scale;
              dh = ch * scale;
              break;
            }
            case 'pan-right': {
              const panAmount = padding * cw;
              const scale = 1 + padding;
              dx = -(cw * scale - cw) + progress * panAmount;
              dy = -(ch * scale - ch) / 2;
              dw = cw * scale;
              dh = ch * scale;
              break;
            }
            case 'ken-burns': {
              const s = 1 + progress * padding * 1.5;
              dx = (cw - cw * s) / 2 + progress * padding * cw * 0.3;
              dy = (ch - ch * s) / 2 + progress * padding * ch * 0.15;
              dw = cw * s;
              dh = ch * s;
              break;
            }
            case 'drift': {
              const driftX = Math.sin(progress * Math.PI * 2) * padding * cw * 0.3;
              const driftY = Math.cos(progress * Math.PI * 1.5) * padding * ch * 0.2;
              const scale = 1 + padding * 0.5;
              dx = (cw - cw * scale) / 2 + driftX;
              dy = (ch - ch * scale) / 2 + driftY;
              dw = cw * scale;
              dh = ch * scale;
              break;
            }
          }

          ctx.drawImage(img, dx, dy, dw, dh);
          frame++;
          if (frame === 1 || frame % Math.max(1, Math.floor(fps)) === 0) {
            onProgress?.(frame, totalFrames);
          }

          // Use setTimeout instead of requestAnimationFrame for more consistent timing
          setTimeout(renderFrame, 1000 / fps);
        };

        renderFrame();
      };
      img.onerror = () => {
        // Clean up blob URL on error
        if (blobUrlToRevoke) {
          URL.revokeObjectURL(blobUrlToRevoke);
        }
        console.error('[NeuralForge] Image load failed for motion encoding. src type:', imageSrc?.substring(0, 30), 'length:', imageSrc?.length);
        reject(new Error('Failed to load image for motion encoding. The image data may be corrupted or too large. Try a different free source model.'));
      };
      img.src = imgSrc;
    } catch (err) {
      console.error('[NeuralForge] Motion encoding setup error:', err);
      reject(err);
    }
  });
}

async function encodeImageSequenceToVideo(
  imageSources: string[],
  width: number,
  height: number,
  duration: number,
  fps: number = 12,
  onProgress?: (frame: number, totalFrames: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        reject(new Error('Your browser does not support MediaRecorder video encoding. Try Chrome, Edge, or Firefox.'));
        return;
      }
      if (!imageSources.length) {
        reject(new Error('No action frames were generated.'));
        return;
      }

      const maxDim = 1024;
      let cw = width;
      let ch = height;
      if (Math.max(cw, ch) > maxDim) {
        const scale = maxDim / Math.max(cw, ch);
        cw = Math.round(cw * scale);
        ch = Math.round(ch * scale);
      }
      cw = cw % 2 === 0 ? cw : cw + 1;
      ch = ch % 2 === 0 ? ch : ch + 1;

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(fps);
      const chunks: Blob[] = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onerror = () => reject(new Error('Action sequence video encoding failed.'));
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (!blob.size) {
          reject(new Error('Action sequence encoding produced an empty file.'));
          return;
        }
        resolve(URL.createObjectURL(blob));
      };

      const imageElements: HTMLImageElement[] = [];
      let loaded = 0;

      const startEncoding = () => {
        recorder.start();
        const totalFrames = Math.max(1, duration * fps);
        let frame = 0;
        onProgress?.(0, totalFrames);

        const renderFrame = () => {
          if (frame >= totalFrames) {
            onProgress?.(totalFrames, totalFrames);
            recorder.stop();
            return;
          }

          const progress = frame / totalFrames;
          const sequencePosition = progress * (imageElements.length - 1);
          const currentIndex = Math.min(imageElements.length - 1, Math.floor(sequencePosition));
          const nextIndex = Math.min(imageElements.length - 1, currentIndex + 1);
          const blend = sequencePosition - currentIndex;
          const scale = 1.04 + Math.sin(progress * Math.PI) * 0.04;
          const dw = cw * scale;
          const dh = ch * scale;
          const dx = (cw - dw) / 2;
          const dy = (ch - dh) / 2;

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, cw, ch);
          ctx.globalAlpha = 1;
          ctx.drawImage(imageElements[currentIndex], dx, dy, dw, dh);
          if (nextIndex !== currentIndex) {
            ctx.globalAlpha = blend;
            ctx.drawImage(imageElements[nextIndex], dx, dy, dw, dh);
          }
          ctx.globalAlpha = 1;

          frame++;
          if (frame === 1 || frame % Math.max(1, Math.floor(fps)) === 0) {
            onProgress?.(frame, totalFrames);
          }
          setTimeout(renderFrame, 1000 / fps);
        };

        renderFrame();
      };

      imageSources.forEach((src) => {
        const img = document.createElement('img');
        img.onload = () => {
          loaded++;
          if (loaded === imageSources.length) startEncoding();
        };
        img.onerror = () => reject(new Error('Failed to load one of the generated action frames.'));
        if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous';
        img.src = src;
        imageElements.push(img);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Image Loader Component ─────────────────────────────────────────────────
function ImageWithLoader({ src }: { src: string }) {
  const [loading, setLoading] = useState(!src.startsWith('data:'));
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="text-center text-zinc-600 p-4">
        <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Image failed to load</p>
        <p className="text-xs mt-1 text-zinc-700">Try generating again or use a different model</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50 z-10">
          <div className="text-center text-zinc-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-40" />
            <p className="text-xs">Loading image...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt="Generated"
        className="w-full h-full object-contain"
        loading="eager"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}

export default function Home() {
  const {
    activeTab, setActiveTab,
    connectionStatus,
  } = useNeuralForgeStore();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          useNeuralForgeStore.getState().updateConnectionStatus({
            backendConnected: true,
            backendVersion: data.version || '2.0.0',
            gpuAvailable: data.gpu_available || false,
            gpuName: data.gpu_name || 'Cloud AI',
            modelsLoaded: data.models_loaded || [],
          });
        } else {
          useNeuralForgeStore.getState().updateConnectionStatus({ backendConnected: false });
        }
      } catch {
        useNeuralForgeStore.getState().updateConnectionStatus({ backendConnected: false });
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <motion.aside
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        className="w-20 lg:w-64 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col shrink-0"
      >
        <div className="p-4 lg:p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="font-bold text-lg leading-tight">NeuralForge</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Free AI Studio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 lg:p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${activeTab === item.id
                  ? 'bg-violet-600/20 text-violet-300 shadow-lg shadow-violet-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span className="hidden lg:inline">{item.label}</span>
              {activeTab === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto hidden lg:block text-violet-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            {connectionStatus.backendConnected ? (
              <Cloud className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs text-zinc-500 hidden lg:inline">
              {connectionStatus.backendConnected ? 'Cloud AI Connected' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-zinc-500 hidden lg:inline">Free · No API Key</span>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'image' && <ImageGenPanel />}
            {activeTab === 'video' && <VideoGenPanel />}
            {activeTab === 'growth' && <GrowthStudioPanel />}
            {activeTab === 'gallery' && <GalleryPanel />}
            {activeTab === 'models' && <ModelsPanel />}
            {activeTab === 'safety' && <SafetyPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Image Generation Panel ──────────────────────────────────────────────────
function ImageGenPanel() {
  const { imageSettings, updateImageSettings, imageProgress, setImageProgress, generatedImage, setGeneratedImage, addGalleryItem, safetySettings, addSafetyLog } = useNeuralForgeStore();

  const handleGenerate = useCallback(async () => {
    if (!imageSettings.prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (safetySettings.contentFilterEnabled) {
      const lower = imageSettings.prompt.toLowerCase();
      const blocked = safetySettings.blockedPrompts.find(p => lower.includes(p.toLowerCase()));
      if (blocked) {
        addSafetyLog({
          id: crypto.randomUUID(),
          prompt: imageSettings.prompt,
          reason: `Blocked keyword: "${blocked}"`,
          timestamp: Date.now(),
          action: 'blocked',
        });
        toast.error(`Prompt blocked: contains "${blocked}"`);
        return;
      }
    }

    setImageProgress({ isGenerating: true, currentStep: 0, totalSteps: imageSettings.steps, message: `Generating with ${IMAGE_MODEL_OPTIONS.find(m => m.id === imageSettings.modelId)?.name || imageSettings.modelId}...` });

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageSettings),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Generation failed');
      }

      const data = await res.json();
      setGeneratedImage(data.image_url);
      addGalleryItem({
        id: crypto.randomUUID(),
        type: 'image',
        prompt: imageSettings.prompt,
        negativePrompt: imageSettings.negativePrompt,
        settings: { ...imageSettings },
        url: data.image_url,
        thumbnailUrl: data.image_url,
        timestamp: Date.now(),
        isNsfw: data.is_nsfw || false,
        modelUsed: data.model_used,
        provider: data.provider,
      });
      toast.success(`Image generated with ${data.model_used || 'AI'}!`);
    } catch (err: any) {
      toast.error(err.message || 'Generation failed.');
    } finally {
      setImageProgress({ isGenerating: false, currentStep: 0, message: '' });
    }
  }, [imageSettings, safetySettings, setImageProgress, setGeneratedImage, addGalleryItem, addSafetyLog]);

  const selectedModel = IMAGE_MODEL_OPTIONS.find(m => m.id === imageSettings.modelId);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
          <Image className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Image Generation</h2>
          <p className="text-sm text-zinc-500">Free AI image generation — no API key required</p>
        </div>
        <Badge className="ml-auto bg-emerald-600/20 text-emerald-300 border-0">
          <Globe className="w-3 h-3 mr-1" /> Free
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-400" /> AI Model
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {IMAGE_MODEL_OPTIONS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => updateImageSettings({ modelId: model.id })}
                    className={`text-left p-2.5 rounded-lg border transition-all duration-150 group
                      ${imageSettings.modelId === model.id
                        ? 'bg-violet-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10'
                        : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                      <Badge className={`text-[9px] px-1.5 py-0 ${BADGE_COLORS[model.badge] || 'bg-zinc-600/30 text-zinc-300'}`}>
                        {model.badge}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">{model.description}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Bolt className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] text-zinc-500">{model.speed}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300">Prompt</Label>
                <Textarea
                  value={imageSettings.prompt}
                  onChange={(e) => updateImageSettings({ prompt: e.target.value })}
                  placeholder="A cyberpunk city at sunset, neon lights reflecting on wet streets, ultra detailed, 8k..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Negative Prompt</Label>
                <Textarea
                  value={imageSettings.negativePrompt}
                  onChange={(e) => updateImageSettings({ negativePrompt: e.target.value })}
                  placeholder="blurry, low quality, distorted, watermark, text..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[60px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Style</Label>
                <Select value={imageSettings.style} onValueChange={(v) => updateImageSettings({ style: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {STYLE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Resolution</Label>
                <Select
                  value={`${imageSettings.width}x${imageSettings.height}`}
                  onValueChange={(v) => {
                    const [w, h] = v.split('x').map(Number);
                    updateImageSettings({ width: w, height: h });
                  }}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {RESOLUTION_OPTIONS.map((r) => (
                      <SelectItem key={r.label} value={`${r.width}x${r.height}`}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-zinc-300">Seed</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500"
                    onClick={() => updateImageSettings({ seed: Math.floor(Math.random() * 2147483647) })}>
                    <RotateCcw className="w-3 h-3 mr-1" /> Random
                  </Button>
                </div>
                <Input
                  type="number"
                  value={imageSettings.seed ?? ''}
                  onChange={(e) => updateImageSettings({ seed: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Random"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={imageProgress.isGenerating}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold h-12 text-base shadow-lg shadow-violet-500/20"
              >
                {imageProgress.isGenerating ? (
                  <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating with {selectedModel?.name || 'AI'}...</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Generate with {selectedModel?.name || 'AI'}</>
                )}
              </Button>

              {imageProgress.isGenerating && (
                <div className="space-y-2">
                  <Progress value={50} className="h-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 text-center">{imageProgress.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-zinc-300 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" /> Preview
                {selectedModel && (
                  <Badge className="text-[9px] bg-violet-600/20 text-violet-300 border-0 ml-auto">{selectedModel.name}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
                {generatedImage ? (
                  <ImageWithLoader src={generatedImage} />
                ) : imageProgress.isGenerating ? (
                  <div className="text-center text-zinc-500 p-4">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-40" />
                    <p className="text-sm">Generating your image...</p>
                    <p className="text-xs mt-1 text-zinc-600">This may take 10-30 seconds</p>
                  </div>
                ) : (
                  <div className="text-center text-zinc-600">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generated image will appear here</p>
                  </div>
                )}
              </div>
              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1 border-zinc-700"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = generatedImage;
                      a.download = `neuralforge-${Date.now()}.png`;
                      a.click();
                    }}>
                    <Download className="w-4 h-4 mr-2" /> Download Image
                  </Button>
                  <Button variant="outline" className="border-zinc-700"
                    onClick={() => { navigator.clipboard.writeText(generatedImage); toast.success('Copied!'); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Tips for Better Images
              </h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <p><strong className="text-violet-300">Flux</strong> — Best all-rounder, great for any style</p>
                <p><strong className="text-yellow-300">NanoBanana</strong> — Fun & fast creative AI</p>
                <p><strong className="text-pink-300">Flux Realism</strong> — Most photorealistic results</p>
                <p><strong className="text-cyan-300">GPT Image</strong> — Best prompt understanding</p>
                <p><strong className="text-amber-300">Use negative prompts</strong> — Add &quot;blurry, low quality, distorted&quot; to improve results</p>
                <p><strong className="text-emerald-300">Be descriptive</strong> — More detail = better images</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Video Player Component (removed - using native <video> now) ────────────

// ─── Video Generation Panel ──────────────────────────────────────────────────
function VideoGenPanel() {
  const { videoSettings, updateVideoSettings, videoProgress, setVideoProgress, setGeneratedVideo, generatedVideoUrl, setGeneratedVideoUrl, addGalleryItem, safetySettings, addSafetyLog } = useNeuralForgeStore();
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingPercent, setEncodingPercent] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageMode, setSourceImageMode] = useState<'motion' | 'sequence' | null>(null);
  const [pendingVideoMeta, setPendingVideoMeta] = useState<{
    prompt: string;
    negativePrompt?: string;
    settings: Record<string, unknown>;
    modelUsed?: string;
    provider?: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [videoBlobUrl]);

  // Auto-start motion encoding when a free motion source image is received.
  useEffect(() => {
    if (!sourceImage || sourceImageMode !== 'motion') return;
    let cancelled = false;
    setIsEncoding(true);
    setEncodingPercent(0);
    const totalFrames = videoSettings.duration * videoSettings.fps;
    setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames, message: `Encoding ${videoSettings.duration}s motion video (${videoSettings.motionEffect})... keep this tab open` });
    encodeMotionToVideo(
      sourceImage,
      videoSettings.width,
      videoSettings.height,
      videoSettings.duration,
      videoSettings.fps,
      videoSettings.motionEffect,
      (frame, total) => {
        if (cancelled) return;
        const percent = total > 0 ? Math.min(99, Math.round((frame / total) * 100)) : 0;
        setEncodingPercent(percent);
        setVideoProgress({
          isGenerating: true,
          currentFrame: frame,
          totalFrames: total,
          message: `Encoding video ${percent}% (${Math.ceil((total - frame) / videoSettings.fps)}s remaining)...`,
        });
      },
    ).then((url) => {
      if (!cancelled) {
        if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
        setVideoBlobUrl(url);
        setGeneratedVideoUrl(url);
        setGeneratedVideo(url);
        setIsEncoding(false);
        setEncodingPercent(100);
        setVideoProgress({ isGenerating: false, currentFrame: 0, message: '' });
        if (pendingVideoMeta) {
          addGalleryItem({
            id: crypto.randomUUID(),
            type: 'video',
            prompt: pendingVideoMeta.prompt,
            negativePrompt: pendingVideoMeta.negativePrompt,
            settings: pendingVideoMeta.settings,
            url,
            thumbnailUrl: sourceImage,
            timestamp: Date.now(),
            isNsfw: false,
            modelUsed: pendingVideoMeta.modelUsed,
            provider: pendingVideoMeta.provider,
            videoUrl: url,
          });
        }
        toast.success('Motion video encoded!');
      }
    }).catch((err) => {
      if (!cancelled) {
        setIsEncoding(false);
        setEncodingPercent(0);
        setVideoProgress({ isGenerating: false, currentFrame: 0, message: '' });
        toast.error('Motion encoding failed: ' + err.message);
      }
    });
    return () => { cancelled = true; };
  }, [sourceImage, sourceImageMode]);

  const selectedPreset = VIDEO_PRESET_OPTIONS.find(p => p.id === videoSettings.socialPreset);

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = VIDEO_PRESET_OPTIONS.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') {
      updateVideoSettings({
        socialPreset: presetId,
        width: preset.width,
        height: preset.height,
      });
    } else {
      updateVideoSettings({ socialPreset: presetId });
    }
  }, [updateVideoSettings]);

  const handleGenerate = useCallback(async () => {
    if (!videoSettings.prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (safetySettings.contentFilterEnabled) {
      const lower = videoSettings.prompt.toLowerCase();
      const blocked = safetySettings.blockedPrompts.find(p => lower.includes(p.toLowerCase()));
      if (blocked) {
        addSafetyLog({
          id: crypto.randomUUID(),
          prompt: videoSettings.prompt,
          reason: `Blocked keyword: "${blocked}"`,
          timestamp: Date.now(),
          action: 'blocked',
        });
        toast.error(`Prompt blocked: contains "${blocked}"`);
        return;
      }
    }

    // Clean up previous blob URLs
    if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    setVideoBlobUrl(null);
    setSourceImage(null);
    setSourceImageMode(null);
    setPendingVideoMeta(null);
    setEncodingPercent(0);
    setGeneratedVideoUrl(null);
    setGeneratedVideo(null);

    if (videoSettings.generationMode === 'real') {
      const realModel = REAL_VIDEO_MODEL_OPTIONS.find(m => m.id === videoSettings.realVideoModelId) || REAL_VIDEO_MODEL_OPTIONS[0];
      setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames: 1, message: `Generating action keyframes with ${realModel.name}...` });
    } else {
      const motionModel = MOTION_SOURCE_MODEL_OPTIONS.find(m => m.id === videoSettings.modelId) || MOTION_SOURCE_MODEL_OPTIONS[0];
      setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames: 1, message: `Generating free image with ${motionModel.name} for long motion video...` });
    }

    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...videoSettings,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Video generation failed');
      }

      const data = await res.json();

      const responseIsMotion = data.mode === 'motion' || data.image_base64 || data.image_url;

      if (data.mode === 'sequence' && Array.isArray(data.image_frames)) {
        const frameUrls = data.image_frames
          .map((frame: { image_base64?: string }) => frame.image_base64)
          .filter(Boolean) as string[];
        if (!frameUrls.length) throw new Error('Action sequence completed but returned no frames.');

        setSourceImageMode('sequence');
        setSourceImage(frameUrls[0]);
        setIsEncoding(true);
        setEncodingPercent(0);
        const sequenceDuration = data.duration || videoSettings.duration;
        setVideoProgress({
          isGenerating: true,
          currentFrame: 0,
          totalFrames: sequenceDuration * videoSettings.fps,
          message: `Encoding ${frameUrls.length} action keyframes into a video...`,
        });

        const url = await encodeImageSequenceToVideo(
          frameUrls,
          data.width || videoSettings.width,
          data.height || videoSettings.height,
          sequenceDuration,
          videoSettings.fps,
          (frame, total) => {
            const percent = total > 0 ? Math.min(99, Math.round((frame / total) * 100)) : 0;
            setEncodingPercent(percent);
            setVideoProgress({
              isGenerating: true,
              currentFrame: frame,
              totalFrames: total,
              message: `Encoding action sequence ${percent}%...`,
            });
          },
        );

        setVideoBlobUrl(url);
        setGeneratedVideoUrl(url);
        setGeneratedVideo(url);
        setIsEncoding(false);
        setEncodingPercent(100);
        setVideoProgress({ isGenerating: false, currentFrame: 0, message: '' });
        addGalleryItem({
          id: crypto.randomUUID(),
          type: 'video',
          prompt: videoSettings.prompt,
          settings: { ...videoSettings },
          url,
          thumbnailUrl: frameUrls[0],
          timestamp: Date.now(),
          isNsfw: data.is_nsfw || false,
          modelUsed: data.model_used,
          provider: data.provider,
          videoUrl: url,
        });
        toast.success('Action sequence video generated!');
      } else if (responseIsMotion) {
        // Motion mode/fallback: we get an image_base64, set as sourceImage which triggers encoding
        // Backend already includes data:image/...;base64, prefix from fetchImageAsBase64
        const imageUrl = data.image_base64 || data.image_url;
        setPendingVideoMeta({
          prompt: videoSettings.prompt,
          negativePrompt: videoSettings.negativePrompt,
          settings: { ...videoSettings },
          modelUsed: data.model_used,
          provider: data.provider,
        });
        setSourceImageMode('motion');
        setSourceImage(imageUrl);
        toast.success(`Image generated! Encoding ${data.duration || videoSettings.duration}s free motion video...`);
      } else {
        // Real AI clip mode: we get actual video bytes.
        let url = data.video_url || '';
        if (data.video_base64) {
          let rawBase64 = data.video_base64;
          if (rawBase64.startsWith('data:')) {
            rawBase64 = rawBase64.split(',')[1]; // Strip data URL prefix
          }
          const byteChars = atob(rawBase64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: data.video_mime || 'video/mp4' });
          url = URL.createObjectURL(blob);
        }
        if (!url) throw new Error('Real AI video completed but no video was returned.');
        setVideoBlobUrl(url);
        setGeneratedVideoUrl(url);
        setGeneratedVideo(url);
        addGalleryItem({
          id: crypto.randomUUID(),
          type: 'video',
          prompt: videoSettings.prompt,
          settings: { ...videoSettings },
          url,
          thumbnailUrl: url,
          timestamp: Date.now(),
          isNsfw: data.is_nsfw || false,
          modelUsed: data.model_used,
          provider: data.provider,
          videoUrl: url,
        });
        toast.success(`Real AI video generated with ${data.model_used || 'AI'}!`);
      }
    } catch (err: any) {
      setIsEncoding(false);
      setEncodingPercent(0);
      toast.error(err.message || 'Video generation failed.');
      setVideoProgress({ isGenerating: false, currentFrame: 0, message: '' });
    } finally {
      // Don't clear progress yet - encoding will happen after source image generation.
    }
  }, [videoSettings, safetySettings, setVideoProgress, setGeneratedVideo, setGeneratedVideoUrl, addGalleryItem, addSafetyLog, videoBlobUrl]);

  const currentVideoUrl = videoBlobUrl || generatedVideoUrl;
  const selectedRealModel = REAL_VIDEO_MODEL_OPTIONS.find(m => m.id === videoSettings.realVideoModelId) || REAL_VIDEO_MODEL_OPTIONS[0];
  const maxSelectableDuration = videoSettings.generationMode === 'real' ? selectedRealModel.maxDuration : 60;
  const selectableDurations = (videoSettings.generationMode === 'real' ? REAL_VIDEO_DURATION_OPTIONS : DURATION_OPTIONS)
    .filter((duration) => duration <= maxSelectableDuration);
  const selectedDurationValue = selectableDurations.includes(videoSettings.duration as typeof DURATION_OPTIONS[number])
    ? `${videoSettings.duration}`
    : `${selectableDurations[selectableDurations.length - 1] || 5}`;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center">
          <Film className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Video Generation</h2>
          <p className="text-sm text-zinc-500">Create AI videos for Reels, YouTube, TikTok & more</p>
        </div>
        <Badge className="ml-auto border-0 bg-amber-600/20 text-amber-300">
          <Camera className="w-3 h-3 mr-1" /> Free · No Key
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Free Video Mode */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" /> Free Video Mode
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateVideoSettings({ generationMode: 'real', duration: Math.min(videoSettings.duration, selectedRealModel.maxDuration) })}
                  className={`text-left p-3 rounded-lg border transition-all duration-150 ${
                    videoSettings.generationMode === 'real'
                      ? 'bg-violet-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10'
                      : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-zinc-200">Action Sequence</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Multiple keyframes, no key</p>
                </button>
                <button
                  onClick={() => updateVideoSettings({ generationMode: 'motion', duration: Math.max(videoSettings.duration, 45) })}
                  className={`text-left p-3 rounded-lg border transition-all duration-150 ${
                    videoSettings.generationMode === 'motion'
                      ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-zinc-200">Long Motion</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">45-60s animated image</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Preset */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-400" /> Platform / Format
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {VIDEO_PRESET_OPTIONS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className={`text-left p-2 rounded-lg border transition-all duration-150
                      ${videoSettings.socialPreset === preset.id
                        ? 'bg-pink-600/20 border-pink-500/50 shadow-lg shadow-pink-500/10'
                        : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{preset.icon}</span>
                      <span className="text-xs font-medium text-zinc-200 truncate">{preset.name}</span>
                    </div>
                    <p className="text-[9px] text-zinc-500">{preset.aspect} · {preset.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {videoSettings.generationMode === 'real' ? (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
              <CardContent className="p-4">
                <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-violet-400" /> Action Sequence Style
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {REAL_VIDEO_MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => updateVideoSettings({ realVideoModelId: model.id, duration: Math.min(videoSettings.duration, model.maxDuration) })}
                      className={`text-left p-2.5 rounded-lg border transition-all duration-150
                        ${videoSettings.realVideoModelId === model.id
                          ? 'bg-violet-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10'
                          : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                        <Badge className={`text-[9px] px-1.5 py-0 ${BADGE_COLORS[model.badge] || 'bg-zinc-600/30 text-zinc-300'}`}>
                          {model.badge}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">{model.description}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 mt-3">
                  No-key action sequences generate several AI images in different poses, then encode them into a short clip.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Motion Source Image Model */}
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
                <CardContent className="p-4">
                  <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-amber-400" /> Source Image Model
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {MOTION_SOURCE_MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => updateVideoSettings({ modelId: model.id })}
                        className={`text-left p-2.5 rounded-lg border transition-all duration-150
                          ${videoSettings.modelId === model.id
                            ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                          <Badge className={`text-[9px] px-1.5 py-0 ${BADGE_COLORS[model.badge] || 'bg-zinc-600/30 text-zinc-300'}`}>
                            {model.badge}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">{model.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Motion Effect Selector */}
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
                <CardContent className="p-4">
                  <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" /> Motion Effect
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOTION_EFFECT_OPTIONS.map((effect) => (
                      <button
                        key={effect.id}
                        onClick={() => updateVideoSettings({ motionEffect: effect.id })}
                        className={`text-left p-2 rounded-lg border transition-all duration-150
                          ${videoSettings.motionEffect === effect.id
                            ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
                          }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm">{effect.icon}</span>
                          <span className="text-xs font-medium text-zinc-200">{effect.name}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500">{effect.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300">Prompt</Label>
                <Textarea
                  value={videoSettings.prompt}
                  onChange={(e) => updateVideoSettings({ prompt: e.target.value })}
                  placeholder="A cinematic shot of waves crashing on a tropical beach at sunset, drone camera moving forward..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">
                    Duration{videoSettings.generationMode === 'real' ? ` (action sequence max ${maxSelectableDuration}s)` : ' (long motion 45-60s)'}
                  </Label>
                  <Select value={selectedDurationValue} onValueChange={(v) => {
                    const val = Number(v);
                    updateVideoSettings({ duration: Math.min(val, maxSelectableDuration) });
                  }}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {selectableDurations.map((d) => (
                        <SelectItem key={d} value={`${d}`}>{d}s</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Frame Rate</Label>
                  <Select value={`${videoSettings.fps}`} onValueChange={(v) => updateVideoSettings({ fps: Number(v) })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {FPS_OPTIONS.map((f) => (
                        <SelectItem key={f} value={`${f}`}>{f} fps</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                {videoSettings.generationMode === 'real'
                  ? `${videoSettings.duration}s action sequence at ${videoSettings.width}x${videoSettings.height} (${selectedPreset?.aspect || 'Custom'}) · multiple generated poses`
                  : `${videoSettings.duration}s long motion video at ${videoSettings.width}x${videoSettings.height} (${selectedPreset?.aspect || 'Custom'}) · ${videoSettings.motionEffect}`}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={videoProgress.isGenerating || isEncoding}
                className={`w-full text-white font-semibold h-12 text-base shadow-lg ${
                  videoSettings.generationMode === 'real'
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-violet-500/20'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20'
                }`}
              >
                {videoProgress.isGenerating || isEncoding ? (
                  <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> {videoProgress.message || 'Encoding...'}</>
                ) : (
                  <><Film className="w-5 h-5 mr-2" /> {videoSettings.generationMode === 'real' ? 'Generate Action Sequence' : 'Generate Free 45-60s Motion Video'}</>
                )}
              </Button>

              {(videoProgress.isGenerating || isEncoding) && (
                <div className="space-y-2">
                  <Progress value={isEncoding ? encodingPercent : 50} className="h-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 text-center">
                    {isEncoding
                      ? `Encoding ${videoSettings.duration}s motion video in your browser...`
                      : videoSettings.generationMode === 'real'
                        ? 'Generating multiple action keyframes...'
                        : 'Generating free source image... 10-30 seconds'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-zinc-300 text-sm flex items-center gap-2">
                <Video className="w-4 h-4" /> Video Preview
                <Badge className={`text-[9px] border-0 ml-auto ${
                  videoSettings.generationMode === 'real'
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'bg-amber-600/20 text-amber-300'
                }`}>
                  {videoSettings.generationMode === 'real' ? 'Action Sequence' : videoSettings.motionEffect}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`rounded-xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center overflow-hidden ${
                videoSettings.height > videoSettings.width ? 'aspect-[9/16]' : 'aspect-video'
              }`}>
                {currentVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : isEncoding ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                    {sourceImage && (
                      <img src={sourceImage} alt="Source preview" className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm" />
                    )}
                    <div className="relative z-10 text-center text-zinc-300 p-6 max-w-sm">
                      <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin text-amber-400" />
                      <p className="text-sm font-medium">Encoding video, not just generating an image</p>
                      <p className="text-xs mt-1 text-zinc-500">
                        This free browser encoder records in real time, so a {videoSettings.duration}s video takes about {videoSettings.duration}s after the image is ready.
                      </p>
                      <Progress value={encodingPercent} className="h-2 mt-4" />
                      <p className="text-xs mt-2 text-amber-300">{encodingPercent}% complete - keep this tab open</p>
                    </div>
                  </div>
                ) : sourceImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={sourceImage} alt="Source" className="w-full h-full object-contain" />
                    <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-zinc-950/85 border border-amber-500/30 p-3 text-xs text-amber-200">
                      Source image is ready. If video did not start, use Chrome/Edge/Firefox and keep the tab active while encoding.
                    </div>
                  </div>
                ) : videoProgress.isGenerating ? (
                  <div className="text-center text-zinc-500 p-4">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-40" />
                    <p className="text-sm">{videoProgress.message || 'Generating video...'}</p>
                    <p className="text-xs mt-1 text-zinc-600">
                      {videoSettings.generationMode === 'real'
                        ? 'Encoding multiple generated action poses into a short video.'
                        : 'Generating free source image... 10-30 seconds'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-zinc-600">
                    <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generated video will appear here</p>
                  </div>
                )}
              </div>

              {currentVideoUrl && (
                <div className="space-y-3 mt-4">
                  <Button variant="outline" className="flex-1 border-zinc-700"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = currentVideoUrl;
                      a.download = `neuralforge-video-${Date.now()}.mp4`;
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Video
                  </Button>

                  {sourceImage && (
                    <Button variant="outline" className="w-full border-zinc-700"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = sourceImage;
                        a.download = `neuralforge-source-${Date.now()}.png`;
                        a.click();
                      }}>
                      <Download className="w-4 h-4 mr-2" /> Download Source Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Video Tips
              </h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <p><strong className="text-violet-300">Action Sequence</strong> — Use this for prompts like &quot;dog dancing&quot;; it generates several poses and stitches them into a clip.</p>
                <p><strong className="text-amber-300">Long Motion</strong> — Use this for 45-60s clips, but it animates a still image.</p>
                <p><strong className="text-emerald-300">Source image model</strong> — Try GPT Image or SeeDream if the first image is not accurate enough.</p>
                <p><strong className="text-orange-300">Motion effect</strong> — Ken Burns and Drift usually look best for long clips.</p>
                <p><strong className="text-sky-300">No API keys</strong> — True text-to-video currently needs authentication, so no-key mode uses generated keyframes.</p>
                <p><strong className="text-amber-300">Be descriptive</strong> — Describe motion and camera movement</p>
                <p><strong className="text-violet-300">Use &quot;Cinematic&quot; style</strong> — For best video results</p>
                <p><strong className="text-pink-300">For Reels/TikTok</strong> — Select the platform preset first</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── SG Growth Studio Panel ─────────────────────────────────────────────────
type GrowthSection = 'account' | 'profile' | 'characters' | 'links' | 'products' | 'planner' | 'scheduler' | 'leads' | 'video-providers';

const GROWTH_SECTIONS: { id: GrowthSection; label: string; icon: typeof Share2 }[] = [
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'profile', label: 'Brand', icon: Settings },
  { id: 'characters', label: 'Characters', icon: Star },
  { id: 'links', label: 'Links & OAuth', icon: Share2 },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'planner', label: 'Planner', icon: Wand2 },
  { id: 'scheduler', label: 'Scheduler', icon: Clock },
  { id: 'leads', label: 'Leads', icon: Database },
  { id: 'video-providers', label: 'True Video', icon: Video },
];

function buildSingaporeCaption(
  draft: Pick<CampaignDraft, 'platform' | 'contentType' | 'goal'>,
  brand: BrandProfile,
  product?: ProductItem,
  primaryLink?: string,
  character?: CharacterProfile,
): CampaignDraft {
  const productName = product?.name || 'your featured offer';
  const priceLine = product?.promoPrice
    ? `Today promo: S$${product.promoPrice}${product.price ? ` (usual S$${product.price})` : ''}.`
    : brand.offer;
  const zone = brand.singaporeZones[0] || 'Singapore';
  const cta = brand.primaryGoal === 'leads'
    ? `DM "INFO" or WhatsApp us to get details.`
    : `Tap the profile link${primaryLink ? `: ${primaryLink}` : ' or message us for details'}.`;
  const hook = brand.primaryGoal === 'leads'
    ? `Need more enquiries from ${zone}?`
    : character
      ? `${character.name} shares something worth watching in Singapore`
      : `Singapore content idea for ${productName}!`;
  const caption = [
    hook,
    character ? `${character.name}: ${character.catchphrases[0] || 'Good thing must share'}.` : '',
    `${productName} is for ${product?.targetBuyer || brand.targetAudience}.`,
    product?.benefits || brand.uniqueSellingPoint,
    priceLine,
    product?.deliveryInfo || 'Islandwide delivery available.',
    cta,
  ].filter(Boolean).join('\n\n');
  const hashtags = draft.platform === 'tiktok'
    ? ['#sgtiktok', '#singaporedeals', '#sgsmallbusiness', '#tiktokshopsg']
    : ['#singapore', '#sgbusiness', '#sgdeals', '#supportlocalsg'];

  return {
    id: crypto.randomUUID(),
    title: `${productName} ${draft.platform} ${draft.contentType}`,
    platform: draft.platform,
    contentType: draft.contentType,
    goal: draft.goal,
    hook,
    caption,
    prompt: `Create a ${draft.contentType} for ${brand.industry} in Singapore. Feature ${productName}. ${character ? `Use recurring character ${character.name}: ${character.role}. Visual: ${character.visualDescription}. Personality: ${character.personality}. Outfit: ${character.outfitStyle}. Catchphrases: ${character.catchphrases.join(', ')}. Do: ${character.doRules}. Avoid: ${character.dontRules}.` : ''} Style: ${brand.tone}. Audience: ${brand.targetAudience}. CTA: ${cta}`,
    cta,
    hashtags,
    productId: product?.id,
    characterId: character?.id,
    createdAt: Date.now(),
  };
}

function toDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizePreferredTimes(times: string[]): string[] {
  const valid = times
    .map((time) => time.trim())
    .filter((time) => /^\d{2}:\d{2}$/.test(time));
  return valid.length ? valid : ['12:30', '20:00'];
}

function GrowthStudioPanel() {
  const {
    brandProfile,
    updateBrandProfile,
    socialLinks,
    updateSocialLink,
    products,
    addProduct,
    updateProduct,
    removeProduct,
    characters,
    addCharacter,
    updateCharacter,
    removeCharacter,
    activeCharacterId,
    setActiveCharacter,
    campaignDrafts,
    addCampaignDraft,
    removeCampaignDraft,
    scheduledPosts,
    addScheduledPost,
    updateScheduledPost,
    autoScheduleSettings,
    updateAutoScheduleSettings,
    aiVideoProviderSettings,
    updateAiVideoProviderSettings,
    workspaceSession,
    updateWorkspaceSession,
    leads,
    addLead,
    updateLead,
    removeLead,
    setActiveTab,
    updateImageSettings,
    updateVideoSettings,
  } = useNeuralForgeStore();
  const [section, setSection] = useState<GrowthSection>('account');
  const [draftPlatform, setDraftPlatform] = useState<CampaignDraft['platform']>('instagram');
  const [draftType, setDraftType] = useState<CampaignDraft['contentType']>('image');
  const [draftGoal, setDraftGoal] = useState<CampaignDraft['goal']>(brandProfile.primaryGoal);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [characterForm, setCharacterForm] = useState<Omit<CharacterProfile, 'id' | 'active'>>({
    name: '',
    type: 'virtual-influencer',
    role: '',
    personality: '',
    visualDescription: '',
    outfitStyle: '',
    voiceTone: '',
    catchphrases: [],
    contentThemes: [],
    doRules: '',
    dontRules: '',
    referenceImageUrl: '',
  });
  const [productForm, setProductForm] = useState<Omit<ProductItem, 'id'>>({
    name: '',
    category: '',
    price: '',
    promoPrice: '',
    stock: '',
    benefits: '',
    targetBuyer: '',
    orderLink: '',
    deliveryInfo: 'Islandwide delivery available.',
  });
  const [leadForm, setLeadForm] = useState<Omit<LeadRecord, 'id' | 'createdAt'>>({
    name: '',
    contact: '',
    source: 'manual',
    interest: '',
    status: 'new',
    consent: false,
    consentPurpose: brandProfile.pdpaConsentPurpose,
    notes: '',
  });
  const [klingStatus, setKlingStatus] = useState<'unknown' | 'configured' | 'missing'>('unknown');
  const [klingLastTasks, setKlingLastTasks] = useState<{ order: number; title: string; taskId?: string }[]>([]);
  const [systemReadiness, setSystemReadiness] = useState<{
    supabase?: { configured: boolean; serviceConfigured: boolean };
    kling?: { configured: boolean };
    storage?: { recommendedBuckets: string[] };
  } | null>(null);

  useEffect(() => {
    const checkReadiness = async () => {
      try {
        const res = await fetch('/api/system/readiness');
        if (!res.ok) return;
        const data = await res.json();
        setSystemReadiness(data);
      } catch {}
    };
    checkReadiness();
  }, []);

  const primaryOrderLink = socialLinks.find((link) => ['shopee', 'lazada', 'tiktokShop', 'website', 'whatsapp'].includes(link.platform) && link.url)?.url || '';
  const connectedPublishingCount = socialLinks.filter((link) => ['instagram', 'facebook', 'tiktok'].includes(link.platform) && link.oauthStatus === 'connected').length;
  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0];
  const activeCharacter = characters.find((character) => character.id === activeCharacterId) || characters[0];

  const generateDraft = () => {
    const draft = buildSingaporeCaption(
      { platform: draftPlatform, contentType: draftType, goal: draftGoal },
      brandProfile,
      selectedProduct,
      selectedProduct?.orderLink || primaryOrderLink,
      activeCharacter,
    );
    addCampaignDraft(draft);
    toast.success('Singapore campaign draft generated');
    setSection('planner');
  };

  const addProductFromForm = () => {
    if (!productForm.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    const product: ProductItem = { id: crypto.randomUUID(), ...productForm };
    addProduct(product);
    setSelectedProductId(product.id);
    setProductForm({
      name: '',
      category: '',
      price: '',
      promoPrice: '',
      stock: '',
      benefits: '',
      targetBuyer: '',
      orderLink: '',
      deliveryInfo: 'Islandwide delivery available.',
    });
    toast.success('Product added');
  };

  const addCharacterFromForm = () => {
    if (!characterForm.name.trim()) {
      toast.error('Character name is required');
      return;
    }
    const character: CharacterProfile = {
      id: crypto.randomUUID(),
      active: false,
      ...characterForm,
      catchphrases: characterForm.catchphrases.filter(Boolean),
      contentThemes: characterForm.contentThemes.filter(Boolean),
    };
    addCharacter(character);
    setActiveCharacter(character.id);
    setCharacterForm({
      name: '',
      type: 'virtual-influencer',
      role: '',
      personality: '',
      visualDescription: '',
      outfitStyle: '',
      voiceTone: '',
      catchphrases: [],
      contentThemes: [],
      doRules: '',
      dontRules: '',
      referenceImageUrl: '',
    });
    toast.success('Character created and activated');
  };

  const scheduleDraft = (draft: CampaignDraft) => {
    const runAt = new Date();
    runAt.setDate(runAt.getDate() + 1);
    runAt.setHours(20, 0, 0, 0);
    const platformLink = socialLinks.find((link) => link.platform === draft.platform);
    const post: ScheduledPost = {
      id: crypto.randomUUID(),
      draftId: draft.id,
      platform: draft.platform,
      caption: `${draft.caption}\n\n${draft.hashtags.join(' ')}`,
      assetType: draft.contentType,
      scheduledFor: runAt.toISOString().slice(0, 16),
      status: platformLink?.oauthStatus === 'connected' ? 'scheduled' : 'needs-oauth',
      notes: platformLink?.oauthStatus === 'connected'
        ? 'Ready for publisher worker.'
        : 'Connect OAuth before automatic publishing. Manual link CTAs still work.',
    };
    addScheduledPost(post);
    toast.success('Draft added to scheduler');
    setSection('scheduler');
  };

  const toggleAutoPlatform = (platform: AutoScheduleSettings['activePlatforms'][number]) => {
    const active = autoScheduleSettings.activePlatforms.includes(platform);
    const nextPlatforms = active
      ? autoScheduleSettings.activePlatforms.filter((item) => item !== platform)
      : [...autoScheduleSettings.activePlatforms, platform];
    updateAutoScheduleSettings({ activePlatforms: nextPlatforms.length ? nextPlatforms : [platform] });
  };

  const generateAutoQueue = () => {
    const platforms = autoScheduleSettings.activePlatforms.length
      ? autoScheduleSettings.activePlatforms
      : ['tiktok', 'instagram', 'facebook'] as AutoScheduleSettings['activePlatforms'];
    const times = normalizePreferredTimes(autoScheduleSettings.preferredTimes);
    const videoDrafts = campaignDrafts.filter((draft) => draft.contentType === 'video');
    const imageDrafts = campaignDrafts.filter((draft) => draft.contentType === 'image' || draft.contentType === 'carousel');
    const postsToAdd: ScheduledPost[] = [];

    if (autoScheduleSettings.videosPerDay > 0 && videoDrafts.length === 0) {
      toast.error('Create at least one video campaign draft before auto-scheduling videos.');
      return;
    }
    if (autoScheduleSettings.imagesPerDay > 0 && imageDrafts.length === 0) {
      toast.error('Create at least one image/carousel campaign draft before auto-scheduling images.');
      return;
    }

    let platformCursor = 0;
    let timeCursor = 0;
    const createPost = (draft: CampaignDraft, dayOffset: number, slotIndex: number) => {
      const platform = autoScheduleSettings.rotatePlatforms
        ? platforms[platformCursor++ % platforms.length]
        : draft.platform;
      const [hours, minutes] = times[timeCursor++ % times.length].split(':').map(Number);
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + dayOffset);
      scheduledAt.setHours(hours, minutes + slotIndex * 3, 0, 0);
      const platformLink = socialLinks.find((link) => link.platform === platform);
      const oauthReady = platformLink?.oauthStatus === 'connected';

      postsToAdd.push({
        id: crypto.randomUUID(),
        draftId: draft.id,
        platform,
        caption: `${draft.caption}\n\n${draft.hashtags.join(' ')}`,
        assetType: draft.contentType,
        scheduledFor: toDateTimeLocal(scheduledAt),
        status: oauthReady && !autoScheduleSettings.requireApprovalBeforePublish ? 'scheduled' : 'needs-oauth',
        notes: oauthReady
          ? autoScheduleSettings.requireApprovalBeforePublish
            ? 'Auto-planned. Review/approve before publisher worker sends it.'
            : 'Auto-planned and ready for publisher worker.'
          : 'Auto-planned. Connect OAuth before automatic publishing; manual CTA links remain usable.',
      });
    };

    for (let day = 1; day <= autoScheduleSettings.daysToPlan; day++) {
      for (let i = 0; i < autoScheduleSettings.videosPerDay; i++) {
        createPost(videoDrafts[(day + i - 1) % videoDrafts.length], day, i);
      }
      for (let i = 0; i < autoScheduleSettings.imagesPerDay; i++) {
        createPost(imageDrafts[(day + i - 1) % imageDrafts.length], day, autoScheduleSettings.videosPerDay + i);
      }
    }

    postsToAdd.reverse().forEach(addScheduledPost);
    toast.success(`Auto-scheduled ${postsToAdd.length} posts across ${platforms.length} platform(s)`);
    setSection('scheduler');
  };

  const sendDraftToGenerator = (draft: CampaignDraft) => {
    if (draft.contentType === 'image' || draft.contentType === 'carousel') {
      updateImageSettings({
        prompt: draft.prompt,
        style: 'Social Media',
        width: draft.platform === 'instagram' ? 1024 : 768,
        height: draft.platform === 'instagram' ? 1024 : 1344,
      });
      setActiveTab('image');
    } else {
      updateVideoSettings({
        prompt: draft.prompt,
        socialPreset: draft.platform === 'tiktok' ? 'tiktok' : draft.platform === 'instagram' ? 'instagram-reel' : 'facebook-reel',
        generationMode: aiVideoProviderSettings.trueMotionEnabled ? 'real' : 'motion',
      });
      setActiveTab('video');
    }
    toast.success('Draft sent to generator');
  };

  const addLeadFromForm = () => {
    if (!leadForm.name.trim() || !leadForm.contact.trim()) {
      toast.error('Lead name and contact are required');
      return;
    }
    addLead({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...leadForm,
      consentPurpose: leadForm.consentPurpose || brandProfile.pdpaConsentPurpose,
    });
    setLeadForm({
      name: '',
      contact: '',
      source: 'manual',
      interest: '',
      status: 'new',
      consent: false,
      consentPurpose: brandProfile.pdpaConsentPurpose,
      notes: '',
    });
    toast.success('Lead captured');
  };

  const estimateKlingCost = (
    targetDuration = aiVideoProviderSettings.targetDurationSeconds,
    mode = aiVideoProviderSettings.klingMode,
    resolution = aiVideoProviderSettings.klingResolution,
  ) => {
    const priceTable: Record<string, number> = {
      'standard:720p': 0.075,
      'standard:1080p': 0.1,
      'professional:720p': 0.1125,
      'professional:1080p': 0.15,
    };
    const unit = priceTable[`${mode}:${resolution}`] || priceTable['standard:720p'];
    return (targetDuration * unit).toFixed(2);
  };

  const rebuildKlingScenes = (
    targetDuration = aiVideoProviderSettings.targetDurationSeconds,
    sceneLength = aiVideoProviderSettings.sceneLengthSeconds,
  ) => {
    const sceneCount = Math.ceil(targetDuration / sceneLength);
    const templates = ['Hook', 'Problem', 'Product', 'Benefits', 'Proof', 'CTA', 'Objection', 'Offer', 'Final CTA'];
    const scenes = Array.from({ length: sceneCount }, (_, index) => {
      const title = templates[index] || `Scene ${index + 1}`;
      return {
        id: crypto.randomUUID(),
        order: index + 1,
        duration: sceneLength,
        title,
        prompt: `${title} scene for ${brandProfile.businessName}: ${brandProfile.offer}. Organic Singapore social content, not a hard-sell ad. ${activeCharacter ? `Feature recurring character ${activeCharacter.name}: ${activeCharacter.visualDescription}, ${activeCharacter.personality}, ${activeCharacter.outfitStyle}.` : ''} Clear subject motion, vertical social video, compelling ${brandProfile.primaryGoal} CTA to profile link or DM.`,
        status: 'planned' as const,
      };
    });
    updateAiVideoProviderSettings({
      targetDurationSeconds: targetDuration,
      sceneLengthSeconds: sceneLength,
      estimatedCostUsd: estimateKlingCost(targetDuration),
      scenePlan: scenes,
    });
  };

  const updateKlingScenePrompt = (sceneId: string, prompt: string) => {
    updateAiVideoProviderSettings({
      scenePlan: aiVideoProviderSettings.scenePlan.map((scene) =>
        scene.id === sceneId ? { ...scene, prompt } : scene
      ),
    });
  };

  const checkKlingProvider = async () => {
    try {
      const res = await fetch('/api/providers/kling');
      const data = await res.json();
      setKlingStatus(data.configured ? 'configured' : 'missing');
      toast[data.configured ? 'success' : 'info'](data.note || 'Kling provider checked');
    } catch (error: any) {
      setKlingStatus('missing');
      toast.error(error.message || 'Unable to check Kling provider');
    }
  };

  const submitKlingPlan = async () => {
    try {
      const res = await fetch('/api/providers/kling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: aiVideoProviderSettings.klingMode,
          resolution: aiVideoProviderSettings.klingResolution,
          scenes: aiVideoProviderSettings.scenePlan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setKlingStatus('missing');
        toast.error(data.detail || 'Kling provider is not configured');
        return;
      }
      setKlingStatus('configured');
      toast.success(data.detail || 'Kling plan is ready for provider adapter');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit Kling plan');
    }
  };

  const submitPaidKlingJobs = async () => {
    const confirmed = window.confirm(
      `Submit ${aiVideoProviderSettings.scenePlan.length} paid Kling scene jobs now? Estimated raw provider cost is about US$${aiVideoProviderSettings.estimatedCostUsd}.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/providers/kling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: aiVideoProviderSettings.klingMode,
          resolution: aiVideoProviderSettings.klingResolution,
          scenes: aiVideoProviderSettings.scenePlan,
          confirmSpend: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || 'Kling paid job submission failed');
        return;
      }
      setKlingStatus('configured');
      setKlingLastTasks(data.tasks || []);
      toast.success('Kling scene jobs submitted. Task IDs saved below.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit paid Kling jobs');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">SG Growth Studio</h2>
          <p className="text-sm text-zinc-500">Singapore organic content planner, recurring characters, links, scheduling and leads</p>
        </div>
        <Badge className="ml-auto bg-emerald-600/20 text-emerald-300 border-0">
          {connectedPublishingCount} OAuth connected
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {GROWTH_SECTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all ${
              section === item.id
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </div>

      {section === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Workspace Login Readiness</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>User Name</Label>
                  <Input value={workspaceSession.userName} onChange={(e) => updateWorkspaceSession({ userName: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={workspaceSession.email} onChange={(e) => updateWorkspaceSession({ email: e.target.value })} placeholder="owner@example.com" className="bg-zinc-800/50 border-zinc-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Workspace Name</Label>
                <Input value={workspaceSession.workspaceName} onChange={(e) => updateWorkspaceSession({ workspaceName: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Auth Provider</Label>
                  <Select value={workspaceSession.authProvider} onValueChange={(value: typeof workspaceSession.authProvider) => updateWorkspaceSession({ authProvider: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['local-preview', 'supabase', 'authjs'].map((provider) => <SelectItem key={provider} value={provider}>{provider}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={workspaceSession.role} onValueChange={(value: typeof workspaceSession.role) => updateWorkspaceSession({ role: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['owner', 'marketer', 'viewer'].map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => {
                  updateWorkspaceSession({ isLoggedIn: !workspaceSession.isLoggedIn });
                  toast.success(workspaceSession.isLoggedIn ? 'Preview user signed out' : 'Preview user signed in');
                }}
                className={workspaceSession.isLoggedIn ? 'w-full bg-zinc-700 hover:bg-zinc-600' : 'w-full bg-emerald-600 hover:bg-emerald-500'}
              >
                {workspaceSession.isLoggedIn ? 'Sign Out Preview User' : 'Sign In Preview User'}
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Production Auth Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500">Supabase</p>
                  <p className={systemReadiness?.supabase?.configured ? 'text-emerald-300' : 'text-amber-300'}>
                    {systemReadiness?.supabase?.configured ? 'Client configured' : 'Needs env vars'}
                  </p>
                  <p className={systemReadiness?.supabase?.serviceConfigured ? 'text-emerald-300 text-xs' : 'text-zinc-500 text-xs'}>
                    {systemReadiness?.supabase?.serviceConfigured ? 'Service role ready' : 'Service role pending'}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500">Kling</p>
                  <p className={systemReadiness?.kling?.configured ? 'text-emerald-300' : 'text-amber-300'}>
                    {systemReadiness?.kling?.configured ? 'Credentials ready' : 'Needs credentials'}
                  </p>
                  <p className="text-xs text-zinc-500">Server-side only</p>
                </div>
              </div>
              <p><strong className="text-emerald-300">1. User auth:</strong> Add Supabase Auth or Auth.js for real accounts.</p>
              <p><strong className="text-cyan-300">2. Database:</strong> Move workspace, products, drafts, leads and schedules from local state to Postgres.</p>
              <p><strong className="text-violet-300">3. Social OAuth:</strong> Store Meta/TikTok tokens server-side only after user authorization.</p>
              <p><strong className="text-amber-300">4. Scheduler worker:</strong> Use a cron/queue worker to publish scheduled posts reliably.</p>
              <p><strong className="text-pink-300">5. Storage buckets:</strong> {systemReadiness?.storage?.recommendedBuckets?.join(', ') || 'media-assets, kling-clips, post-thumbnails'}.</p>
              <Separator className="bg-zinc-800" />
              <p className="text-xs text-zinc-500">This panel is a safe frontend foundation; it does not collect social passwords or expose API keys.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {section === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Business Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={brandProfile.businessName} onChange={(e) => updateBrandProfile({ businessName: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={brandProfile.industry} onChange={(e) => updateBrandProfile({ industry: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea value={brandProfile.targetAudience} onChange={(e) => updateBrandProfile({ targetAudience: e.target.value })} className="bg-zinc-800/50 border-zinc-700 min-h-[70px]" />
              </div>
              <div className="space-y-2">
                <Label>Offer / USP</Label>
                <Textarea value={`${brandProfile.offer}\n${brandProfile.uniqueSellingPoint}`} onChange={(e) => {
                  const [offer, ...usp] = e.target.value.split('\n');
                  updateBrandProfile({ offer, uniqueSellingPoint: usp.join('\n') });
                }} className="bg-zinc-800/50 border-zinc-700 min-h-[90px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={brandProfile.tone} onValueChange={(value: BrandProfile['tone']) => updateBrandProfile({ tone: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['professional', 'friendly', 'singlish-light', 'premium', 'urgent'].map((tone) => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select value={brandProfile.primaryGoal} onValueChange={(value: BrandProfile['primaryGoal']) => updateBrandProfile({ primaryGoal: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['leads', 'awareness', 'engagement', 'ecommerce'].map((goal) => <SelectItem key={goal} value={goal}>{goal}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Singapore + PDPA Setup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Singapore Zones</Label>
                <Input value={brandProfile.singaporeZones.join(', ')} onChange={(e) => updateBrandProfile({ singaporeZones: e.target.value.split(',').map((zone) => zone.trim()).filter(Boolean) })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input value={brandProfile.whatsappNumber} onChange={(e) => updateBrandProfile({ whatsappNumber: e.target.value })} placeholder="+65..." className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>PDPA Consent Purpose</Label>
                <Textarea value={brandProfile.pdpaConsentPurpose} onChange={(e) => updateBrandProfile({ pdpaConsentPurpose: e.target.value })} className="bg-zinc-800/50 border-zinc-700 min-h-[100px]" />
              </div>
              <div className="rounded-lg bg-amber-600/10 border border-amber-600/30 p-3 text-xs text-amber-200">
                Lead forms should keep consent unchecked by default, record timestamp/source, and include opt-out instructions before marketing follow-up.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {section === 'characters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Create Recurring Character</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={characterForm.name} onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })} placeholder="Character name" className="bg-zinc-800/50 border-zinc-700" />
                <Select value={characterForm.type} onValueChange={(value: CharacterProfile['type']) => setCharacterForm({ ...characterForm, type: value })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {['mascot', 'founder-avatar', 'virtual-influencer', 'customer-persona', 'product-character'].map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea value={characterForm.role} onChange={(e) => setCharacterForm({ ...characterForm, role: e.target.value })} placeholder="Role in content, e.g. SG deal hunter / founder / customer persona" className="bg-zinc-800/50 border-zinc-700 min-h-[70px]" />
              <Textarea value={characterForm.personality} onChange={(e) => setCharacterForm({ ...characterForm, personality: e.target.value })} placeholder="Personality" className="bg-zinc-800/50 border-zinc-700 min-h-[70px]" />
              <Textarea value={characterForm.visualDescription} onChange={(e) => setCharacterForm({ ...characterForm, visualDescription: e.target.value })} placeholder="Visual description for image/Kling prompts" className="bg-zinc-800/50 border-zinc-700 min-h-[80px]" />
              <div className="grid grid-cols-2 gap-3">
                <Input value={characterForm.outfitStyle} onChange={(e) => setCharacterForm({ ...characterForm, outfitStyle: e.target.value })} placeholder="Outfit/style" className="bg-zinc-800/50 border-zinc-700" />
                <Input value={characterForm.voiceTone} onChange={(e) => setCharacterForm({ ...characterForm, voiceTone: e.target.value })} placeholder="Voice/tone" className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <Input value={characterForm.catchphrases.join(', ')} onChange={(e) => setCharacterForm({ ...characterForm, catchphrases: e.target.value.split(',').map((item) => item.trim()) })} placeholder="Catchphrases, comma separated" className="bg-zinc-800/50 border-zinc-700" />
              <Input value={characterForm.contentThemes.join(', ')} onChange={(e) => setCharacterForm({ ...characterForm, contentThemes: e.target.value.split(',').map((item) => item.trim()) })} placeholder="Content themes, comma separated" className="bg-zinc-800/50 border-zinc-700" />
              <Input value={characterForm.referenceImageUrl} onChange={(e) => setCharacterForm({ ...characterForm, referenceImageUrl: e.target.value })} placeholder="Reference image URL (optional)" className="bg-zinc-800/50 border-zinc-700" />
              <Textarea value={characterForm.doRules} onChange={(e) => setCharacterForm({ ...characterForm, doRules: e.target.value })} placeholder="Do rules" className="bg-zinc-800/50 border-zinc-700 min-h-[60px]" />
              <Textarea value={characterForm.dontRules} onChange={(e) => setCharacterForm({ ...characterForm, dontRules: e.target.value })} placeholder="Don't rules / brand safety" className="bg-zinc-800/50 border-zinc-700 min-h-[60px]" />
              <Button onClick={addCharacterFromForm} className="w-full bg-violet-600 hover:bg-violet-500"><Star className="w-4 h-4 mr-2" /> Create Character</Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {characters.map((character) => (
              <Card key={character.id} className={`bg-zinc-900/50 border ${character.id === activeCharacterId ? 'border-violet-500/60' : 'border-zinc-800'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-violet-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input value={character.name} onChange={(e) => updateCharacter(character.id, { name: e.target.value })} className="bg-transparent border-0 p-0 h-auto text-zinc-100 font-semibold" />
                        <Badge className="bg-violet-600/20 text-violet-300 border-0">{character.type}</Badge>
                        {character.id === activeCharacterId && <Badge className="bg-emerald-600/20 text-emerald-300 border-0">active</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{character.role}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-zinc-700" onClick={() => setActiveCharacter(character.id)}>Use</Button>
                    <Button variant="ghost" size="sm" onClick={() => removeCharacter(character.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </div>
                  <Textarea value={character.visualDescription} onChange={(e) => updateCharacter(character.id, { visualDescription: e.target.value })} className="bg-zinc-800/50 border-zinc-700 min-h-[70px] text-xs" />
                  <div className="flex flex-wrap gap-1">
                    {character.catchphrases.map((phrase) => (
                      <Badge key={phrase} className="text-[9px] bg-zinc-800 text-zinc-300 border-0">{phrase}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {socialLinks.map((link) => (
            <Card key={link.platform} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{link.label}</p>
                    <p className="text-[10px] text-zinc-500">{link.oauthStatus === 'connected' ? 'OAuth connected' : link.oauthStatus === 'manual-link' ? 'Manual link / CTA ready' : 'OAuth setup required for auto-posting'}</p>
                  </div>
                  <Badge className={`ml-auto border-0 ${link.url ? 'bg-emerald-600/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>{link.url ? 'Link set' : 'No link'}</Badge>
                </div>
                <Input value={link.url} onChange={(e) => updateSocialLink(link.platform, { url: e.target.value, connected: !!e.target.value })} placeholder={`Paste ${link.label} URL`} className="bg-zinc-800/50 border-zinc-700" />
                {['instagram', 'facebook', 'tiktok'].includes(link.platform) && (
                  <Button variant="outline" className="w-full border-zinc-700" onClick={() => {
                    updateSocialLink(link.platform, { oauthStatus: 'pending-review' });
                    toast.info('OAuth connection requires registered Meta/TikTok developer app credentials and approval.');
                  }}>
                    Prepare OAuth Connection
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Add Offer / Link Topic</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" className="bg-zinc-800/50 border-zinc-700" />
                <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="Category" className="bg-zinc-800/50 border-zinc-700" />
                <Input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="Price" className="bg-zinc-800/50 border-zinc-700" />
                <Input value={productForm.promoPrice} onChange={(e) => setProductForm({ ...productForm, promoPrice: e.target.value })} placeholder="Promo price" className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <Textarea value={productForm.benefits} onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })} placeholder="Benefits / pain points solved" className="bg-zinc-800/50 border-zinc-700 min-h-[80px]" />
              <Input value={productForm.orderLink} onChange={(e) => setProductForm({ ...productForm, orderLink: e.target.value })} placeholder="Shopee/Lazada/TikTok Shop/order link" className="bg-zinc-800/50 border-zinc-700" />
              <Button onClick={addProductFromForm} className="w-full bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Box className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div className="flex-1">
                      <Input value={product.name} onChange={(e) => updateProduct(product.id, { name: e.target.value })} className="bg-transparent border-0 p-0 h-auto text-zinc-100 font-semibold" />
                      <p className="text-xs text-zinc-500 mt-1">{product.category} · S${product.promoPrice || product.price} · Stock {product.stock || 'n/a'}</p>
                      <p className="text-xs text-zinc-400 mt-2">{product.benefits}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Generate Singapore Campaign Draft</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Select value={draftPlatform} onValueChange={(value: CampaignDraft['platform']) => setDraftPlatform(value)}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">{['instagram', 'facebook', 'tiktok'].map((platform) => <SelectItem key={platform} value={platform}>{platform}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={draftType} onValueChange={(value: CampaignDraft['contentType']) => setDraftType(value)}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">{['image', 'video', 'carousel'].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={draftGoal} onValueChange={(value: CampaignDraft['goal']) => setDraftGoal(value)}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">{['leads', 'awareness', 'engagement', 'ecommerce'].map((goal) => <SelectItem key={goal} value={goal}>{goal}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={generateDraft} className="w-full bg-violet-600 hover:bg-violet-500"><Wand2 className="w-4 h-4 mr-2" /> Generate Draft</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {campaignDrafts.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500">No drafts yet. Generate one from your Singapore brand/product profile.</CardContent></Card>
            ) : campaignDrafts.map((draft) => (
              <Card key={draft.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-violet-600/20 text-violet-300 border-0">{draft.platform}</Badge>
                    <Badge className="bg-amber-600/20 text-amber-300 border-0">{draft.goal}</Badge>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => removeCampaignDraft(draft.id)}><X className="w-4 h-4" /></Button>
                  </div>
                  <p className="font-semibold text-zinc-200">{draft.hook}</p>
                  <Textarea value={`${draft.caption}\n\n${draft.hashtags.join(' ')}`} readOnly className="bg-zinc-800/50 border-zinc-700 min-h-[160px] text-xs" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => scheduleDraft(draft)} className="bg-emerald-600 hover:bg-emerald-500"><Clock className="w-4 h-4 mr-2" /> Schedule</Button>
                    <Button size="sm" variant="outline" className="border-zinc-700" onClick={() => sendDraftToGenerator(draft)}><Sparkles className="w-4 h-4 mr-2" /> Generate Asset</Button>
                    <Button size="sm" variant="outline" className="border-zinc-700" onClick={() => navigator.clipboard?.writeText(`${draft.caption}\n\n${draft.hashtags.join(' ')}`)}><Copy className="w-4 h-4 mr-2" /> Copy</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === 'scheduler' && (
        <div className="space-y-3">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Auto Posting Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Videos / day</Label>
                  <Input
                    type="number"
                    min={0}
                    value={autoScheduleSettings.videosPerDay}
                    onChange={(e) => updateAutoScheduleSettings({ videosPerDay: Math.max(0, Number(e.target.value || 0)) })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Images / day</Label>
                  <Input
                    type="number"
                    min={0}
                    value={autoScheduleSettings.imagesPerDay}
                    onChange={(e) => updateAutoScheduleSettings({ imagesPerDay: Math.max(0, Number(e.target.value || 0)) })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Days to plan</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={autoScheduleSettings.daysToPlan}
                    onChange={(e) => updateAutoScheduleSettings({ daysToPlan: Math.min(30, Math.max(1, Number(e.target.value || 1))) })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred times</Label>
                  <Input
                    value={autoScheduleSettings.preferredTimes.join(', ')}
                    onChange={(e) => updateAutoScheduleSettings({ preferredTimes: e.target.value.split(',').map((time) => time.trim()).filter(Boolean) })}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['tiktok', 'instagram', 'facebook'] as AutoScheduleSettings['activePlatforms']).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => toggleAutoPlatform(platform)}
                    className={`px-3 py-2 rounded-lg border text-xs capitalize ${
                      autoScheduleSettings.activePlatforms.includes(platform)
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                        : 'bg-zinc-800/40 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-center rounded-lg border border-zinc-800 p-3">
                <div className="text-xs text-zinc-500">
                  Example: 2 videos/day for 7 days across TikTok, Instagram, Facebook creates 14 scheduled video slots. Posts stay as <span className="text-amber-300">needs-oauth</span> until the platform account is connected and approved.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-zinc-700" onClick={() => updateAutoScheduleSettings({ rotatePlatforms: !autoScheduleSettings.rotatePlatforms })}>
                    {autoScheduleSettings.rotatePlatforms ? 'Rotating platforms' : 'Draft platform only'}
                  </Button>
                  <Button onClick={generateAutoQueue} className="bg-emerald-600 hover:bg-emerald-500"><Clock className="w-4 h-4 mr-2" /> Generate Auto Queue</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {scheduledPosts.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500">No scheduled posts yet. Schedule a campaign draft first.</CardContent></Card>
          ) : scheduledPosts.map((post) => (
            <Card key={post.id} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_220px_140px] gap-4 items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-cyan-600/20 text-cyan-300 border-0">{post.platform}</Badge>
                    <Badge className={`border-0 ${post.status === 'scheduled' ? 'bg-emerald-600/20 text-emerald-300' : 'bg-amber-600/20 text-amber-300'}`}>{post.status}</Badge>
                  </div>
                  <p className="text-sm text-zinc-300 whitespace-pre-line">{post.caption}</p>
                  <p className="text-xs text-zinc-500 mt-2">{post.notes}</p>
                </div>
                <Input type="datetime-local" value={post.scheduledFor} onChange={(e) => updateScheduledPost(post.id, { scheduledFor: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
                <Button variant="outline" className="border-zinc-700" onClick={() => toast.info('Publishing worker will be enabled after OAuth credentials and app review are configured.')}>Publish Check</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === 'leads' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Capture Lead</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Lead name" className="bg-zinc-800/50 border-zinc-700" />
                <Input value={leadForm.contact} onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })} placeholder="Phone / email / handle" className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={leadForm.source} onValueChange={(value: LeadRecord['source']) => setLeadForm({ ...leadForm, source: value })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {['instagram', 'facebook', 'tiktok', 'whatsapp', 'website', 'manual'].map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={leadForm.status} onValueChange={(value: LeadRecord['status']) => setLeadForm({ ...leadForm, status: value })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {['new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea value={leadForm.interest} onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })} placeholder="What are they interested in?" className="bg-zinc-800/50 border-zinc-700 min-h-[70px]" />
              <Textarea value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Follow-up notes" className="bg-zinc-800/50 border-zinc-700 min-h-[70px]" />
              <div className="flex items-start gap-3 rounded-lg border border-zinc-800 p-3">
                <Switch checked={leadForm.consent} onCheckedChange={(checked) => setLeadForm({ ...leadForm, consent: checked })} />
                <div>
                  <p className="text-sm text-zinc-200">Marketing consent recorded</p>
                  <p className="text-xs text-zinc-500">{leadForm.consentPurpose || brandProfile.pdpaConsentPurpose}</p>
                </div>
              </div>
              <Button onClick={addLeadFromForm} className="w-full bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Add Lead</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500">No leads yet. Capture enquiries from DMs, WhatsApp, forms or comments.</CardContent></Card>
            ) : leads.map((lead) => (
              <Card key={lead.id} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-200">{lead.name}</p>
                        <Badge className="bg-cyan-600/20 text-cyan-300 border-0">{lead.source}</Badge>
                        <Badge className={`border-0 ${lead.consent ? 'bg-emerald-600/20 text-emerald-300' : 'bg-amber-600/20 text-amber-300'}`}>{lead.consent ? 'consent' : 'no consent'}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{lead.contact}</p>
                      <p className="text-xs text-zinc-400 mt-2">{lead.interest}</p>
                      <div className="flex gap-2 mt-3">
                        {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadRecord['status'][]).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateLead(lead.id, { status })}
                            className={`px-2 py-1 rounded text-[10px] ${lead.status === status ? 'bg-emerald-600/30 text-emerald-200' : 'bg-zinc-800 text-zinc-500'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeLead(lead.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === 'video-providers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">True AI Motion Provider Strategy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Preferred Provider</Label>
                  <Select value={aiVideoProviderSettings.preferredProvider} onValueChange={(value: AiVideoProviderSettings['preferredProvider']) => updateAiVideoProviderSettings({ preferredProvider: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">{['kling', 'replicate', 'fal', 'seedance'].map((provider) => <SelectItem key={provider} value={provider}>{provider}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Mode</Label>
                  <Select value={aiVideoProviderSettings.budgetMode} onValueChange={(value: AiVideoProviderSettings['budgetMode']) => updateAiVideoProviderSettings({ budgetMode: value })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">{['draft', 'standard', 'premium'].map((mode) => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly AI Video Budget (SGD)</Label>
                <Input value={aiVideoProviderSettings.monthlyBudgetSgd} onChange={(e) => updateAiVideoProviderSettings({ monthlyBudgetSgd: e.target.value })} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Target Video Length</Label>
                  <Select value={`${aiVideoProviderSettings.targetDurationSeconds}`} onValueChange={(value) => rebuildKlingScenes(Number(value) as 15 | 30 | 60 | 90, aiVideoProviderSettings.sceneLengthSeconds)}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {[15, 30, 60, 90].map((duration) => <SelectItem key={duration} value={`${duration}`}>{duration}s</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Scene Length</Label>
                  <Select value={`${aiVideoProviderSettings.sceneLengthSeconds}`} onValueChange={(value) => rebuildKlingScenes(aiVideoProviderSettings.targetDurationSeconds, Number(value) as 5 | 10)}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {[5, 10].map((duration) => <SelectItem key={duration} value={`${duration}`}>{duration}s scenes</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kling Mode</Label>
                  <Select value={aiVideoProviderSettings.klingMode} onValueChange={(value: AiVideoProviderSettings['klingMode']) => updateAiVideoProviderSettings({ klingMode: value, estimatedCostUsd: estimateKlingCost(aiVideoProviderSettings.targetDurationSeconds, value, aiVideoProviderSettings.klingResolution) })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['standard', 'professional'].map((mode) => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={aiVideoProviderSettings.klingResolution} onValueChange={(value: AiVideoProviderSettings['klingResolution']) => updateAiVideoProviderSettings({ klingResolution: value, estimatedCostUsd: estimateKlingCost(aiVideoProviderSettings.targetDurationSeconds, aiVideoProviderSettings.klingMode, value) })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['720p', '1080p'].map((resolution) => <SelectItem key={resolution} value={resolution}>{resolution}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-600/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-violet-200">Kling long-form plan</p>
                    <p className="text-xs text-zinc-400">
                      {aiVideoProviderSettings.scenePlan.length} scenes x {aiVideoProviderSettings.sceneLengthSeconds}s = {aiVideoProviderSettings.targetDurationSeconds}s target
                    </p>
                  </div>
                  <Badge className="bg-violet-600/30 text-violet-200 border-0">Est. US${aiVideoProviderSettings.estimatedCostUsd}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button variant="outline" className="border-zinc-700" onClick={checkKlingProvider}>Check Kling Key</Button>
                  <Button className="bg-violet-600 hover:bg-violet-500" onClick={submitKlingPlan}>Submit Plan Check</Button>
                </div>
                <Button
                  className="w-full mt-2 bg-pink-600 hover:bg-pink-500"
                  onClick={submitPaidKlingJobs}
                  disabled={!aiVideoProviderSettings.trueMotionEnabled}
                >
                  Submit Paid Kling Scene Jobs
                </Button>
                <p className={`text-[10px] mt-2 ${klingStatus === 'configured' ? 'text-emerald-300' : klingStatus === 'missing' ? 'text-amber-300' : 'text-zinc-500'}`}>
                  Status: {klingStatus === 'unknown' ? 'not checked' : klingStatus === 'configured' ? 'Kling access/secret keys detected server-side' : 'Kling access/secret keys missing server-side'}
                </p>
                {klingLastTasks.length > 0 && (
                  <div className="mt-3 rounded-lg bg-zinc-950/60 border border-zinc-800 p-3 space-y-1">
                    <p className="text-xs font-semibold text-zinc-300">Last submitted Kling tasks</p>
                    {klingLastTasks.map((task) => (
                      <p key={`${task.order}-${task.taskId || task.title}`} className="text-[10px] text-zinc-500">
                        Scene {task.order} {task.title}: {task.taskId || 'task id pending in provider response'}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                <div>
                  <p className="text-sm text-zinc-200">Require approval before spending credits</p>
                  <p className="text-xs text-zinc-500">Prevents accidental true-video costs.</p>
                </div>
                <Switch checked={aiVideoProviderSettings.requireApprovalBeforeSpend} onCheckedChange={(checked) => updateAiVideoProviderSettings({ requireApprovalBeforeSpend: checked })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                <div>
                  <p className="text-sm text-zinc-200">Enable paid true AI motion video</p>
                  <p className="text-xs text-zinc-500">Needs provider API key configured server-side.</p>
                </div>
                <Switch checked={aiVideoProviderSettings.trueMotionEnabled} onCheckedChange={(checked) => updateAiVideoProviderSettings({ trueMotionEnabled: checked })} />
              </div>
              <div className="space-y-2">
                <Label>Kling Scene Plan</Label>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {aiVideoProviderSettings.scenePlan.map((scene) => (
                    <div key={scene.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-zinc-800 text-zinc-300 border-0">#{scene.order}</Badge>
                        <Input
                          value={scene.title}
                          onChange={(e) => updateAiVideoProviderSettings({
                            scenePlan: aiVideoProviderSettings.scenePlan.map((item) => item.id === scene.id ? { ...item, title: e.target.value } : item),
                          })}
                          className="bg-transparent border-0 p-0 h-auto text-sm font-semibold text-zinc-200"
                        />
                        <Badge className="ml-auto bg-amber-600/20 text-amber-300 border-0">{scene.duration}s</Badge>
                      </div>
                      <Textarea
                        value={scene.prompt}
                        onChange={(e) => updateKlingScenePrompt(scene.id, e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 min-h-[70px] text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader><CardTitle className="text-sm text-zinc-300">Value-for-Money Routing</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <p><strong className="text-emerald-300">Primary:</strong> Kling is now the main provider for 60-90s true-motion workflows.</p>
              <p><strong className="text-cyan-300">Method:</strong> Generate 5s/10s scenes, extend or stitch them into a 60s/90s final video.</p>
              <p><strong className="text-violet-300">Premium:</strong> Seedance/Runway remain optional hero-campaign fallbacks after Kling is stable.</p>
              <Separator className="bg-zinc-800" />
              <p className="text-xs text-zinc-500">Production implementation should keep API keys server-side, estimate clip cost before generation, and deduct app credits only after the user approves spend.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Gallery Panel ────────────────────────────────────────────────────────────
function GalleryPanel() {
  const { gallery, removeGalleryItem, galleryFilter, setGalleryFilter, gallerySearch, setGallerySearch } = useNeuralForgeStore();

  const filtered = gallery.filter(item => {
    if (galleryFilter !== 'all' && item.type !== galleryFilter) return false;
    if (gallerySearch && !item.prompt.toLowerCase().includes(gallerySearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Gallery</h2>
          <p className="text-sm text-zinc-500">{gallery.length} generations</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-1">
          {(['all', 'image', 'video'] as const).map((f) => (
            <button key={f} onClick={() => setGalleryFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${galleryFilter === f ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input value={gallerySearch} onChange={(e) => setGallerySearch(e.target.value)}
            placeholder="Search gallery..." className="bg-zinc-900/50 border-zinc-800 pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-zinc-600 py-20">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No generations yet</p>
          <p className="text-xs mt-1 text-zinc-700">Generate images or videos to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800">
              <div className={`flex items-center justify-center ${item.type === 'video' ? 'aspect-video' : 'aspect-square'}`}>
                <img src={item.thumbnailUrl} alt={item.prompt} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-3 w-full">
                  <p className="text-xs text-zinc-200 truncate">{item.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[8px] bg-violet-600/30 text-violet-300 border-0">{item.modelUsed}</Badge>
                    <Badge className={`text-[8px] border-0 ${item.type === 'video' ? 'bg-amber-600/30 text-amber-300' : 'bg-cyan-600/30 text-cyan-300'}`}>{item.type}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-zinc-400 hover:text-red-400 p-0"
                      onClick={() => removeGalleryItem(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-zinc-400 hover:text-white p-0"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = item.url;
                        a.download = `neuralforge-${Date.now()}.${item.type === 'video' ? 'webm' : 'png'}`;
                        a.click();
                      }}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Models Panel ─────────────────────────────────────────────────────────────
function ModelsPanel() {
  const { models, activateModel, updateModel } = useNeuralForgeStore();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Models</h2>
          <p className="text-sm text-zinc-500">All models are free and cloud-based</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.id} className={`bg-zinc-900/50 border-zinc-800 backdrop-blur transition-all ${model.active ? 'ring-2 ring-violet-500/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-zinc-200">{model.name}</h3>
                <Badge className={`text-[9px] ${model.free ? 'bg-emerald-600/20 text-emerald-300' : 'bg-amber-600/20 text-amber-300'} border-0`}>
                  {model.free ? 'Free' : 'Premium'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 mb-3">{model.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                <Badge className="bg-zinc-800/50 text-zinc-400 border-0 text-[9px]">{model.type}</Badge>
                <Badge className="bg-zinc-800/50 text-zinc-400 border-0 text-[9px]">{model.provider}</Badge>
                {model.noApiKey && <Badge className="bg-zinc-800/50 text-zinc-400 border-0 text-[9px]">No Key</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Safety Panel ─────────────────────────────────────────────────────────────
function SafetyPanel() {
  const { safetySettings, updateSafetySettings, addSafetyLog, clearSafetyLog } = useNeuralForgeStore();
  const [newBlocked, setNewBlocked] = useState('');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Safety Settings</h2>
          <p className="text-sm text-zinc-500">Content filtering and moderation</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-200">Content Filter</Label>
                <p className="text-xs text-zinc-500 mt-1">Block prompts containing inappropriate content</p>
              </div>
              <Switch checked={safetySettings.contentFilterEnabled} onCheckedChange={(v) => updateSafetySettings({ contentFilterEnabled: v })} />
            </div>
            <Separator className="bg-zinc-800" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-200">NSFW Detection</Label>
                <p className="text-xs text-zinc-500 mt-1">Flag potentially inappropriate generated content</p>
              </div>
              <Switch checked={safetySettings.nsfwDetectionEnabled} onCheckedChange={(v) => updateSafetySettings({ nsfwDetectionEnabled: v })} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-4">
            <Label className="text-zinc-200">Blocked Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {safetySettings.blockedPrompts.map((word) => (
                <Badge key={word} className="bg-red-600/20 text-red-300 border-0 text-xs flex items-center gap-1">
                  {word}
                  <button onClick={() => updateSafetySettings({ blockedPrompts: safetySettings.blockedPrompts.filter(w => w !== word) })}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newBlocked} onChange={(e) => setNewBlocked(e.target.value)}
                placeholder="Add keyword..." className="bg-zinc-800/50 border-zinc-700" />
              <Button onClick={() => {
                if (newBlocked.trim()) {
                  updateSafetySettings({ blockedPrompts: [...safetySettings.blockedPrompts, newBlocked.trim()] });
                  setNewBlocked('');
                }
              }} className="bg-red-600 hover:bg-red-500">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-zinc-200">Safety Log</Label>
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500" onClick={clearSafetyLog}>
                <Trash2 className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
            {safetySettings.safetyLog.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-4">No blocked prompts yet</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {safetySettings.safetyLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/30">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-zinc-300">{entry.prompt}</p>
                      <p className="text-[10px] text-zinc-500">{entry.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel() {
  const { appSettings, updateAppSettings } = useNeuralForgeStore();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-zinc-500">Application preferences</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-4">
            <Label className="text-zinc-200">Theme</Label>
            <Select value={appSettings.theme} onValueChange={(v: 'dark' | 'light') => updateAppSettings({ theme: v })}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-4">
            <Label className="text-zinc-200">Default Resolution</Label>
            <Select value={appSettings.defaultResolution} onValueChange={(v) => updateAppSettings({ defaultResolution: v })}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {RESOLUTION_OPTIONS.map((r) => (
                  <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-zinc-200">Backend</Label>
                <p className="text-xs text-zinc-500 mt-1">Using Pollinations.ai free cloud API</p>
              </div>
              <Badge className="bg-emerald-600/20 text-emerald-300 border-0">Cloud</Badge>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-zinc-800/30">
              <p className="text-xs text-zinc-400">
                NeuralForge uses free Pollinations.ai image generation for no-key image and keyframe workflows. 
                Long Motion and Action Sequence videos are browser encoded to WebM. Paid true-motion providers 
                should be configured server-side when you are ready for production AI video credits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
