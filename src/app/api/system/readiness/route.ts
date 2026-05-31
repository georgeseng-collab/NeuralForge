import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseConfig();
  const klingConfigured = Boolean(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY);

  return NextResponse.json({
    supabase: {
      configured: supabase.configured,
      serviceConfigured: supabase.serviceConfigured,
      requiredEnv: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    },
    kling: {
      configured: klingConfigured,
      requiredEnv: ['KLING_ACCESS_KEY', 'KLING_SECRET_KEY', 'KLING_API_BASE_URL'],
    },
    storage: {
      recommendedBuckets: ['media-assets', 'kling-clips', 'post-thumbnails'],
    },
  });
}
