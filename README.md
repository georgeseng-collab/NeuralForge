# NeuralForge — Offline AI Image & Video Studio

Generate AI images and videos locally, without API keys or cloud services.

## 🧠 Features

- **Image Generation**: Text-to-image using Stable Diffusion (SD Turbo, SDXL)
- **Video Generation**: Text-to-video and image-to-video using AnimateDiff/SVD
- **Fully Offline**: Works without internet once models are downloaded
- **No API Keys**: All processing runs on your local machine
- **Safety Layer**: Built-in content filtering and NSFW detection
- **Model Manager**: Download, activate, and manage AI models
- **Gallery**: Browse, search, and export your generations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NeuralForge UI                     │
│              (Next.js + React + PWA)                 │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Image Gen │ │Video Gen │ │ Gallery  │ │Models  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────────────────────────────┐  │
│  │ Safety   │ │      Settings & Connection       │  │
│  └──────────┘ └──────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP API
┌──────────────────────┴──────────────────────────────┐
│              NeuralForge Backend (Python)             │
│                  FastAPI + Uvicorn                    │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │ SD Turbo   │ │ SDXL Base  │ │ Safety Filter    │ │
│  │ (4.2 GB)   │ │ (6.5 GB)   │ │ + NSFW Detection │ │
│  └────────────┘ └────────────┘ └──────────────────┘ │
│  ┌────────────┐ ┌────────────┐                       │
│  │ AnimateDiff│ │  SVD XT    │                       │
│  │ (3.8 GB)   │ │ (4.1 GB)   │                       │
│  └────────────┘ └────────────┘                       │
│                                                      │
│  GPU: CUDA (NVIDIA) → Fast | CPU → Slow but works   │
└──────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.10+** (for AI backend)
- **NVIDIA GPU** (recommended, CPU works but slower)
- **8GB+ RAM** (16GB+ recommended for SDXL)

### 1. Install Frontend
```bash
npm install
npm run dev
```

### 2. Install Python Backend
```bash
cd neuralforge-backend
pip install -r requirements.txt
python main.py
```

### 3. Open the App
Navigate to `http://localhost:3000` in Chrome.

### 4. Download a Model
Go to the **Models** tab and click Download on your preferred model.

## ⚠️ Limitations

- **Video generation** is computationally expensive — short clips (2-5s) are realistic for consumer GPUs
- **5-minute videos** require stitching multiple clips together (future feature)
- **CPU mode** works but is 10-50x slower than GPU
- **Model downloads** are large (3-7 GB each)

## 🔒 Safety & Compliance

- All prompts are filtered against a blocklist of harmful keywords
- NSFW detection flags potentially explicit content
- Safety events are logged locally (never sent externally)
- Users must acknowledge the disclaimer before generating

## 📦 Folder Structure

```
NeuralForge/
├── src/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── api/health/           # Backend health proxy
│   └── lib/
│       ├── types.ts              # TypeScript types
│       └── store.ts              # Zustand state store
├── neuralforge-backend/          # Python AI backend
│   ├── main.py                   # FastAPI server
│   └── requirements.txt          # Python dependencies
├── mini-services/
│   └── neuralforge-backend/      # Mock backend (dev)
│       └── index.ts              # Bun mock server
└── README.md
```

## 🔮 Future Upgrades

- WebGPU acceleration for browser-based inference
- Plugin system for custom models
- LoRA fine-tuning support
- Batch generation queue
- Real-time preview during generation
- Video stitching for longer clips
- ComfyUI workflow integration

## 💰 Monetization Options (Compliant)

- Premium model packs (curated, licensed models)
- Cloud GPU rental integration
- Priority support & updates
- Enterprise features (team management, API access)

---

**Built with ❤️ using open-source AI models**
