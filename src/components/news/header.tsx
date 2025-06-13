"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Types for category data
interface CategoryData {
  name: string;
  slug: string;
  count: number;
  recentPosts: {
    id: string;
    title: string;
    slug: string;
    published_at: string;
    featured_image_url?: string;
  }[];
}

interface NewsHeaderProps {
  hasBreakingNews?: boolean;
}

export function NewsHeader({ hasBreakingNews = false }: NewsHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category");

  // Fetch categories with post counts and recent posts
  const fetchCategories = async () => {
    try {
      const supabase = createClient();

      // Get all unique categories with post counts
      const { data: categoryData, error: categoryError } = await supabase
        .from("posts")
        .select("category")
        .eq("status", "published");

      if (categoryError) throw categoryError;

      // Count posts per category and get unique categories
      const categoryCounts = categoryData.reduce(
        (acc: Record<string, number>, post) => {
          acc[post.category] = (acc[post.category] || 0) + 1;
          return acc;
        },
        {}
      );

      // Fetch recent posts for each category
      const categoryPromises = Object.entries(categoryCounts).map(
        async ([categorySlug, count]) => {
          const { data: recentPosts, error: postsError } = await supabase
            .from("posts")
            .select("id, title, slug, published_at, featured_image_url")
            .eq("category", categorySlug)
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(3);

          if (postsError) throw postsError;

          // Convert category slug to display name
          const categoryName =
            categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

          return {
            name: categoryName,
            slug: categorySlug,
            count,
            recentPosts: recentPosts || [],
          };
        }
      );

      const categoriesWithPosts = await Promise.all(categoryPromises);

      // Sort by post count (descending) and take top 6
      const sortedCategories = categoriesWithPosts
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-white/95 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
      {/* Simplified Top Bar */}
      {hasBreakingNews && (
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-8 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-semibold">Breaking News</span>
                <BellIcon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                NewsHub
              </h1>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {loading ? (
              // Loading skeleton
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog?category=${category.slug}`}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    activeCategory === category.slug
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 !text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
                  )}
                >
                  {category.name}
                </Link>
              ))
            )}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Removed admin authentication elements for cleaner public navigation */}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden transition-all duration-200 ease-in-out overflow-hidden",
            mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-gray-200 pt-4">
            {/* Mobile Search */}
            <div className="mb-4 sm:hidden">
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </form>
            </div>

            {/* Enhanced Mobile Categories */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {loading ? (
                // Loading skeleton for mobile
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/blog?category=${category.slug}`}
                    className={cn(
                      "block p-4 rounded-xl text-sm font-medium transition-all duration-200",
                      activeCategory === category.slug
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 !text-white shadow-lg"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </div>

            {/* Removed mobile admin link for cleaner public navigation */}
          </div>
        </div>
      </nav>
    </header>
  );
}
