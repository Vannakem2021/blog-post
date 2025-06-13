"use client";

import { useState, KeyboardEvent } from "react";
import {
  StarIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { FocusKeyword } from "@/lib/types";

interface FocusKeywordManagerProps {
  keywords: string[];
  primaryKeyword?: string;
  onKeywordsChange: (keywords: string[]) => void;
  onPrimaryKeywordChange: (keyword: string) => void;
  isPillarContent?: boolean;
  onPillarContentChange?: (isPillar: boolean) => void;
  className?: string;
}

export function FocusKeywordManager({
  keywords = [],
  primaryKeyword,
  onKeywordsChange,
  onPrimaryKeywordChange,
  isPillarContent = false,
  onPillarContentChange,
  className,
}: FocusKeywordManagerProps) {
  const [inputValue, setInputValue] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAddKeyword = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !keywords.includes(trimmedValue)) {
      const newKeywords = [...keywords, trimmedValue];
      onKeywordsChange(newKeywords);

      // Set as primary if it's the first keyword
      if (!primaryKeyword && newKeywords.length === 1) {
        onPrimaryKeywordChange(trimmedValue);
      }
    }
    setInputValue("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (
    keywordToRemove: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const newKeywords = keywords.filter((k) => k !== keywordToRemove);
    onKeywordsChange(newKeywords);

    // If removing primary keyword, set new primary
    if (primaryKeyword === keywordToRemove && newKeywords.length > 0) {
      onPrimaryKeywordChange(newKeywords[0]);
    } else if (newKeywords.length === 0) {
      onPrimaryKeywordChange("");
    }
  };

  const handleSetPrimary = (keyword: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrimaryKeywordChange(keyword);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Focus Keywords
          </h3>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <InformationCircleIcon className="h-5 w-5" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                <p>
                  Focus keywords help optimize your content for search engines.
                  Choose 1-3 relevant keywords that your target audience might
                  search for.
                </p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ChartBarIcon className="h-4 w-4" />
          <span>SERP Preview</span>
        </button>
      </div>

      {/* Keyword Input */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Example: Rank Math SEO"
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Keywords Display */}
        {keywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => {
                const isPrimary = keyword === primaryKeyword;
                return (
                  <div
                    key={keyword}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isPrimary
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleSetPrimary(keyword, e)}
                      className={cn(
                        "transition-colors",
                        isPrimary
                          ? "text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      )}
                      title={isPrimary ? "Primary keyword" : "Set as primary"}
                    >
                      {isPrimary ? (
                        <StarIconSolid className="h-4 w-4" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveKeyword(keyword, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove keyword"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {primaryKeyword && (
              <p className="text-xs text-gray-600 flex items-center space-x-1">
                <StarIconSolid className="h-3 w-3 text-yellow-500" />
                <span>
                  <strong>{primaryKeyword}</strong> is your primary focus
                  keyword
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Guidance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-blue-800 font-medium">SEO Guidance</p>
            <p className="text-xs text-blue-700">
              <a href="#" className="underline hover:no-underline">
                Read here to Score 100/100
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Pillar Content */}
      {onPillarContentChange && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="pillar-content"
              checked={isPillarContent}
              onChange={(e) => onPillarContentChange(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded mt-0.5"
            />
            <div>
              <label
                htmlFor="pillar-content"
                className="block text-sm font-medium text-purple-900"
              >
                This post is Pillar Content
              </label>
              <p className="text-xs text-purple-700 mt-1">
                Pillar content is comprehensive, authoritative content that
                covers a topic in-depth and serves as the foundation for related
                content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keywords Summary */}
      {keywords.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}{" "}
                added
              </p>
              <p className="text-xs text-gray-600">
                Primary: {primaryKeyword || "None selected"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Recommended: 1-3 keywords</p>
              <p
                className={cn(
                  "text-xs font-medium",
                  keywords.length <= 3 ? "text-green-600" : "text-yellow-600"
                )}
              >
                {keywords.length <= 3 ? "Good" : "Consider reducing"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
