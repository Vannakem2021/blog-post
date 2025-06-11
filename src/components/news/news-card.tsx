import Link from "next/link";
import { truncateText } from "@/lib/utils";
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
  variant?: "default" | "featured" | "compact" | "headline";
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
        <div className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
          {post.featuredImageUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {post.isBreaking && (
                <Badge variant="destructive" className="text-xs">
                  BREAKING
                </Badge>
              )}
              {showCategory && category && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", category.color)}
                >
                  {category.name}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm text-high-emphasis line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1 text-xs text-medium-emphasis">
              <span>{formatTimeAgo(post.publishedAt || post.createdAt)}</span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
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
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <Link href={`/news/${post.slug}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              {post.isBreaking && (
                <Badge variant="destructive" className="text-xs">
                  BREAKING
                </Badge>
              )}
              {showCategory && category && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", category.color)}
                >
                  {category.name}
                </Badge>
              )}
              {post.urgencyLevel === "urgent" && !post.isBreaking && (
                <FireIcon className="h-4 w-4 text-orange-500" />
              )}
            </div>

            <h3 className="font-semibold text-high-emphasis line-clamp-3 hover:text-primary transition-colors mb-2">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-medium-emphasis text-sm line-clamp-2 mb-3">
                {truncateText(post.excerpt, 100)}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-medium-emphasis">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-3 w-3" />
                <span>{formatTimeAgo(post.publishedAt || post.createdAt)}</span>
              </div>

              {showStats && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-3 w-3" />
                    <span>{post.viewCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ShareIcon className="h-3 w-3" />
                    <span>{post.shareCount}</span>
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
      <Card className="h-full hover:shadow-xl transition-shadow duration-200 overflow-hidden">
        <Link href={`/news/${post.slug}`}>
          {post.featuredImageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              {post.isBreaking && (
                <Badge variant="destructive" className="text-xs">
                  BREAKING
                </Badge>
              )}
              {showCategory && category && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", category.color)}
                >
                  {category.name}
                </Badge>
              )}
              {post.urgencyLevel === "urgent" && !post.isBreaking && (
                <FireIcon className="h-4 w-4 text-orange-500" />
              )}
            </div>

            <h2 className="text-xl font-bold text-high-emphasis line-clamp-2 hover:text-primary transition-colors mb-3">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-medium-emphasis line-clamp-3 mb-4">{post.excerpt}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {showAuthor && author && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={author.avatarUrl || "/default-avatar.png"}
                      alt={author.fullName || "Author"}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-high-emphasis">
                      {author.fullName}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-sm text-medium-emphasis">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {formatTimeAgo(post.publishedAt || post.createdAt)}
                  </span>
                </div>
              </div>

              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-medium-emphasis">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{post.viewCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ShareIcon className="h-4 w-4" />
                    <span>{post.shareCount}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <Link href={`/news/${post.slug}`}>
        {post.featuredImageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            {post.isBreaking && (
              <Badge variant="destructive" className="text-xs">
                BREAKING
              </Badge>
            )}
            {showCategory && category && (
              <Badge
                variant="outline"
                className={cn("text-xs", category.color)}
              >
                {category.name}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-high-emphasis line-clamp-2 hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-medium-emphasis text-sm line-clamp-2 mb-3">
              {truncateText(post.excerpt, 120)}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-medium-emphasis">
            <span>{formatTimeAgo(post.publishedAt || post.createdAt)}</span>
            {post.readingTime && <span>{post.readingTime} min read</span>}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
