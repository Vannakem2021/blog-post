"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { BlogPost, NewsCategory } from "@/lib/types";

// Validation schemas
interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  category: NewsCategory;
  status: "draft" | "published";
  urgency_level?: "breaking" | "urgent" | "normal";
  is_breaking?: boolean;
  is_featured?: boolean;
  reading_time?: number;
  source_attribution?: string[];
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

// Helper function to validate admin access
async function validateAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }

  return { user, profile };
}

// Create a new blog post
export async function createPost(input: CreatePostInput) {
  try {
    console.log("createPost called with input:", input);
    console.log("Featured image URL received:", input.featured_image_url);

    const { user } = await validateAdminAccess();
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

    // Prepare post data
    const postData = {
      title: input.title.trim(),
      slug,
      content: input.content,
      excerpt: input.excerpt?.trim() || null,
      featured_image_url: input.featured_image_url || null,
      featured_image_alt: input.featured_image_alt?.trim() || null,
      category: input.category,
      status: input.status,
      urgency_level: input.urgency_level || "normal",
      is_breaking: input.is_breaking || false,
      is_featured: input.is_featured || false,
      reading_time: readingTime,
      source_attribution: input.source_attribution || null,
      author_id: user.id,
      published_at:
        input.status === "published" ? new Date().toISOString() : null,
    };

    console.log("Post data being inserted:", postData);
    console.log("Featured image URL in postData:", postData.featured_image_url);

    // Insert the post
    const { data: post, error } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
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

    // Prepare update data
    const updateData = {
      title: input.title.trim(),
      content: input.content,
      excerpt: input.excerpt?.trim() || null,
      featured_image_url: input.featured_image_url || null,
      featured_image_alt: input.featured_image_alt?.trim() || null,
      category: input.category,
      status: input.status,
      urgency_level: input.urgency_level || "normal",
      is_breaking: input.is_breaking || false,
      is_featured: input.is_featured || false,
      reading_time: readingTime,
      source_attribution: input.source_attribution || null,
      published_at:
        input.status === "published" && existingPost.status === "draft"
          ? new Date().toISOString()
          : existingPost.published_at,
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
  status?: "draft" | "published"
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
      `
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
