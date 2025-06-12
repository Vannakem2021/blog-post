# Supabase Admin-Only Authentication Setup Guide

This guide provides step-by-step instructions to implement admin-only authentication using Supabase with email and password login for your Next.js blog project.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic knowledge of Next.js and TypeScript

## 1. Supabase Setup & Configuration

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `blog-admin-auth`
5. Enter database password (save this!)
6. Select region closest to your users
7. Click "Create new project"

### 1.2 Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
   - **Service role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

### 1.3 Configure Environment Variables

1. Create `.env.local` file in your project root:

```bash
# Copy from .env.local.example and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Important**: Never commit `.env.local` to version control!

## 2. Database Schema Setup

### 2.1 Run Database Setup

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL commands
4. This creates:
   - `profiles` table with RLS policies
   - `posts` table with RLS policies
   - Triggers for automatic profile creation
   - Proper indexes for performance

### 2.2 Create Your First Admin User

1. First, sign up through your app at `/auth/login`
2. Then in Supabase SQL Editor, run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 3. Authentication Flow

### 3.1 How It Works

```
User visits /dashboard → Middleware checks auth →
If not logged in → Redirect to /auth/login →
If logged in but not admin → Redirect to /auth/unauthorized →
If admin → Allow access to dashboard
```

### 3.2 Protected Routes

- `/dashboard/*` - Requires admin authentication
- `/auth/login` - Login page
- `/auth/unauthorized` - Access denied page
- All other routes - Public access

## 4. Key Components

### 4.1 Authentication Context (`src/lib/auth/context.tsx`)

- Manages global auth state
- Provides `signIn`, `signOut` functions
- Tracks `user`, `isAdmin`, `loading` states

### 4.2 Protected Route Component (`src/components/auth/protected-route.tsx`)

- Wraps components that need authentication
- Automatically redirects unauthorized users
- Shows loading states

### 4.3 Login Form (`src/components/auth/auth-form.tsx`)

- Email/password login form
- Form validation with react-hook-form
- Error handling and loading states

## 5. Integration with Existing Components

### 5.1 Updated NewsHeader

The header now shows different states:

- **Not logged in**: "Admin Login" button
- **Logged in as admin**: "Dashboard" and "Sign Out" buttons

### 5.2 Dashboard Protection

All dashboard routes are automatically protected by middleware.

## 6. Security Features

### 6.1 Row Level Security (RLS)

- **Profiles**: Users can only see/edit their own profile, admins can see all
- **Posts**: Public can see published posts, admins can manage all posts
- **Automatic**: Enforced at database level, not just application level

### 6.2 Middleware Protection

- Server-side route protection
- Automatic redirects for unauthorized access
- Session validation on every request

### 6.3 Type Safety

- Full TypeScript integration
- Type-safe database queries
- Compile-time error checking

## 7. Usage Examples

### 7.1 Check if User is Admin

```tsx
import { useAuth } from "@/lib/auth/context";

function MyComponent() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  if (!isAdmin) return <div>Admin access required</div>;

  return <div>Welcome, admin!</div>;
}
```

### 7.2 Protect a Component

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

function AdminPanel() {
  return (
    <ProtectedRoute requireAdmin>
      <div>This is only visible to admins</div>
    </ProtectedRoute>
  );
}
```

### 7.3 Manual Sign Out

```tsx
import { useAuth } from "@/lib/auth/context";

function SignOutButton() {
  const { signOut } = useAuth();

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## 8. Testing the Setup

### 8.1 Test Authentication Flow

1. Visit `http://localhost:3000/dashboard`
2. Should redirect to `/auth/login`
3. Try logging in with wrong credentials
4. Create admin user and try logging in
5. Should redirect to dashboard after successful login

### 8.2 Test Authorization

1. Create a non-admin user in Supabase Auth
2. Try accessing `/dashboard`
3. Should redirect to `/auth/unauthorized`

## 9. Troubleshooting

### 9.1 Common Issues

**"Invalid login credentials"**

- Check email/password are correct
- Verify user exists in Supabase Auth dashboard

**"Access Denied" for admin user**

- Check user's role in profiles table
- Verify RLS policies are set up correctly

**Infinite redirect loops**

- Check middleware configuration
- Verify environment variables are set

**TypeScript errors**

- Run `npm install` to ensure all dependencies are installed
- Check import paths are correct

### 9.2 Debug Steps

1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check user session in Supabase dashboard
4. Verify database policies in SQL Editor

## 10. Production Deployment

### 10.1 Environment Variables

Set these in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### 10.2 Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Service role key kept secret
- ✅ HTTPS enabled in production
- ✅ Regular security updates applied

## 🎉 You're Done!

Your blog now has secure admin-only authentication with:

- ✅ Email/password login
- ✅ Admin role-based access control
- ✅ Protected dashboard routes
- ✅ Secure database policies
- ✅ Type-safe authentication state
- ✅ Automatic session management

The public blog remains accessible while admin features are properly protected!

## 📁 Files Created/Modified

### New Files Created:

- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/supabase/middleware.ts` - Middleware helper
- `middleware.ts` - Next.js middleware for route protection
- `src/lib/auth/context.tsx` - Authentication context and hooks
- `src/components/auth/auth-form.tsx` - Login form component
- `src/components/auth/protected-route.tsx` - Route protection wrapper
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/unauthorized/page.tsx` - Unauthorized access page
- `supabase-setup.sql` - Database schema and RLS policies
- `.env.local.example` - Environment variables template

### Modified Files:

- `src/lib/types.ts` - Added authentication types
- `src/app/layout.tsx` - Added AuthProvider wrapper
- `src/components/news/header.tsx` - Added auth state and login/logout
- `src/app/(dashboard)/layout.tsx` - Added admin protection and auth integration

## 🔧 Next Steps

1. **Set up your Supabase project** using the provided SQL schema
2. **Configure environment variables** with your Supabase credentials
3. **Create your first admin user** by signing up and updating the database
4. **Test the authentication flow** by visiting `/dashboard`
5. **Customize the UI** to match your brand and requirements

## 🛡️ Security Best Practices Implemented

- **Row Level Security (RLS)** enforced at database level
- **Server-side route protection** via middleware
- **Type-safe authentication** with TypeScript
- **Secure session management** with Supabase Auth
- **Proper error handling** and user feedback
- **Environment variable protection** for sensitive keys
