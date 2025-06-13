"use client";

import { useEffect, useState } from "react";
import { SEOSnippetPreview } from "./seo-snippet-preview";
import { FocusKeywordManager } from "./focus-keyword-manager";
import { SEOAnalysisChecklist } from "./seo-analysis-checklist";
import { analyzeSEO, generateSEOSlug } from "@/lib/seo-utils";
import { SEOAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SEOSectionProps {
  title: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  primaryKeyword?: string;
  isPillarContent?: boolean;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onFocusKeywordsChange: (keywords: string[]) => void;
  onPrimaryKeywordChange: (keyword: string) => void;
  onPillarContentChange: (isPillar: boolean) => void;
  className?: string;
}

export function SEOSection({
  title,
  content,
  slug,
  metaTitle,
  metaDescription,
  focusKeywords = [],
  primaryKeyword,
  isPillarContent = false,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
  onFocusKeywordsChange,
  onPrimaryKeywordChange,
  onPillarContentChange,
  className,
}: SEOSectionProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    word_count: 0,
    title_has_keyword: false,
    meta_description_has_keyword: false,
    slug_has_keyword: false,
    content_has_keyword: false,
    content_length_adequate: false,
    meta_title_length_good: false,
    meta_description_length_good: false,
    has_focus_keywords: false,
    seo_score: 0,
  });

  // Auto-generate slug when title or primary keyword changes
  useEffect(() => {
    if (title && (!slug || slug === "")) {
      const newSlug = generateSEOSlug(title, primaryKeyword);
      onSlugChange(newSlug);
    }
  }, [title, primaryKeyword, slug, onSlugChange]);

  // Auto-generate meta title if not set (truncate to 60 chars if needed)
  useEffect(() => {
    if (title && (!metaTitle || metaTitle === "")) {
      // Truncate title to 60 characters for meta title if it's too long
      const truncatedTitle =
        title.length > 60 ? title.substring(0, 57) + "..." : title;
      onMetaTitleChange(truncatedTitle);
    }
  }, [title, metaTitle, onMetaTitleChange]);

  // Perform SEO analysis whenever relevant data changes
  useEffect(() => {
    const newAnalysis = analyzeSEO(
      title,
      content,
      metaTitle,
      metaDescription,
      slug,
      focusKeywords,
      primaryKeyword
    );
    setAnalysis(newAnalysis);
  }, [
    title,
    content,
    metaTitle,
    metaDescription,
    slug,
    focusKeywords,
    primaryKeyword,
  ]);

  const handleSlugChange = (newSlug: string) => {
    // Clean the slug
    const cleanSlug = newSlug
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    onSlugChange(cleanSlug);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* SEO Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔍 SEO Optimization
          </h3>
          <p className="text-gray-600">
            Optimize your content for search engines and improve visibility
          </p>
        </div>

        {/* SEO Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">SEO Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analysis.seo_score}/100
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                  analysis.seo_score >= 80
                    ? "bg-green-500"
                    : analysis.seo_score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
              >
                {analysis.seo_score >= 80
                  ? "A"
                  : analysis.seo_score >= 60
                  ? "B"
                  : "C"}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Word Count</p>
                <p className="text-2xl font-bold text-green-900">
                  {analysis.word_count}
                </p>
              </div>
              <div className="text-green-600">📝</div>
            </div>
            <p className="text-xs text-green-700 mt-1">
              {analysis.content_length_adequate
                ? "Good length"
                : "Consider adding more content"}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Keywords</p>
                <p className="text-2xl font-bold text-purple-900">
                  {focusKeywords.length}
                </p>
              </div>
              <div className="text-purple-600">🎯</div>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {primaryKeyword
                ? `Primary: ${primaryKeyword}`
                : "No primary keyword"}
            </p>
          </div>
        </div>
      </div>

      {/* SEO Snippet Preview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <SEOSnippetPreview
          title={title}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          slug={slug}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onSlugChange={handleSlugChange}
        />
      </div>

      {/* Focus Keywords */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <FocusKeywordManager
          keywords={focusKeywords}
          primaryKeyword={primaryKeyword}
          onKeywordsChange={onFocusKeywordsChange}
          onPrimaryKeywordChange={onPrimaryKeywordChange}
          isPillarContent={isPillarContent}
          onPillarContentChange={onPillarContentChange}
        />
      </div>

      {/* SEO Analysis */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <SEOAnalysisChecklist
          analysis={analysis}
          primaryKeyword={primaryKeyword}
        />
      </div>

      {/* SEO Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              SEO Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Use your primary keyword naturally throughout the content
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Write compelling meta descriptions that encourage clicks
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Keep URLs short and descriptive with your target keyword
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Aim for at least 600 words for better search engine ranking
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Use headings (H2, H3) to structure your content logically
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
