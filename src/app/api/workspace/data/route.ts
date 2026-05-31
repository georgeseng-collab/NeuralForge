import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

async function getAuthedUser(request: NextRequest) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error('Supabase service role is not configured.');

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!token) throw new Error('Missing Supabase access token.');

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error(error?.message || 'Invalid Supabase access token.');

  return { supabase, user: data.user };
}

async function assertWorkspaceMember(supabase: ReturnType<typeof createServiceSupabaseClient>, workspaceId: string, userId: string) {
  if (!supabase) throw new Error('Supabase service role is not configured.');
  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('User is not a member of this workspace.');
}

function toBrandProfile(row: any) {
  return {
    businessName: row.business_name || '',
    industry: row.industry || '',
    targetAudience: row.target_audience || '',
    offer: row.offer || '',
    uniqueSellingPoint: row.unique_selling_point || '',
    tone: row.tone || 'friendly',
    language: row.language || 'singlish-light',
    singaporeZones: row.singapore_zones || [],
    primaryGoal: row.primary_goal || 'awareness',
    whatsappNumber: row.whatsapp_number || '',
    pdpaConsentPurpose: row.pdpa_consent_purpose || '',
  };
}

function toCharacter(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    role: row.role || '',
    personality: row.personality || '',
    visualDescription: row.visual_description || '',
    outfitStyle: row.outfit_style || '',
    voiceTone: row.voice_tone || '',
    catchphrases: row.catchphrases || [],
    contentThemes: row.content_themes || [],
    doRules: row.do_rules || '',
    dontRules: row.dont_rules || '',
    referenceImageUrl: row.reference_image_url || '',
    active: Boolean(row.active),
  };
}

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || '';
    if (!workspaceId) {
      return NextResponse.json({ detail: 'workspaceId is required.' }, { status: 400 });
    }

    const { supabase, user } = await getAuthedUser(request);
    await assertWorkspaceMember(supabase, workspaceId, user.id);

    const [brandResult, linksResult, charactersResult] = await Promise.all([
      supabase.from('brand_profiles').select('*').eq('workspace_id', workspaceId).limit(1).maybeSingle(),
      supabase.from('social_links').select('*').eq('workspace_id', workspaceId).order('label'),
      supabase.from('characters').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: true }),
    ]);

    if (brandResult.error) throw new Error(brandResult.error.message);
    if (linksResult.error) throw new Error(linksResult.error.message);
    if (charactersResult.error) throw new Error(charactersResult.error.message);

    return NextResponse.json({
      brandProfile: brandResult.data ? toBrandProfile(brandResult.data) : null,
      socialLinks: (linksResult.data || []).map((row: any) => ({
        platform: row.platform,
        label: row.label,
        url: row.url || '',
        connected: Boolean(row.url || row.oauth_status === 'connected'),
        oauthStatus: row.oauth_status || 'not-connected',
      })),
      characters: (charactersResult.data || []).map(toCharacter),
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to load workspace data.' },
      { status: error.message?.includes('token') ? 401 : 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, brandProfile, socialLinks, characters } = body;
    if (!workspaceId) {
      return NextResponse.json({ detail: 'workspaceId is required.' }, { status: 400 });
    }

    const { supabase, user } = await getAuthedUser(request);
    await assertWorkspaceMember(supabase, workspaceId, user.id);

    if (brandProfile) {
      const { data: existingBrand } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('workspace_id', workspaceId)
        .limit(1)
        .maybeSingle();
      const payload = {
        workspace_id: workspaceId,
        business_name: brandProfile.businessName,
        industry: brandProfile.industry,
        target_audience: brandProfile.targetAudience,
        offer: brandProfile.offer,
        unique_selling_point: brandProfile.uniqueSellingPoint,
        tone: brandProfile.tone,
        language: brandProfile.language,
        singapore_zones: brandProfile.singaporeZones || [],
        primary_goal: brandProfile.primaryGoal,
        whatsapp_number: brandProfile.whatsappNumber,
        pdpa_consent_purpose: brandProfile.pdpaConsentPurpose,
        updated_at: new Date().toISOString(),
      };
      const result = existingBrand?.id
        ? await supabase.from('brand_profiles').update(payload).eq('id', existingBrand.id)
        : await supabase.from('brand_profiles').insert(payload);
      if (result.error) throw new Error(result.error.message);
    }

    if (Array.isArray(socialLinks)) {
      for (const link of socialLinks) {
        const { error } = await supabase
          .from('social_links')
          .upsert({
            workspace_id: workspaceId,
            platform: link.platform,
            label: link.label,
            url: link.url || '',
            oauth_status: link.oauthStatus || 'manual-link',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'workspace_id,platform' });
        if (error) throw new Error(error.message);
      }
    }

    if (Array.isArray(characters)) {
      for (const character of characters) {
        const payload = {
          workspace_id: workspaceId,
          name: character.name,
          type: character.type,
          role: character.role,
          personality: character.personality,
          visual_description: character.visualDescription,
          outfit_style: character.outfitStyle,
          voice_tone: character.voiceTone,
          catchphrases: character.catchphrases || [],
          content_themes: character.contentThemes || [],
          do_rules: character.doRules,
          dont_rules: character.dontRules,
          reference_image_url: character.referenceImageUrl,
          active: Boolean(character.active),
          updated_at: new Date().toISOString(),
        };
        const result = character.id && character.id.length === 36
          ? await supabase.from('characters').upsert({ id: character.id, ...payload })
          : await supabase.from('characters').insert(payload);
        if (result.error) throw new Error(result.error.message);
      }
    }

    return NextResponse.json({ status: 'saved' });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to save workspace data.' },
      { status: error.message?.includes('token') ? 401 : 500 },
    );
  }
}
