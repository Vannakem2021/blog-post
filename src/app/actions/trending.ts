"use server";

import { createClient } from "@/lib/supabase/server";
import { BlogPost } from "@/lib/types";

interface TrendingPostsOptions {
  limit?: number;
  excludePostId?: string;
  daysBack?: number;
}

/**
 * Fetch trending posts from the database based on engagement metrics
 * Algorithm prioritizes:
 * - High view counts and share counts
 * - Recent publication dates (within specified days)
 * - Published status only
 * - Excludes current post if specified
 */
export async function getTrendingPosts({
  limit = 5,
  excludePostId,
  daysBack = 30,
}: TrendingPostsOptions = {}): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();

    // Calculate the date threshold for recent posts
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          full_name,
          email
        )
      `
      )
      .eq("status", "published")
      .gte("published_at", dateThreshold.toISOString());

    // Exclude current post if specified
    if (excludePostId) {
      query = query.neq("id", excludePostId);
    }

    const { data: posts, error } = await query
      .limit(limit * 2) // Fetch more to allow for better sorting
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trending posts:", error);
      return [];
    }

    if (!posts || posts.length === 0) {
      return [];
    }

    // Calculate trending score for each post
    const postsWithScore = posts.map((post) => {
      const viewCount = post.view_count || 0;
      const shareCount = post.share_count || 0;
      const publishedAt = new Date(post.published_at || post.created_at);
      const now = new Date();
      const hoursOld =
        (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

      // Trending algorithm:
      // - Base score from views and shares (weighted)
      // - Recency bonus (newer posts get higher scores)
      // - Breaking news bonus
      const baseScore = viewCount + shareCount * 2;
      const recencyMultiplier = Math.max(0.1, 1 - hoursOld / (24 * 7)); // Decay over a week
      const breakingBonus = post.is_breaking ? 1000 : 0;
      const featuredBonus = post.is_featured ? 500 : 0;

      const trendingScore =
        baseScore * recencyMultiplier + breakingBonus + featuredBonus;

      return {
        ...post,
        trendingScore,
      };
    });

    // Sort by trending score and return top posts
    return postsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)
      .map(({ trendingScore, ...post }) => post); // Remove the score from final result
  } catch (error) {
    console.error("Error in getTrendingPosts:", error);
    return [];
  }
}

/**
 * Get trending posts with caching for better performance
 * This function can be called from client components
 */
export async function getTrendingPostsCached(
  options: TrendingPostsOptions = {}
) {
  // For now, just call the main function
  // In the future, we could add Redis caching here
  return getTrendingPosts(options);
}
