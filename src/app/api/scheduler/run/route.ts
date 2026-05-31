import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

function isAuthorized(request: NextRequest) {
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('authorization') || '';
  const querySecret = request.nextUrl.searchParams.get('secret') || '';
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { detail: 'Unauthorized scheduler request.' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const confirmPublish = Boolean(body.confirmPublish);
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        detail: 'Supabase service client is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const { data: duePosts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .lte('scheduled_for', now)
    .in('status', ['scheduled'])
    .order('scheduled_for', { ascending: true })
    .limit(25);

  if (error) {
    return NextResponse.json(
      { detail: error.message },
      { status: 500 },
    );
  }

  if (!confirmPublish) {
    return NextResponse.json({
      status: 'dry_run',
      dueCount: duePosts?.length || 0,
      duePosts,
      detail: 'Dry run only. Set confirmPublish=true after platform publishing adapters are connected.',
    });
  }

  // Real platform adapters will be wired here:
  // - publishToFacebookPage()
  // - publishToInstagramBusiness()
  // - publishToTikTok()
  //
  // Until then, fail closed so the scheduler cannot mark posts as published
  // without an actual platform response.
  return NextResponse.json(
    {
      status: 'adapters_missing',
      dueCount: duePosts?.length || 0,
      detail: 'Publishing adapters are not connected yet. Scheduler found due posts but did not publish them.',
    },
    { status: 501 },
  );
}
