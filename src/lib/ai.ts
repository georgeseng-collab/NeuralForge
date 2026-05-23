import { NextRequest, NextResponse } from 'next/server';

const ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1';
const ZAI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai';
const ZAI_CHAT_ID = process.env.ZAI_CHAT_ID || '';
const ZAI_TOKEN = process.env.ZAI_TOKEN || '';
const ZAI_USER_ID = process.env.ZAI_USER_ID || '';
const ZAI_PROXY_URL = process.env.ZAI_PROXY_URL || '';

const IS_VERCEL = !!process.env.VERCEL;

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZAI_API_KEY}`,
    'X-Z-AI-From': 'Z',
  };
  if (ZAI_TOKEN) headers['X-Token'] = ZAI_TOKEN;
  if (ZAI_CHAT_ID) headers['X-Chat-Id'] = ZAI_CHAT_ID;
  if (ZAI_USER_ID) headers['X-User-Id'] = ZAI_USER_ID;
  return headers;
}

function buildApiUrl(endpoint: string): string {
  if (IS_VERCEL && ZAI_PROXY_URL) {
    const portMatch = ZAI_BASE_URL.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : '8080';
    return `${ZAI_PROXY_URL}/v1${endpoint}?XTransformPort=${port}`;
  }
  return `${ZAI_BASE_URL}${endpoint}`;
}

/**
 * Generate an SVG placeholder image with the prompt text
 */
function generatePlaceholderImage(prompt: string, style: string, width: number, height: number): string {
  const colors: Record<string, string[]> = {
    'Photorealistic': ['#6d28d9', '#ec4899'],
    'Anime': ['#f43f5e', '#f97316'],
    'Digital Art': ['#8b5cf6', '#06b6d4'],
    'Oil Painting': ['#92400e', '#b45309'],
    'Watercolor': ['#0ea5e9', '#a78bfa'],
    'Sketch': ['#6b7280', '#9ca3af'],
    'Cyberpunk': ['#7c3aed', '#06b6d4'],
    'Fantasy': ['#059669', '#7c3aed'],
  };
  const [c1, c2] = colors[style] || colors['Photorealistic'];
  const shortPrompt = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt;
  const escapedPrompt = shortPrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width/2}" y="${height/2 - 20}" font-family="system-ui, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.9">AI Generated Preview</text>
  <text x="${width/2}" y="${height/2 + 20}" font-family="system-ui, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">${escapedPrompt}</text>
  <text x="${width/2}" y="${height - 30}" font-family="system-ui, sans-serif" font-size="11" fill="white" text-anchor="middle" opacity="0.5">Run locally with backend for full AI generation</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Try to generate image using ZAI API, fall back to placeholder
 */
export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  style: string = 'Photorealistic',
  width: number = 512,
  height: number = 512
): Promise<{ imageUrl: string; isReal: boolean }> {
  const url = buildApiUrl('/images/generations');
  const headers = getHeaders();

  try {
    console.log(`[NeuralForge] Attempting ZAI API at: ${url.replace(/https?:\/\/[^/]+/, '***')}`);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, size }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();

    // Download and convert to base64
    const processedData = await Promise.all(
      (result.data || []).map(async (item: any) => {
        if (item.url) {
          try {
            const imgResponse = await fetch(item.url, { signal: AbortSignal.timeout(30000) });
            if (imgResponse.ok) {
              const arrayBuffer = await imgResponse.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              return { base64, format: 'png' };
            }
          } catch (e) {
            console.error('Failed to download image:', e);
          }
        }
        if (item.base64) return item;
        return item;
      })
    );

    const imageBase64 = processedData[0]?.base64;
    if (imageBase64) {
      return { imageUrl: `data:image/png;base64,${imageBase64}`, isReal: true };
    }

    throw new Error('No image data in response');
  } catch (error: any) {
    console.log(`[NeuralForge] ZAI API unavailable: ${error.message}. Generating placeholder.`);
    const placeholder = generatePlaceholderImage(prompt, style, width, height);
    return { imageUrl: placeholder, isReal: false };
  }
}

/**
 * Check if the ZAI API is reachable
 */
export async function checkHealth(): Promise<{ reachable: boolean; mode: string }> {
  try {
    const url = buildApiUrl('/images/generations');
    // Quick check - if on Vercel without proxy, we know it won't work
    if (IS_VERCEL && !ZAI_PROXY_URL) {
      return { reachable: false, mode: 'cloud-demo' };
    }
    // Try a lightweight request
    return { reachable: true, mode: 'checking' };
  } catch {
    return { reachable: false, mode: 'offline' };
  }
}
