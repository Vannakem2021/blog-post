# Blog Post Website Development Plan

## Project Overview
Building a comprehensive blog post website using Next.js, Supabase, and UploadThing with admin authentication and content management capabilities.

## Tech Stack
- **Frontend**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication & Database**: Supabase
- **File Storage**: UploadThing
- **Rich Text Editor**: React Quill or Tiptap
- **UI Components**: Headless UI or Radix UI

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── uploadthing/
│   │       ├── core.ts
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── loading-spinner.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── auth-provider.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── post-list.tsx
│   │   ├── post-form.tsx
│   │   └── rich-text-editor.tsx
│   ├── blog/
│   │   ├── post-card.tsx
│   │   ├── post-content.tsx
│   │   ├── pagination.tsx
│   │   └── header.tsx
│   └── common/
│       ├── image-upload.tsx
│       └── seo-head.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── uploadthing.ts
│   ├── utils.ts
│   ├── validations.ts
│   └── types.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-posts.ts
│   └── use-upload.ts
└── middleware.ts
```

## Database Schema (Supabase)

### Tables

#### 1. profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. blog_posts
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. post_images
```sql
CREATE TABLE post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

#### profiles table
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### blog_posts table
```sql
-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Only admins can manage posts
CREATE POLICY "Admins can manage posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

#### post_images table
```sql
-- Enable RLS
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images for published posts
CREATE POLICY "Anyone can view published post images" ON post_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = post_images.post_id 
      AND blog_posts.status = 'published'
    )
  );

-- Only admins can manage images
CREATE POLICY "Admins can manage images" ON post_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Dependencies to Install

### Core Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install uploadthing @uploadthing/react
npm install @headlessui/react @heroicons/react
npm install react-hook-form @hookform/resolvers zod
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
npm install date-fns clsx tailwind-merge
npm install react-hot-toast
npm install slugify
```

### Development Dependencies
```bash
npm install --save-dev @types/slugify
```

## Implementation Phases

### Phase 1: Setup & Authentication (Priority 1)
1. Install and configure Supabase
2. Set up authentication system
3. Create login page and auth middleware
4. Implement protected routes
5. Create basic dashboard layout

### Phase 2: Database & Core Models (Priority 1)
1. Set up Supabase database schema
2. Configure RLS policies
3. Create TypeScript types
4. Implement data access functions

### Phase 3: Admin Dashboard (Priority 2)
1. Create dashboard layout with sidebar
2. Implement post listing with pagination
3. Create post creation form with rich text editor
4. Implement post editing functionality
5. Add post deletion with confirmation

### Phase 4: File Upload Integration (Priority 2)
1. Set up UploadThing configuration
2. Implement image upload component
3. Integrate with rich text editor
4. Add featured image upload

### Phase 5: Public Blog Interface (Priority 3)
1. Create public blog listing page
2. Implement individual post pages
3. Add SEO optimization
4. Implement responsive design

### Phase 6: Polish & Testing (Priority 3)
1. Add loading states and error handling
2. Implement proper SEO meta tags
3. Add pagination for blog posts
4. Performance optimization
5. Testing and bug fixes

## Key Features Implementation Details

### Authentication System
- Admin-only access using Supabase Auth
- Role-based access control
- Session management with middleware
- Automatic redirect for unauthorized users

### Rich Text Editor
- Tiptap editor with image support
- Custom toolbar with formatting options
- Image upload integration
- HTML content storage

### Image Management
- UploadThing for secure file uploads
- Image optimization and resizing
- Alt text and caption support
- Featured image selection

### SEO Optimization
- Dynamic meta tags for each post
- Open Graph and Twitter Card support
- Structured data markup
- SEO-friendly URLs with slugs

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Responsive images
- Touch-friendly interface

## Security Considerations
- Row Level Security (RLS) on all tables
- Input validation and sanitization
- CSRF protection
- Secure file upload handling
- Environment variable protection

This plan provides a comprehensive roadmap for building a professional blog post website with all requested features and modern best practices.
