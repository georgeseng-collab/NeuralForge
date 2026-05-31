-- NeuralForge SG Growth Studio production backbone
-- Run in Supabase SQL editor or via Supabase migrations.

create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'marketer', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_name text not null,
  industry text,
  target_audience text,
  offer text,
  unique_selling_point text,
  tone text,
  language text,
  singapore_zones text[] not null default '{}',
  primary_goal text,
  whatsapp_number text,
  pdpa_consent_purpose text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null,
  label text not null,
  url text,
  oauth_status text not null default 'not-connected',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, platform)
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  type text not null,
  role text,
  personality text,
  visual_description text,
  outfit_style text,
  voice_tone text,
  catchphrases text[] not null default '{}',
  content_themes text[] not null default '{}',
  do_rules text,
  dont_rules text,
  reference_image_url text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  category text,
  price text,
  promo_price text,
  stock text,
  benefits text,
  target_buyer text,
  order_link text,
  delivery_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  character_id uuid references public.characters(id) on delete set null,
  title text not null,
  platform text not null,
  content_type text not null,
  goal text not null,
  hook text,
  caption text,
  prompt text,
  cta text,
  hashtags text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  draft_id uuid references public.campaign_drafts(id) on delete set null,
  type text not null check (type in ('image', 'video', 'thumbnail', 'clip')),
  provider text,
  storage_path text not null,
  public_url text,
  mime_type text,
  duration_seconds integer,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists public.kling_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  draft_id uuid references public.campaign_drafts(id) on delete set null,
  scene_order integer not null,
  scene_title text,
  scene_prompt text not null,
  duration_seconds integer not null,
  mode text not null,
  resolution text not null,
  estimated_cost_usd numeric(10, 2),
  provider_task_id text,
  status text not null default 'planned',
  video_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  draft_id uuid references public.campaign_drafts(id) on delete set null,
  asset_id uuid references public.media_assets(id) on delete set null,
  platform text not null,
  caption text,
  asset_type text not null,
  scheduled_for timestamptz not null,
  status text not null default 'draft',
  platform_post_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  contact text not null,
  source text not null,
  interest text,
  status text not null default 'new',
  consent boolean not null default false,
  consent_purpose text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('credit', 'debit', 'refund')),
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  provider text,
  reason text,
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_campaign_drafts_workspace on public.campaign_drafts(workspace_id);
create index if not exists idx_scheduled_posts_due on public.scheduled_posts(status, scheduled_for);
create index if not exists idx_kling_jobs_status on public.kling_jobs(workspace_id, status);
create index if not exists idx_leads_workspace_status on public.leads(workspace_id, status);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.characters enable row level security;
alter table public.offers enable row level security;
alter table public.campaign_drafts enable row level security;
alter table public.media_assets enable row level security;
alter table public.kling_jobs enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.leads enable row level security;
alter table public.credit_ledger enable row level security;

-- RLS policy template. Apply after auth is connected:
-- create policy "workspace members can read workspace data" on public.brand_profiles
-- for select using (
--   exists (
--     select 1 from public.workspace_members m
--     where m.workspace_id = brand_profiles.workspace_id
--     and m.user_id = auth.uid()
--   )
-- );
