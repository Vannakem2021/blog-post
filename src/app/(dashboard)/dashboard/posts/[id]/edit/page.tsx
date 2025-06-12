"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { PostForm } from "@/components/dashboard/post-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPost } from "@/app/actions/posts";
import { BlogPost, CreatePostData } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post data
  const fetchPost = async () => {
    try {
      setLoading(true);
      const result = await getPost(postId);

      if (result.success && result.data) {
        setPost(result.data);
      } else {
        toast.error(result.error || "Failed to fetch post");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleSubmit = async (data: CreatePostData) => {
    // TODO: Implement updatePost action
    console.log("Updating post:", { id: postId, ...data });
    toast.success("Post updated successfully!");
    router.push(`/dashboard/posts/${postId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Loading..." />
        <main className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading post...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Post Not Found" />
        <main className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Post not found
              </h3>
              <p className="text-gray-500 mb-4">
                The post you're trying to edit doesn't exist.
              </p>
              <Link href="/dashboard/posts">
                <Button>Back to Posts</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title={`Edit: ${post.title}`} />

      <main className="p-6">
        <PostForm post={post} onSubmit={handleSubmit} onCancel={handleCancel} />
      </main>
    </div>
  );
}
