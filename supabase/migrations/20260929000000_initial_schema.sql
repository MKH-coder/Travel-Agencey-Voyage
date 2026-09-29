-- Migration: 20260929000000_initial_schema.sql
-- Voyage Global Travel Platform PostgreSQL / Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  duration TEXT,
  created_by TEXT,
  created_by_name TEXT,
  listing_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  custom_title TEXT,
  department TEXT,
  avatar TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  recovery_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Custom Posts Table
CREATE TABLE IF NOT EXISTS public.custom_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  base_role TEXT NOT NULL DEFAULT 'ADMIN',
  description TEXT,
  privileges TEXT[] DEFAULT ARRAY[]::TEXT[],
  badge_color TEXT DEFAULT 'sky',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  performed_by_email TEXT,
  target_id TEXT,
  target_type TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  listing_category TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Price Alerts Table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  target_price NUMERIC(10, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_avatar TEXT,
  rating NUMERIC(2, 1) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Custom Trips Table
CREATE TABLE IF NOT EXISTS public.custom_trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  trip_title TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  travel_style TEXT,
  budget_tier TEXT,
  estimated_price NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'PENDING_QUOTE',
  day_itineraries JSONB,
  inclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
  selected_listing_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_trips ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads
CREATE POLICY "Public listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users are viewable by authenticated users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Custom posts are viewable by everyone" ON public.custom_posts FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert on listings" ON public.listings FOR ALL USING (true);
CREATE POLICY "Public insert on reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Public insert on bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Public insert on audit logs" ON public.audit_logs FOR ALL USING (true);
