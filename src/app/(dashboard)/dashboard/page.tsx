'use client'

import Link from 'next/link'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockPosts, mockPublishedPosts, mockDraftPosts } from '@/lib/mock-data'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilSquareIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const stats = [
    {
      name: 'Total Posts',
      value: mockPosts.length,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Published',
      value: mockPublishedPosts.length,
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Drafts',
      value: mockDraftPosts.length,
      icon: PencilSquareIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  const recentPosts = mockPosts.slice(0, 5)

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Dashboard" 
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Posts</CardTitle>
              <Link href="/dashboard/posts">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground">
                  <div className="flex-1">
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {post.status === 'published' ? 'Published' : 'Draft'} • 
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/posts/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link href="/dashboard/posts" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Manage Posts
                </Button>
              </Link>
              <Link href="/blog" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Public Blog
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Use descriptive titles and excerpts for better SEO</p>
                <p>• Add featured images to make posts more engaging</p>
                <p>• Save drafts frequently while writing</p>
                <p>• Preview posts before publishing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
