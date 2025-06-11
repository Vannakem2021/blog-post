// import { formatDate } from "@/lib/utils"; // Removed unused import
import { BlogPost } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthorById, newsCategories } from "@/lib/mock-data";
import {
  ShareIcon,
  BookmarkIcon,
  PrinterIcon,
  ClockIcon,
  EyeIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface PostContentProps {
  post: BlogPost;
}

export function PostContent({ post }: PostContentProps) {
  const author = getAuthorById(post.authorId);
  const category = newsCategories.find((cat) => cat.slug === post.category);

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
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        {/* Category and Breaking News Badges */}
        <div className="flex items-center space-x-2 mb-4">
          {post.isBreaking && (
            <Badge variant="destructive" className="text-sm">
              <FireIcon className="h-3 w-3 mr-1" />
              BREAKING NEWS
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className={cn("text-sm", category.color)}>
              {category.name}
            </Badge>
          )}
          {post.urgencyLevel === "urgent" && !post.isBreaking && (
            <Badge variant="secondary" className="text-sm">
              URGENT
            </Badge>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Article Metadata */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Author and Date Info */}
            <div className="flex items-center space-x-4">
              {author && (
                <div className="flex items-center space-x-3">
                  <img
                    src={author.avatarUrl || "/default-avatar.png"}
                    alt={author.fullName || "Author"}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {author.fullName}
                    </p>
                    <p className="text-sm text-gray-600">{author.title}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {formatTimeAgo(post.publishedAt || post.createdAt)}
                  </span>
                </div>
                {post.readingTime && (
                  <div className="flex items-center space-x-1">
                    <span>{post.readingTime} min read</span>
                  </div>
                )}
                {post.viewCount && (
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{post.viewCount.toLocaleString()} views</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ShareIcon className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkIcon className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>

          {/* Source Attribution */}
          {post.sourceAttribution && post.sourceAttribution.length > 0 && (
            <div className="mt-4 text-sm text-gray-700">
              <span className="font-medium">Sources: </span>
              {post.sourceAttribution.join(", ")}
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="mb-8">
          <img
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          {post.featuredImageAlt && (
            <p className="text-sm text-gray-500 text-center mt-2 italic">
              {post.featuredImageAlt}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <p>Thanks for reading!</p>
          </div>

          {/* Social sharing buttons could go here */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <span className="sr-only">Share on Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>

            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <span className="sr-only">Share on Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <span className="sr-only">Share on LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
}
