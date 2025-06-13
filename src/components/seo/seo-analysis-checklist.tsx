"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { SEOCheck, SEOAnalysis } from "@/lib/types";
import { generateSEOChecks } from "@/lib/seo-utils";

interface SEOAnalysisChecklistProps {
  analysis: SEOAnalysis;
  primaryKeyword?: string;
  className?: string;
}

export function SEOAnalysisChecklist({
  analysis,
  primaryKeyword,
  className,
}: SEOAnalysisChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    basic: true,
    additional: false,
    readability: false,
  });

  const checks = generateSEOChecks(analysis, primaryKeyword);

  // Categorize checks
  const basicChecks = checks.filter((check) =>
    [
      "title-keyword",
      "meta-description-keyword",
      "slug-keyword",
      "content-keyword",
      "content-length",
    ].includes(check.id)
  );

  const additionalChecks = checks.filter((check) =>
    ["meta-title-length", "meta-description-length"].includes(check.id)
  );

  // Count errors and warnings
  const errorCount = checks.filter((check) => check.status === "error").length;
  const warningCount = checks.filter(
    (check) => check.status === "warning"
  ).length;

  const toggleSection = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusIcon = (status: "success" | "error" | "warning") => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: "success" | "error" | "warning") => {
    switch (status) {
      case "success":
        return "text-green-700 bg-green-50 border-green-200";
      case "error":
        return "text-red-700 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
  };

  const CheckItem = ({ check }: { check: SEOCheck }) => (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        getStatusColor(check.status)
      )}
    >
      <div className="flex items-start space-x-3">
        {getStatusIcon(check.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{check.label}</h4>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                check.status === "success" && "bg-green-100 text-green-800",
                check.status === "error" && "bg-red-100 text-red-800",
                check.status === "warning" && "bg-yellow-100 text-yellow-800"
              )}
            >
              {check.status === "success"
                ? "✓"
                : check.status === "error"
                ? "✗"
                : "⚠"}
            </span>
          </div>
          <p className="text-sm mt-1">{check.message}</p>
          {check.suggestion && (
            <div className="mt-2 flex items-start space-x-2">
              <LightBulbIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                {check.suggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center space-x-2 text-left"
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              SEO Analysis
            </h3>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-600">
                Score:{" "}
                <span className="font-semibold">{analysis.seo_score}/100</span>
              </span>
              {errorCount > 0 && (
                <span className="flex items-center space-x-1 text-red-600">
                  <XCircleIcon className="h-4 w-4" />
                  <span>
                    {errorCount} Error{errorCount !== 1 ? "s" : ""}
                  </span>
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center space-x-1 text-yellow-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>
                    {warningCount} Warning{warningCount !== 1 ? "s" : ""}
                  </span>
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Score Badge */}
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-semibold",
            analysis.seo_score >= 80
              ? "bg-green-100 text-green-800"
              : analysis.seo_score >= 60
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {analysis.seo_score}/100
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Basic SEO Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={(e) => toggleSection("basic", e)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {expandedSections.basic ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
                <h4 className="text-md font-semibold text-gray-900">
                  Basic SEO
                </h4>
                {basicChecks.filter((c) => c.status === "error").length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                    × {basicChecks.filter((c) => c.status === "error").length}{" "}
                    Errors
                  </span>
                )}
              </div>
            </button>

            {expandedSections.basic && (
              <div className="space-y-3 ml-6">
                {basicChecks.map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            )}
          </div>

          {/* Additional SEO Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={(e) => toggleSection("additional", e)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {expandedSections.additional ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
                <h4 className="text-md font-semibold text-gray-900">
                  Additional
                </h4>
                {additionalChecks.filter((c) => c.status === "warning").length >
                  0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    ⚠{" "}
                    {
                      additionalChecks.filter((c) => c.status === "warning")
                        .length
                    }{" "}
                    Warnings
                  </span>
                )}
              </div>
            </button>

            {expandedSections.additional && (
              <div className="space-y-3 ml-6">
                {additionalChecks.map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            )}
          </div>

          {/* Title Readability Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={(e) => toggleSection("readability", e)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                {expandedSections.readability ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
                <h4 className="text-md font-semibold text-gray-900">
                  Content Readability
                </h4>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  Coming Soon
                </span>
              </div>
            </button>

            {expandedSections.readability && (
              <div className="ml-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Content readability analysis will be available in a future
                  update. This will include metrics like reading level, sentence
                  length, and paragraph structure.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Overall SEO Health
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {analysis.seo_score >= 80
                    ? "Excellent! Your content is well-optimized."
                    : analysis.seo_score >= 60
                    ? "Good, but there's room for improvement."
                    : "Needs work. Focus on the errors above."}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-2xl font-bold",
                    analysis.seo_score >= 80
                      ? "text-green-600"
                      : analysis.seo_score >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {analysis.seo_score}%
                </div>
                <p className="text-xs text-gray-500">SEO Score</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
