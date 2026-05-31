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
  MOTION_EFFECT_OPTIONS, MOTION_SOURCE_MODEL_OPTIONS,
  type GalleryItem, type SafetyLogEntry,
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
  // This also handles automatic fallback from paid/credit providers.
  useEffect(() => {
    if (!sourceImage) return;
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
  }, [sourceImage]);

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
    setPendingVideoMeta(null);
    setEncodingPercent(0);
    setGeneratedVideoUrl(null);
    setGeneratedVideo(null);

    const motionModel = MOTION_SOURCE_MODEL_OPTIONS.find(m => m.id === videoSettings.modelId) || MOTION_SOURCE_MODEL_OPTIONS[0];
    setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames: 1, message: `Generating free image with ${motionModel.name} for motion video...` });

    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...videoSettings,
          videoMode: 'motion',
          motionEffect: videoSettings.motionEffect,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Video generation failed');
      }

      const data = await res.json();

      const responseIsMotion = data.mode === 'motion' || data.image_base64 || data.image_url;

      if (responseIsMotion) {
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
        setSourceImage(imageUrl);
        toast.success(`Image generated! Encoding ${data.duration || videoSettings.duration}s free motion video...`);
      } else {
        // Real AI video mode: we get a video_base64
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
          const url = URL.createObjectURL(blob);
          setVideoBlobUrl(url);
          setGeneratedVideoUrl(url);
          setGeneratedVideo(url);
        } else if (data.video_url) {
          setGeneratedVideo(data.video_url);
          setGeneratedVideoUrl(data.video_url);
        }
        addGalleryItem({
          id: crypto.randomUUID(),
          type: 'video',
          prompt: videoSettings.prompt,
          settings: { ...videoSettings },
          url: data.video_url || data.thumbnail_url || '',
          thumbnailUrl: data.thumbnail_url || data.video_url || '',
          timestamp: Date.now(),
          isNsfw: data.is_nsfw || false,
          modelUsed: data.model_used,
          provider: data.provider,
        });
        toast.success(`AI video generated with ${data.model_used || 'AI'}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Video generation failed.');
    } finally {
      // Don't clear progress yet - encoding will happen after source image generation.
    }
  }, [videoSettings, safetySettings, setVideoProgress, setGeneratedVideo, setGeneratedVideoUrl, addGalleryItem, addSafetyLog, videoBlobUrl]);

  const currentVideoUrl = videoBlobUrl || generatedVideoUrl;
  const maxSelectableDuration = 60;
  const selectableDurations = DURATION_OPTIONS.filter((duration) => duration <= maxSelectableDuration);
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
              <div className="rounded-lg border border-amber-500/30 bg-amber-600/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-zinc-200">No API keys required</span>
                </div>
                <p className="text-xs text-zinc-400">
                  NeuralForge creates a free AI source image, then encodes it in your browser as a 45-60 second motion video.
                </p>
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

          {/* Free motion settings */}
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
                  <Label className="text-zinc-300">Duration (free 45-60s)</Label>
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
                {`${videoSettings.duration}s free motion video at ${videoSettings.width}x${videoSettings.height} (${selectedPreset?.aspect || 'Custom'}) · ${videoSettings.motionEffect}`}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={videoProgress.isGenerating || isEncoding}
                className="w-full text-white font-semibold h-12 text-base shadow-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20"
              >
                {videoProgress.isGenerating || isEncoding ? (
                  <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> {videoProgress.message || 'Encoding...'}</>
                ) : (
                  <><Film className="w-5 h-5 mr-2" /> Generate Free 45-60s Motion Video</>
                )}
              </Button>

              {(videoProgress.isGenerating || isEncoding) && (
                <div className="space-y-2">
                  <Progress value={isEncoding ? encodingPercent : 50} className="h-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 text-center">
                    {isEncoding ? `Encoding ${videoSettings.duration}s motion video in your browser...` : 'Generating free source image... 10-30 seconds'}
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
                <Badge className="text-[9px] bg-amber-600/20 text-amber-300 border-0 ml-auto">{videoSettings.motionEffect}</Badge>
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
                    <p className="text-sm">{videoProgress.message || 'Generating free motion video...'}</p>
                    <p className="text-xs mt-1 text-zinc-600">
                      Generating free source image... 10-30 seconds
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
                <p><strong className="text-amber-300">No API keys</strong> — The video flow is fully free and no-key.</p>
                <p><strong className="text-sky-300">45-60 seconds</strong> — Use longer durations for Reels, Shorts, and TikTok drafts.</p>
                <p><strong className="text-emerald-300">Source image model</strong> — Try GPT Image or SeeDream if the first image is not accurate enough.</p>
                <p><strong className="text-orange-300">Motion effect</strong> — Ken Burns and Drift usually look best for long clips.</p>
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
                NeuralForge uses the free Pollinations.ai API for all AI generation. No API key is required. 
                All image models generate high-quality results. Video is generated as cinematic keyframes encoded 
                to WebM on your device for social media use.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
