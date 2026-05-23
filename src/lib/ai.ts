import ZAI from 'z-ai-web-dev-sdk';

// Create ZAI instance using environment variables instead of .z-ai-config file
// This works on Vercel serverless where the config file doesn't exist
export function createZAI() {
  const config = {
    baseUrl: process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1',
    apiKey: process.env.ZAI_API_KEY || 'Z.ai',
    chatId: process.env.ZAI_CHAT_ID || '',
    token: process.env.ZAI_TOKEN || '',
    userId: process.env.ZAI_USER_ID || '',
  };

  if (!config.baseUrl || !config.apiKey) {
    throw new Error('ZAI_BASE_URL and ZAI_API_KEY environment variables are required');
  }

  return new ZAI(config);
}
