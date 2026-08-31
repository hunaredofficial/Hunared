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
