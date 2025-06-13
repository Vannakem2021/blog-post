"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/types";
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import {
  getLiveStats,
  updateUserSession,
  type LiveStats,
} from "@/app/actions/stats";
import { formatNumber, generateSessionId } from "@/lib/stats-utils";

interface TrendingWidgetProps {
  className?: string;
  maxItems?: number;
  trendingPosts?: BlogPost[];
  isLoading?: boolean;
  error?: string | null;
}

export function TrendingWidget({
  className,
  maxItems = 5,
  trendingPosts = [],
  isLoading = false,
  error = null,
}: TrendingWidgetProps) {
  const displayPosts = trendingPosts.slice(0, maxItems);

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

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: maxItems }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 mb-4">
            Unable to load trending articles
          </p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayPosts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📰</div>
          <p className="text-sm text-gray-600">
            No trending articles available
          </p>
        </div>
      )}

      {/* Trending Posts */}
      {!isLoading && !error && displayPosts.length > 0 && (
        <div className="space-y-6">
          {displayPosts.map((post, index) => {
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
                          <span className="text-xs text-gray-500">
                            TRENDING
                          </span>
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
      )}

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

// Enhanced Quick Stats Widget with Real-time Data
export function QuickStatsWidget({ className }: { className?: string }) {
  const [stats, setStats] = useState([
    {
      label: "Breaking News",
      value: "...",
      color: "text-red-600",
      bgColor: "bg-gradient-to-r from-red-50 to-red-100",
      icon: "🚨",
      loading: true,
    },
    {
      label: "Stories Today",
      value: "...",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
      icon: "📰",
      loading: true,
    },
    {
      label: "Active Readers",
      value: "...",
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-50 to-green-100",
      icon: "👥",
      loading: true,
    },
  ]);

  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live stats from database
  const fetchLiveStats = useCallback(async () => {
    try {
      const liveStats = await getLiveStats();

      setStats([
        {
          label: "Breaking News",
          value: liveStats.breakingNewsCount.toString(),
          color: "text-red-600",
          bgColor: "bg-gradient-to-r from-red-50 to-red-100",
          icon: "🚨",
          loading: false,
        },
        {
          label: "Stories Today",
          value: liveStats.storiesTodayCount.toString(),
          color: "text-blue-600",
          bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
          icon: "📰",
          loading: false,
        },
        {
          label: "Active Readers",
          value: formatNumber(liveStats.activeReadersCount),
          color: "text-green-600",
          bgColor: "bg-gradient-to-r from-green-50 to-green-100",
          icon: "👥",
          loading: false,
        },
      ]);

      setLastUpdated(new Date(liveStats.lastUpdated).toLocaleTimeString());
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching live stats:", error);
      // Keep loading state or show error state
      setIsLoading(false);
    }
  }, []);

  // Update user session for active readers tracking
  const updateSession = useCallback(async () => {
    try {
      const sessionId =
        localStorage.getItem("blog_session_id") || generateSessionId();
      localStorage.setItem("blog_session_id", sessionId);
      await updateUserSession(sessionId);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  }, []);

  // Initialize and set up real-time updates
  useEffect(() => {
    // Initial data fetch
    fetchLiveStats();
    updateSession();

    // Set up periodic updates every 30 seconds
    const statsInterval = setInterval(fetchLiveStats, 30000);

    // Update session every 2 minutes to maintain active status
    const sessionInterval = setInterval(updateSession, 120000);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(statsInterval);
      clearInterval(sessionInterval);
    };
  }, [fetchLiveStats, updateSession]);

  // Update session when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateSession();
        fetchLiveStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [updateSession, fetchLiveStats]);

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
                  {stat.loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
            </div>
            <div className="text-gray-400">
              {stat.loading ? (
                <div className="animate-pulse">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Live indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col items-center space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isLoading ? "bg-yellow-500" : "bg-green-500"
              )}
            ></div>
            <span>
              {isLoading ? "Updating..." : "Live updates every 30 seconds"}
            </span>
          </div>
          {lastUpdated && !isLoading && (
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
