"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { newsCategories } from "@/lib/mock-data";

interface NewsHeaderProps {
  hasBreakingNews?: boolean;
}

export function NewsHeader({ hasBreakingNews = false }: NewsHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Top Bar with Time and Breaking News Indicator */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center space-x-4 text-gray-700">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span className="font-medium">{currentTime}</span>
              </div>
              <span>•</span>
              <span className="font-medium">Latest News</span>
            </div>

            {hasBreakingNews && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-red-700 font-bold">Breaking News</span>
                <BellIcon className="h-3 w-3 text-red-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NewsHub</h1>
              <Badge
                variant="outline"
                className="ml-2 text-xs border-gray-400 text-gray-700"
              >
                Live
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {newsCategories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {category.name}
              </Link>
            ))}

            {/* More dropdown for additional categories */}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                More
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {newsCategories.slice(6).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-10"
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
                  className="hidden sm:flex"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Admin Link */}
            <Link href="/dashboard" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
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

            {/* Mobile Categories */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {newsCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="block px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Mobile Admin Link */}
            <div className="pt-4 border-t border-gray-200">
              <Link href="/dashboard" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
