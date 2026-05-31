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

function toOffer(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || '',
    price: row.price || '',
    promoPrice: row.promo_price || '',
    stock: row.stock || '',
    benefits: row.benefits || '',
    targetBuyer: row.target_buyer || '',
    orderLink: row.order_link || '',
    deliveryInfo: row.delivery_info || '',
  };
}

function toDraft(row: any) {
  return {
    id: row.id,
    title: row.title || '',
    platform: row.platform || 'instagram',
    contentType: row.content_type || 'image',
    goal: row.goal || 'awareness',
    hook: row.hook || '',
    caption: row.caption || '',
    prompt: row.prompt || '',
    cta: row.cta || '',
    hashtags: row.hashtags || [],
    productId: row.offer_id || undefined,
    characterId: row.character_id || undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function toScheduledPost(row: any) {
  return {
    id: row.id,
    draftId: row.draft_id || '',
    platform: row.platform || 'instagram',
    caption: row.caption || '',
    assetType: row.asset_type || 'image',
    scheduledFor: row.scheduled_for ? String(row.scheduled_for).slice(0, 16) : '',
    status: row.status || 'draft',
    notes: row.notes || '',
  };
}

function toLead(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    contact: row.contact || '',
    source: row.source || 'manual',
    interest: row.interest || '',
    status: row.status || 'new',
    consent: Boolean(row.consent),
    consentPurpose: row.consent_purpose || '',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    notes: row.notes || '',
  };
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || '';
    if (!workspaceId) {
      return NextResponse.json({ detail: 'workspaceId is required.' }, { status: 400 });
    }

    const { supabase, user } = await getAuthedUser(request);
    await assertWorkspaceMember(supabase, workspaceId, user.id);

    const [brandResult, linksResult, charactersResult, offersResult, draftsResult, scheduledResult, leadsResult] = await Promise.all([
      supabase.from('brand_profiles').select('*').eq('workspace_id', workspaceId).limit(1).maybeSingle(),
      supabase.from('social_links').select('*').eq('workspace_id', workspaceId).order('label'),
      supabase.from('characters').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: true }),
      supabase.from('offers').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('campaign_drafts').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('scheduled_posts').select('*').eq('workspace_id', workspaceId).order('scheduled_for', { ascending: true }),
      supabase.from('leads').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
    ]);

    if (brandResult.error) throw new Error(brandResult.error.message);
    if (linksResult.error) throw new Error(linksResult.error.message);
    if (charactersResult.error) throw new Error(charactersResult.error.message);
    if (offersResult.error) throw new Error(offersResult.error.message);
    if (draftsResult.error) throw new Error(draftsResult.error.message);
    if (scheduledResult.error) throw new Error(scheduledResult.error.message);
    if (leadsResult.error) throw new Error(leadsResult.error.message);

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
      products: (offersResult.data || []).map(toOffer),
      campaignDrafts: (draftsResult.data || []).map(toDraft),
      scheduledPosts: (scheduledResult.data || []).map(toScheduledPost),
      leads: (leadsResult.data || []).map(toLead),
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
    const { workspaceId, brandProfile, socialLinks, characters, products, campaignDrafts, scheduledPosts, leads } = body;
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
      await supabase.from('characters').delete().eq('workspace_id', workspaceId);
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
        const result = await supabase.from('characters').insert(isUuid(character.id) ? { id: character.id, ...payload } : payload);
        if (result.error) throw new Error(result.error.message);
      }
    }

    if (Array.isArray(products)) {
      await supabase.from('offers').delete().eq('workspace_id', workspaceId);
      for (const product of products) {
        const { error } = await supabase.from('offers').insert({
          ...(isUuid(product.id) ? { id: product.id } : {}),
          workspace_id: workspaceId,
          name: product.name,
          category: product.category,
          price: product.price,
          promo_price: product.promoPrice,
          stock: product.stock,
          benefits: product.benefits,
          target_buyer: product.targetBuyer,
          order_link: product.orderLink,
          delivery_info: product.deliveryInfo,
        });
        if (error) throw new Error(error.message);
      }
    }

    if (Array.isArray(campaignDrafts)) {
      await supabase.from('campaign_drafts').delete().eq('workspace_id', workspaceId);
      for (const draft of campaignDrafts) {
        const { error } = await supabase.from('campaign_drafts').insert({
          ...(isUuid(draft.id) ? { id: draft.id } : {}),
          workspace_id: workspaceId,
          offer_id: isUuid(draft.productId) ? draft.productId : null,
          character_id: isUuid(draft.characterId) ? draft.characterId : null,
          title: draft.title,
          platform: draft.platform,
          content_type: draft.contentType,
          goal: draft.goal,
          hook: draft.hook,
          caption: draft.caption,
          prompt: draft.prompt,
          cta: draft.cta,
          hashtags: draft.hashtags || [],
          status: 'draft',
        });
        if (error) throw new Error(error.message);
      }
    }

    if (Array.isArray(scheduledPosts)) {
      await supabase.from('scheduled_posts').delete().eq('workspace_id', workspaceId);
      for (const post of scheduledPosts) {
        const { error } = await supabase.from('scheduled_posts').insert({
          ...(isUuid(post.id) ? { id: post.id } : {}),
          workspace_id: workspaceId,
          draft_id: isUuid(post.draftId) ? post.draftId : null,
          platform: post.platform,
          caption: post.caption,
          asset_type: post.assetType,
          scheduled_for: post.scheduledFor ? new Date(post.scheduledFor).toISOString() : new Date().toISOString(),
          status: post.status,
          notes: post.notes,
        });
        if (error) throw new Error(error.message);
      }
    }

    if (Array.isArray(leads)) {
      await supabase.from('leads').delete().eq('workspace_id', workspaceId);
      for (const lead of leads) {
        const { error } = await supabase.from('leads').insert({
          ...(isUuid(lead.id) ? { id: lead.id } : {}),
          workspace_id: workspaceId,
          name: lead.name,
          contact: lead.contact,
          source: lead.source,
          interest: lead.interest,
          status: lead.status,
          consent: Boolean(lead.consent),
          consent_purpose: lead.consentPurpose,
          notes: lead.notes,
        });
        if (error) throw new Error(error.message);
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
