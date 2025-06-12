"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPost } from "@/app/actions/posts";
import { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function PostViewPage() {
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
                The post you're looking for doesn't exist.
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
      <Header
        title="View Post"
        actions={
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Created: {formatDate(post.created_at)}</p>
                    <p>Updated: {formatDate(post.updated_at)}</p>
                    {post.published_at && (
                      <p>Published: {formatDate(post.published_at)}</p>
                    )}
                    <p>
                      Slug:{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        {post.slug}
                      </code>
                    </p>
                  </div>
                </div>
                {post.featured_image_url && (
                  <div className="ml-6 flex-shrink-0">
                    <img
                      src={post.featured_image_url}
                      alt={post.featured_image_alt || post.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {post.excerpt && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Excerpt</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {post.excerpt}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Content</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between">
            <Link href="/dashboard/posts">
              <Button variant="outline">← Back to Posts</Button>
            </Link>
            {post.status === "published" && (
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Button variant="outline">View Public Post →</Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
