import Link from 'next/link'
import { formatDate, truncateText } from '@/lib/utils'
import { BlogPost } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PostCardProps {
  post: BlogPost
  showStatus?: boolean
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <Link href={`/blog/${post.slug}`}>
        {post.featuredImageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            {showStatus && (
              <Badge
                variant={post.status === 'published' ? 'default' : 'secondary'}
                className="ml-2 flex-shrink-0"
              >
                {post.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {truncateText(post.excerpt, 150)}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()}>
              {formatDate(post.publishedAt || post.createdAt)}
            </time>
            <span className="text-blue-600 hover:text-blue-800 font-medium">
              Read more →
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
