-- ========================================
-- SCHEDULED POSTS FEATURE - DATABASE MIGRATION
-- ========================================
-- Run this migration in Supabase SQL Editor to add scheduled post functionality
-- This migration is safe to run multiple times (idempotent)

-- 1. Add scheduled post fields to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Phnom_Penh',
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT FALSE;

-- 2. Update status constraint to include 'scheduled'
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'published', 'scheduled'));

-- 3. Add indexes for scheduled post queries
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status_scheduled ON public.posts(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_auto_publish ON public.posts(auto_publish, scheduled_at);

-- Optimized index for finding posts ready to publish
CREATE INDEX IF NOT EXISTS idx_posts_publish_ready 
ON public.posts (scheduled_at, status, auto_publish) 
WHERE status = 'scheduled' AND auto_publish = TRUE;

-- 4. Update RLS policy for public viewing (no changes needed - scheduled posts remain admin-only)
-- The existing "Anyone can view published posts" policy already excludes scheduled posts
-- The existing "Admins can view all posts" policy already includes scheduled posts

-- 5. Create function for automatic publishing of scheduled posts
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

-- 6. Create audit table for scheduled post operations
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

-- 7. Create audit table for post schedule changes
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

-- 8. Create function to log schedule changes
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

-- 9. Create trigger for schedule change logging
DROP TRIGGER IF EXISTS posts_schedule_audit_trigger ON public.posts;
CREATE TRIGGER posts_schedule_audit_trigger
  AFTER UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_schedule_change();

-- 10. Update existing posts to have default values for new fields
UPDATE public.posts
SET
  timezone = 'Asia/Phnom_Penh',
  auto_publish = FALSE
WHERE
  timezone IS NULL OR auto_publish IS NULL;

-- Migration completed successfully!
-- You can now use scheduled post functionality in your application.
