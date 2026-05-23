"""
NeuralForge Backend — Python FastAPI Server
Runs locally with GPU support for AI image & video generation.

Setup:
  pip install -r requirements.txt
  python main.py

Models will be downloaded automatically on first use.
"""

import os
import sys
import json
import time
import logging
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# ─── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('neuralforge')

# ─── Config ───────────────────────────────────────────────────────────────
DATA_DIR = Path(os.environ.get('NEURALFORGE_DATA', './neuralforge-data'))
MODELS_DIR = DATA_DIR / 'models'
OUTPUT_DIR = DATA_DIR / 'output'
LOGS_DIR = DATA_DIR / 'logs'

for d in [MODELS_DIR, OUTPUT_DIR, LOGS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── Safety ───────────────────────────────────────────────────────────────
BLOCKED_KEYWORDS = [
    'violence', 'gore', 'explicit', 'nsfw', 'nude', 'sexual',
    'hate', 'racist', 'illegal', 'child abuse', 'self harm',
    'terrorism', 'weapon', 'drug',
]

SAFETY_LOG_FILE = LOGS_DIR / 'safety_log.json'

def check_prompt_safety(prompt: str) -> dict:
    """Check if a prompt is safe. Returns {safe, blocked_keyword, reason}."""
    lower = prompt.lower()
    for keyword in BLOCKED_KEYWORDS:
        if keyword in lower:
            entry = {
                'timestamp': datetime.now().isoformat(),
                'prompt': prompt,
                'blocked_keyword': keyword,
                'action': 'blocked',
            }
            _log_safety_event(entry)
            return {'safe': False, 'blocked_keyword': keyword, 'reason': f'Contains blocked keyword: "{keyword}"'}
    return {'safe': True, 'blocked_keyword': None, 'reason': None}

def _log_safety_event(entry: dict):
    """Log a safety event to the local JSON log file."""
    logs = []
    if SAFETY_LOG_FILE.exists():
        try:
            logs = json.loads(SAFETY_LOG_FILE.read_text())
        except:
            logs = []
    logs.append(entry)
    SAFETY_LOG_FILE.write_text(json.dumps(logs[-100:], indent=2))

# ─── AI Model Loading ────────────────────────────────────────────────────
class ModelManager:
    def __init__(self):
        self.loaded_models = {}
        self.gpu_available = False
        self.gpu_name = 'CPU'
        self._check_gpu()

    def _check_gpu(self):
        """Check if CUDA GPU is available."""
        try:
            import torch
            if torch.cuda.is_available():
                self.gpu_available = True
                self.gpu_name = torch.cuda.get_device_name(0)
                logger.info(f'GPU detected: {self.gpu_name}')
            else:
                logger.info('No GPU detected, using CPU (slower)')
        except ImportError:
            logger.warning('PyTorch not installed — AI generation will not work')

    def load_image_model(self, model_id: str = 'sd-turbo'):
        """Load an image generation model."""
        try:
            from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline
            import torch

            model_map = {
                'sd-turbo': 'stabilityai/sd-turbo',
                'sdxl-base': 'stabilityai/stable-diffusion-xl-base-1.0',
            }

            hf_id = model_map.get(model_id, model_id)
            logger.info(f'Loading image model: {hf_id}')

            dtype = torch.float16 if self.gpu_available else torch.float32
            device = 'cuda' if self.gpu_available else 'cpu'

            if 'sdxl' in model_id:
                pipe = StableDiffusionXLPipeline.from_pretrained(
                    hf_id, torch_dtype=dtype, variant='fp16' if self.gpu_available else None
                )
            else:
                pipe = StableDiffusionPipeline.from_pretrained(
                    hf_id, torch_dtype=dtype
                )

            pipe = pipe.to(device)
            
            if self.gpu_available:
                pipe.enable_model_cpu_offload()

            self.loaded_models[model_id] = pipe
            logger.info(f'Model {model_id} loaded successfully')
            return True

        except ImportError as e:
            logger.error(f'Missing dependency: {e}')
            logger.error('Install with: pip install diffusers transformers accelerate')
            return False
        except Exception as e:
            logger.error(f'Failed to load model: {e}')
            return False

    def generate_image(self, prompt: str, negative_prompt: str = '',
                       width: int = 512, height: int = 512, steps: int = 20,
                       cfg_scale: float = 7.0, seed: Optional[int] = None):
        """Generate an image using the loaded model."""
        import torch

        # Find any loaded image model
        pipe = None
        model_id = None
        for mid in ['sd-turbo', 'sdxl-base']:
            if mid in self.loaded_models:
                pipe = self.loaded_models[mid]
                model_id = mid
                break

        if pipe is None:
            raise HTTPException(status_code=400, detail='No image model loaded. Download and activate a model first.')

        generator = None
        if seed is not None:
            device = 'cuda' if self.gpu_available else 'cpu'
            generator = torch.Generator(device=device).manual_seed(seed)
        else:
            seed = int.from_bytes(os.urandom(4), 'big')

        logger.info(f'Generating image: "{prompt[:50]}..." | {width}x{height} | {steps} steps')

        start_time = time.time()
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt or None,
            width=width,
            height=height,
            num_inference_steps=steps,
            guidance_scale=cfg_scale,
            generator=generator,
        )
        generation_time = time.time() - start_time

        image = result.images[0]
        filename = f'img_{int(time.time())}_{seed}.png'
        filepath = OUTPUT_DIR / filename
        image.save(filepath)

        # NSFW check
        is_nsfw = hasattr(result, 'nsfw_content_detected') and any(result.nsfw_content_detected)

        logger.info(f'Image generated in {generation_time:.1f}s: {filename}')

        return {
            'image_url': f'/output/{filename}',
            'is_nsfw': is_nsfw,
            'seed': seed,
            'generation_time': round(generation_time, 2),
        }


model_manager = ModelManager()

# ─── FastAPI App ──────────────────────────────────────────────────────────
app = FastAPI(title='NeuralForge Backend', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ─── Serve output files ──────────────────────────────────────────────────
@app.get('/output/{filename}')
async def serve_output(filename: str):
    filepath = OUTPUT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail='File not found')
    return FileResponse(filepath)

# ─── Health Check ─────────────────────────────────────────────────────────
@app.get('/health')
async def health():
    return {
        'status': 'ok',
        'version': '1.0.0',
        'backend': 'neuralforge-python',
        'gpu_available': model_manager.gpu_available,
        'gpu_name': model_manager.gpu_name,
        'models_loaded': list(model_manager.loaded_models.keys()),
        'output_dir': str(OUTPUT_DIR),
    }

# ─── Image Generation ────────────────────────────────────────────────────
class ImageRequest(BaseModel):
    prompt: str
    negativePrompt: str = ''
    width: int = 512
    height: int = 512
    steps: int = 20
    cfgScale: float = 7.0
    style: str = 'Photorealistic'
    seed: Optional[int] = None

@app.post('/api/generate/image')
async def generate_image(req: ImageRequest):
    # Safety check
    safety = check_prompt_safety(req.prompt)
    if not safety['safe']:
        raise HTTPException(status_code=400, detail=safety['reason'])

    try:
        result = model_manager.generate_image(
            prompt=req.prompt,
            negative_prompt=req.negativePrompt,
            width=req.width,
            height=req.height,
            steps=req.steps,
            cfg_scale=req.cfgScale,
            seed=req.seed,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Image generation failed: {e}')
        raise HTTPException(status_code=500, detail=str(e))

# ─── Video Generation ────────────────────────────────────────────────────
class VideoRequest(BaseModel):
    prompt: str
    duration: int = 2
    fps: int = 12
    width: int = 512
    height: int = 512
    imageToVideo: bool = False
    sourceImage: Optional[str] = None

@app.post('/api/generate/video')
async def generate_video(req: VideoRequest):
    safety = check_prompt_safety(req.prompt)
    if not safety['safe']:
        raise HTTPException(status_code=400, detail=safety['reason'])

    try:
        # Video generation with AnimateDiff or SVD
        # This is a placeholder — actual implementation requires the models
        raise HTTPException(
            status_code=501,
            detail='Video generation requires AnimateDiff or SVD model. Please ensure a video model is downloaded and active.'
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Video generation failed: {e}')
        raise HTTPException(status_code=500, detail=str(e))

# ─── Model Management ────────────────────────────────────────────────────
@app.get('/api/models')
async def list_models():
    models = [
        {'id': 'sd-turbo', 'name': 'SD Turbo', 'type': 'image', 'downloaded': False, 'active': 'sd-turbo' in model_manager.loaded_models},
        {'id': 'sdxl-base', 'name': 'Stable Diffusion XL', 'type': 'image', 'downloaded': False, 'active': 'sdxl-base' in model_manager.loaded_models},
        {'id': 'animatediff', 'name': 'AnimateDiff', 'type': 'video', 'downloaded': False, 'active': False},
        {'id': 'svd-xt', 'name': 'SVD XT', 'type': 'video', 'downloaded': False, 'active': False},
    ]
    # Check which models are downloaded
    for m in models:
        model_path = MODELS_DIR / m['id']
        m['downloaded'] = model_path.exists()
    return {'models': models}

class DownloadRequest(BaseModel):
    model_id: str

@app.post('/api/models/download')
async def download_model(req: DownloadRequest):
    try:
        success = model_manager.load_image_model(req.model_id)
        if success:
            return {'message': f'Model {req.model_id} downloaded and loaded', 'success': True}
        else:
            raise HTTPException(status_code=500, detail=f'Failed to download model {req.model_id}')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Safety Check ─────────────────────────────────────────────────────────
class SafetyRequest(BaseModel):
    prompt: str

@app.post('/api/safety/check')
async def safety_check(req: SafetyRequest):
    result = check_prompt_safety(req.prompt)
    return {'safe': result['safe'], 'blocked_keyword': result['blocked_keyword']}

# ─── Run ──────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get('PORT', 5000))
    logger.info(f'🧠 NeuralForge Backend starting on port {port}')
    logger.info(f'📁 Data directory: {DATA_DIR}')
    logger.info(f'🖥️  GPU: {"Yes — " + model_manager.gpu_name if model_manager.gpu_available else "No — using CPU"}')
    uvicorn.run(app, host='0.0.0.0', port=port)
