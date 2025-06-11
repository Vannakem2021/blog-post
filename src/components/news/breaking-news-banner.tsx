"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { BreakingNews } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BreakingNewsBannerProps {
  stories: BreakingNews[];
  autoRotate?: boolean;
  rotationInterval?: number;
  className?: string;
}

export function BreakingNewsBanner({
  stories,
  autoRotate = true,
  rotationInterval = 5000,
  className,
}: BreakingNewsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const activeStories = stories.filter((story) => story.isActive);

  useEffect(() => {
    if (!autoRotate || isPaused || activeStories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeStories.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isPaused, activeStories.length, rotationInterval]);

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % activeStories.length);
  };

  const prevStory = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeStories.length) % activeStories.length
    );
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isVisible || activeStories.length === 0) return null;

  const currentStory = activeStories[currentIndex];

  return (
    <div
      className={cn(
        "bg-red-700 text-white relative overflow-hidden border-b-2 border-red-800",
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
      </div>

      <div className="relative px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breaking News Label */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="bg-white text-red-800 px-3 py-1 rounded-md font-bold text-sm uppercase tracking-wide shadow-sm">
              Breaking
            </div>
            <div className="hidden sm:block w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>

          {/* Story Content */}
          <div
            className="flex-1 mx-4 min-w-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <Link
              href={currentStory.url}
              className="block hover:text-red-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm sm:text-base truncate text-white">
                  {currentStory.title}
                </h3>
                <span className="text-red-100 text-xs flex-shrink-0 hidden sm:inline">
                  {formatTimeAgo(currentStory.timestamp)}
                </span>
              </div>
              <p className="text-red-50 text-xs sm:text-sm truncate mt-1">
                {currentStory.summary}
              </p>
            </Link>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {activeStories.length > 1 && (
              <>
                <button
                  onClick={prevStory}
                  className="p-1 hover:bg-red-600 rounded transition-colors text-white"
                  aria-label="Previous story"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                <div className="flex space-x-1">
                  {activeStories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentIndex ? "bg-white" : "bg-red-200"
                      )}
                      aria-label={`Go to story ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStory}
                  className="p-1 hover:bg-red-600 rounded transition-colors text-white"
                  aria-label="Next story"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dismiss Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-red-600 rounded transition-colors ml-2 text-white"
              aria-label="Dismiss breaking news"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar for Auto-rotation */}
      {autoRotate && !isPaused && activeStories.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-700">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${
                ((Date.now() % rotationInterval) / rotationInterval) * 100
              }%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
