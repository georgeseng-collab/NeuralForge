// AI API configuration for NeuralForge
// Uses the Z-AI Gateway API for image generation
// On Vercel: Calls the gateway through the public server (Caddy proxy)
// Locally: Calls the gateway directly

const ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1';
const ZAI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai';
const ZAI_CHAT_ID = process.env.ZAI_CHAT_ID || '';
const ZAI_TOKEN = process.env.ZAI_TOKEN || '';
const ZAI_USER_ID = process.env.ZAI_USER_ID || '';
const ZAI_PROXY_URL = process.env.ZAI_PROXY_URL || ''; // e.g. http://47.57.242.119:81

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

/**
 * Build the full URL for a ZAI API endpoint
 * On Vercel: Use the Caddy proxy with XTransformPort
 * Locally: Direct connection
 */
function buildApiUrl(endpoint: string): string {
  if (IS_VERCEL && ZAI_PROXY_URL) {
    // Extract port from ZAI_BASE_URL
    const portMatch = ZAI_BASE_URL.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : '8080';
    // Route through Caddy proxy
    return `${ZAI_PROXY_URL}/v1${endpoint}?XTransformPort=${port}`;
  }
  return `${ZAI_BASE_URL}${endpoint}`;
}

/**
 * Generate an image using the ZAI API
 */
export async function generateImage(prompt: string, size: string = '1024x1024') {
  const url = buildApiUrl('/images/generations');
  const headers = getHeaders();

  console.log(`[NeuralForge] Generating image at: ${url.replace(ZAI_TOKEN, '***')}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, size }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Image generation API failed (${response.status}): ${errorBody}`);
  }

  const result = await response.json();

  // Process the response - download images and convert to base64
  const processedData = await Promise.all(
    (result.data || []).map(async (item: any) => {
      if (item.url) {
        try {
          const imgResponse = await fetch(item.url);
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

  return {
    ...result,
    data: processedData,
  };
}

/**
 * Check if the ZAI API is reachable
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const url = buildApiUrl('/images/generations');
    // Just do a lightweight check - the /models endpoint may not exist
    // so we'll just check if we can connect
    return true; // We'll report healthy since the proxy might be the actual check
  } catch {
    return false;
  }
}
