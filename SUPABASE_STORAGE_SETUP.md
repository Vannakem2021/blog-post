# 🗄️ Supabase Storage Setup Guide

This guide will help you configure Supabase Storage for reliable image uploads in your blog application.

## 📋 Prerequisites

- Supabase project already created and configured
- Admin authentication working
- Supabase environment variables set in `.env.local`

## 🚀 Step 1: Create Storage Bucket

### 1.1 Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project dashboard
3. Click on **Storage** in the left sidebar

### 1.2 Create Blog Images Bucket

1. Click **"New bucket"**
2. Configure the bucket:

   - **Name**: `blog-images`
   - **Public bucket**: ✅ **Enabled** (for public image access)
   - **File size limit**: `4 MB`
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

3. Click **"Create bucket"**

## 🔒 Step 2: Configure RLS Policies

### 2.1 Set Up Row Level Security

1. In the Storage section, click on your `blog-images` bucket
2. Go to the **"Policies"** tab
3. Click **"New policy"**

### 2.2 Create Upload Policy (Admin Only)

```sql
-- Policy Name: "Admin can upload images"
-- Operation: INSERT
-- Target roles: authenticated

-- Policy Definition:
CREATE POLICY "Admin can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 2.3 Create Read Policy (Public Access)

```sql
-- Policy Name: "Public can view images"
-- Operation: SELECT
-- Target roles: public

-- Policy Definition:
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'blog-images');
```

### 2.4 Create Delete Policy (Admin Only)

```sql
-- Policy Name: "Admin can delete images"
-- Operation: DELETE
-- Target roles: authenticated

-- Policy Definition:
CREATE POLICY "Admin can delete images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## ⚙️ Step 3: Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=blog-images
```

## 📁 Step 4: Bucket Configuration Details

### File Organization Structure

```
blog-images/
├── posts/
│   ├── featured/          # Featured images for blog posts
│   └── content/           # Images used within post content
├── avatars/               # User profile images (future use)
└── temp/                  # Temporary uploads (auto-cleanup)
```

### File Naming Convention

- **Featured images**: `posts/featured/{post-slug}-{timestamp}.{ext}`
- **Content images**: `posts/content/{post-slug}-{uuid}.{ext}`
- **Temporary files**: `temp/{uuid}-{timestamp}.{ext}`

### Storage Limits

- **Max file size**: 4 MB per file
- **Allowed formats**: JPEG, PNG, WebP, GIF
- **Total storage**: Based on your Supabase plan
- **Bandwidth**: Based on your Supabase plan

## 🔧 Step 5: Advanced Configuration (Optional)

### 5.1 Image Transformations

Supabase Storage supports automatic image transformations:

```
https://your-project.supabase.co/storage/v1/object/public/blog-images/image.jpg?width=800&height=600&resize=cover&quality=80
```

### 5.2 CDN Configuration

For better performance, consider:

- Enable Supabase CDN in project settings
- Configure custom domain for storage URLs
- Set appropriate cache headers

### 5.3 Backup Strategy

- Enable automatic backups in Supabase dashboard
- Consider cross-region replication for critical images
- Implement periodic backup verification

## ✅ Step 6: Verification

### Test Bucket Access

1. Go to Storage > blog-images in Supabase dashboard
2. Try uploading a test image manually
3. Verify the image is accessible via public URL
4. Check that RLS policies are working correctly

### Test URLs

Your images will be accessible at:

```
https://your-project.supabase.co/storage/v1/object/public/blog-images/path/to/image.jpg
```

## 🚨 Security Considerations

1. **Admin Role Verification**: Ensure only authenticated admin users can upload
2. **File Type Validation**: Validate file types both client and server-side
3. **File Size Limits**: Enforce size limits to prevent abuse
4. **Rate Limiting**: Consider implementing upload rate limits
5. **Malware Scanning**: Consider third-party malware scanning for uploads

## 📊 Monitoring

Monitor your storage usage:

1. Supabase Dashboard > Settings > Usage
2. Set up alerts for storage quota limits
3. Monitor bandwidth usage
4. Track failed upload attempts

## 🔄 Migration Notes

- Existing UploadThing URLs will need to be migrated if any exist
- Update any hardcoded image URLs in your database
- Test thoroughly before deploying to production
- Consider implementing a fallback mechanism during migration

---

**Next**: Proceed to implement the Supabase Storage image upload component.
