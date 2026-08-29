-- Hunared — Companies Directory migration
-- Run in Supabase SQL Editor

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
