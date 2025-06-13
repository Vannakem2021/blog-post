"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { StatusPostList } from "@/components/dashboard/status-post-list";
import { StatusPagination } from "@/components/dashboard/status-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getPostsByStatus,
  getPostCounts,
  deletePost,
  publishScheduledPostNow,
  cancelScheduledPost,
} from "@/app/actions/posts";
import { BlogPost } from "@/lib/types";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { newsCategories } from "@/lib/mock-data";

type PostCounts = {
  published: number;
  draft: number;
  scheduled: number;
  total: number;
};

type StatusData = {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
};

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for post counts
  const [postCounts, setPostCounts] = useState<PostCounts>({
    published: 0,
    draft: 0,
    scheduled: 0,
    total: 0,
  });

  // State for each status section
  const [publishedData, setPublishedData] = useState<StatusData>({
    posts: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: true,
  });

  const [draftData, setDraftData] = useState<StatusData>({
    posts: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: true,
  });

  const [scheduledData, setScheduledData] = useState<StatusData>({
    posts: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: true,
  });

  // State for section visibility
  const [expandedSections, setExpandedSections] = useState({
    published: true,
    draft: true,
    scheduled: true,
  });

  // State for category filters
  const [categoryFilters, setCategoryFilters] = useState({
    published: "all",
    draft: "all",
    scheduled: "all",
  });

  // State for dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    post: BlogPost | null;
  }>({
    open: false,
    post: null,
  });

  // Get pagination from URL params
  const getPageFromParams = (status: string) => {
    return Number(searchParams.get(`${status}_page`)) || 1;
  };

  // Fetch post counts
  const fetchPostCounts = async () => {
    try {
      const result = await getPostCounts();
      if (result.success && result.data) {
        setPostCounts(result.data);
      } else {
        toast.error(result.error || "Failed to fetch post counts");
      }
    } catch (error) {
      console.error("Error fetching post counts:", error);
      toast.error("Failed to fetch post counts");
    }
  };

  // Fetch posts for a specific status
  const fetchPostsForStatus = async (
    status: "published" | "draft" | "scheduled",
    page?: number,
    category?: string
  ) => {
    try {
      const currentPage = page || getPageFromParams(status);
      const currentCategory = category || categoryFilters[status];

      // Set loading state
      const setData =
        status === "published"
          ? setPublishedData
          : status === "draft"
          ? setDraftData
          : setScheduledData;

      setData((prev) => ({ ...prev, loading: true }));

      const result = await getPostsByStatus(
        status,
        currentPage,
        10, // posts per page
        currentCategory === "all" ? undefined : currentCategory
      );

      if (result.success && result.data) {
        setData({
          posts: result.data.posts,
          pagination: result.data.pagination,
          loading: false,
        });
      } else {
        toast.error(result.error || `Failed to fetch ${status} posts`);
        setData((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(`Error fetching ${status} posts:`, error);
      toast.error(`Failed to fetch ${status} posts`);
      const setData =
        status === "published"
          ? setPublishedData
          : status === "draft"
          ? setDraftData
          : setScheduledData;
      setData((prev) => ({ ...prev, loading: false }));
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    await Promise.all([
      fetchPostCounts(),
      fetchPostsForStatus("published"),
      fetchPostsForStatus("draft"),
      fetchPostsForStatus("scheduled"),
    ]);
  };

  // Event handlers
  const handleEdit = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}/edit`);
  };

  const handleView = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}`);
  };

  const handleDelete = (post: BlogPost) => {
    setDeleteDialog({ open: true, post });
  };

  const handlePublishNow = async (post: BlogPost) => {
    try {
      const result = await publishScheduledPostNow(post.id);
      if (result.success) {
        toast.success("Post published successfully!");
        await fetchAllData(); // Refresh all data
      } else {
        toast.error(result.error || "Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      toast.error("Failed to publish post");
    }
  };

  const handleCancelScheduled = async (post: BlogPost) => {
    try {
      const result = await cancelScheduledPost(post.id);
      if (result.success) {
        toast.success("Scheduled post cancelled successfully!");
        await fetchAllData(); // Refresh all data
      } else {
        toast.error(result.error || "Failed to cancel scheduled post");
      }
    } catch (error) {
      console.error("Error cancelling scheduled post:", error);
      toast.error("Failed to cancel scheduled post");
    }
  };

  const handleCategoryFilter = (
    status: "published" | "draft" | "scheduled",
    category: string
  ) => {
    setCategoryFilters((prev) => ({ ...prev, [status]: category }));
    fetchPostsForStatus(status, 1, category); // Reset to page 1 when filtering
  };

  const toggleSection = (status: "published" | "draft" | "scheduled") => {
    setExpandedSections((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // Delete post handler
  const confirmDelete = async () => {
    if (!deleteDialog.post) return;

    try {
      const result = await deletePost(deleteDialog.post.id);
      if (result.success) {
        toast.success("Post deleted successfully!");
        await fetchAllData(); // Refresh all data
        setDeleteDialog({ open: false, post: null });
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, post: null });
  };

  // Effects
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch when URL params change
  useEffect(() => {
    const publishedPage = getPageFromParams("published");
    const draftPage = getPageFromParams("draft");
    const scheduledPage = getPageFromParams("scheduled");

    if (publishedPage !== publishedData.pagination.page) {
      fetchPostsForStatus("published", publishedPage);
    }
    if (draftPage !== draftData.pagination.page) {
      fetchPostsForStatus("draft", draftPage);
    }
    if (scheduledPage !== scheduledData.pagination.page) {
      fetchPostsForStatus("scheduled", scheduledPage);
    }
  }, [searchParams]);

  // Helper function to render status section
  const renderStatusSection = (
    status: "published" | "draft" | "scheduled",
    title: string,
    icon: string,
    data: StatusData,
    count: number
  ) => {
    const isExpanded = expandedSections[status];
    const currentCategory = categoryFilters[status];

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection(status)}
              className="flex items-center space-x-3 text-left flex-1 hover:text-blue-600 transition-colors duration-200"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {title} ({count})
                </h3>
                <p className="text-gray-600 text-sm">
                  {status === "published" && "Live articles visible to readers"}
                  {status === "draft" && "Work in progress articles"}
                  {status === "scheduled" &&
                    "Articles scheduled for future publication"}
                </p>
              </div>
            </button>

            <div className="flex items-center space-x-3">
              {/* Category Filter */}
              <select
                value={currentCategory}
                onChange={(e) => handleCategoryFilter(status, e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="all">All Categories</option>
                {newsCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(status)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Section Content */}
        {isExpanded && (
          <div className="p-6">
            {data.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading {status} posts...</p>
                </div>
              </div>
            ) : (
              <>
                <StatusPostList
                  posts={data.posts}
                  status={status}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onPublishNow={
                    status === "scheduled" ? handlePublishNow : undefined
                  }
                  onCancel={
                    status === "scheduled" ? handleCancelScheduled : undefined
                  }
                />

                {data.pagination.totalPages > 1 && (
                  <StatusPagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    statusType={status}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Content Management"
        actions={
          <Link href="/dashboard/posts/new">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        }
      />

      <main className="p-8 lg:p-12 space-y-8">
        {/* Overview Stats */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              📊 Content Overview
            </h2>
            <p className="text-gray-600">
              Manage your articles organized by publication status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {postCounts.total}
              </div>
              <div className="text-blue-700 font-medium">Total Posts</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {postCounts.published}
              </div>
              <div className="text-green-700 font-medium">Published</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">
                {postCounts.draft}
              </div>
              <div className="text-yellow-700 font-medium">Drafts</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {postCounts.scheduled}
              </div>
              <div className="text-purple-700 font-medium">Scheduled</div>
            </div>
          </div>
        </div>

        {/* Status Sections */}
        {renderStatusSection(
          "published",
          "Published Posts",
          "🌟",
          publishedData,
          postCounts.published
        )}
        {renderStatusSection(
          "draft",
          "Draft Posts",
          "📝",
          draftData,
          postCounts.draft
        )}
        {renderStatusSection(
          "scheduled",
          "Scheduled Posts",
          "⏰",
          scheduledData,
          postCounts.scheduled
        )}
      </main>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogHeader onClose={cancelDelete}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">🗑️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delete Post</h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium mb-2">
              Are you sure you want to delete this post?
            </p>
            <p className="text-red-700 text-sm">
              <strong>&ldquo;{deleteDialog.post?.title}&rdquo;</strong> will be
              permanently removed from your blog.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={cancelDelete}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Delete Post
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
