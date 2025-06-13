"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface StatusPaginationProps {
  currentPage: number;
  totalPages: number;
  statusType: "published" | "draft" | "scheduled";
  className?: string;
}

export function StatusPagination({
  currentPage,
  totalPages,
  statusType,
  className,
}: StatusPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const pageParam = `${statusType}_page`;
    
    if (page === 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, page.toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/posts${newUrl}`, { scroll: false });
  };

  // Generate page numbers to show
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

  const visiblePages = totalPages > 1 ? getVisiblePages() : [];

  return (
    <div className={cn("flex items-center justify-center mt-8", className)}>
      <div className="flex items-center space-x-1 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => updatePage(Math.max(1, currentPage - 1))}
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-gray-400 text-sm"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => updatePage(pageNumber)}
                className={cn(
                  "min-w-[36px] h-9 rounded-lg font-semibold transition-all duration-200 text-sm",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
                )}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
          className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
