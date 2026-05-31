import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  configured: boolean;
  serviceConfigured: boolean;
};

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    url,
    anonKey,
    serviceRoleKey,
    configured: Boolean(url && anonKey),
    serviceConfigured: Boolean(url && serviceRoleKey),
  };
}

export function createBrowserSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.configured) return null;

  return createClient(config.url, config.anonKey);
}

export function createServiceSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.serviceConfigured) return null;

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
