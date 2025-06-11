import Link from "next/link";
import { NewsHeader } from "@/components/news/header";
import { BreakingNewsBanner } from "@/components/news/breaking-news-banner";
import { NewsCard } from "@/components/news/news-card";
import {
  TrendingWidget,
  QuickStatsWidget,
} from "@/components/news/trending-widget";
import { Button } from "@/components/ui/button";
import {
  mockPublishedPosts,
  mockBreakingNews,
  mockFeaturedPosts,
} from "@/lib/mock-data";

export default function Home() {
  const breakingNews = mockBreakingNews.filter((news) => news.isActive);
  const featuredStory = mockFeaturedPosts[0];
  const secondaryStories = mockFeaturedPosts.slice(1, 4);
  const latestNews = mockPublishedPosts.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && <BreakingNewsBanner stories={breakingNews} />}

      <NewsHeader hasBreakingNews={breakingNews.length > 0} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Stories Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured Story */}
            <div className="lg:col-span-2">
              {featuredStory && (
                <NewsCard
                  post={featuredStory}
                  variant="featured"
                  showAuthor={true}
                  showStats={true}
                />
              )}
            </div>

            {/* Secondary Stories Sidebar */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b border-border pb-2">
                  Top Stories
                </h2>
                {secondaryStories.map((story) => (
                  <NewsCard
                    key={story.id}
                    post={story}
                    variant="headline"
                    showCategory={true}
                  />
                ))}
              </div>

              {/* Quick Stats */}
              <QuickStatsWidget />
            </div>
          </div>
        </section>

        {/* Latest News Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* News Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Latest News
                </h2>
                <Link href="/news">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestNews.map((post) => (
                  <NewsCard
                    key={post.id}
                    post={post}
                    variant="default"
                    showCategory={true}
                  />
                ))}
              </div>
            </div>

            {/* Trending Sidebar */}
            <div className="lg:col-span-1">
              <TrendingWidget />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
