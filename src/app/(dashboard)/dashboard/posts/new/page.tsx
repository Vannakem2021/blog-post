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

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <PostForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
}
