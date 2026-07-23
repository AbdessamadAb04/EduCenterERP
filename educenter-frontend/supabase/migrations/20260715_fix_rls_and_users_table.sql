-- ============================================================
-- Migration: Fix RLS policies and users table structure
-- 
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create public.users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  fullname TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- 2. Fix RLS for etablissements
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create etablissements" ON public.etablissements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read etablissements they own" ON public.etablissements
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own etablissements" ON public.etablissements
  FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own etablissements" ON public.etablissements
  FOR DELETE USING (auth.uid() = owner_user_id);

-- 3. Fix RLS for user_etablissements
ALTER TABLE public.user_etablissements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can link themselves to etablissements" ON public.user_etablissements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND auth_user_id = auth.uid())
  );

CREATE POLICY "Users can read their own links" ON public.user_etablissements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND auth_user_id = auth.uid())
  );

-- 4. Auto-create public.users record when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, fullname, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill existing auth users who don't have a public.users record yet
INSERT INTO public.users (auth_user_id, fullname, email)
SELECT
  au.id,
  au.raw_user_meta_data ->> 'full_name',
  au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.auth_user_id = au.id
);
