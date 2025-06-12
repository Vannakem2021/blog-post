"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { PostList } from "@/components/dashboard/post-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { getPosts, deletePost } from "@/app/actions/posts";
import { BlogPost } from "@/lib/types";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    post: BlogPost | null;
  }>({
    open: false,
    post: null,
  });

  // Fetch posts from database
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await getPosts(1, 50); // Get first 50 posts

      if (result.success && result.data) {
        setPosts(result.data.posts);
      } else {
        toast.error(result.error || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}/edit`);
  };

  const handleView = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}`);
  };

  const handleDelete = (post: BlogPost) => {
    setDeleteDialog({ open: true, post });
  };

  const confirmDelete = async () => {
    if (deleteDialog.post) {
      try {
        const result = await deletePost(deleteDialog.post.id);

        if (result.success) {
          setPosts(posts.filter((p) => p.id !== deleteDialog.post!.id));
          toast.success("Post deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      } finally {
        setDeleteDialog({ open: false, post: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, post: null });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="All Posts"
        actions={
          <Link href="/dashboard/posts/new">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        }
      />

      <main className="p-8 lg:p-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 shadow-lg"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 opacity-20"></div>
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Loading Posts
              </h3>
              <p className="text-gray-600">Fetching your content library...</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                📚 Content Library
              </h2>
              <p className="text-gray-600">
                Manage all your blog posts and articles
              </p>
            </div>

            <PostList
              posts={posts}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          </div>
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
              <strong>"{deleteDialog.post?.title}"</strong> will be permanently
              removed from your blog.
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
