"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { BlogPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ClockIcon,
  CalendarIcon,
  PlayIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface StatusPostListProps {
  posts: BlogPost[];
  status: "published" | "draft" | "scheduled";
  onEdit?: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
  onView?: (post: BlogPost) => void;
  onPublishNow?: (post: BlogPost) => void;
  onCancel?: (post: BlogPost) => void;
}

export function StatusPostList({ 
  posts, 
  status, 
  onEdit, 
  onDelete, 
  onView,
  onPublishNow,
  onCancel
}: StatusPostListProps) {
  if (posts.length === 0) {
    const emptyMessages = {
      published: {
        icon: "🌟",
        title: "No published posts",
        description: "Your published articles will appear here once you publish them."
      },
      draft: {
        icon: "📝",
        title: "No draft posts",
        description: "Start writing your next article and save it as a draft."
      },
      scheduled: {
        icon: "⏰",
        title: "No scheduled posts",
        description: "Schedule posts to be published automatically at a future date."
      }
    };

    const message = emptyMessages[status];

    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">{message.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {message.description}
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (post: BlogPost) => {
    switch (post.status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            ✅ Published
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            ⏰ Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            📝 Draft
          </Badge>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      politics: "bg-red-50 text-red-700 border-red-200",
      business: "bg-green-50 text-green-700 border-green-200",
      technology: "bg-blue-50 text-blue-700 border-blue-200",
      sports: "bg-orange-50 text-orange-700 border-orange-200",
      world: "bg-purple-50 text-purple-700 border-purple-200",
      health: "bg-pink-50 text-pink-700 border-pink-200",
      local: "bg-yellow-50 text-yellow-700 border-yellow-200",
      opinion: "bg-gray-50 text-gray-700 border-gray-200",
      entertainment: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
      <Badge className={`${categoryColors[category] || categoryColors.opinion} text-xs`}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getStatusBadge(post)}
                    {post.category && getCategoryBadge(post.category)}
                  </div>
                </div>

                {post.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Created: {formatDate(post.created_at)}</span>
                  </span>
                  
                  {post.published_at && (
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>Published: {formatDate(post.published_at)}</span>
                    </span>
                  )}
                  
                  {post.scheduled_at && (
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>Scheduled: {formatDate(post.scheduled_at)}</span>
                    </span>
                  )}

                  {post.view_count !== undefined && (
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>{post.view_count} views</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(post)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}

                {status === "scheduled" && onPublishNow && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPublishNow(post)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                )}

                {status === "scheduled" && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(post)}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(post)}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <TrashIcon className="h-4 w-4" />
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
