import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { NewsCard } from "@/components/news/news-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { Pagination } from "@/components/blog/pagination";
import { mockPublishedPosts, mockBreakingNews } from "@/lib/mock-data";

export default function NewsPage() {
  // In a real app, this would come from search params and API
  const currentPage = 1;
  const postsPerPage = 9;
  const totalPosts = mockPublishedPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const posts = mockPublishedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const breakingNews = mockBreakingNews.filter((news) => news.isActive);

  return (
    <div className="min-h-screen bg-white">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <BreakingNewsBanner stories={breakingNews} />
      )}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All News</h1>
          <p className="text-gray-600">
            Stay informed with the latest breaking news and updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* News Grid */}
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {posts.map((post) => (
                    <NewsCard
                      key={post.id}
                      post={post}
                      variant="default"
                      showCategory={true}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/blog"
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles yet</h3>
                <p className="text-gray-500">Check back soon for breaking news and updates!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingWidget />
          </div>
        </div>
      </main>

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
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
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
