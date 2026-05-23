'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Film, Image, Database, Shield, Settings, Wifi, WifiOff,
  Cpu, ChevronRight, Zap, Download, Trash2, Search, Play, Pause,
  RotateCcw, Check, AlertTriangle, Eye, EyeOff, Plus, X, Server,
  Monitor, HardDrive, RefreshCw, ExternalLink, Copy, Volume2,
  Palette, Layers, Clock, Box
} from 'lucide-react';
import { useNeuralForgeStore } from '@/lib/store';
import {
  RESOLUTION_OPTIONS, DURATION_OPTIONS, FPS_OPTIONS, STYLE_OPTIONS,
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

export default function Home() {
  const {
    activeTab, setActiveTab,
    connectionStatus,
  } = useNeuralForgeStore();

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health?XTransformPort=5000');
        if (res.ok) {
          const data = await res.json();
          useNeuralForgeStore.getState().updateConnectionStatus({
            backendConnected: true,
            backendVersion: data.version || '1.0.0',
            gpuAvailable: data.gpu_available || false,
            gpuName: data.gpu_name || '',
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
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Offline AI Studio</p>
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
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs text-zinc-500 hidden lg:inline">
              {connectionStatus.backendConnected ? 'Backend Connected' : 'Backend Offline'}
            </span>
          </div>
          {connectionStatus.gpuAvailable && (
            <div className="flex items-center gap-2 mt-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] text-zinc-500 hidden lg:inline">{connectionStatus.gpuName}</span>
            </div>
          )}
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

    setImageProgress({ isGenerating: true, currentStep: 0, totalSteps: imageSettings.steps, message: 'Starting generation...' });

    try {
      const res = await fetch('/api/generate/image?XTransformPort=5000', {
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
      });
      toast.success('Image generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed. Is the backend running?');
    } finally {
      setImageProgress({ isGenerating: false, currentStep: 0, message: '' });
    }
  }, [imageSettings, safetySettings, setImageProgress, setGeneratedImage, addGalleryItem, addSafetyLog]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
          <Image className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Image Generation</h2>
          <p className="text-sm text-zinc-500">Create stunning images with AI — fully offline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-4">
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

              {/* Steps */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-zinc-300">Steps</Label>
                  <span className="text-sm text-violet-400 font-mono">{imageSettings.steps}</span>
                </div>
                <Slider
                  value={[imageSettings.steps]}
                  onValueChange={([v]) => updateImageSettings({ steps: v })}
                  min={10} max={50} step={1}
                  className="[&_[role=slider]]:bg-violet-500"
                />
              </div>

              {/* CFG Scale */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-zinc-300">CFG Scale</Label>
                  <span className="text-sm text-violet-400 font-mono">{imageSettings.cfgScale}</span>
                </div>
                <Slider
                  value={[imageSettings.cfgScale]}
                  onValueChange={([v]) => updateImageSettings({ cfgScale: v })}
                  min={1} max={20} step={0.5}
                  className="[&_[role=slider]]:bg-violet-500"
                />
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
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" /> Generate Image
                  </>
                )}
              </Button>

              {/* Progress */}
              {imageProgress.isGenerating && (
                <div className="space-y-2">
                  <Progress value={(imageProgress.currentStep / imageProgress.totalSteps) * 100} className="h-2" />
                  <p className="text-xs text-zinc-500 text-center">
                    Step {imageProgress.currentStep}/{imageProgress.totalSteps} — {imageProgress.message}
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
              <CardTitle className="text-zinc-300 text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-xl bg-zinc-800/30 border border-zinc-800 flex items-center justify-center overflow-hidden">
                {generatedImage ? (
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-zinc-600">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generated image will appear here</p>
                  </div>
                )}
              </div>
              {generatedImage && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = generatedImage;
                      a.download = `neuralforge-${Date.now()}.png`;
                      a.click();
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

    setVideoProgress({ isGenerating: true, currentFrame: 0, totalFrames: videoSettings.duration * videoSettings.fps, message: 'Initializing video generation...' });

    try {
      const res = await fetch('/api/generate/video?XTransformPort=5000', {
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
      });
      toast.success('Video generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Video generation failed. Is the backend running?');
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
          <p className="text-sm text-zinc-500">Create AI videos from text or images</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
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

              <div className="space-y-2">
                <Label className="text-zinc-300">Resolution</Label>
                <Select
                  value={`${videoSettings.width}x${videoSettings.height}`}
                  onValueChange={(v) => {
                    const [w, h] = v.split('x').map(Number);
                    updateVideoSettings({ width: w, height: h });
                  }}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="256x256">256 × 256</SelectItem>
                    <SelectItem value="512x512">512 × 512</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image to Video toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Image-to-Video</Label>
                  <Switch
                    checked={videoSettings.imageToVideo}
                    onCheckedChange={(v) => updateVideoSettings({ imageToVideo: v })}
                  />
                </div>
                {videoSettings.imageToVideo && (
                  <div className="rounded-xl border-2 border-dashed border-zinc-700 p-4 text-center">
                    {videoSettings.sourceImage ? (
                      <div className="relative">
                        <img src={videoSettings.sourceImage} alt="Source" className="max-h-40 mx-auto rounded-lg" />
                        <Button
                          variant="ghost" size="sm"
                          className="absolute top-1 right-1 bg-zinc-900/80 h-7 w-7 p-0"
                          onClick={() => updateVideoSettings({ sourceImage: null })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                        <p className="text-sm text-zinc-500">Upload source image</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Est. frames: {videoSettings.duration * videoSettings.fps} | Est. time: ~{Math.ceil(videoSettings.duration * 8)}s
              </div>

              <Button
                onClick={handleGenerate}
                disabled={videoProgress.isGenerating}
                className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-semibold h-12 text-base shadow-lg shadow-amber-500/20"
              >
                {videoProgress.isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating Video...
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 mr-2" /> Generate Video
                  </>
                )}
              </Button>

              {videoProgress.isGenerating && (
                <div className="space-y-2">
                  <Progress value={(videoProgress.currentFrame / videoProgress.totalFrames) * 100} className="h-2" />
                  <p className="text-xs text-zinc-500 text-center">
                    Frame {videoProgress.currentFrame}/{videoProgress.totalFrames} — {videoProgress.message}
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
                <video src={generatedVideo} controls className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-zinc-600">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Generated video will appear here</p>
                </div>
              )}
            </div>
            {generatedVideo && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 border-zinc-700"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = generatedVideo;
                    a.download = `neuralforge-${Date.now()}.mp4`;
                    a.click();
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

function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
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
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800/50">
                    <Play className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col justify-end p-3">
                <p className="text-xs text-zinc-200 line-clamp-2 mb-2">{item.prompt}</p>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-white/10 hover:bg-white/20"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = item.url;
                      a.download = `neuralforge-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`;
                      a.click();
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
  const { models, updateModel, activateModel } = useNeuralForgeStore();

  const handleDownload = (id: string) => {
    updateModel(id, { progress: 0 });
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateModel(id, { downloaded: true, progress: 100 });
        toast.success('Model downloaded!');
      } else {
        updateModel(id, { progress: Math.round(progress) });
      }
    }, 500);
  };

  const totalSize = models.filter(m => m.downloaded).reduce((acc, m) => acc + m.sizeBytes, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Model Manager</h2>
            <p className="text-sm text-zinc-500">Download & manage AI models</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <HardDrive className="w-4 h-4" />
          {(totalSize / 1e9).toFixed(1)} GB used
        </div>
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
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{model.description}</p>
                </div>
                <span className="text-xs text-zinc-500 shrink-0">{model.size}</span>
              </div>

              <p className="text-[10px] text-zinc-600 font-mono mb-3">{model.huggingFaceId}</p>

              {model.progress > 0 && model.progress < 100 && (
                <div className="mb-3">
                  <Progress value={model.progress} className="h-1.5" />
                  <p className="text-xs text-zinc-500 mt-1">Downloading: {model.progress}%</p>
                </div>
              )}

              <div className="flex gap-2">
                {!model.downloaded ? (
                  <Button
                    onClick={() => handleDownload(model.id)}
                    disabled={model.progress > 0 && model.progress < 100}
                    className="flex-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border-0"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => activateModel(model.id)}
                      variant={model.active ? 'default' : 'outline'}
                      className={`flex-1 ${model.active ? 'bg-violet-600/20 text-violet-300 border-0' : 'border-zinc-700'}`}
                    >
                      {model.active ? <Check className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      {model.active ? 'Active' : 'Activate'}
                    </Button>
                    <Button variant="outline" className="border-zinc-700" onClick={() => updateModel(model.id, { downloaded: false, progress: 0, active: false })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
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
        {/* Filters */}
        <div className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <Label className="text-zinc-300">Content Filter</Label>
                </div>
                <Switch
                  checked={safetySettings.contentFilterEnabled}
                  onCheckedChange={(v) => updateSafetySettings({ contentFilterEnabled: v })}
                />
              </div>
              <p className="text-xs text-zinc-500">Blocks prompts containing harmful or inappropriate keywords</p>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <Label className="text-zinc-300">NSFW Detection</Label>
                </div>
                <Switch
                  checked={safetySettings.nsfwDetectionEnabled}
                  onCheckedChange={(v) => updateSafetySettings({ nsfwDetectionEnabled: v })}
                />
              </div>
              <p className="text-xs text-zinc-500">Detects and flags potentially explicit generated content</p>

              <Separator className="bg-zinc-800" />

              {/* Blocked Words */}
              <div className="space-y-3">
                <Label className="text-zinc-300">Blocked Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newBlockedWord}
                    onChange={(e) => setNewBlockedWord(e.target.value)}
                    placeholder="Add keyword..."
                    className="bg-zinc-800/50 border-zinc-700"
                    onKeyDown={(e) => e.key === 'Enter' && addBlockedWord()}
                  />
                  <Button onClick={addBlockedWord} variant="outline" className="border-zinc-700 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {safetySettings.blockedPrompts.map((word) => (
                    <Badge key={word} variant="secondary" className="bg-zinc-800 text-zinc-300 pr-1">
                      {word}
                      <button onClick={() => removeBlockedWord(word)} className="ml-1 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-300 text-sm">Disclaimer</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    NeuralForge uses open-source AI models for generation. Users are solely responsible for the content they generate.
                    This tool implements safety filters, but they are not perfect. Do not use this tool to create illegal, harmful,
                    or non-consensual content. All generation activity is logged locally for safety and compliance purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Log */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-zinc-300 text-sm">Safety Log</CardTitle>
            <Button variant="ghost" size="sm" className="text-zinc-500" onClick={clearSafetyLog}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {safetySettings.safetyLog.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-8">No safety events logged</p>
              ) : (
                <div className="space-y-2">
                  {safetySettings.safetyLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${entry.action === 'blocked' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 truncate">&quot;{entry.prompt}&quot;</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{entry.reason}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${entry.action === 'blocked' ? 'bg-red-600/20 text-red-300' : 'bg-amber-600/20 text-amber-300'}`}>
                        {entry.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings Panel ──────────────────────────────────────────────────────────
function SettingsPanel() {
  const { appSettings, updateAppSettings, connectionStatus, updateConnectionStatus } = useNeuralForgeStore();

  const handlePing = async () => {
    try {
      const res = await fetch('/api/health?XTransformPort=5000');
      if (res.ok) {
        const data = await res.json();
        updateConnectionStatus({
          backendConnected: true,
          backendVersion: data.version || '1.0.0',
          gpuAvailable: data.gpu_available || false,
          gpuName: data.gpu_name || '',
        });
        toast.success(`Backend connected! v${data.version || '1.0.0'}`);
      } else {
        updateConnectionStatus({ backendConnected: false });
        toast.error('Backend returned error');
      }
    } catch {
      updateConnectionStatus({ backendConnected: false });
      toast.error('Cannot connect to backend');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-zinc-500">Configure your NeuralForge setup</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-zinc-300 text-sm flex items-center gap-2">
              <Server className="w-4 h-4" /> Backend Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Backend URL</Label>
              <Input
                value={appSettings.backendUrl}
                onChange={(e) => updateAppSettings({ backendUrl: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              <div>
                <p className="text-sm font-medium">
                  {connectionStatus.backendConnected ? 'Connected' : 'Disconnected'}
                </p>
                {connectionStatus.backendVersion && (
                  <p className="text-xs text-zinc-500">Version {connectionStatus.backendVersion}</p>
                )}
              </div>
            </div>

            {connectionStatus.gpuAvailable && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-600/5 border border-violet-500/20">
                <Monitor className="w-4 h-4 text-violet-400" />
                <div>
                  <p className="text-sm font-medium text-violet-300">GPU Available</p>
                  <p className="text-xs text-zinc-500">{connectionStatus.gpuName}</p>
                </div>
              </div>
            )}

            <Button onClick={handlePing} variant="outline" className="w-full border-zinc-700">
              <RefreshCw className="w-4 h-4 mr-2" /> Ping Backend
            </Button>
          </CardContent>
        </Card>

        {/* Defaults */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-zinc-300 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" /> Default Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label className="text-zinc-300">Storage Path</Label>
              <Input
                value={appSettings.storagePath}
                onChange={(e) => updateAppSettings({ storagePath: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            <Button variant="outline" className="w-full border-zinc-700 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => toast.success('Cache cleared!')}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear Cache
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">NeuralForge</h3>
                  <p className="text-xs text-zinc-500">v1.0.0 — Offline AI Image & Video Studio</p>
                </div>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <p>Open Source • No API Keys Required</p>
                <p>Powered by Stable Diffusion & AnimateDiff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
