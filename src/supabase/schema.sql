-- ================================================================
-- Hunared — Supabase Database Schema
-- Run this in Supabase SQL Editor → New Query
-- ================================================================

-- ── Enable UUID extension ──────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Custom Enum Types ──────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'employer', 'seeker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('pending', 'approved', 'rejected', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type article_status as enum ('pending', 'approved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type article_category as enum ('safety_hse', 'engineering', 'career_tips');
exception when duplicate_object then null; end $$;

-- ── Table: profiles ───────────────────────────────────────────
create table if not exists profiles (
  id                text primary key,  -- matches Clerk user ID (e.g. "user_2abc...")
  role              user_role not null default 'seeker',
  full_name         text not null,
  username          text unique,
  email             text not null unique,
  phone             text,
  gender            text,
  location          text,
  profession        text,
  avatar_url        text,              -- Cloudinary secure_url
  avatar_public_id  text,             -- Cloudinary public_id (for deletion)
  cv_url            text,             -- Supabase Storage signed URL path
  company_cr        text,
  company_website   text,
  company_address   text,
  job_interests     text[] default '{}',
  country           text,
  city              text,
  available_for_hire boolean default true,
  skill_level       text,
  deleted_at        timestamptz,      -- soft-delete timestamp (null = active)
  created_at        timestamptz not null default now()
);

-- ── Table: jobs ───────────────────────────────────────────────
create table if not exists jobs (
  id              uuid primary key default gen_random_uuid(),
  employer_id     text not null references profiles(id) on delete cascade,
  job_title       text not null,
  job_description text not null,
  positions       integer not null default 1,
  location        text not null,
  duration        text not null,
  salary_rate     text not null,
  category        text not null,
  subcategory     text,
  company_name    text not null,
  company_phone   text,
  company_email   text,
  company_address text,
  status          job_status not null default 'pending',
  created_at      timestamptz not null default now()
);

-- ── Table: articles ───────────────────────────────────────────
create table if not exists articles (
  id         uuid primary key default gen_random_uuid(),
  author_id  text not null references profiles(id) on delete cascade,
  title      text not null,
  content    text not null,
  category   article_category not null,
  status     article_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_profiles_role        on profiles(role);
create index if not exists idx_profiles_deleted_at  on profiles(deleted_at);
create index if not exists idx_jobs_status          on jobs(status);
create index if not exists idx_jobs_employer        on jobs(employer_id);
create index if not exists idx_jobs_category        on jobs(category);
create index if not exists idx_articles_status      on articles(status);
create index if not exists idx_articles_author      on articles(author_id);

-- ── Row Level Security ────────────────────────────────────────
alter table profiles  enable row level security;
alter table jobs      enable row level security;
alter table articles  enable row level security;

-- profiles: anyone can read active profiles; owner can update their own
create policy "Public read active profiles"
  on profiles for select
  using (deleted_at is null);

create policy "Users can update own profile"
  on profiles for update
  using (id = current_setting('app.current_user_id', true));

create policy "Service role has full access to profiles"
  on profiles for all
  using (current_setting('role', true) = 'service_role');

-- jobs: anyone can read approved jobs
create policy "Public read approved jobs"
  on jobs for select
  using (status = 'approved');

create policy "Employers can insert jobs"
  on jobs for insert
  with check (employer_id = current_setting('app.current_user_id', true));

create policy "Employers can update own jobs"
  on jobs for update
  using (employer_id = current_setting('app.current_user_id', true));

create policy "Service role has full access to jobs"
  on jobs for all
  using (current_setting('role', true) = 'service_role');

-- articles: anyone can read approved articles
create policy "Public read approved articles"
  on articles for select
  using (status = 'approved');

create policy "Authenticated users can insert articles"
  on articles for insert
  with check (author_id = current_setting('app.current_user_id', true));

create policy "Service role has full access to articles"
  on articles for all
  using (current_setting('role', true) = 'service_role');

-- ── Storage Buckets (run separately in Supabase Dashboard) ────
-- Bucket: "cvs"     → private, 10MB max, PDF only
-- Bucket: "avatars" → public,  5MB max,  image/* (but we use Cloudinary for images)
-- NOTE: Avatars are stored on Cloudinary. The "cvs" bucket is the only
--       Supabase Storage bucket required for this project.

-- ================================================================
-- SETUP REMINDER FOR SUPABASE DASHBOARD:
--   1. Create Storage bucket named "cvs" (private)
--   2. Set allowed MIME types: application/pdf
--   3. Set max file size: 10485760 (10MB)
--   4. Add Storage policy that allows service_role full access
--      and allows authenticated users to upload to their own folder:
--        path pattern: {user_id}/*
-- ================================================================

-- ================================================================
-- Companies table (Company Directory)
-- ================================================================
do $$ begin
  create type company_verification_status as enum (
    'unverified', 'pending', 'verified', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type company_status as enum (
    'active', 'temporarily_closed', 'closed', 'pending'
  );
exception when duplicate_object then null; end $$;

create table if not exists companies (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            text not null references profiles(id) on delete cascade,
  slug                text not null unique,
  name                text not null,
  legal_name          text,
  display_name        text,
  logo_url            text,
  logo_public_id      text,
  cover_url           text,
  cover_public_id     text,
  short_description   text,
  about               text,
  mission             text,
  vision              text,
  values_text         text,
  company_type        text,
  industry            text[] default '{}',
  sub_industry        text,
  services            text[] default '{}',
  products            text[] default '{}',
  business_size       text,
  employee_count      integer,
  employee_range      text,
  founded_year        integer,
  status              company_status not null default 'active',
  verification_status company_verification_status not null default 'unverified',
  is_featured         boolean not null default false,
  is_premium          boolean not null default false,
  is_hiring           boolean not null default false,
  headquarters_country text,
  headquarters_country_code text,
  headquarters_city   text,
  headquarters_address text,
  postal_code         text,
  locations           jsonb default '[]',
  countries_served    text[] default '{}',
  languages           text[] default '{}',
  website             text,
  email               text,
  phone               text,
  whatsapp            text,
  social_links        jsonb default '{}',
  certifications      text[] default '{}',
  rating_avg          numeric(3,2) default 0,
  reviews_count       integer not null default 0,
  followers_count     integer not null default 0,
  jobs_count          integer not null default 0,
  services_count      integer not null default 0,
  profile_completion  integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists companies_owner_idx on companies(owner_id);
create index if not exists companies_slug_idx on companies(slug);
create index if not exists companies_country_idx on companies(headquarters_country_code);
create index if not exists companies_city_idx on companies(headquarters_city);
create index if not exists companies_verification_idx on companies(verification_status);
create index if not exists companies_status_idx on companies(status);
create index if not exists companies_featured_idx on companies(is_featured) where is_featured = true;
create index if not exists companies_hiring_idx on companies(is_hiring) where is_hiring = true;
create index if not exists companies_industry_gin on companies using gin(industry);
create index if not exists companies_services_gin on companies using gin(services);
create index if not exists companies_name_trgm on companies using gin (name gin_trgm_ops);

-- Optional: enable pg_trgm for fuzzy name search
-- create extension if not exists pg_trgm;

alter table companies enable row level security;

create policy "Public read active companies"
  on companies for select
  using (status = 'active');

create policy "Owners can insert companies"
  on companies for insert
  with check (owner_id = current_setting('app.current_user_id', true));

create policy "Owners can update own companies"
  on companies for update
  using (owner_id = current_setting('app.current_user_id', true));

create policy "Service role full access companies"
  on companies for all
  using (current_setting('role', true) = 'service_role');

-- Company follows
create table if not exists company_follows (
  user_id     text not null references profiles(id) on delete cascade,
  company_id  uuid not null references companies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, company_id)
);

alter table company_follows enable row level security;

create policy "Users manage own follows"
  on company_follows for all
  using (user_id = current_setting('app.current_user_id', true));

create policy "Service role full access company_follows"
  on company_follows for all
  using (current_setting('role', true) = 'service_role');

-- Company reviews
create table if not exists company_reviews (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  reviewer_id text not null references profiles(id) on delete cascade,
  rating      integer not null check (rating >= 1 and rating <= 5),
  title       text,
  body        text,
  helpful_count integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (company_id, reviewer_id)
);

alter table company_reviews enable row level security;

create policy "Public read reviews"
  on company_reviews for select
  using (true);

create policy "Authenticated insert reviews"
  on company_reviews for insert
  with check (reviewer_id = current_setting('app.current_user_id', true));

create policy "Service role full access company_reviews"
  on company_reviews for all
  using (current_setting('role', true) = 'service_role');
