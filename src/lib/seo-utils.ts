import { SEOAnalysis, SEOCheck, FocusKeyword } from "./types";

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  if (!content || content.trim() === "") return 0;
  return content.trim().split(/\s+/).length;
}

/**
 * Extract text content from HTML
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(
  content: string,
  keywords: string[]
): Record<string, number> {
  const text = stripHtml(content).toLowerCase();
  const words = text.split(/\s+/);
  const totalWords = words.length;
  
  const density: Record<string, number> = {};
  
  keywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase();
    const occurrences = (text.match(new RegExp(keywordLower, "g")) || []).length;
    density[keyword] = totalWords > 0 ? (occurrences / totalWords) * 100 : 0;
  });
  
  return density;
}

/**
 * Check if keyword appears in first 10% of content
 */
export function keywordInFirstParagraph(content: string, keyword: string): boolean {
  if (!keyword || !content) return false;
  
  const text = stripHtml(content);
  const firstTenPercent = text.substring(0, Math.floor(text.length * 0.1));
  
  return firstTenPercent.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSEOSlug(title: string, keyword?: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  
  // If keyword is provided and not in slug, try to incorporate it
  if (keyword && !slug.includes(keyword.toLowerCase().replace(/\s+/g, "-"))) {
    const keywordSlug = keyword.toLowerCase().replace(/\s+/g, "-");
    slug = `${keywordSlug}-${slug}`;
  }
  
  return slug;
}

/**
 * Validate meta title length
 */
export function validateMetaTitle(title: string): {
  isValid: boolean;
  length: number;
  message: string;
} {
  const length = title.length;
  
  if (length === 0) {
    return {
      isValid: false,
      length,
      message: "Meta title is required",
    };
  }
  
  if (length < 30) {
    return {
      isValid: false,
      length,
      message: "Meta title is too short (minimum 30 characters)",
    };
  }
  
  if (length > 60) {
    return {
      isValid: false,
      length,
      message: "Meta title is too long (maximum 60 characters)",
    };
  }
  
  return {
    isValid: true,
    length,
    message: "Meta title length is optimal",
  };
}

/**
 * Validate meta description length
 */
export function validateMetaDescription(description: string): {
  isValid: boolean;
  length: number;
  message: string;
} {
  const length = description.length;
  
  if (length === 0) {
    return {
      isValid: false,
      length,
      message: "Meta description is recommended for better SEO",
    };
  }
  
  if (length < 120) {
    return {
      isValid: false,
      length,
      message: "Meta description is too short (minimum 120 characters)",
    };
  }
  
  if (length > 160) {
    return {
      isValid: false,
      length,
      message: "Meta description is too long (maximum 160 characters)",
    };
  }
  
  return {
    isValid: true,
    length,
    message: "Meta description length is optimal",
  };
}

/**
 * Perform comprehensive SEO analysis
 */
export function analyzeSEO(
  title: string,
  content: string,
  metaTitle?: string,
  metaDescription?: string,
  slug?: string,
  focusKeywords: string[] = [],
  primaryKeyword?: string
): SEOAnalysis {
  const wordCount = countWords(stripHtml(content));
  const effectiveTitle = metaTitle || title;
  const keyword = primaryKeyword || focusKeywords[0] || "";
  
  const analysis: SEOAnalysis = {
    word_count: wordCount,
    title_has_keyword: keyword ? effectiveTitle.toLowerCase().includes(keyword.toLowerCase()) : false,
    meta_description_has_keyword: keyword && metaDescription 
      ? metaDescription.toLowerCase().includes(keyword.toLowerCase()) 
      : false,
    slug_has_keyword: keyword && slug 
      ? slug.toLowerCase().includes(keyword.toLowerCase().replace(/\s+/g, "-")) 
      : false,
    content_has_keyword: keyword 
      ? stripHtml(content).toLowerCase().includes(keyword.toLowerCase()) 
      : false,
    content_length_adequate: wordCount >= 600,
    meta_title_length_good: validateMetaTitle(effectiveTitle).isValid,
    meta_description_length_good: metaDescription 
      ? validateMetaDescription(metaDescription).isValid 
      : false,
    has_focus_keywords: focusKeywords.length > 0,
    seo_score: 0, // Will be calculated below
  };
  
  // Calculate SEO score
  let score = 0;
  if (analysis.title_has_keyword) score += 15;
  if (analysis.meta_description_has_keyword) score += 15;
  if (analysis.slug_has_keyword) score += 10;
  if (analysis.content_has_keyword) score += 10;
  if (analysis.content_length_adequate) score += 20;
  if (analysis.meta_title_length_good) score += 10;
  if (analysis.meta_description_length_good) score += 10;
  if (analysis.has_focus_keywords) score += 10;
  
  analysis.seo_score = score;
  
  return analysis;
}

/**
 * Generate SEO checks based on analysis
 */
export function generateSEOChecks(
  analysis: SEOAnalysis,
  primaryKeyword?: string
): SEOCheck[] {
  const checks: SEOCheck[] = [
    {
      id: "title-keyword",
      label: "Keyword in SEO title",
      status: analysis.title_has_keyword ? "success" : "error",
      message: analysis.title_has_keyword
        ? "Focus keyword found in SEO title"
        : "Focus keyword not found in SEO title",
      suggestion: !analysis.title_has_keyword
        ? `Add "${primaryKeyword}" to your SEO title`
        : undefined,
    },
    {
      id: "meta-description-keyword",
      label: "Keyword in meta description",
      status: analysis.meta_description_has_keyword ? "success" : "error",
      message: analysis.meta_description_has_keyword
        ? "Focus keyword found in meta description"
        : "Focus keyword not found in meta description",
      suggestion: !analysis.meta_description_has_keyword
        ? `Include "${primaryKeyword}" in your meta description`
        : undefined,
    },
    {
      id: "slug-keyword",
      label: "Keyword in URL slug",
      status: analysis.slug_has_keyword ? "success" : "error",
      message: analysis.slug_has_keyword
        ? "Focus keyword found in URL slug"
        : "Focus keyword not found in URL slug",
      suggestion: !analysis.slug_has_keyword
        ? "Consider updating the URL to include your focus keyword"
        : undefined,
    },
    {
      id: "content-keyword",
      label: "Keyword in content",
      status: analysis.content_has_keyword ? "success" : "error",
      message: analysis.content_has_keyword
        ? "Focus keyword found in content"
        : "Focus keyword not found in content",
      suggestion: !analysis.content_has_keyword
        ? "Include your focus keyword naturally throughout the content"
        : undefined,
    },
    {
      id: "content-length",
      label: "Content length",
      status: analysis.content_length_adequate ? "success" : "error",
      message: analysis.content_length_adequate
        ? `Content length is adequate (${analysis.word_count} words)`
        : `Content is too short (${analysis.word_count} words)`,
      suggestion: !analysis.content_length_adequate
        ? "Consider expanding your content to at least 600 words for better SEO"
        : undefined,
    },
    {
      id: "meta-title-length",
      label: "Meta title length",
      status: analysis.meta_title_length_good ? "success" : "warning",
      message: analysis.meta_title_length_good
        ? "Meta title length is optimal"
        : "Meta title length needs optimization",
      suggestion: !analysis.meta_title_length_good
        ? "Keep meta title between 30-60 characters"
        : undefined,
    },
    {
      id: "meta-description-length",
      label: "Meta description length",
      status: analysis.meta_description_length_good ? "success" : "warning",
      message: analysis.meta_description_length_good
        ? "Meta description length is optimal"
        : "Meta description length needs optimization",
      suggestion: !analysis.meta_description_length_good
        ? "Keep meta description between 120-160 characters"
        : undefined,
    },
  ];
  
  return checks;
}

/**
 * Generate Google-style search preview
 */
export function generateSearchPreview(
  title: string,
  metaTitle?: string,
  metaDescription?: string,
  slug?: string,
  baseUrl: string = "https://yourblog.com"
): {
  displayTitle: string;
  displayUrl: string;
  displayDescription: string;
} {
  const displayTitle = metaTitle || title || "Untitled Post";
  const displayUrl = `${baseUrl}/${slug || "untitled-post"}`;
  const displayDescription = metaDescription || "No meta description provided.";
  
  return {
    displayTitle: displayTitle.length > 60 ? displayTitle.substring(0, 57) + "..." : displayTitle,
    displayUrl,
    displayDescription: displayDescription.length > 160 ? displayDescription.substring(0, 157) + "..." : displayDescription,
  };
}
