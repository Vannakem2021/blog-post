"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormLabel,
  FormError,
  FormHelpText,
  FormSection,
  FormActions,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
} from "@/components/ui/form-field";

import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/common/image-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EnhancedDateTimePicker } from "@/components/ui/enhanced-datetime-picker";
import { SEOSection } from "@/components/seo/seo-section";
import { generateSlug } from "@/lib/utils";
import { BlogPost, NewsCategory } from "@/lib/types";
import { newsCategories } from "@/lib/mock-data";
import { postSchema, PostFormData } from "@/lib/validations";
import { toast } from "sonner";

interface PostFormProps {
  post?: BlogPost;
  onSubmit: (data: PostFormData) => Promise<void>;
  onCancel?: () => void;
}

// Form Progress Component
function FormProgress({
  title,
  content,
  featuredImage,
  featuredImageAlt,
}: {
  title: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
}) {
  const requirements = [
    { label: "Title (10+ chars)", completed: title.length >= 10 },
    { label: "Content (100+ chars)", completed: content.trim().length >= 100 },
    { label: "Category selected", completed: true }, // Always true as it has default
    {
      label: "Alt text (if image uploaded)",
      completed:
        !featuredImage || (featuredImage && featuredImageAlt.trim().length > 0),
    },
  ];

  const completedCount = requirements.filter((req) => req.completed).length;
  const progressPercentage = (completedCount / requirements.length) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-blue-800">
          Form Completion Progress
        </h4>
        <span className="text-sm text-blue-600 font-medium">
          {completedCount}/{requirements.length} completed
        </span>
      </div>

      <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span
              className={`text-sm ${
                req.completed ? "text-green-600" : "text-gray-500"
              }`}
            >
              {req.completed ? "✅" : "⏳"}
            </span>
            <span
              className={`text-xs ${
                req.completed ? "text-green-700" : "text-gray-600"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validation Summary Component
function ValidationSummary({
  errors,
  content,
  featuredImage,
  title,
  featuredImageAlt,
}: {
  errors: any;
  content: string;
  featuredImage: string;
  title: string;
  featuredImageAlt: string;
}) {
  const validationIssues = [];

  // Check required fields
  if (!title || title.length < 10) {
    validationIssues.push("Title must be at least 10 characters");
  }
  if (!content || content.trim().length < 100) {
    validationIssues.push("Content must be at least 100 characters");
  }
  if (featuredImage && (!featuredImageAlt || !featuredImageAlt.trim())) {
    validationIssues.push("Alt text is required for featured image");
  }
  if (errors.category) {
    validationIssues.push("Category selection is required");
  }
  if (errors.scheduled_at) {
    validationIssues.push("Valid scheduled date is required");
  }

  // Add critical form errors (exclude optional SEO fields that don't block submission)
  const criticalFields = [
    "title",
    "content",
    "category",
    "scheduled_at",
    "featured_image_alt",
  ];
  Object.keys(errors).forEach((field) => {
    // Only show errors for critical fields or if the field has been explicitly filled
    if (
      criticalFields.includes(field) ||
      (field === "meta_title" &&
        errors[field]?.message &&
        !errors[field]?.message.includes("Meta title"))
    ) {
      if (!validationIssues.some((issue) => issue.includes(field))) {
        const error = errors[field];
        if (error?.message) {
          validationIssues.push(error.message);
        }
      }
    }
  });

  if (validationIssues.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-red-500 text-lg">⚠️</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            Please complete the following to enable submission:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationIssues.map((issue, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
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
    trigger,
    clearErrors,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      featured_image_url: post?.featured_image_url || "",
      featured_image_alt: post?.featured_image_alt || "",
      category: post?.category || "technology",
      status: post?.status || "draft",
      scheduled_at: post?.scheduled_at || "",
      timezone: post?.timezone || "Asia/Phnom_Penh",
      auto_publish: post?.auto_publish ?? true,
      urgency_level: post?.urgency_level || "normal",
      is_breaking: post?.is_breaking || false,
      is_featured: post?.is_featured || false,
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
      focus_keywords: post?.focus_keywords || [],
      primary_keyword: post?.primary_keyword || "",
      is_pillar_content: post?.is_pillar_content || false,
    },
  });

  // Watch form values for validation summary
  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const watchedCategory = watch("category");
  const watchedStatus = watch("status");
  const watchedFeaturedImageAlt = watch("featured_image_alt");
  const watchedFeaturedImageUrl = watch("featured_image_url");

  // Calculate if form is ready for submission
  const isFormValid = React.useMemo(() => {
    // Basic required fields
    const hasValidTitle = watchedTitle && watchedTitle.length >= 10;
    const hasValidContent = content && (content || "").trim().length >= 100;
    const hasValidCategory = watchedCategory;

    // Featured image alt text validation
    const featuredImageValid =
      !featuredImage || (featuredImage && watchedFeaturedImageAlt?.trim());

    // Check if there are any critical form errors (exclude optional SEO fields)
    const criticalErrorFields = [
      "title",
      "content",
      "category",
      "scheduled_at",
      "featured_image_alt",
    ];
    const criticalErrors = Object.keys(errors).filter(
      (field) =>
        criticalErrorFields.includes(field) ||
        (field === "featured_image_url" &&
          featuredImage &&
          !watchedFeaturedImageAlt?.trim())
    );
    const hasNoCriticalErrors = criticalErrors.length === 0;

    const result =
      hasValidTitle &&
      hasValidContent &&
      hasValidCategory &&
      featuredImageValid &&
      hasNoCriticalErrors;

    if (process.env.NODE_ENV === "development") {
      console.log("📋 Form validation check:", {
        hasValidTitle,
        hasValidContent,
        hasValidCategory,
        featuredImageValid,
        hasNoCriticalErrors,
        result,
        titleLength: watchedTitle?.length,
        contentLength: (content || "").trim().length,
        category: watchedCategory,
        featuredImage: !!featuredImage,
        featuredImageAlt: watchedFeaturedImageAlt,
        criticalErrors,
      });
    }

    return result;
  }, [
    watchedTitle,
    content,
    watchedCategory,
    featuredImage,
    watchedFeaturedImageAlt,
    errors,
  ]);

  // Update content in form when it changes
  useEffect(() => {
    setValue("content", content);
    // Trigger validation for content field
    trigger("content");
  }, [content, setValue, trigger]);

  // Update SEO fields in form when they change
  useEffect(() => {
    // Ensure meta title is within 60 character limit
    const truncatedMetaTitle =
      metaTitle && metaTitle.length > 60
        ? metaTitle.substring(0, 57) + "..."
        : metaTitle || "";

    setValue("meta_title", truncatedMetaTitle);
    setValue("meta_description", metaDescription || "");
    setValue("primary_keyword", primaryKeyword || "");

    // Update the state if meta title was truncated
    if (
      metaTitle &&
      metaTitle.length > 60 &&
      truncatedMetaTitle !== metaTitle
    ) {
      setMetaTitle(truncatedMetaTitle);
    }

    // Only trigger validation if fields are not empty
    if (truncatedMetaTitle) {
      trigger("meta_title");
    }
    if (metaDescription) {
      trigger("meta_description");
    }
    if (primaryKeyword) {
      trigger("primary_keyword");
    }
  }, [metaTitle, metaDescription, primaryKeyword, setValue, trigger]);

  // Also update featured image URL in form
  useEffect(() => {
    setValue("featured_image_url", featuredImage);
    trigger("featured_image_url");
    // Also trigger alt text validation when image changes
    if (featuredImage) {
      trigger("featured_image_alt");
    }
  }, [featuredImage, setValue, trigger]);

  // Force re-validation when key fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      trigger(); // Trigger validation for all fields
    }, 100);
    return () => clearTimeout(timer);
  }, [watchedTitle, content, watchedCategory, featuredImage, trigger]);

  // Removed debug logging for production

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

  const handleFormSubmit = async (data: PostFormData) => {
    // Removed debug logging for production

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
      // Success feedback
      toast.success(
        post ? "Post updated successfully!" : "Post created successfully!"
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Hidden fields for SEO data */}
      <input type="hidden" {...register("meta_title")} />
      <input type="hidden" {...register("meta_description")} />
      <input type="hidden" {...register("primary_keyword")} />

      {/* Form Validation Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isFormValid ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="font-semibold text-gray-800">
              Form Status:{" "}
              {isFormValid
                ? "✅ Ready to Submit"
                : "⏳ Completing Required Fields"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Errors: {Object.keys(errors).length}
          </div>
        </div>
      </div>

      {/* Form Progress */}
      <FormProgress
        title={watchedTitle || ""}
        content={content}
        featuredImage={featuredImage}
        featuredImageAlt={watchedFeaturedImageAlt || ""}
      />

      {/* Validation Summary */}
      <ValidationSummary
        errors={errors}
        content={content}
        featuredImage={featuredImage}
        title={watchedTitle || ""}
        featuredImageAlt={watchedFeaturedImageAlt || ""}
      />

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
              <FormField>
                <FormLabel htmlFor="title" required>
                  Title
                  <span className="ml-2 text-sm text-gray-500">
                    ({(watchedTitle || "").length}/200 characters, min 10)
                  </span>
                </FormLabel>
                <EnhancedInput
                  id="title"
                  placeholder="Enter an engaging post title (10-200 characters)"
                  error={errors.title?.message}
                  isLoading={isLoading}
                  className={`h-12 text-lg ${
                    (watchedTitle || "").length < 10
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("title")}
                  onChange={(e) => {
                    handleTitleChange(e);
                    trigger("title");
                  }}
                  onBlur={() => trigger("title")}
                />
                <FormError message={errors.title?.message} />
                <FormHelpText>
                  Create a compelling title that captures your readers'
                  attention (minimum 10 characters required)
                </FormHelpText>
              </FormField>

              <FormField>
                <FormLabel htmlFor="excerpt">Excerpt</FormLabel>
                <EnhancedTextarea
                  id="excerpt"
                  placeholder="Brief description that will appear in previews and search results (max 300 characters)"
                  rows={3}
                  error={errors.excerpt?.message}
                  isLoading={isLoading}
                  {...register("excerpt")}
                  onBlur={() => trigger("excerpt")}
                />
                <FormError message={errors.excerpt?.message} />
                <FormHelpText>
                  Optional. Used for post previews and SEO optimization.
                </FormHelpText>
              </FormField>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Content *
                  <span className="ml-2 text-sm text-gray-500">
                    ({(content || "").trim().length} characters, min 100
                    required)
                  </span>
                </label>
                <div
                  className={`rounded-xl border-2 transition-colors ${
                    (content || "").trim().length < 100
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your blog post content here... (minimum 100 characters required)"
                  />
                </div>
                {(content || "").trim().length < 100 && (
                  <p className="text-sm text-red-600 mt-2">
                    Content must be at least 100 characters. Current:{" "}
                    {(content || "").trim().length}
                  </p>
                )}
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
              <FormField>
                <FormLabel htmlFor="category" required>
                  Category
                </FormLabel>
                <EnhancedSelect
                  id="category"
                  error={errors.category?.message}
                  isLoading={isLoading}
                  {...register("category")}
                  onChange={(e) => {
                    setValue("category", e.target.value as NewsCategory);
                    trigger("category");
                  }}
                >
                  {newsCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </EnhancedSelect>
                <FormError message={errors.category?.message} />
                <FormHelpText>
                  Choose the most appropriate category for your article
                </FormHelpText>
              </FormField>

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
                <div className="flex-1 relative group">
                  <Button
                    type="submit"
                    disabled={isLoading || isSubmitting || !isValid}
                    onClick={() => {
                      // Removed debug logging for production
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 h-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading || isSubmitting ? (
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

                  {/* Tooltip for disabled state */}
                  {(isLoading || isSubmitting || !isValid) && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {isLoading || isSubmitting
                        ? "Saving in progress..."
                        : "Complete all required fields to enable submission"}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
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
                <FormField>
                  <FormLabel htmlFor="featured_image_alt" required>
                    Alt Text
                    <span className="ml-2 text-sm text-red-600">
                      (Required for featured image)
                    </span>
                  </FormLabel>
                  <EnhancedInput
                    id="featured_image_alt"
                    placeholder="Describe the image for accessibility (required)"
                    error={errors.featured_image_alt?.message}
                    isLoading={isLoading}
                    className={`${
                      featuredImage && errors.featured_image_alt
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    {...register("featured_image_alt")}
                    onBlur={() => trigger("featured_image_alt")}
                  />
                  <FormError message={errors.featured_image_alt?.message} />
                  <FormHelpText>
                    <span className="text-red-600 font-medium">Required:</span>{" "}
                    Alt text is mandatory when a featured image is uploaded for
                    accessibility and SEO optimization.
                  </FormHelpText>
                </FormField>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
