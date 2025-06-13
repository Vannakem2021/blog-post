-- ========================================
-- SEO OPTIMIZATION SYSTEM - DATABASE MIGRATION
-- ========================================
-- This migration adds comprehensive SEO features to the blog system

-- 1. Add SEO fields to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS focus_keywords TEXT[],
ADD COLUMN IF NOT EXISTS primary_keyword TEXT,
ADD COLUMN IF NOT EXISTS is_pillar_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS readability_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS keyword_density JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_analysis JSONB DEFAULT '{}';

-- 2. Create indexes for SEO-related queries
CREATE INDEX IF NOT EXISTS idx_posts_meta_title ON public.posts(meta_title);
CREATE INDEX IF NOT EXISTS idx_posts_meta_description ON public.posts(meta_description);
CREATE INDEX IF NOT EXISTS idx_posts_focus_keywords ON public.posts USING GIN(focus_keywords);
CREATE INDEX IF NOT EXISTS idx_posts_primary_keyword ON public.posts(primary_keyword);
CREATE INDEX IF NOT EXISTS idx_posts_pillar_content ON public.posts(is_pillar_content);
CREATE INDEX IF NOT EXISTS idx_posts_seo_score ON public.posts(seo_score);
CREATE INDEX IF NOT EXISTS idx_posts_word_count ON public.posts(word_count);

-- 3. Create SEO analysis function
CREATE OR REPLACE FUNCTION public.calculate_seo_score(
  p_title TEXT,
  p_content TEXT,
  p_meta_title TEXT,
  p_meta_description TEXT,
  p_slug TEXT,
  p_focus_keywords TEXT[],
  p_primary_keyword TEXT
) RETURNS JSONB AS $$
DECLARE
  score INTEGER := 0;
  analysis JSONB := '{}';
  word_count INTEGER;
  title_has_keyword BOOLEAN := FALSE;
  meta_desc_has_keyword BOOLEAN := FALSE;
  slug_has_keyword BOOLEAN := FALSE;
  content_has_keyword BOOLEAN := FALSE;
  first_paragraph TEXT;
BEGIN
  -- Calculate word count
  word_count := array_length(string_to_array(trim(p_content), ' '), 1);
  
  -- Check if primary keyword exists in various places
  IF p_primary_keyword IS NOT NULL AND p_primary_keyword != '' THEN
    -- Check title
    title_has_keyword := LOWER(COALESCE(p_title, '')) LIKE '%' || LOWER(p_primary_keyword) || '%';
    
    -- Check meta description
    meta_desc_has_keyword := LOWER(COALESCE(p_meta_description, '')) LIKE '%' || LOWER(p_primary_keyword) || '%';
    
    -- Check slug
    slug_has_keyword := LOWER(COALESCE(p_slug, '')) LIKE '%' || LOWER(replace(p_primary_keyword, ' ', '-')) || '%';
    
    -- Check content
    content_has_keyword := LOWER(COALESCE(p_content, '')) LIKE '%' || LOWER(p_primary_keyword) || '%';
    
    -- Check first 10% of content
    first_paragraph := LEFT(p_content, LENGTH(p_content) / 10);
  END IF;
  
  -- Build analysis object
  analysis := jsonb_build_object(
    'word_count', word_count,
    'title_has_keyword', title_has_keyword,
    'meta_description_has_keyword', meta_desc_has_keyword,
    'slug_has_keyword', slug_has_keyword,
    'content_has_keyword', content_has_keyword,
    'content_length_adequate', word_count >= 600,
    'meta_title_length_good', LENGTH(COALESCE(p_meta_title, p_title)) BETWEEN 30 AND 60,
    'meta_description_length_good', LENGTH(COALESCE(p_meta_description, '')) BETWEEN 120 AND 160,
    'has_focus_keywords', array_length(p_focus_keywords, 1) > 0
  );
  
  -- Calculate score based on checks
  IF title_has_keyword THEN score := score + 15; END IF;
  IF meta_desc_has_keyword THEN score := score + 15; END IF;
  IF slug_has_keyword THEN score := score + 10; END IF;
  IF content_has_keyword THEN score := score + 10; END IF;
  IF word_count >= 600 THEN score := score + 20; END IF;
  IF LENGTH(COALESCE(p_meta_title, p_title)) BETWEEN 30 AND 60 THEN score := score + 10; END IF;
  IF LENGTH(COALESCE(p_meta_description, '')) BETWEEN 120 AND 160 THEN score := score + 10; END IF;
  IF array_length(p_focus_keywords, 1) > 0 THEN score := score + 10; END IF;
  
  -- Add score to analysis
  analysis := analysis || jsonb_build_object('seo_score', score);
  
  RETURN analysis;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-calculate SEO score on insert/update
CREATE OR REPLACE FUNCTION public.update_seo_analysis()
RETURNS TRIGGER AS $$
DECLARE
  seo_analysis JSONB;
BEGIN
  -- Calculate SEO analysis
  seo_analysis := public.calculate_seo_score(
    NEW.title,
    NEW.content,
    NEW.meta_title,
    NEW.meta_description,
    NEW.slug,
    NEW.focus_keywords,
    NEW.primary_keyword
  );
  
  -- Update the record with analysis
  NEW.seo_analysis := seo_analysis;
  NEW.seo_score := (seo_analysis->>'seo_score')::INTEGER;
  NEW.word_count := (seo_analysis->>'word_count')::INTEGER;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS trigger_update_seo_analysis ON public.posts;
CREATE TRIGGER trigger_update_seo_analysis
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seo_analysis();

-- 6. Create SEO analytics table for tracking improvements
CREATE TABLE IF NOT EXISTS public.seo_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  seo_score INTEGER NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_seo_analytics_post_id ON public.seo_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_score ON public.seo_analytics(seo_score);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_created_at ON public.seo_analytics(created_at);

-- 8. Enable RLS on SEO analytics
ALTER TABLE public.seo_analytics ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for SEO analytics
CREATE POLICY "Admins can view all SEO analytics" ON public.seo_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert SEO analytics" ON public.seo_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Create function to get SEO suggestions
CREATE OR REPLACE FUNCTION public.get_seo_suggestions(post_id UUID)
RETURNS JSONB AS $$
DECLARE
  post_record RECORD;
  suggestions JSONB := '[]';
BEGIN
  SELECT * INTO post_record FROM public.posts WHERE id = post_id;
  
  IF NOT FOUND THEN
    RETURN '[]';
  END IF;
  
  -- Generate suggestions based on analysis
  IF NOT (post_record.seo_analysis->>'title_has_keyword')::BOOLEAN THEN
    suggestions := suggestions || jsonb_build_array(
      jsonb_build_object(
        'type', 'error',
        'message', 'Add your focus keyword to the SEO title',
        'field', 'meta_title'
      )
    );
  END IF;
  
  IF NOT (post_record.seo_analysis->>'content_length_adequate')::BOOLEAN THEN
    suggestions := suggestions || jsonb_build_array(
      jsonb_build_object(
        'type', 'error',
        'message', 'Content should be at least 600 words for better SEO',
        'field', 'content'
      )
    );
  END IF;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
