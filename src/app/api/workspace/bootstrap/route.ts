import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'instagram', label: 'Instagram', oauth_status: 'not-connected' },
  { platform: 'facebook', label: 'Facebook Page', oauth_status: 'not-connected' },
  { platform: 'tiktok', label: 'TikTok', oauth_status: 'not-connected' },
  { platform: 'whatsapp', label: 'WhatsApp', oauth_status: 'manual-link' },
  { platform: 'shopee', label: 'Shopee', oauth_status: 'manual-link' },
  { platform: 'lazada', label: 'Lazada', oauth_status: 'manual-link' },
  { platform: 'tiktokShop', label: 'TikTok Shop', oauth_status: 'manual-link' },
  { platform: 'carousell', label: 'Carousell', oauth_status: 'manual-link' },
  { platform: 'website', label: 'Website / Landing Page', oauth_status: 'manual-link' },
];

const DEFAULT_CHARACTERS = [
  {
    name: 'Aunty Deal Hunter',
    type: 'virtual-influencer',
    role: 'Singapore organic content host who finds useful things and explains why people should care',
    personality: 'Funny, direct, warm, slightly kaypoh, Singlish-light but still brand-safe',
    visual_description: 'Friendly Singaporean aunty, expressive face, approachable smile, social-media host energy',
    outfit_style: 'Casual heartland outfit with neat styling and bright accent colors',
    voice_tone: 'Conversational, practical, funny, trustworthy',
    catchphrases: ['Good thing must share', 'Don’t say bojio', 'This one actually useful'],
    content_themes: ['daily useful finds', 'Singapore lifestyle tips', 'problem-solution stories', 'link-in-bio CTA'],
    do_rules: 'Keep it friendly, useful, local, and organic. Make the character recurring and memorable.',
    dont_rules: 'Avoid hard-selling, offensive stereotypes, exaggerated income claims, or misleading urgency.',
    reference_image_url: '',
    active: true,
  },
  {
    name: 'SG Founder Avatar',
    type: 'founder-avatar',
    role: 'Founder-style persona that builds trust and explains the story behind each post',
    personality: 'Sincere, hardworking, knowledgeable, relatable',
    visual_description: 'Modern Singapore small business owner, confident but approachable, clean social video look',
    outfit_style: 'Smart casual, neutral colors, clean background',
    voice_tone: 'Helpful, honest, concise',
    catchphrases: ['Here’s what I learned', 'Let me show you', 'This is why it matters'],
    content_themes: ['behind the scenes', 'founder story', 'educational tips', 'trust building'],
    do_rules: 'Make the founder feel real, helpful, and consistent.',
    dont_rules: 'Avoid fake guarantees, over-polished corporate tone, or unrealistic testimonials.',
    reference_image_url: '',
    active: false,
  },
];

export async function POST(request: NextRequest) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { detail: 'Supabase service role is not configured.' },
      { status: 409 },
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!token) {
    return NextResponse.json(
      { detail: 'Missing Supabase access token.' },
      { status: 401 },
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json(
      { detail: userError?.message || 'Invalid Supabase access token.' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const user = userData.user;
  const workspaceName = body.workspaceName || 'NeuralForge SG Workspace';

  const { data: existingMembership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, owner_id)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ detail: membershipError.message }, { status: 500 });
  }

  if (existingMembership?.workspace_id) {
    return NextResponse.json({
      status: 'loaded',
      user: { id: user.id, email: user.email },
      workspace: {
        id: existingMembership.workspace_id,
        name: (existingMembership.workspaces as any)?.name || workspaceName,
      },
      role: existingMembership.role,
    });
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      owner_id: user.id,
      name: workspaceName,
      plan: 'starter',
    })
    .select('*')
    .single();

  if (workspaceError) {
    return NextResponse.json({ detail: workspaceError.message }, { status: 500 });
  }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    return NextResponse.json({ detail: memberError.message }, { status: 500 });
  }

  await supabase.from('brand_profiles').insert({
    workspace_id: workspace.id,
    business_name: body.businessName || 'NeuralForge SG Creator',
    industry: 'Organic content and social growth',
    target_audience: 'Singapore viewers who enjoy useful, entertaining and relatable local content',
    offer: 'Daily organic posts that bring viewers to my profile link or DM',
    unique_selling_point: 'Singapore-localized recurring characters, regular posting, and link-driven organic growth',
    tone: 'friendly',
    language: 'singlish-light',
    singapore_zones: ['Tampines', 'Jurong', 'Woodlands', 'CBD'],
    primary_goal: 'awareness',
    pdpa_consent_purpose: 'To respond to enquiries and send opted-in marketing updates.',
  });

  await supabase.from('social_links').insert(
    DEFAULT_SOCIAL_LINKS.map((link) => ({
      workspace_id: workspace.id,
      ...link,
    }))
  );

  await supabase.from('characters').insert(
    DEFAULT_CHARACTERS.map((character) => ({
      workspace_id: workspace.id,
      ...character,
    }))
  );

  return NextResponse.json({
    status: 'created',
    user: { id: user.id, email: user.email },
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    role: 'owner',
  });
}
