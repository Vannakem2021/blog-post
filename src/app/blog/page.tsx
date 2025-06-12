import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { Pagination } from "@/components/blog/pagination";
import { mockBreakingNews } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

// Get published posts from database
async function getPublishedPosts(page = 1, limit = 9) {
  const supabase = await createClient();

  const {
    data: posts,
    error,
    count,
  } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        full_name,
        email
      )
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], total: 0 };
  }

  return { posts: posts || [], total: count || 0 };
}

export default async function NewsPage() {
  // In a real app, this would come from search params
  const currentPage = 1;
  const postsPerPage = 9;

  const { posts, total: totalPosts } = await getPublishedPosts(
    currentPage,
    postsPerPage
  );
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const breakingNews = mockBreakingNews.filter((news) => news.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && <BreakingNewsBanner stories={breakingNews} />}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      {/* Enhanced Page Header Section */}
      <section className="relative bg-gradient-to-r from-white via-gray-50 to-slate-100 border-b border-gray-200">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
              All News & Articles
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay informed with the latest breaking news, in-depth analysis,
              and comprehensive coverage from around the world
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Enhanced News Grid */}
            <div className="lg:col-span-3">
              {posts.length > 0 ? (
                <>
                  {/* Grid Header */}
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        Latest Articles
                      </h2>
                      <p className="text-gray-600">
                        Discover our most recent stories and breaking news
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                      {totalPosts} articles found
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                    {posts.map((post) => (
                      <NewsCard
                        key={post.id}
                        post={post}
                        variant="enhanced"
                        showCategory={true}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-16">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/blog"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No articles found
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      We're working hard to bring you the latest news and
                      updates. Check back soon for breaking stories and in-depth
                      coverage!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                  <TrendingWidget />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 mt-20">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              NewsHub
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your trusted source for breaking news, in-depth reporting, and
              comprehensive coverage from around the world.
            </p>
            <div className="flex justify-center space-x-8 mb-8">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Facebook
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                RSS
              </a>
            </div>
            <div className="pt-8 border-t border-gray-700 text-gray-400">
              <p className="text-sm">
                © 2024 NewsHub. All rights reserved. Built with ❤️ for
                journalism.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
