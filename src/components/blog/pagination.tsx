"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      {/* Pagination Info */}
      <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
        Page {currentPage} of {totalPages}
      </div>

      <nav className="flex items-center justify-center space-x-3">
        {/* Previous button */}
        <Link href={getPageUrl(Math.max(1, currentPage - 1))}>
          <Button
            variant="outline"
            size="lg"
            disabled={currentPage === 1}
            className="flex items-center px-6 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Previous
          </Button>
        </Link>

        {/* Enhanced Page numbers */}
        <div className="flex items-center space-x-2">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-4 py-3 text-gray-500 font-medium"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Link key={pageNumber} href={getPageUrl(pageNumber)}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "min-w-[48px] h-12 rounded-xl font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg pointer-events-none"
                      : "border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 shadow-sm hover:shadow-md"
                  )}
                >
                  {pageNumber}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Next button */}
        <Link href={getPageUrl(Math.min(totalPages, currentPage + 1))}>
          <Button
            variant="outline"
            size="lg"
            disabled={currentPage === totalPages}
            className="flex items-center px-6 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </nav>
    </div>
  );
}
