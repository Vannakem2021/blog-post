-- ========================================
-- SECURITY ENHANCEMENTS FOR NEWSHUB
-- ========================================
-- Run these SQL commands in your Supabase SQL Editor
-- These enhance the existing security setup with additional protections

-- 1. Add security audit table for tracking security events
CREATE TABLE IF NOT EXISTS public.security_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_change', 'role_change', 'data_access', 'data_modification')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit" ON public.security_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit records
CREATE POLICY "System can insert security audit" ON public.security_audit
  FOR INSERT WITH CHECK (true);

-- 2. Add user status and account security fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'locked')),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mfa_secret TEXT;

-- 3. Enhanced RLS policies for profiles with status check
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Users can only access their own profile if active
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id AND status = 'active'
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id AND status = 'active'
  )
  WITH CHECK (
    auth.uid() = id 
    AND status = 'active'
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- 4. Enhanced RLS policies for posts with audit trail
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
CREATE POLICY "Admins can insert posts" ON public.posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
CREATE POLICY "Admins can update posts" ON public.posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Admins can delete posts" ON public.posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- 5. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details
  ) VALUES (
    event_type,
    COALESCE(user_id, auth.uid()),
    ip_address,
    user_agent,
    details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to handle failed login attempts
CREATE OR REPLACE FUNCTION public.handle_failed_login(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF FOUND THEN
    -- Increment failed login attempts
    UPDATE public.profiles 
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = user_profile.id;
    
    -- Lock account after 5 failed attempts
    IF user_profile.failed_login_attempts >= 4 THEN
      UPDATE public.profiles 
      SET status = 'locked'
      WHERE id = user_profile.id;
      
      -- Log security event
      PERFORM public.log_security_event(
        'account_locked',
        user_profile.id,
        NULL,
        NULL,
        jsonb_build_object('reason', 'too_many_failed_attempts')
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to handle successful login
CREATE OR REPLACE FUNCTION public.handle_successful_login(
  user_id UUID,
  ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Reset failed login attempts and update last login
  UPDATE public.profiles 
  SET 
    failed_login_attempts = 0,
    last_login_at = NOW(),
    last_login_ip = ip_address
  WHERE id = user_id;
  
  -- Log security event
  PERFORM public.log_security_event(
    'login',
    user_id,
    ip_address,
    NULL,
    jsonb_build_object('timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create indexes for security and performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- 9. Create view for admin security dashboard
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.failed_login_attempts,
  p.last_login_at,
  p.last_login_ip,
  p.created_at,
  (
    SELECT COUNT(*) 
    FROM public.security_audit sa 
    WHERE sa.user_id = p.id 
    AND sa.event_type = 'failed_login'
    AND sa.created_at > NOW() - INTERVAL '24 hours'
  ) as failed_logins_24h,
  (
    SELECT COUNT(*) 
    FROM public.posts 
    WHERE author_id = p.id
  ) as total_posts
FROM public.profiles p;

-- Only admins can view security dashboard
CREATE POLICY "Admins can view security dashboard" ON public.security_dashboard
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- 10. Create function to clean up old audit logs (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM public.security_audit 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
