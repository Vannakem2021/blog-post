"use client";

import { useState } from "react";
import {
  PencilIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { generateSearchPreview } from "@/lib/seo-utils";

interface SEOSnippetPreviewProps {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  baseUrl?: string;
  onMetaTitleChange?: (value: string) => void;
  onMetaDescriptionChange?: (value: string) => void;
  onSlugChange?: (value: string) => void;
  className?: string;
}

export function SEOSnippetPreview({
  title,
  metaTitle,
  metaDescription,
  slug,
  baseUrl = "https://yourblog.com",
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
  className,
}: SEOSnippetPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || "",
    slug: slug || "",
  });

  const preview = generateSearchPreview(
    title,
    metaTitle,
    metaDescription,
    slug,
    baseUrl
  );

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMetaTitleChange?.(editValues.metaTitle);
    onMetaDescriptionChange?.(editValues.metaDescription);
    onSlugChange?.(editValues.slug);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditValues({
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || "",
      slug: slug || "",
    });
    setIsEditing(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SEO Preview</h3>
          <p className="text-sm text-gray-600">
            See how your post will appear in Google search results
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(!isEditing);
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          <span>{isEditing ? "Cancel" : "Edit Snippet"}</span>
        </button>
      </div>

      {/* Preview or Edit Mode */}
      {isEditing ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={editValues.metaTitle}
              onChange={(e) =>
                setEditValues({ ...editValues, metaTitle: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter SEO title"
              maxLength={60}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Recommended: 30-60 characters
              </span>
              <span
                className={cn(
                  "text-xs",
                  editValues.metaTitle.length > 60
                    ? "text-red-500"
                    : editValues.metaTitle.length < 30
                    ? "text-yellow-500"
                    : "text-green-500"
                )}
              >
                {editValues.metaTitle.length}/60
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{baseUrl}/</span>
              <input
                type="text"
                value={editValues.slug}
                onChange={(e) =>
                  setEditValues({ ...editValues, slug: e.target.value })
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="url-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={editValues.metaDescription}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  metaDescription: e.target.value,
                })
              }
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter meta description"
              maxLength={160}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Recommended: 120-160 characters
              </span>
              <span
                className={cn(
                  "text-xs",
                  editValues.metaDescription.length > 160
                    ? "text-red-500"
                    : editValues.metaDescription.length < 120
                    ? "text-yellow-500"
                    : "text-green-500"
                )}
              >
                {editValues.metaDescription.length}/160
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* Google-style preview */}
          <div className="space-y-2">
            {/* URL */}
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-green-700 font-medium">
                {preview.displayUrl}
              </span>
              <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
            </div>

            {/* Title */}
            <h4 className="text-xl text-blue-600 hover:underline cursor-pointer font-medium leading-tight">
              {preview.displayTitle}
            </h4>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {preview.displayDescription}
            </p>
          </div>

          {/* Additional info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Preview may vary in actual search results</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
