import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { Pagination } from "@/components/blog/pagination";
import { mockBreakingNews } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { getTrendingPosts } from "@/app/actions/trending";

// Get published posts from database with optional category filter
async function getPublishedPosts(page = 1, limit = 9, category?: string) {
  const supabase = await createClient();

  let query = supabase
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
    .eq("status", "published");

  // Add category filter if provided
  if (category) {
    query = query.eq("category", category);
  }

  const {
    data: posts,
    error,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], total: 0 };
  }

  return { posts: posts || [], total: count || 0 };
}

interface NewsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  // Get search parameters
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const category =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : undefined;
  const postsPerPage = 9;

  // Fetch posts and trending data in parallel with error handling
  const [postsResult, trendingResult] = await Promise.allSettled([
    getPublishedPosts(currentPage, postsPerPage, category),
    getTrendingPosts({ limit: 5 }),
  ]);

  const { posts, total: totalPosts } =
    postsResult.status === "fulfilled"
      ? postsResult.value
      : { posts: [], total: 0 };
  const trendingPosts =
    trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const trendingError =
    trendingResult.status === "rejected"
      ? "Failed to load trending articles"
      : null;
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
            {category ? (
              <>
                <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm mb-6">
                  📂 {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                  Category
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
                  {category.charAt(0).toUpperCase() + category.slice(1)} News
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover the latest {category} stories, breaking news, and
                  in-depth analysis from our expert journalists
                </p>
              </>
            ) : (
              <>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
                  All News & Articles
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Stay informed with the latest breaking news, in-depth
                  analysis, and comprehensive coverage from around the world
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Enhanced News Grid */}
            <div className="lg:col-span-3">
              {posts.length > 0 ? (
                <>
                  {/* Enhanced Grid Header */}
                  <div className="flex flex-col space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
                        {category
                          ? `${
                              category.charAt(0).toUpperCase() +
                              category.slice(1)
                            } Articles`
                          : "Latest Articles"}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        {category
                          ? `Browse all ${category} stories and updates`
                          : "Discover our most recent stories and breaking news"}
                      </p>
                    </div>

                    {/* Responsive controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                      {category && (
                        <a
                          href="/blog"
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors text-center sm:text-left"
                        >
                          ← All Categories
                        </a>
                      )}
                      <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-2 rounded-full border border-gray-200 shadow-sm text-center whitespace-nowrap">
                        {totalPosts} {category ? category : "total"} articles
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
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
                    <div className="mt-12 sm:mt-16">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={
                          category ? `/blog?category=${category}` : "/blog"
                        }
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
                      {category
                        ? `No ${category} articles found`
                        : "No articles found"}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {category
                        ? `We don't have any ${category} articles at the moment. Check back soon for new stories in this category!`
                        : "We're working hard to bring you the latest news and updates. Check back soon for breaking stories and in-depth coverage!"}
                    </p>
                    {category && (
                      <a
                        href="/blog"
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>Browse All Categories</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-24 space-y-6 sm:space-y-8">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                  <TrendingWidget
                    trendingPosts={trendingPosts}
                    isLoading={false}
                    error={trendingError}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 mt-16 sm:mt-20">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 sm:mb-6">
              NewsHub
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Your trusted source for breaking news, in-depth reporting, and
              comprehensive coverage from around the world.
            </p>

            {/* Responsive Social Links */}
            <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3 sm:gap-4 lg:gap-8 mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base text-center"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base text-center"
              >
                Facebook
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base text-center"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 text-sm sm:text-base text-center"
              >
                RSS
              </a>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-gray-700 text-gray-400">
              <p className="text-xs sm:text-sm">
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
