-- Security Enhancement Migration for Profiles Table
-- This adds security-related fields to the existing profiles table

-- 1. Add security fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'locked')),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;

-- 2. Create indexes for security queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_failed_attempts ON public.profiles(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- 3. Update existing profiles to have active status
UPDATE public.profiles 
SET status = 'active' 
WHERE status IS NULL;

-- 4. Create security audit table
CREATE TABLE IF NOT EXISTS public.security_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on security audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for security audit
CREATE POLICY "Admins can view security audit" ON public.security_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert security audit" ON public.security_audit
  FOR INSERT WITH CHECK (true);

-- 7. Create indexes for security audit
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at);

-- 8. Create security functions

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit (event_type, user_id, details)
  VALUES (event_type, user_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed login attempts
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
    SET 
      failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
      updated_at = NOW()
    WHERE email = user_email;
    
    -- Lock account if too many failed attempts
    IF (user_profile.failed_login_attempts + 1) >= 5 THEN
      UPDATE public.profiles 
      SET status = 'locked'
      WHERE email = user_email;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle successful login
CREATE OR REPLACE FUNCTION public.handle_successful_login(
  user_id UUID,
  ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    failed_login_attempts = 0,
    last_login_at = NOW(),
    last_login_ip = ip_address,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_failed_login(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_successful_login(UUID, TEXT) TO authenticated;

-- 10. Update the handle_new_user function to include security defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    status,
    failed_login_attempts,
    mfa_enabled
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'active',
    0,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
