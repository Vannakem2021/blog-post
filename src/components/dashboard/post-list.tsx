'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BlogPost } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface PostListProps {
  posts: BlogPost[]
  onEdit?: (post: BlogPost) => void
  onDelete?: (post: BlogPost) => void
  onView?: (post: BlogPost) => void
}

export function PostList({ posts, onEdit, onDelete, onView }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first blog post.</p>
            <Link href="/dashboard/posts/new">
              <Button>Create New Post</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {post.title}
                  </h3>
                  <Badge
                    variant={post.status === 'published' ? 'default' : 'secondary'}
                  >
                    {post.status}
                  </Badge>
                </div>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>Created: {formatDate(post.createdAt)}</span>
                  {post.publishedAt && (
                    <span>Published: {formatDate(post.publishedAt)}</span>
                  )}
                </div>
              </div>
              {post.featuredImageUrl && (
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Slug: <code className="bg-gray-100 px-1 rounded">{post.slug}</code>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(post)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(post)}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(post)}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
