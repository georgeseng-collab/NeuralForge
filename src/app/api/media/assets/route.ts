import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string; extension: string } {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error('Invalid data URL.');

  const mimeType = match[1] || 'application/octet-stream';
  const extension = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('jpeg') || mimeType.includes('jpg')
      ? 'jpg'
      : mimeType.includes('webm')
        ? 'webm'
        : mimeType.includes('mp4')
          ? 'mp4'
          : 'bin';

  return {
    buffer: Buffer.from(match[2], 'base64'),
    mimeType,
    extension,
  };
}

async function fetchRemoteAsset(url: string): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Failed to fetch remote asset: ${response.status}`);

  const mimeType = response.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await response.arrayBuffer();
  const extension = mimeType.includes('webm')
    ? 'webm'
    : mimeType.includes('mp4')
      ? 'mp4'
      : mimeType.includes('png')
        ? 'png'
        : mimeType.includes('jpeg') || mimeType.includes('jpg')
          ? 'jpg'
          : 'bin';

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType,
    extension,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { detail: 'Supabase service client is not configured.' },
        { status: 409 },
      );
    }

    const body = await request.json();
    const {
      workspaceId,
      draftId,
      source,
      type = 'video',
      provider = 'manual',
      bucket = 'media-assets',
      pathPrefix = 'uploads',
      durationSeconds,
      width,
      height,
    } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { detail: 'workspaceId is required to store media assets.' },
        { status: 400 },
      );
    }
    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { detail: 'source data URL or remote URL is required.' },
        { status: 400 },
      );
    }

    const asset = source.startsWith('data:')
      ? parseDataUrl(source)
      : await fetchRemoteAsset(source);

    const storagePath = `${pathPrefix}/${workspaceId}/${crypto.randomUUID()}.${asset.extension}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, asset.buffer, {
        contentType: asset.mimeType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { detail: uploadError.message },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const publicUrl = publicData.publicUrl;

    const { data: mediaAsset, error: insertError } = await supabase
      .from('media_assets')
      .insert({
        workspace_id: workspaceId,
        draft_id: draftId || null,
        type,
        provider,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: asset.mimeType,
        duration_seconds: durationSeconds || null,
        width: width || null,
        height: height || null,
      })
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json(
        { detail: insertError.message, storagePath, publicUrl },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 'stored',
      bucket,
      storagePath,
      publicUrl,
      mediaAsset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to store media asset.' },
      { status: 500 },
    );
  }
}
