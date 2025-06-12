"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/app/actions/posts";
import { BlogPost } from "@/lib/types";
import { toast } from "sonner";

import {
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });

  // Fetch posts and calculate statistics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await getPosts(1, 100); // Get more posts for accurate stats

      if (result.success && result.data) {
        const allPosts = result.data.posts;
        setPosts(allPosts);

        // Calculate statistics
        const publishedPosts = allPosts.filter(
          (post) => post.status === "published"
        );
        const draftPosts = allPosts.filter((post) => post.status === "draft");

        setStats({
          total: allPosts.length,
          published: publishedPosts.length,
          drafts: draftPosts.length,
        });
      } else {
        toast.error(result.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      name: "Total Posts",
      value: stats.total,
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Published",
      value: stats.published,
      icon: EyeIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Drafts",
      value: stats.drafts,
      icon: PencilSquareIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const recentPosts = posts.slice(0, 5);

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsConfig.map((stat) => (
                <Card key={stat.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.name}
                        </p>
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
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {post.status === "published" ? "Published" : "Draft"}{" "}
                          •{new Date(post.updated_at).toLocaleDateString()}
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
          </>
        )}
      </main>
    </div>
  );
}
