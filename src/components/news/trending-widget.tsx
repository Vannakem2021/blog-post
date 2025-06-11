import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/lib/types";
import { getTrendingPosts } from "@/lib/mock-data";
import {
  ArrowTrendingUpIcon,
  FireIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface TrendingWidgetProps {
  className?: string;
  maxItems?: number;
}

export function TrendingWidget({
  className,
  maxItems = 5,
}: TrendingWidgetProps) {
  const trendingPosts = getTrendingPosts().slice(0, maxItems);

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

  const getTrendingIcon = (index: number) => {
    if (index === 0) return <FireIcon className="h-4 w-4 text-red-500" />;
    if (index === 1)
      return <ArrowTrendingUpIcon className="h-4 w-4 text-orange-500" />;
    return (
      <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
    );
  };

  const getTrendingColor = (index: number) => {
    if (index === 0) return "text-red-600";
    if (index === 1) return "text-orange-600";
    if (index === 2) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {trendingPosts.map((post, index) => (
          <div key={post.id} className="group">
            <Link href={`/news/${post.slug}`}>
              <div className="flex items-start space-x-3 p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Trending Number/Icon */}
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {getTrendingIcon(index)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "font-medium text-sm line-clamp-2 group-hover:text-blue-700 transition-colors",
                      getTrendingColor(index)
                    )}
                  >
                    {post.title}
                  </h4>

                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>{post.viewCount?.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>
                        {formatTimeAgo(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {post.isBreaking && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      BREAKING
                    </Badge>
                  )}
                </div>

                {/* Thumbnail */}
                {post.featuredImageUrl && (
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}

        {/* View All Link */}
        <div className="pt-3 border-t border-gray-200">
          <Link
            href="/trending"
            className="block text-center text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
          >
            View All Trending →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Widget
export function QuickStatsWidget({ className }: { className?: string }) {
  const stats = [
    { label: "Breaking News", value: "3", color: "text-red-600" },
    { label: "Stories Today", value: "47", color: "text-blue-600" },
    { label: "Active Readers", value: "12.5K", color: "text-green-600" },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Live Stats</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
