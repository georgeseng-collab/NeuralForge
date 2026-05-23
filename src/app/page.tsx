'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Film, Image, Database, Shield, Settings, Wifi, WifiOff,
  Cpu, ChevronRight, Zap, Download, Trash2, Search, Play, Pause,
  RotateCcw, Check, AlertTriangle, Eye, EyeOff, Plus, X, Server,
  Monitor, HardDrive, RefreshCw, ExternalLink, Copy, Volume2,
  Palette, Layers, Clock, Box, Globe, Cloud, Star, Bolt, Moon,
  Wand2, Paintbrush, Camera, Video
} from 'lucide-react';
import { useNeuralForgeStore } from '@/lib/store';
import {
  RESOLUTION_OPTIONS, DURATION_OPTIONS, FPS_OPTIONS, STYLE_OPTIONS,
  IMAGE_MODEL_OPTIONS, VIDEO_MODEL_OPTIONS,
  type GalleryItem, type SafetyLogEntry,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  'Open Source': 'bg-green-600/30 text-green-300',
  'Video': 'bg-red-600/30 text-red-300',
};

export default function Home() {
  const {
    activeTab, setActiveTab,
    connectionStatus,
  } = useNeuralForgeStore();

  // Check backend connection on mount
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
      {/* ─── Sidebar ──────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        className="w-20 lg:w-64 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col shrink-0"
      >
        {/* Logo */}
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

        {/* Nav */}
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

        {/* Connection Status */}
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
          {connectionStatus.gpuAvailable && (
            <div className="flex items-center gap-2 mt-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] text-zinc-500 hidden lg:inline">{connectionStatus.gpuName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-zinc-500 hidden lg:inline">Free · No API Key</span>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ──────────────────────────────────────── */}
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
    // Safety check
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
      toast.error(err.message || 'Generation failed. Is the backend running?');
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
        {/* Left: Settings */}
        <div className="space-y-4">
          {/* Model Selector */}
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
              {/* Prompt */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Prompt</Label>
                <Textarea
                  value={imageSettings.prompt}
                  onChange={(e) => updateImageSettings({ prompt: e.target.value })}
                  placeholder="A cyberpunk city at sunset, neon lights reflecting on wet streets..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[100px] resize-none"
                />
                <p className="text-xs text-zinc-600">{imageSettings.prompt.length} characters</p>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Negative Prompt</Label>
                <Textarea
                  value={imageSettings.negativePrompt}
                  onChange={(e) => updateImageSettings({ negativePrompt: e.target.value })}
                  placeholder="blurry, low quality, distorted, watermark..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[60px] resize-none"
                />
              </div>

              {/* Style */}
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

              {/* Resolution */}
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

              {/* Seed */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-zinc-300">Seed</Label>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 text-xs text-zinc-500"
                    onClick={() => updateImageSettings({ seed: Math.floor(Math.random() * 2147483647) })}
                  >
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

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={imageProgress.isGenerating}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold h-12 text-base shadow-lg shadow-violet-500/20"
              >
                {imageProgress.isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating with {selectedModel?.name || 'AI'}...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" /> Generate with {selectedModel?.name || 'AI'}
                  </>
                )}
              </Button>

              {/* Progress */}
              {imageProgress.isGenerating && (
                <div className="space-y-2">
                  <Progress value={50} className="h-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 text-center">
                    {imageProgress.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-zinc-300 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" /> Preview
                {selectedModel && (
                  <Badge className="text-[9px] bg-violet-600/20 text-violet-300 border-0 ml-auto">
                    {selectedModel.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="text-center text-zinc-600 p-4"><p class="text-sm">Image failed to load</p><p class="text-xs mt-1">Try a different model or prompt</p></div>';
                    }}
                  />
                ) : (
                  <div className="text-center text-zinc-600">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generated image will appear here</p>
                    <p className="text-xs mt-1 text-zinc-700">Select a model and enter a prompt to start</p>
                  </div>
                )}
              </div>
              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700"
                    onClick={() => {
                      // For Pollinations URLs, open in new tab to save
                      if (generatedImage.startsWith('http')) {
                        window.open(generatedImage, '_blank');
                      } else {
                        const a = document.createElement('a');
                        a.href = generatedImage;
                        a.download = `neuralforge-${Date.now()}.png`;
                        a.click();
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    className="border-zinc-700"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImage);
                      toast.success('Image URL copied!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Quick Tips
              </h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <p className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span><strong className="text-zinc-300">Flux</strong> — Best all-rounder for any style</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span><strong className="text-zinc-300">Flux Realism</strong> — Photorealistic portraits & scenes</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong className="text-zinc-300">Flux Anime</strong> — Anime, manga & illustration</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong className="text-zinc-300">Turbo</strong> — Fastest generation, good for testing</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span><strong className="text-zinc-300">AnyDark</strong> — Gothic, noir & dark aesthetics</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Video Generation Panel ──────────────────────────────────────────────────
function VideoGenPanel() {
  const { videoSettings, updateVideoSettings, videoProgress, setVideoProgress, generatedVideo, setGeneratedVideo, addGalleryItem, safetySettings, addSafetyLog } = useNeuralForgeStore();

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

    setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames: videoSettings.duration * videoSettings.fps, message: 'Generating video keyframe...' });

    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoSettings),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Video generation failed');
      }

      const data = await res.json();
      setGeneratedVideo(data.video_url);
      addGalleryItem({
        id: crypto.randomUUID(),
        type: 'video',
        prompt: videoSettings.prompt,
        settings: { ...videoSettings },
        url: data.video_url,
        thumbnailUrl: data.thumbnail_url || data.video_url,
        timestamp: Date.now(),
        isNsfw: data.is_nsfw || false,
        modelUsed: data.model_used,
        provider: data.provider,
      });
      toast.success('Video keyframe generated!');
    } catch (err: any) {
      toast.error(err.message || 'Video generation failed.');
    } finally {
      setVideoProgress({ isGenerating: false, currentFrame: 0, message: '' });
    }
  }, [videoSettings, safetySettings, setVideoProgress, setGeneratedVideo, addGalleryItem, addSafetyLog]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => updateVideoSettings({ sourceImage: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center">
          <Film className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Video Generation</h2>
          <p className="text-sm text-zinc-500">Create AI video keyframes from text</p>
        </div>
        <Badge className="ml-auto bg-amber-600/20 text-amber-300 border-0">
          <Video className="w-3 h-3 mr-1" /> Beta
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Video Model Selector */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-4">
              <Label className="text-zinc-300 mb-3 block text-sm font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" /> Video Model
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_MODEL_OPTIONS.map((model) => (
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

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-zinc-300">Prompt</Label>
                <Textarea
                  value={videoSettings.prompt}
                  onChange={(e) => updateVideoSettings({ prompt: e.target.value })}
                  placeholder="A timelapse of a flower blooming in a garden..."
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Duration</Label>
                  <Select value={`${videoSettings.duration}`} onValueChange={(v) => updateVideoSettings({ duration: Number(v) })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={`${d}`}>{d}s</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">FPS</Label>
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
                <Clock className="w-3.5 h-3.5" />
                Generates a cinematic keyframe image
              </div>

              <Button
                onClick={handleGenerate}
                disabled={videoProgress.isGenerating}
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-semibold h-12 text-base shadow-lg shadow-amber-500/20"
              >
                {videoProgress.isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 mr-2" /> Generate Video Keyframe
                  </>
                )}
              </Button>

              {videoProgress.isGenerating && (
                <div className="space-y-2">
                  <Progress value={50} className="h-2 animate-pulse" />
                  <p className="text-xs text-zinc-500 text-center">
                    {videoProgress.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-zinc-300 text-sm">Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {generatedVideo ? (
                <img src={generatedVideo} alt="Video keyframe" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-zinc-600">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Video keyframe will appear here</p>
                </div>
              )}
            </div>
            {generatedVideo && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 border-zinc-700"
                  onClick={() => {
                    if (generatedVideo.startsWith('http')) {
                      window.open(generatedVideo, '_blank');
                    } else {
                      const a = document.createElement('a');
                      a.href = generatedVideo;
                      a.download = `neuralforge-video-${Date.now()}.png`;
                      a.click();
                    }
                  }}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Gallery Panel ───────────────────────────────────────────────────────────
function GalleryPanel() {
  const { gallery, galleryFilter, setGalleryFilter, gallerySearch, setGallerySearch, removeGalleryItem } = useNeuralForgeStore();

  const filtered = gallery.filter((item) => {
    if (galleryFilter !== 'all' && item.type !== galleryFilter) return false;
    if (gallerySearch && !item.prompt.toLowerCase().includes(gallerySearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Gallery</h2>
            <p className="text-sm text-zinc-500">{gallery.length} generations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              placeholder="Search prompts..."
              className="pl-9 bg-zinc-800/50 border-zinc-700 w-60"
            />
          </div>
          <div className="flex bg-zinc-800/50 rounded-lg border border-zinc-700 p-0.5">
            {(['all', 'image', 'video'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setGalleryFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${galleryFilter === f ? 'bg-violet-600/30 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No generations yet</p>
          <p className="text-sm">Create your first image or video to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative"
            >
              <div className="aspect-square rounded-xl bg-zinc-800/30 border border-zinc-800 overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col justify-end p-3">
                <p className="text-xs text-zinc-200 line-clamp-2 mb-1">{item.prompt}</p>
                {item.modelUsed && (
                  <p className="text-[9px] text-violet-300 mb-2">Model: {item.modelUsed}</p>
                )}
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white/10 hover:bg-white/20"
                    onClick={() => {
                      if (item.url.startsWith('http')) {
                        window.open(item.url, '_blank');
                      } else {
                        const a = document.createElement('a');
                        a.href = item.url;
                        a.download = `neuralforge-${item.id}.${item.type === 'image' ? 'png' : 'png'}`;
                        a.click();
                      }
                    }}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white/10 hover:bg-red-500/30"
                    onClick={() => removeGalleryItem(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-zinc-900/80">
                {item.type === 'image' ? <Image className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
                {item.type}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Models Panel ────────────────────────────────────────────────────────────
function ModelsPanel() {
  const { models, activateModel } = useNeuralForgeStore();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Model Manager</h2>
            <p className="text-sm text-zinc-500">Free AI models — no download needed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600/20 text-emerald-300 border-0">
            <Globe className="w-3 h-3 mr-1" /> All Free
          </Badge>
          <Badge className="bg-violet-600/20 text-violet-300 border-0">
            <Star className="w-3 h-3 mr-1" /> {models.length} Models
          </Badge>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-300">Cloud AI — Free & No API Key</h3>
        </div>
        <p className="text-sm text-zinc-400">
          All models run on free cloud APIs. No downloads, no API keys, no GPU needed. Just select a model and start generating!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <Card key={model.id} className={`bg-zinc-900/50 border backdrop-blur transition-all ${model.active ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : 'border-zinc-800'}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{model.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {model.type === 'image' ? <Image className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
                      {model.type}
                    </Badge>
                    {model.active && (
                      <Badge className="text-[10px] bg-violet-600/30 text-violet-300">Active</Badge>
                    )}
                    {model.free && (
                      <Badge className="text-[10px] bg-emerald-600/30 text-emerald-300">Free</Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{model.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-zinc-600 mb-3">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {model.provider === 'pollinations' ? 'Pollinations.ai' : model.provider === 'huggingface' ? 'Hugging Face' : 'ZAI Local'}
                </span>
                <span className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Cloud
                </span>
                {model.noApiKey && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <Check className="w-3 h-3" />
                    No API Key
                  </span>
                )}
              </div>

              <Button
                onClick={() => activateModel(model.id)}
                variant={model.active ? 'default' : 'outline'}
                className={`w-full ${model.active ? 'bg-violet-600/20 text-violet-300 border-0' : 'border-zinc-700'}`}
              >
                {model.active ? <Check className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {model.active ? 'Active Model' : 'Select Model'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Safety Panel ────────────────────────────────────────────────────────────
function SafetyPanel() {
  const { safetySettings, updateSafetySettings, addSafetyLog, clearSafetyLog } = useNeuralForgeStore();
  const [newBlockedWord, setNewBlockedWord] = useState('');

  const addBlockedWord = () => {
    if (newBlockedWord.trim() && !safetySettings.blockedPrompts.includes(newBlockedWord.trim().toLowerCase())) {
      updateSafetySettings({ blockedPrompts: [...safetySettings.blockedPrompts, newBlockedWord.trim().toLowerCase()] });
      setNewBlockedWord('');
      toast.success('Keyword added to block list');
    }
  };

  const removeBlockedWord = (word: string) => {
    updateSafetySettings({ blockedPrompts: safetySettings.blockedPrompts.filter(w => w !== word) });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Safety & Compliance</h2>
          <p className="text-sm text-zinc-500">Content filtering and safety controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Content Filter</h3>
                <p className="text-xs text-zinc-500">Block prompts with inappropriate content</p>
              </div>
              <Switch
                checked={safetySettings.contentFilterEnabled}
                onCheckedChange={(v) => updateSafetySettings({ contentFilterEnabled: v })}
              />
            </div>

            <Separator className="bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">NSFW Detection</h3>
                <p className="text-xs text-zinc-500">Flag potentially explicit content</p>
              </div>
              <Switch
                checked={safetySettings.nsfwDetectionEnabled}
                onCheckedChange={(v) => updateSafetySettings({ nsfwDetectionEnabled: v })}
              />
            </div>

            <Separator className="bg-zinc-800" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300">Blocked Keywords</h3>
              <div className="flex gap-2">
                <Input
                  value={newBlockedWord}
                  onChange={(e) => setNewBlockedWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBlockedWord()}
                  placeholder="Add keyword..."
                  className="bg-zinc-800/50 border-zinc-700"
                />
                <Button onClick={addBlockedWord} variant="outline" className="border-zinc-700 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {safetySettings.blockedPrompts.map((word) => (
                  <Badge key={word} variant="secondary" className="text-xs bg-red-600/20 text-red-300 cursor-pointer hover:bg-red-600/30"
                    onClick={() => removeBlockedWord(word)}>
                    {word} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Log */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-300 text-sm">Safety Log</CardTitle>
              <Button variant="ghost" size="sm" className="text-zinc-500 h-7" onClick={clearSafetyLog}>
                <Trash2 className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {safetySettings.safetyLog.length === 0 ? (
              <div className="text-center py-8 text-zinc-600">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No safety events recorded</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {safetySettings.safetyLog.map((entry) => (
                    <div key={entry.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-medium text-amber-300">{entry.action}</span>
                        <span className="text-[10px] text-zinc-600 ml-auto">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{entry.reason}</p>
                      <p className="text-xs text-zinc-500 mt-1 italic">&ldquo;{entry.prompt}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings Panel ──────────────────────────────────────────────────────────
function SettingsPanel() {
  const { appSettings, updateAppSettings, connectionStatus } = useNeuralForgeStore();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-zinc-500">Configure NeuralForge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Cloud AI Settings
            </h3>

            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/50">
              <p className="text-sm text-emerald-300 font-medium">Free Cloud Mode Active</p>
              <p className="text-xs text-zinc-400 mt-1">
                NeuralForge uses free cloud AI APIs. No API keys needed. No downloads required. Just generate!
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Default Resolution</Label>
              <Select
                value={appSettings.defaultResolution}
                onValueChange={(v) => updateAppSettings({ defaultResolution: v })}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="512x512">512 × 512</SelectItem>
                  <SelectItem value="768x768">768 × 768</SelectItem>
                  <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-zinc-300">Default Steps</Label>
                <span className="text-sm text-violet-400 font-mono">{appSettings.defaultSteps}</span>
              </div>
              <Slider
                value={[appSettings.defaultSteps]}
                onValueChange={([v]) => updateAppSettings({ defaultSteps: v })}
                min={10} max={50} step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-zinc-300">Default CFG Scale</Label>
                <span className="text-sm text-violet-400 font-mono">{appSettings.defaultCfgScale}</span>
              </div>
              <Slider
                value={[appSettings.defaultCfgScale]}
                onValueChange={([v]) => updateAppSettings({ defaultCfgScale: v })}
                min={1} max={20} step={0.5}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> System Info
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">Status</span>
                <Badge className="bg-emerald-600/20 text-emerald-300 border-0">
                  {connectionStatus.backendConnected ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">Version</span>
                <span className="text-sm text-zinc-300">{connectionStatus.backendVersion}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">AI Engine</span>
                <span className="text-sm text-zinc-300">{connectionStatus.gpuName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">Models Available</span>
                <span className="text-sm text-zinc-300">{connectionStatus.modelsLoaded?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-400">API Key Required</span>
                <Badge className="bg-emerald-600/20 text-emerald-300 border-0">No</Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-300 mb-2">Available Providers</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span className="text-zinc-400">Pollinations.ai</span>
                  <Badge className="text-[9px] bg-emerald-600/20 text-emerald-300 border-0">Free</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span className="text-zinc-400">Hugging Face</span>
                  <Badge className="text-[9px] bg-blue-600/20 text-blue-300 border-0">Free Tier</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Server className="w-3 h-3 text-violet-400" />
                  <span className="text-zinc-400">ZAI Engine (Local)</span>
                  <Badge className="text-[9px] bg-violet-600/20 text-violet-300 border-0">Dev Only</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
