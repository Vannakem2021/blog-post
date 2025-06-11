'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockPosts } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function PostViewPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const post = mockPosts.find(p => p.id === postId)

  if (!post) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Post Not Found" />
        <main className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
              <p className="text-gray-500 mb-4">The post you're looking for doesn't exist.</p>
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
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Created: {formatDate(post.createdAt)}</p>
                    <p>Updated: {formatDate(post.updatedAt)}</p>
                    {post.publishedAt && (
                      <p>Published: {formatDate(post.publishedAt)}</p>
                    )}
                    <p>Slug: <code className="bg-gray-100 px-1 rounded">{post.slug}</code></p>
                  </div>
                </div>
                {post.featuredImageUrl && (
                  <div className="ml-6 flex-shrink-0">
                    <img
                      src={post.featuredImageUrl}
                      alt={post.featuredImageAlt || post.title}
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
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{post.excerpt}</p>
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
            {post.status === 'published' && (
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Button variant="outline">View Public Post →</Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
