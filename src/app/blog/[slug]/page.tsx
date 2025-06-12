import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { PostContent } from "@/components/blog/post-content";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";

import { mockBreakingNews } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

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
async function getRelatedPosts(currentPostId: string, limit = 4) {
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
  const post = await getPostBySlug(params.slug);

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
  const post = await getPostBySlug(params.slug);
  const breakingNews = mockBreakingNews.filter((news) => news.is_active);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(post.id);

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center space-x-2 text-sm">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Home
            </a>
            <span className="text-gray-400">/</span>
            <a
              href="/blog"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Blog
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 capitalize">{post.category}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">
              {post.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Enhanced Article Content */}
            <article className="lg:col-span-3">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <PostContent post={post} />
              </div>

              {/* Social Share Section */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="text-center">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                    📢 Share This Article
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Help others discover this story
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                      <span>Twitter</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Facebook</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
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
                      <span>LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Author Bio Section */}
              {post.profiles && (
                <div className="mt-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex items-start space-x-6">
                    <img
                      src={post.profiles.avatar_url || "/default-avatar.png"}
                      alt={post.profiles.full_name || "Author"}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        About {post.profiles.full_name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {post.profiles.bio ||
                          "Experienced journalist and writer covering the latest news and developments."}
                      </p>
                      <div className="flex space-x-4">
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">
                          <span className="sr-only">Follow on Twitter</span>
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">
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
                  <TrendingWidget />
                </div>
              </div>
            </aside>
          </div>

          {/* Enhanced Related Articles */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                    📚 Related Articles
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Discover more stories and insights that complement this
                    article
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <NewsCard
                      key={relatedPost.id}
                      post={relatedPost}
                      variant="enhanced"
                      showCategory={true}
                    />
                  ))}
                </div>

                {/* View More Articles */}
                <div className="text-center mt-12 pt-8 border-t border-gray-200">
                  <a
                    href="/blog"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>Explore All Articles</span>
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
                </div>
              </div>
            </section>
          )}
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
