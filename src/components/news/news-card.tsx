import Link from "next/link";
import { truncateText, stripMarkdown } from "@/lib/utils";
import { BlogPost } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthorById, newsCategories } from "@/lib/mock-data";
import {
  ClockIcon,
  EyeIcon,
  ShareIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact" | "headline" | "enhanced";
  showCategory?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
}

export function NewsCard({
  post,
  variant = "default",
  showCategory = true,
  showAuthor = true,
  showStats = false,
}: NewsCardProps) {
  const author = getAuthorById(post.authorId);
  const category = newsCategories.find((cat) => cat.slug === post.category);

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (variant === "headline") {
    return (
      <Link href={`/news/${post.slug}`} className="block group">
        <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-300">
          {post.featuredImageUrl && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {showCategory && category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    category.color
                  )}
                >
                  {category.name}
                </Badge>
              )}
              {post.isBreaking && (
                <Badge
                  variant="destructive"
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                >
                  BREAKING
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <ClockIcon className="h-3 w-3" />
              <span className="font-medium">
                {formatTimeAgo(post.publishedAt || post.createdAt)}
              </span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span className="font-medium">
                    {post.readingTime} min read
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="h-full bg-card border border-border rounded-lg hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
        <Link href={`/news/${post.slug}`} className="block h-full">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              {showCategory && category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    category.color
                  )}
                >
                  {category.name}
                </Badge>
              )}
              {post.isBreaking && (
                <Badge
                  variant="destructive"
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                >
                  BREAKING
                </Badge>
              )}
              {post.urgencyLevel === "urgent" && !post.isBreaking && (
                <div className="flex items-center gap-1 text-orange-500">
                  <FireIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">URGENT</span>
                </div>
              )}
            </div>

            <h3 className="font-bold text-base text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors duration-200 mb-3 leading-tight">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                {truncateText(stripMarkdown(post.excerpt), 100)}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {formatTimeAgo(post.publishedAt || post.createdAt)}
                </span>
              </div>

              {showStats && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {post.viewCount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">{post.shareCount}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="h-full bg-card border border-border rounded-lg hover:shadow-lg hover:border-gray-300 transition-all duration-300 group overflow-hidden">
        <Link href={`/news/${post.slug}`} className="block h-full">
          {post.featuredImageUrl && (
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              {showCategory && category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-sm font-medium px-3 py-1.5 rounded-full",
                    category.color
                  )}
                >
                  {category.name}
                </Badge>
              )}
              {post.isBreaking && (
                <Badge
                  variant="destructive"
                  className="text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  BREAKING
                </Badge>
              )}
              {post.urgencyLevel === "urgent" && !post.isBreaking && (
                <div className="flex items-center gap-1 text-orange-500">
                  <FireIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">URGENT</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-4 leading-tight">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-gray-600 text-base line-clamp-3 mb-6 leading-relaxed">
                {stripMarkdown(post.excerpt)}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {showAuthor && author && (
                  <div className="flex items-center gap-3">
                    <img
                      src={author.avatarUrl || "/default-avatar.png"}
                      alt={author.fullName || "Author"}
                      className="w-8 h-8 rounded-full border-2 border-gray-100"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {author.fullName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span className="font-medium">
                    {formatTimeAgo(post.publishedAt || post.createdAt)}
                  </span>
                </div>
              </div>

              {showStats && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {post.viewCount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon className="h-4 w-4" />
                    <span className="font-medium">{post.shareCount}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Enhanced variant (matching home page style)
  if (variant === "enhanced") {
    return (
      <article className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2">
        <Link href={`/blog/${post.slug}`} className="block">
          {/* Image */}
          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Enhanced Content */}
          <div className="p-8 space-y-4">
            {/* Category Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
              {post.category}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm">
              {post.excerpt}
            </p>

            {/* Enhanced Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>
                  {new Date(
                    post.published_at || post.created_at
                  ).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>{post.reading_time || "5"} min read</span>
              </div>
              <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant
  return (
    <Card className="h-full bg-card border border-border rounded-lg hover:shadow-lg hover:border-gray-300 transition-all duration-300 group overflow-hidden">
      <Link href={`/news/${post.slug}`} className="block h-full">
        {post.featuredImageUrl && (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            {showCategory && category && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  category.color
                )}
              >
                {category.name}
              </Badge>
            )}
            {post.isBreaking && (
              <Badge
                variant="destructive"
                className="text-xs font-medium px-2.5 py-1 rounded-full"
              >
                BREAKING
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3 leading-tight">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed flex-grow">
              {truncateText(stripMarkdown(post.excerpt), 120)}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              <span className="font-medium">
                {formatTimeAgo(post.publishedAt || post.createdAt)}
              </span>
            </div>
            {post.readingTime && (
              <span className="font-medium">{post.readingTime} min read</span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
