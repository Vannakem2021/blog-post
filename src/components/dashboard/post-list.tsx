"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { BlogPost } from "@/lib/types";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface PostListProps {
  posts: BlogPost[];
  onEdit?: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
  onView?: (post: BlogPost) => void;
}

export function PostList({ posts, onEdit, onDelete, onView }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            No posts found
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Get started by creating your first blog post and sharing your
            thoughts with the world.
          </p>
          <Link href="/dashboard/posts/new">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Create Your First Post
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1"
        >
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {post.title}
                  </h3>
                  <Badge
                    className={`px-3 py-1 rounded-full font-semibold ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : post.status === "scheduled"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {post.status === "published" && "✅ Published"}
                    {post.status === "scheduled" && "⏰ Scheduled"}
                    {post.status === "draft" && "📝 Draft"}
                  </Badge>
                </div>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">📅</span>
                    <span>Created: {formatDate(post.created_at)}</span>
                  </div>
                  {post.published_at && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">🚀</span>
                      <span>Published: {formatDate(post.published_at)}</span>
                    </div>
                  )}
                  {post.scheduled_at && post.status === "scheduled" && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">⏰</span>
                      <span>Scheduled: {formatDate(post.scheduled_at)}</span>
                      {post.timezone && post.timezone !== "UTC" && (
                        <span className="text-xs text-gray-400">
                          ({post.timezone})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {post.featured_image_url && (
                <div className="ml-6 flex-shrink-0">
                  <img
                    src={post.featured_image_url}
                    alt={post.featured_image_alt || post.title}
                    className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 flex items-center space-x-2">
                  <span className="text-gray-400">🔗</span>
                  <span>Slug:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded-lg font-mono text-xs">
                    {post.slug}
                  </code>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(post)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(post)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
