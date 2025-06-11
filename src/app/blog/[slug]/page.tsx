import { notFound } from "next/navigation";
import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { PostContent } from "@/components/blog/post-content";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { mockPublishedPosts, mockBreakingNews } from "@/lib/mock-data";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const post = mockPublishedPosts.find((p) => p.slug === params.slug);
  const breakingNews = mockBreakingNews.filter((news) => news.isActive);

  if (!post) {
    notFound();
  }

  // Get related posts (excluding current post, same category preferred)
  const relatedPosts = mockPublishedPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === post.category && b.category !== post.category)
        return -1;
      if (b.category === post.category && a.category !== post.category)
        return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && <BreakingNewsBanner stories={breakingNews} />}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <article className="lg:col-span-3 bg-white rounded-lg shadow-sm p-8">
            <PostContent post={post} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <TrendingWidget />
          </aside>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Related Articles
                </h2>
                <p className="mt-2 text-gray-600">
                  More stories you might find interesting
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <NewsCard
                    key={relatedPost.id}
                    post={relatedPost}
                    variant="compact"
                    showCategory={true}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* News Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">NewsHub</h3>
            <p className="text-gray-400 mb-4">
              Your trusted source for breaking news and in-depth reporting.
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                RSS
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400">
              © 2024 NewsHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
