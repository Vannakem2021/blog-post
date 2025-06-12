# Single Admin Setup Guide

This is a simplified guide for setting up **one admin user only** for your blog authentication system.

## 🔑 Step 1: Get Your Supabase Keys

### Finding All Required Keys:

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy these three values:**

```bash
# Project URL (at the top)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Project API Keys section:
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (scroll down, click "Reveal")
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Where to Find Service Role Key:
- In the same **Settings → API** page
- Scroll down to "Project API keys" section  
- Look for **"service_role"** (below the anon key)
- Click **"Reveal"** to show the full key
- **⚠️ Keep this secret!** It has admin privileges

## 🗄️ Step 2: Set Up Database

1. **In Supabase dashboard, go to SQL Editor**
2. **Copy and paste the entire `supabase-setup.sql` file**
3. **Click "Run"** to execute all commands
4. **Verify tables were created** in Database → Tables

## 🔐 Step 3: Create Your Admin Account

### 3.1 Create Environment File
Create `.env.local` in your project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3.2 Start Your App
```bash
npm run dev
```

### 3.3 Sign Up as Admin
1. **Visit** `http://localhost:3000/auth/login`
2. **Enter your email and password** (this creates your account)
3. **You'll get an error** - this is expected since you're not admin yet

### 3.4 Promote Yourself to Admin
1. **Go back to Supabase SQL Editor**
2. **Run this command** (replace with your email):
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 3.5 Test Admin Access
1. **Go back to** `http://localhost:3000/auth/login`
2. **Login with your credentials**
3. **Should redirect to** `/dashboard` successfully!

## 🔒 Step 4: Disable New Signups (Single Admin Only)

To prevent others from creating accounts:

### Option A: Disable in Supabase Dashboard
1. **Go to Authentication → Settings**
2. **Turn OFF "Enable email confirmations"**
3. **Turn OFF "Enable phone confirmations"**
4. **Set "Site URL"** to your domain only

### Option B: Update Auth Policies (More Secure)
Run this in SQL Editor to completely block new signups:
```sql
-- Disable new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow if it's the first user or if run by admin
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url',
      'admin'  -- First user becomes admin
    );
  ELSE
    -- Block all other signups
    RAISE EXCEPTION 'New user registration is disabled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ✅ Verification Checklist

- [ ] Found all 3 Supabase keys (URL, anon key, service role key)
- [ ] Created `.env.local` with correct values
- [ ] Ran `supabase-setup.sql` successfully
- [ ] Created admin account through login page
- [ ] Promoted account to admin in database
- [ ] Can access `/dashboard` after login
- [ ] Disabled new user signups
- [ ] Public blog pages still work without login

## 🚨 Troubleshooting

### "Invalid login credentials"
- Check email/password are correct
- Verify user exists in Authentication → Users

### "Access Denied" after login
- Check user role in Database → profiles table
- Verify the UPDATE command worked
- Make sure email matches exactly

### Can't find Service Role Key
- Go to Settings → API
- Scroll down past the anon key
- Look for "service_role" section
- Click "Reveal" button

### Environment variables not working
- Restart your dev server (`npm run dev`)
- Check `.env.local` is in project root
- Verify no extra spaces in the values

## 🎯 Final Result

You now have:
- ✅ **One admin account** (you)
- ✅ **Protected dashboard** at `/dashboard`
- ✅ **Public blog** accessible to everyone
- ✅ **No new signups** allowed
- ✅ **Secure authentication** with Supabase

Your blog is ready with admin-only authentication! 🎉
