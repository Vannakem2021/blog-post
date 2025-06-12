import Link from "next/link";
import { BlogPost } from "@/lib/types";
import { getTrendingPosts } from "@/lib/mock-data";
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline";
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

  return (
    <div className={cn("p-8", className)}>
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8 pb-4 border-b border-gray-200">
        🔥 Trending Now
      </h3>

      <div className="space-y-6">
        {trendingPosts.map((post, index) => {
          const trendingData = [
            {
              bgColor: "bg-gradient-to-r from-red-50 to-red-100",
              iconColor: "text-red-600",
              icon: "🔥",
              rank: "#1",
            },
            {
              bgColor: "bg-gradient-to-r from-orange-50 to-orange-100",
              iconColor: "text-orange-600",
              icon: "📈",
              rank: "#2",
            },
            {
              bgColor: "bg-gradient-to-r from-yellow-50 to-yellow-100",
              iconColor: "text-yellow-600",
              icon: "⭐",
              rank: "#3",
            },
            {
              bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
              iconColor: "text-blue-600",
              icon: "📰",
              rank: `#${index + 1}`,
            },
            {
              bgColor: "bg-gradient-to-r from-purple-50 to-purple-100",
              iconColor: "text-purple-600",
              icon: "💫",
              rank: `#${index + 1}`,
            },
          ];

          const itemData = trendingData[index] || trendingData[3];

          return (
            <div key={post.id} className="group">
              <Link href={`/blog/${post.slug}`}>
                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100",
                    itemData.bgColor
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{itemData.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            itemData.iconColor
                          )}
                        >
                          {itemData.rank}
                        </span>
                        <span className="text-xs text-gray-500">TRENDING</span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                        {post.title}
                      </h4>

                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-3 w-3" />
                          <span>
                            {post.view_count?.toLocaleString() || "1.2K"}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {formatTimeAgo(
                              post.published_at || post.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Enhanced View All Link */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Link
          href="/trending"
          className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border border-transparent hover:border-blue-100"
        >
          View All Trending Stories →
        </Link>
      </div>

      {/* Live indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Updated every 5 minutes</span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Quick Stats Widget
export function QuickStatsWidget({ className }: { className?: string }) {
  const stats = [
    {
      label: "Breaking News",
      value: "3",
      color: "text-red-600",
      bgColor: "bg-gradient-to-r from-red-50 to-red-100",
      icon: "🚨",
    },
    {
      label: "Stories Today",
      value: "47",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
      icon: "📰",
    },
    {
      label: "Active Readers",
      value: "12.5K",
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-50 to-green-100",
      icon: "👥",
    },
  ];

  return (
    <div className={cn("p-8", className)}>
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8 pb-4 border-b border-gray-200">
        📊 Live Stats
      </h3>

      <div className="space-y-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100",
              stat.bgColor
            )}
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide block">
                  {stat.label}
                </span>
                <div className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </div>
              </div>
            </div>
            <div className="text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Live indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 30 seconds</span>
        </div>
      </div>
    </div>
  );
}
