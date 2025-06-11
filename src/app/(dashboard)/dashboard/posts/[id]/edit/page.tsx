'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { PostForm } from '@/components/dashboard/post-form'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockPosts } from '@/lib/mock-data'
import { CreatePostData } from '@/lib/types'
import Link from 'next/link'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const post = mockPosts.find(p => p.id === postId)

  const handleSubmit = async (data: CreatePostData) => {
    // Simulate API call
    console.log('Updating post:', { id: postId, ...data })
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to post view
    router.push(`/dashboard/posts/${postId}`)
  }

  const handleCancel = () => {
    router.push(`/dashboard/posts/${postId}`)
  }

  if (!post) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Post Not Found" />
        <main className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
              <p className="text-gray-500 mb-4">The post you're trying to edit doesn't exist.</p>
              <Link href="/dashboard/posts">
                <Button>Back to Posts</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title={`Edit: ${post.title}`} />
      
      <main className="p-6">
        <PostForm 
          post={post}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
