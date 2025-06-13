import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { PostContent } from "@/components/blog/post-content";
import { ShareButtons } from "@/components/blog/share-buttons";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { UserCircleIcon } from "@heroicons/react/24/outline";

import { mockBreakingNews } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { getTrendingPosts } from "@/app/actions/trending";

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Get post by slug from database
async function getPostBySlug(slug: string) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        full_name,
        email,
        bio,
        avatar_url
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return post;
}

// Get related posts
async function getRelatedPosts(
  currentPostId: string,
  category: string,
  limit = 4
) {
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
    .eq("category", category)
    .neq("id", currentPostId)
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }

  return posts || [];
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || "Read this article on NewsHub",
    openGraph: {
      title: post.title,
      description: post.excerpt || "Read this article on NewsHub",
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: "article",
      publishedTime: post.published_at || post.created_at,
      authors: [post.profiles?.full_name || "NewsHub"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "Read this article on NewsHub",
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  const breakingNews = mockBreakingNews.filter((news) => news.is_active);

  if (!post) {
    notFound();
  }

  // Get related posts and trending posts with error handling
  const [relatedPosts, trendingPostsResult] = await Promise.allSettled([
    getRelatedPosts(post.id, post.category),
    getTrendingPosts({ excludePostId: post.id, limit: 5 }),
  ]);

  const relatedPostsData =
    relatedPosts.status === "fulfilled" ? relatedPosts.value : [];
  const trendingPosts =
    trendingPostsResult.status === "fulfilled" ? trendingPostsResult.value : [];
  const trendingError =
    trendingPostsResult.status === "rejected"
      ? "Failed to load trending articles"
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && <BreakingNewsBanner stories={breakingNews} />}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      {/* Breadcrumb Navigation */}
      <section className="relative bg-gradient-to-r from-white via-gray-50 to-slate-100 border-b border-gray-200">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              Home
            </a>
            <span className="text-gray-400 flex-shrink-0">/</span>
            <a
              href="/blog"
              className="text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              Blog
            </a>
            <span className="text-gray-400 flex-shrink-0">/</span>
            <span className="text-gray-600 capitalize whitespace-nowrap">
              {post.category}
            </span>
            <span className="text-gray-400 flex-shrink-0">/</span>
            <span className="text-gray-900 font-medium truncate min-w-0">
              {post.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Enhanced Article Content */}
            <article className="lg:col-span-3">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <PostContent post={post} />
              </div>

              {/* Enhanced Social Share Section */}
              <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
                    📢 Share This Article
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Help others discover this story
                  </p>
                  <ShareButtons post={post} />
                </div>
              </div>

              {/* Author Bio Section */}
              {post.profiles && (
                <div className="mt-6 sm:mt-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 flex-shrink-0 mx-auto sm:mx-0" />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        About {post.profiles.full_name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                        {post.profiles.bio ||
                          "Experienced journalist and writer covering the latest news and developments."}
                      </p>
                      <div className="flex justify-center sm:justify-start space-x-4">
                        <button className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg">
                          <span className="sr-only">Follow on Twitter</span>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg">
                          <span className="sr-only">Connect on LinkedIn</span>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Enhanced Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                  <TrendingWidget
                    trendingPosts={trendingPosts}
                    isLoading={false}
                    error={trendingError}
                  />
                </div>
              </div>
            </aside>
          </div>

          {/* Enhanced Related Articles */}
          {relatedPostsData.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
                    📚 Related Articles
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Discover more stories and insights that complement this
                    article
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {relatedPostsData.map((relatedPost) => (
                    <NewsCard
                      key={relatedPost.id}
                      post={relatedPost}
                      variant="enhanced"
                      showCategory={true}
                    />
                  ))}
                </div>

                {/* View More Articles */}
                <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                  <a
                    href="/blog"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>Explore All Articles</span>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                </div>
              </div>
            </section>
          )}
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
