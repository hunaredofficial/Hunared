-- ================================================================
-- Hunared — Advanced Jobs, Marketplace & Profile Intelligence
-- Migration 002 — safe additive changes (no data loss)
-- Run in Supabase SQL Editor → New Query → Run
-- ================================================================

-- ── Jobs: multi-category + optional auto-close ─────────────────
alter table jobs
  add column if not exists categories text[] default '{}',
  add column if not exists expires_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists close_reason text; -- 'manual' | 'expired' | null

-- Backfill categories from legacy single category column
update jobs
set categories = array[category]
where (categories is null or categories = '{}')
  and category is not null
  and category <> '';

create index if not exists idx_jobs_categories_gin on jobs using gin (categories);
create index if not exists idx_jobs_expires_at on jobs (expires_at) where expires_at is not null;
create index if not exists idx_jobs_status_expires on jobs (status, expires_at);

-- ── Marketplace listings: optional auto-close ──────────────────
alter table marketplace_listings
  add column if not exists expires_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists close_reason text;

create index if not exists idx_listings_expires_at
  on marketplace_listings (expires_at) where expires_at is not null;

-- ── Profiles: ensure job_interests array + location fields ─────
alter table profiles
  add column if not exists job_interests text[] default '{}',
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists available_for_hire boolean default true,
  add column if not exists skill_level text;

-- ── Subscription unique constraints (prevent duplicate subs) ───
create unique index if not exists uq_job_category_subs
  on job_category_subscriptions (user_id, category);

create unique index if not exists uq_market_category_subs
  on marketplace_category_subscriptions (user_id, category);

comment on column jobs.categories is 'Multi-select job categories; search uses any overlap';
comment on column jobs.expires_at is 'Optional auto-close timestamp; null = never auto-close';
comment on column marketplace_listings.expires_at is 'Optional auto-close timestamp; null = never';
