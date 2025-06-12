import Link from "next/link";
import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { QuickStatsWidget } from "@/components/news/trending-widget";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { mockBreakingNews } from "@/lib/mock-data";

// Get published posts from database
async function getPublishedPosts() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        full_name,
        email
      )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return posts || [];
}

// Get featured posts from database
async function getFeaturedPosts() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        full_name,
        email
      )
    `
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }

  return posts || [];
}

export default async function Home() {
  // Fetch real data from database
  const [publishedPosts, featuredPosts] = await Promise.all([
    getPublishedPosts(),
    getFeaturedPosts(),
  ]);

  // Use featured posts if available, otherwise use latest published posts
  const featuredStory = featuredPosts[0] || publishedPosts[0];
  const secondaryStories =
    featuredPosts.slice(1, 3).length > 0
      ? featuredPosts.slice(1, 3)
      : publishedPosts.slice(1, 3);
  const latestNews = publishedPosts.slice(0, 9);

  // Keep breaking news as mock data for now (you can implement this in database later)
  const breakingNews = mockBreakingNews.filter((news) => news.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && <BreakingNewsBanner stories={breakingNews} />}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      {/* Hero Section - Featured Story */}
      <section className="relative bg-gradient-to-r from-white via-gray-50 to-slate-100 border-b border-gray-200">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {featuredStory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Featured Image */}
              <div className="order-2 lg:order-1">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100">
                  {featuredStory.featured_image_url ? (
                    <img
                      src={featuredStory.featured_image_url}
                      alt={
                        featuredStory.featured_image_alt || featuredStory.title
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm">
                    ✨ Featured Story
                  </div>

                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight tracking-tight">
                    {featuredStory.title}
                  </h1>

                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                    {featuredStory.excerpt}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-medium">
                    {new Date(
                      featuredStory.published_at || featuredStory.created_at
                    ).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{featuredStory.reading_time || "5"} min read</span>
                </div>

                <Link href={`/blog/${featuredStory.slug}`}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-10 py-4 rounded-xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Read Full Story →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Latest Articles Grid */}
      <main className="relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    Latest Articles
                  </h2>
                  <p className="text-gray-600">
                    Stay updated with our most recent stories
                  </p>
                </div>
                <Link href="/blog">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    View All Articles →
                  </Button>
                </Link>
              </div>

              {/* Enhanced 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {latestNews.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      {/* Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.featured_image_alt || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Content */}
                      <div className="p-8 space-y-4">
                        {/* Category Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                          {post.category}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>

                        {/* Enhanced Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>
                              {new Date(
                                post.published_at || post.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{post.reading_time || "5"} min read</span>
                          </div>
                          <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                            <svg
                              className="w-4 h-4"
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
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Top Stories */}
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                    Top Stories
                  </h3>
                  <div className="space-y-6">
                    {secondaryStories.map((story) => (
                      <article key={story.id} className="group">
                        <Link
                          href={`/blog/${story.slug}`}
                          className="block p-3 -m-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-blue-100"
                        >
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                              {story.featured_image_url ? (
                                <img
                                  src={story.featured_image_url}
                                  alt={story.featured_image_alt || story.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                {story.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  story.published_at || story.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Enhanced Stats Widget */}
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                  <QuickStatsWidget />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
