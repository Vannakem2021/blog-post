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

      if (result.success) {
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
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        }
      />

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : (
          <PostList
            posts={posts}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogHeader onClose={cancelDelete}>Delete Post</DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteDialog.post?.title}"? This
            action cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
