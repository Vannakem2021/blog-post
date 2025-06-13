"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { NewsCategory } from "@/lib/types";
import {
  sanitizeContent,
  sanitizeUserInput,
  sanitizeUrl,
} from "@/lib/security/sanitization";
import {
  rateLimitServerAction,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";
import {
  validateAdminAccess as enhancedValidateAdminAccess,
  logSecurityEvent,
} from "@/lib/security/auth-helpers";

// Validation schemas
interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  category: NewsCategory;
  status: "draft" | "published" | "scheduled"; // Updated to include 'scheduled'
  scheduled_at?: Date | string; // New: When to publish the post
  timezone?: string; // New: Timezone for scheduling
  auto_publish?: boolean; // New: Auto-publish when scheduled time arrives
  urgency_level?: "breaking" | "urgent" | "normal";
  is_breaking?: boolean;
  is_featured?: boolean;
  reading_time?: number;
  source_attribution?: string[];
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string[];
  primary_keyword?: string;
  is_pillar_content?: boolean;
}

interface UpdatePostInput extends CreatePostInput {
  id: string;
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ""); // Strip HTML tags
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper function to validate admin access (legacy - use enhancedValidateAdminAccess for new code)
async function validateAdminAccess() {
  return await enhancedValidateAdminAccess();
}

// Helper function to validate scheduled post data
function validateScheduledPost(input: CreatePostInput | UpdatePostInput) {
  if (input.status === "scheduled") {
    if (!input.scheduled_at) {
      throw new Error("Scheduled date/time is required for scheduled posts");
    }

    const scheduledDate = new Date(input.scheduled_at);
    const now = new Date();

    if (isNaN(scheduledDate.getTime())) {
      throw new Error("Invalid scheduled date format");
    }

    if (scheduledDate <= now) {
      throw new Error("Scheduled date must be in the future");
    }

    // Prevent scheduling too far in advance (optional - 1 year limit)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

    if (scheduledDate > maxFutureDate) {
      throw new Error("Cannot schedule more than 1 year in advance");
    }

    // Validate timezone if provided
    if (input.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: input.timezone });
      } catch {
        throw new Error("Invalid timezone specified");
      }
    }
  }
}

// Create a new blog post
export async function createPost(input: CreatePostInput) {
  try {
    console.log("createPost called with input:", input);
    console.log("Featured image URL received:", input.featured_image_url);

    const { user } = await validateAdminAccess();

    // Rate limiting check
    const rateLimitResult = await rateLimitServerAction(
      `create-post:${user.id}`,
      RATE_LIMIT_CONFIGS.posts
    );

    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.message || "Too many requests");
    }

    const supabase = await createClient();

    // Validate required fields
    if (!input.title?.trim()) {
      throw new Error("Title is required");
    }

    if (!input.content?.trim()) {
      throw new Error("Content is required");
    }

    if (!input.category) {
      throw new Error("Category is required");
    }

    // Validate scheduled post data
    validateScheduledPost(input);

    // Generate slug from title
    const baseSlug = generateSlug(input.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existingPost) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate reading time if not provided
    const readingTime =
      input.reading_time || calculateReadingTime(input.content);

    // Sanitize and prepare post data
    const postData = {
      title: sanitizeUserInput(input.title.trim()),
      slug,
      content: sanitizeContent(input.content, "richText"),
      excerpt: input.excerpt?.trim()
        ? sanitizeUserInput(input.excerpt.trim())
        : null,
      featured_image_url: input.featured_image_url
        ? sanitizeUrl(input.featured_image_url)
        : null,
      featured_image_alt: input.featured_image_alt?.trim()
        ? sanitizeUserInput(input.featured_image_alt.trim())
        : null,
      category: input.category,
      status: input.status,
      urgency_level: input.urgency_level || "normal",
      is_breaking: input.is_breaking || false,
      is_featured: input.is_featured || false,
      reading_time: readingTime,
      source_attribution: input.source_attribution || null,
      author_id: user.id,
      // Scheduled post fields
      scheduled_at: input.status === "scheduled" ? input.scheduled_at : null,
      timezone: input.timezone || "Asia/Phnom_Penh",
      auto_publish:
        input.status === "scheduled" ? input.auto_publish ?? true : false,
      // SEO fields (sanitized)
      meta_title: input.meta_title?.trim()
        ? sanitizeUserInput(input.meta_title.trim())
        : null,
      meta_description: input.meta_description?.trim()
        ? sanitizeUserInput(input.meta_description.trim())
        : null,
      focus_keywords:
        input.focus_keywords?.map((keyword) => sanitizeUserInput(keyword)) ||
        null,
      primary_keyword: input.primary_keyword?.trim()
        ? sanitizeUserInput(input.primary_keyword.trim())
        : null,
      is_pillar_content: input.is_pillar_content || false,
      // Published at logic
      published_at:
        input.status === "published" ? new Date().toISOString() : null,
    };

    // Removed debug logging for production

    // Insert the post
    const { data: post, error } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      data: post,
      message: "Post created successfully",
    };
  } catch (error) {
    console.error("Create post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

// Update an existing blog post
export async function updatePost(input: UpdatePostInput) {
  try {
    const { user } = await validateAdminAccess();

    // Rate limiting check
    const rateLimitResult = await rateLimitServerAction(
      `update-post:${user.id}`,
      RATE_LIMIT_CONFIGS.posts
    );

    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.message || "Too many requests");
    }

    const supabase = await createClient();

    // Validate required fields
    if (!input.id) {
      throw new Error("Post ID is required");
    }

    if (!input.title?.trim()) {
      throw new Error("Title is required");
    }

    if (!input.content?.trim()) {
      throw new Error("Content is required");
    }

    // Validate scheduled post data
    validateScheduledPost(input);

    // Check if post exists and user has permission
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", input.id)
      .single();

    if (fetchError || !existingPost) {
      throw new Error("Post not found");
    }

    // Calculate reading time if not provided
    const readingTime =
      input.reading_time || calculateReadingTime(input.content);

    // Sanitize and prepare update data
    const updateData = {
      title: sanitizeUserInput(input.title.trim()),
      content: sanitizeContent(input.content, "richText"),
      excerpt: input.excerpt?.trim()
        ? sanitizeUserInput(input.excerpt.trim())
        : null,
      featured_image_url: input.featured_image_url
        ? sanitizeUrl(input.featured_image_url)
        : null,
      featured_image_alt: input.featured_image_alt?.trim()
        ? sanitizeUserInput(input.featured_image_alt.trim())
        : null,
      category: input.category,
      status: input.status,
      urgency_level: input.urgency_level || "normal",
      is_breaking: input.is_breaking || false,
      is_featured: input.is_featured || false,
      reading_time: readingTime,
      source_attribution: input.source_attribution || null,
      // Scheduled post fields
      scheduled_at: input.status === "scheduled" ? input.scheduled_at : null,
      timezone: input.timezone || existingPost.timezone || "Asia/Phnom_Penh",
      auto_publish:
        input.status === "scheduled" ? input.auto_publish ?? true : false,
      // SEO fields (sanitized)
      meta_title: input.meta_title?.trim()
        ? sanitizeUserInput(input.meta_title.trim())
        : null,
      meta_description: input.meta_description?.trim()
        ? sanitizeUserInput(input.meta_description.trim())
        : null,
      focus_keywords:
        input.focus_keywords?.map((keyword) => sanitizeUserInput(keyword)) ||
        null,
      primary_keyword: input.primary_keyword?.trim()
        ? sanitizeUserInput(input.primary_keyword.trim())
        : null,
      is_pillar_content: input.is_pillar_content || false,
      // Published at logic - handle transitions between statuses
      published_at: (() => {
        // If changing from draft/scheduled to published, set published_at to now
        if (
          input.status === "published" &&
          existingPost.status !== "published"
        ) {
          return new Date().toISOString();
        }
        // If changing from published to draft/scheduled, clear published_at
        if (
          input.status !== "published" &&
          existingPost.status === "published"
        ) {
          return null;
        }
        // Otherwise, keep existing published_at
        return existingPost.published_at;
      })(),
    };

    // Update the post
    const { data: post, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to update post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${existingPost.slug}`);

    return {
      success: true,
      data: post,
      message: "Post updated successfully",
    };
  } catch (error) {
    console.error("Update post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

// Delete a blog post
export async function deletePost(postId: string) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("slug")
      .eq("id", postId)
      .single();

    if (fetchError || !existingPost) {
      throw new Error("Post not found");
    }

    // Delete the post
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to delete post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("Delete post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}

// Get single post by ID
export async function getPost(id: string) {
  try {
    const supabase = await createClient();

    const { data: post, error } = await supabase
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
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("Failed to fetch post");
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Get post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch post",
    };
  }
}

// Get posts with pagination
export async function getPosts(
  page = 1,
  limit = 10,
  status?: "draft" | "published" | "scheduled"
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          full_name,
          email
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const {
      data: posts,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error("Failed to fetch posts");
    }

    return {
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get posts error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch posts",
    };
  }
}

// Get posts by status with pagination and category filter
export async function getPostsByStatus(
  status: "draft" | "published" | "scheduled",
  page = 1,
  limit = 10,
  category?: string
) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          full_name,
          email
        )
      `,
        { count: "exact" }
      )
      .eq("status", status);

    // Add category filter if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Order by different fields based on status
    if (status === "scheduled") {
      query = query.order("scheduled_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const {
      data: posts,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error(`Failed to fetch ${status} posts`);
    }

    return {
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    };
  } catch (error) {
    console.error(`Get ${status} posts error:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to fetch ${status} posts`,
    };
  }
}

// Get post counts by status
export async function getPostCounts() {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    // Get counts for each status
    const [publishedResult, draftResult, scheduledResult] = await Promise.all([
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled"),
    ]);

    return {
      success: true,
      data: {
        published: publishedResult.count || 0,
        draft: draftResult.count || 0,
        scheduled: scheduledResult.count || 0,
        total:
          (publishedResult.count || 0) +
          (draftResult.count || 0) +
          (scheduledResult.count || 0),
      },
    };
  } catch (error) {
    console.error("Get post counts error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch post counts",
    };
  }
}

// Get scheduled posts specifically
export async function getScheduledPosts(page = 1, limit = 10) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    const {
      data: posts,
      error,
      count,
    } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          full_name,
          email
        )
      `,
        { count: "exact" }
      )
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error("Failed to fetch scheduled posts");
    }

    return {
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get scheduled posts error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch scheduled posts",
    };
  }
}

// Cancel a scheduled post (change status back to draft)
export async function cancelScheduledPost(postId: string) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    // Check if post exists and is scheduled
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.status !== "scheduled") {
      throw new Error("Post is not scheduled");
    }

    // Update post to draft status and clear scheduling fields
    const { data: post, error } = await supabase
      .from("posts")
      .update({
        status: "draft",
        scheduled_at: null,
        auto_publish: false,
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to cancel scheduled post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/dashboard/scheduled");

    return {
      success: true,
      data: post,
      message: "Scheduled post cancelled successfully",
    };
  } catch (error) {
    console.error("Cancel scheduled post error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel scheduled post",
    };
  }
}

// Reschedule a post to a new date/time
export async function reschedulePost(
  postId: string,
  newScheduledAt: string,
  timezone?: string
) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    if (!newScheduledAt) {
      throw new Error("New scheduled date is required");
    }

    // Validate the new scheduled date
    const scheduledDate = new Date(newScheduledAt);
    const now = new Date();

    if (isNaN(scheduledDate.getTime())) {
      throw new Error("Invalid scheduled date format");
    }

    if (scheduledDate <= now) {
      throw new Error("Scheduled date must be in the future");
    }

    // Check if post exists and is scheduled
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.status !== "scheduled") {
      throw new Error("Post is not scheduled");
    }

    // Update the scheduled time
    const { data: post, error } = await supabase
      .from("posts")
      .update({
        scheduled_at: newScheduledAt,
        timezone: timezone || existingPost.timezone || "Asia/Phnom_Penh",
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to reschedule post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/dashboard/scheduled");

    return {
      success: true,
      data: post,
      message: "Post rescheduled successfully",
    };
  } catch (error) {
    console.error("Reschedule post error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reschedule post",
    };
  }
}

// Publish a scheduled post immediately
export async function publishScheduledPostNow(postId: string) {
  try {
    await validateAdminAccess();
    const supabase = await createClient();

    if (!postId) {
      throw new Error("Post ID is required");
    }

    // Check if post exists and is scheduled
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.status !== "scheduled") {
      throw new Error("Post is not scheduled");
    }

    // Update post to published status
    const { data: post, error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        scheduled_at: null,
        auto_publish: false,
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to publish post");
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/posts");
    revalidatePath("/dashboard/scheduled");
    revalidatePath("/");
    revalidatePath("/blog");

    return {
      success: true,
      data: post,
      message: "Post published successfully",
    };
  } catch (error) {
    console.error("Publish scheduled post error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish post",
    };
  }
}
