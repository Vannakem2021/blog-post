"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { PostForm } from "@/components/dashboard/post-form";
import { createPost } from "@/app/actions/posts";
import { toast } from "sonner";

interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  category: string;
  status: "draft" | "published";
  urgency_level?: "breaking" | "urgent" | "normal";
  is_breaking?: boolean;
  is_featured?: boolean;
}

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreatePostData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await createPost({
        ...data,
        category: data.category as any, // Type assertion for NewsCategory
      });

      if (result.success) {
        toast.success(result.message || "Post created successfully!");
        // Force a hard navigation to refresh the posts list
        window.location.href = "/dashboard/posts";
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Create New Post" />

      <main className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                ✍️ Create New Post
              </h2>
              <p className="text-gray-600">
                Share your thoughts and insights with the world
              </p>
            </div>

            <PostForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </main>
    </div>
  );
}
