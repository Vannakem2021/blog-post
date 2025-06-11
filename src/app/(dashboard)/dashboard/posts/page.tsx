'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { PostList } from '@/components/dashboard/post-list'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { mockPosts } from '@/lib/mock-data'
import { BlogPost } from '@/lib/types'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState(mockPosts)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; post: BlogPost | null }>({
    open: false,
    post: null
  })

  const handleEdit = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}/edit`)
  }

  const handleView = (post: BlogPost) => {
    router.push(`/dashboard/posts/${post.id}`)
  }

  const handleDelete = (post: BlogPost) => {
    setDeleteDialog({ open: true, post })
  }

  const confirmDelete = () => {
    if (deleteDialog.post) {
      setPosts(posts.filter(p => p.id !== deleteDialog.post!.id))
      setDeleteDialog({ open: false, post: null })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({ open: false, post: null })
  }

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
        <PostList
          posts={posts}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogHeader onClose={cancelDelete}>
          Delete Post
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteDialog.post?.title}"? This action cannot be undone.
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
  )
}
