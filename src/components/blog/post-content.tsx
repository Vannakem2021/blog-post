"use client";

import { useState } from "react";
import { BlogPost } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { newsCategories } from "@/lib/mock-data";
import {
  ShareIcon,
  ClockIcon,
  FireIcon,
  CheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface PostContentProps {
  post: BlogPost & {
    profiles?: {
      full_name?: string;
      email?: string;
      bio?: string;
      avatar_url?: string;
    };
  };
}

export function PostContent({ post }: PostContentProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const category = newsCategories.find((cat) => cat.slug === post.category);

  // Share functionality with enhanced feedback
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const url = window.location.href;

      // Try to use the Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || "Check out this article",
          url: url,
        });
        toast.success("Article shared successfully!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        // Fallback to clipboard API
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (fallbackError) {
        toast.error("Unable to share article. Please copy the URL manually.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Social media share functions
  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = `${post.title} - ${post.excerpt || "Check out this article"}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    const title = post.title;
    const summary = post.excerpt || "Check out this article";
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
      summary
    )}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <article className="max-w-none">
      {/* Enhanced Header */}
      <header className="p-6 sm:p-8 lg:p-12 pb-6 sm:pb-8">
        {/* Category and Breaking News Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {post.is_breaking && (
            <Badge
              variant="destructive"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 border-0"
            >
              <FireIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              BREAKING NEWS
            </Badge>
          )}
          {category && (
            <Badge
              variant="outline"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 font-semibold"
            >
              {category.name}
            </Badge>
          )}
          {post.urgency_level === "urgent" && !post.is_breaking && (
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200"
            >
              URGENT
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-4xl">
            {post.excerpt}
          </p>
        )}

        {/* Enhanced Article Metadata */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Author Info */}
            {post.profiles && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <UserCircleIcon className="w-12 h-12 sm:w-14 sm:h-14 text-gray-400 mx-auto sm:mx-0" />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-gray-900 text-base sm:text-lg">
                    {post.profiles.full_name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Staff Writer
                  </p>
                </div>
              </div>
            )}

            {/* Metadata and Share Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Horizontal metadata layout */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="font-medium">
                    {formatTimeAgo(post.published_at || post.created_at)}
                  </span>
                </div>
                {post.reading_time && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <span className="text-blue-600">📖</span>
                    <span className="font-medium">
                      {post.reading_time} min read
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Share Action */}
              <div className="flex justify-center sm:justify-end">
                <Button
                  onClick={handleShare}
                  disabled={isSharing || isCopied}
                  variant="outline"
                  size="sm"
                  className={`shadow-sm hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 ${
                    isCopied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                  }`}
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-600 border-t-transparent mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Sharing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : isCopied ? (
                    <>
                      <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Copied!</span>
                      <span className="sm:hidden">✓</span>
                    </>
                  ) : (
                    <>
                      <ShareIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Share Article</span>
                      <span className="sm:hidden">Share</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Featured Image */}
      {post.featured_image_url && (
        <div className="px-6 sm:px-8 lg:px-12 mb-8 sm:mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          {post.featured_image_alt && (
            <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4 italic bg-gray-50 px-3 sm:px-4 py-2 rounded-lg">
              {post.featured_image_alt}
            </p>
          )}
        </div>
      )}

      {/* Enhanced Content */}
      <div className="px-6 sm:px-8 lg:px-12 pb-8 sm:pb-12">
        <div
          className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:mb-6 sm:prose-h1:mb-8 prose-h1:mt-8 sm:prose-h1:mt-12
            prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:mb-4 sm:prose-h2:mb-6 prose-h2:mt-6 sm:prose-h2:mt-10 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 sm:prose-h2:pb-3
            prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:mb-3 sm:prose-h3:mb-4 prose-h3:mt-6 sm:prose-h3:mt-8
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-em:text-gray-600 prose-em:italic
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 sm:prose-blockquote:p-6 prose-blockquote:rounded-r-lg prose-blockquote:my-6 sm:prose-blockquote:my-8
            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-0.5 sm:prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-xs sm:prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4 sm:prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:text-sm sm:prose-pre:text-base
            prose-ul:my-4 sm:prose-ul:my-6 prose-ol:my-4 sm:prose-ol:my-6
            prose-li:my-1 sm:prose-li:my-2 prose-li:text-gray-700
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6 sm:prose-img:my-8 prose-img:w-full prose-img:h-auto
            prose-hr:border-gray-300 prose-hr:my-8 sm:prose-hr:my-12
            prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:rounded-lg prose-table:overflow-hidden prose-table:text-sm sm:prose-table:text-base
            prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:p-2 sm:prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-xs sm:prose-th:text-sm
            prose-td:border prose-td:border-gray-300 prose-td:p-2 sm:prose-td:p-3 prose-td:text-xs sm:prose-td:text-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Enhanced Footer */}
      <footer className="px-6 sm:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8">
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
                💝 Thank You for Reading!
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                We hope you found this article informative and engaging.
              </p>
            </div>

            {/* Enhanced Social sharing buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={shareOnTwitter}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                <span className="hidden sm:inline">Share on Twitter</span>
                <span className="sm:hidden">Twitter</span>
              </button>

              <button
                onClick={shareOnFacebook}
                className="flex items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Share on Facebook</span>
                <span className="sm:hidden">Facebook</span>
              </button>

              <button
                onClick={shareOnLinkedIn}
                className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Share on LinkedIn</span>
                <span className="sm:hidden">LinkedIn</span>
              </button>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 border-t border-gray-200 pt-4 sm:pt-6">
              <p>
                Published on{" "}
                {new Date(
                  post.published_at || post.created_at
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}
