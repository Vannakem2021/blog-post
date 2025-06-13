"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/common/image-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EnhancedDateTimePicker } from "@/components/ui/enhanced-datetime-picker";
import { SEOSection } from "@/components/seo/seo-section";
import { generateSlug } from "@/lib/utils";
import { BlogPost, NewsCategory } from "@/lib/types";
import { newsCategories } from "@/lib/mock-data";

interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  category: NewsCategory;
  status: "draft" | "published" | "scheduled"; // Updated to include 'scheduled'
  scheduled_at?: Date | string; // New: When to publish the post
  timezone?: string; // New: Timezone for scheduling
  auto_publish?: boolean; // New: Auto-publish when scheduled time arrives
  urgency_level?: "breaking" | "urgent" | "normal";
  is_breaking?: boolean;
  is_featured?: boolean;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string[];
  primary_keyword?: string;
  is_pillar_content?: boolean;
}

interface PostFormProps {
  post?: BlogPost;
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel?: () => void;
}

export function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(post?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    post?.featured_image_url || ""
  );

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(post?.status === "scheduled");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    post?.scheduled_at
      ? new Date(post.scheduled_at).toISOString().slice(0, 16)
      : ""
  );
  const [timezone, setTimezone] = useState(post?.timezone || "Asia/Phnom_Penh");
  const [autoPublish, setAutoPublish] = useState(post?.auto_publish ?? true);

  // SEO state
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description || ""
  );
  const [focusKeywords, setFocusKeywords] = useState<string[]>(
    post?.focus_keywords || []
  );
  const [primaryKeyword, setPrimaryKeyword] = useState(
    post?.primary_keyword || ""
  );
  const [isPillarContent, setIsPillarContent] = useState(
    post?.is_pillar_content || false
  );
  const [slug, setSlug] = useState(post?.slug || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostData>({
    defaultValues: {
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      featured_image_alt: post?.featured_image_alt || "",
      category: post?.category || "technology",
      status: post?.status || "draft",
      scheduled_at: post?.scheduled_at || "",
      timezone: post?.timezone || "Asia/Phnom_Penh",
      auto_publish: post?.auto_publish ?? true,
      urgency_level: post?.urgency_level || "normal",
      is_breaking: post?.is_breaking || false,
      is_featured: post?.is_featured || false,
    },
  });

  // Watch status changes to show/hide scheduling UI
  const watchedStatus = watch("status");

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    // Auto-generate slug for new posts (future enhancement)
    if (!post) {
      generateSlug(newTitle);
    }
  };

  // Handle status changes to show/hide scheduling UI
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "draft" | "published" | "scheduled";
    setValue("status", newStatus);
    setIsScheduled(newStatus === "scheduled");

    // Clear scheduling data when not scheduling
    if (newStatus !== "scheduled") {
      setScheduledDateTime("");
      setAutoPublish(true);
      setValue("scheduled_at", "");
      setValue("auto_publish", false);
    }
  };

  const handleFormSubmit = async (data: CreatePostData) => {
    try {
      setIsLoading(true);

      // Validate scheduled post data
      if (data.status === "scheduled") {
        if (!scheduledDateTime) {
          throw new Error("Please select a date and time for scheduling");
        }

        const scheduledDate = new Date(scheduledDateTime);
        const now = new Date();

        if (scheduledDate <= now) {
          throw new Error("Scheduled date must be in the future");
        }
      }

      const submitData = {
        ...data,
        content,
        featured_image_url: featuredImage,
        // Include scheduling data
        scheduled_at:
          data.status === "scheduled" ? scheduledDateTime : undefined,
        timezone: timezone,
        auto_publish: data.status === "scheduled" ? autoPublish : false,
        // Include SEO data
        meta_title: metaTitle,
        meta_description: metaDescription,
        focus_keywords: focusKeywords,
        primary_keyword: primaryKeyword,
        is_pillar_content: isPillarContent,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      // You might want to show a toast error here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                📝 Post Content
              </h3>
              <p className="text-gray-600">
                Create engaging content for your readers
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Title *
                </label>
                <Input
                  id="title"
                  placeholder="Enter an engaging post title"
                  {...register("title", { required: "Title is required" })}
                  onChange={handleTitleChange}
                  className="rounded-xl h-12 text-lg transition-all duration-200"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description that will appear in previews and search results"
                  rows={3}
                  {...register("excerpt")}
                  className="rounded-xl transition-all duration-200 resize-none"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <span className="mr-1">💡</span>
                  Optional. Used for post previews and SEO optimization.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Content *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog post content here..."
                />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <SEOSection
            title={watch("title") || ""}
            content={content}
            slug={slug}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            focusKeywords={focusKeywords}
            primaryKeyword={primaryKeyword}
            isPillarContent={isPillarContent}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onSlugChange={setSlug}
            onFocusKeywordsChange={setFocusKeywords}
            onPrimaryKeywordChange={setPrimaryKeyword}
            onPillarContentChange={setIsPillarContent}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Publish Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                ⚙️ Publish Settings
              </h3>
              <p className="text-gray-600">
                Configure how your post will be published
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full p-3 rounded-xl bg-white transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {newsCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status
                </label>
                <select
                  {...register("status")}
                  onChange={handleStatusChange}
                  className="w-full p-3 rounded-xl bg-white transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">🚀 Publish Now</option>
                  <option value="scheduled">⏰ Schedule for Later</option>
                </select>
              </div>

              {/* Modern Scheduling UI */}
              {(watchedStatus === "scheduled" || isScheduled) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                    <span className="text-blue-600 text-lg">⏰</span>
                    <h4 className="font-semibold text-gray-900">
                      Schedule Settings
                    </h4>
                  </div>

                  <div>
                    <EnhancedDateTimePicker
                      value={scheduledDateTime}
                      onChange={(value) => {
                        setScheduledDateTime(value);
                        setValue("scheduled_at", value);
                      }}
                      minDate={new Date()}
                      timezone={timezone}
                      required={watchedStatus === "scheduled"}
                      placeholder="Select when to publish this post"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => {
                        setTimezone(e.target.value);
                        setValue("timezone", e.target.value);
                      }}
                      className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="Asia/Phnom_Penh">
                        🇰🇭 Cambodia Time (ICT) - Default
                      </option>
                      <option value="UTC">
                        UTC (Coordinated Universal Time)
                      </option>
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">
                        Pacific Time (PT)
                      </option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Asia/Bangkok">Bangkok (ICT)</option>
                      <option value="Asia/Ho_Chi_Minh">
                        Ho Chi Minh (ICT)
                      </option>
                      <option value="Australia/Sydney">
                        Sydney (AEST/AEDT)
                      </option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="auto_publish"
                        checked={autoPublish}
                        onChange={(e) => {
                          setAutoPublish(e.target.checked);
                          setValue("auto_publish", e.target.checked);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded mt-0.5"
                      />
                      <div>
                        <label
                          htmlFor="auto_publish"
                          className="block text-sm font-medium text-blue-900"
                        >
                          🤖 Auto-publish at scheduled time
                        </label>
                        <p className="text-xs text-blue-700 mt-1">
                          When enabled, the post will be automatically published
                          at the scheduled time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Urgency Level
                </label>
                <select
                  {...register("urgency_level")}
                  className="w-full p-3 rounded-xl bg-white transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">📰 Normal</option>
                  <option value="urgent">⚡ Urgent</option>
                  <option value="breaking">🚨 Breaking News</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_breaking"
                      {...register("is_breaking")}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label
                      htmlFor="is_breaking"
                      className="ml-3 block text-sm font-medium text-blue-900"
                    >
                      🚨 Mark as Breaking News
                    </label>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 ml-8">
                    This will highlight the post as urgent news
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      {...register("is_featured")}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label
                      htmlFor="is_featured"
                      className="ml-3 block text-sm font-medium text-purple-900"
                    >
                      ⭐ Feature this post
                    </label>
                  </div>
                  <p className="text-xs text-purple-700 mt-2 ml-8">
                    Featured posts appear prominently on the homepage
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 h-12"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : post ? (
                    "✅ Update Post"
                  ) : (
                    "🚀 Create Post"
                  )}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 h-12"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                🖼️ Featured Image
              </h3>
              <p className="text-gray-600">
                Add a compelling visual to your post
              </p>
            </div>

            <div className="space-y-6">
              <ImageUpload
                value={featuredImage}
                onChange={setFeaturedImage}
                placeholder="Upload featured image"
                className="w-full"
              />

              {featuredImage && (
                <div>
                  <label
                    htmlFor="featured_image_alt"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Alt Text
                  </label>
                  <Input
                    id="featured_image_alt"
                    placeholder="Describe the image for accessibility"
                    {...register("featured_image_alt")}
                    className="rounded-xl transition-all duration-200"
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">♿</span>
                    Important for accessibility and SEO optimization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
