"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";

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
                Loading Dashboard
              </h3>
              <p className="text-gray-600">
                Fetching your latest content and statistics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Stats */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  📊 Content Statistics
                </h2>
                <p className="text-gray-600">
                  Overview of your blog content and performance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {statsConfig.map((stat, index) => {
                  const gradients = [
                    "bg-gradient-to-r from-blue-50 to-blue-100",
                    "bg-gradient-to-r from-green-50 to-green-100",
                    "bg-gradient-to-r from-yellow-50 to-yellow-100",
                  ];
                  const icons = ["📄", "✅", "📝"];

                  return (
                    <div
                      key={stat.name}
                      className={`${gradients[index]} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{icons[index]}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              {stat.name}
                            </p>
                            <p className={`text-3xl font-bold ${stat.color}`}>
                              {stat.value}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <stat.icon className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Recent Posts */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    📝 Recent Posts
                  </h2>
                  <p className="text-gray-600">Your latest content updates</p>
                </div>
                <Link href="/dashboard/posts">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    View All Posts →
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full font-medium ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {post.status === "published"
                            ? "✅ Published"
                            : "📝 Draft"}
                        </span>
                        <span className="text-gray-500">
                          {new Date(post.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/posts/${post.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                        >
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/posts/${post.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Quick Actions & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    ⚡ Quick Actions
                  </h2>
                  <p className="text-gray-600">Common tasks and shortcuts</p>
                </div>

                <div className="space-y-4">
                  <Link href="/dashboard/posts/new" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start p-4 h-auto border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <PlusIcon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Create New Post</div>
                        <div className="text-xs text-gray-500">
                          Start writing a new article
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/dashboard/posts" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start p-4 h-auto border-green-200 text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Manage Posts</div>
                        <div className="text-xs text-gray-500">
                          Edit and organize content
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/blog" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start p-4 h-auto border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <EyeIcon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">View Public Blog</div>
                        <div className="text-xs text-gray-500">
                          See your published content
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    💡 Pro Tips
                  </h2>
                  <p className="text-gray-600">
                    Best practices for content creation
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-blue-600 text-lg">🎯</span>
                    <div>
                      <p className="font-medium text-blue-900">
                        SEO Optimization
                      </p>
                      <p className="text-sm text-blue-700">
                        Use descriptive titles and excerpts for better search
                        rankings
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-green-600 text-lg">🖼️</span>
                    <div>
                      <p className="font-medium text-green-900">
                        Visual Appeal
                      </p>
                      <p className="text-sm text-green-700">
                        Add featured images to make posts more engaging
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <span className="text-yellow-600 text-lg">💾</span>
                    <div>
                      <p className="font-medium text-yellow-900">Save Often</p>
                      <p className="text-sm text-yellow-700">
                        Save drafts frequently while writing to avoid losing
                        work
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-purple-600 text-lg">👀</span>
                    <div>
                      <p className="font-medium text-purple-900">
                        Preview First
                      </p>
                      <p className="text-sm text-purple-700">
                        Always preview posts before publishing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
