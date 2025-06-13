-- Supabase Database Setup for Admin-Only Authentication
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  bio TEXT,
  title TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Policy: Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow profile creation only during user registration (handled by trigger)
CREATE POLICY "Allow profile creation on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Create your first admin user (SINGLE ADMIN SETUP)
-- Step 1: First, sign up through your app at /auth/login with your email
-- Step 2: Then run this command to make that user an admin (REPLACE WITH YOUR EMAIL):

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';

-- Step 3: Disable new user signups in Supabase Auth settings:
-- Go to Authentication → Settings → "Enable email confirmations" = OFF
-- Go to Authentication → Settings → "Enable phone confirmations" = OFF
-- This prevents new users from signing up

-- 9. Create posts table (if not exists) with RLS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('breaking', 'urgent', 'normal')),
  reading_time INTEGER,
  source_attribution TEXT[],
  is_breaking BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for posts

-- Policy: Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (status = 'published');

-- Policy: Admins can view all posts
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can insert posts
CREATE POLICY "Admins can insert posts" ON public.posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update posts
CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete posts
CREATE POLICY "Admins can delete posts" ON public.posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 12. Create updated_at trigger for posts
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- ========================================
-- SCHEDULED POSTS FEATURE - DATABASE MIGRATION
-- ========================================
-- This section adds scheduled post functionality
-- Run this migration after the initial setup above

-- 14. Add scheduled post fields to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Phnom_Penh',
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT FALSE;

-- 15. Update status constraint to include 'scheduled'
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_status_check
CHECK (status IN ('draft', 'published', 'scheduled'));

-- 16. Add indexes for scheduled post queries
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status_scheduled ON public.posts(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_auto_publish ON public.posts(auto_publish, scheduled_at);

-- Optimized index for finding posts ready to publish
CREATE INDEX IF NOT EXISTS idx_posts_publish_ready
ON public.posts (scheduled_at, status, auto_publish)
WHERE status = 'scheduled' AND auto_publish = TRUE;

-- 17. Update RLS policy for public viewing to include scheduled posts (admin-only)
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (status = 'published');

-- Note: Scheduled posts are only visible to admins via existing "Admins can view all posts" policy

-- 18. Create function for automatic publishing of scheduled posts
CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
  published_count INTEGER := 0;
BEGIN
  -- Update scheduled posts that are ready to be published
  UPDATE public.posts
  SET
    status = 'published',
    published_at = NOW(),
    updated_at = NOW()
  WHERE
    status = 'scheduled'
    AND auto_publish = TRUE
    AND scheduled_at <= NOW()
    AND scheduled_at IS NOT NULL;

  -- Get the count of published posts
  GET DIAGNOSTICS published_count = ROW_COUNT;

  -- Log the operation (optional - for debugging)
  INSERT INTO public.scheduled_posts_log (published_count, executed_at)
  VALUES (published_count, NOW())
  ON CONFLICT DO NOTHING;

  RETURN published_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Create audit table for scheduled post operations (optional but recommended)
CREATE TABLE IF NOT EXISTS public.scheduled_posts_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  published_count INTEGER NOT NULL DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT
);

-- Enable RLS on log table
ALTER TABLE public.scheduled_posts_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view scheduled posts logs" ON public.scheduled_posts_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 20. Create audit table for post schedule changes
CREATE TABLE IF NOT EXISTS public.post_schedule_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('scheduled', 'rescheduled', 'cancelled', 'published')),
  old_scheduled_at TIMESTAMP WITH TIME ZONE,
  new_scheduled_at TIMESTAMP WITH TIME ZONE,
  old_status TEXT,
  new_status TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.post_schedule_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view schedule audit" ON public.post_schedule_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert audit records
CREATE POLICY "Admins can insert schedule audit" ON public.post_schedule_audit
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 21. Create function to log schedule changes
CREATE OR REPLACE FUNCTION public.log_schedule_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if scheduling-related fields changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR
     (OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at) THEN

    INSERT INTO public.post_schedule_audit (
      post_id,
      action,
      old_scheduled_at,
      new_scheduled_at,
      old_status,
      new_status,
      user_id
    ) VALUES (
      NEW.id,
      CASE
        WHEN OLD.status != 'scheduled' AND NEW.status = 'scheduled' THEN 'scheduled'
        WHEN OLD.status = 'scheduled' AND NEW.status = 'scheduled' AND OLD.scheduled_at != NEW.scheduled_at THEN 'rescheduled'
        WHEN OLD.status = 'scheduled' AND NEW.status != 'scheduled' THEN 'cancelled'
        WHEN OLD.status = 'scheduled' AND NEW.status = 'published' THEN 'published'
        ELSE 'updated'
      END,
      OLD.scheduled_at,
      NEW.scheduled_at,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22. Create trigger for schedule change logging
CREATE TRIGGER posts_schedule_audit_trigger
  AFTER UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_schedule_change();
