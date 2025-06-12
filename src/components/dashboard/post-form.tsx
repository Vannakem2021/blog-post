"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/common/image-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
  status: "draft" | "published";
  urgency_level?: "breaking" | "urgent" | "normal";
  is_breaking?: boolean;
  is_featured?: boolean;
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreatePostData>({
    defaultValues: {
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      featured_image_alt: post?.featured_image_alt || "",
      category: post?.category || "technology",
      status: post?.status || "draft",
      urgency_level: post?.urgency_level || "normal",
      is_breaking: post?.is_breaking || false,
      is_featured: post?.is_featured || false,
    },
  });

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    // Auto-generate slug for new posts (future enhancement)
    if (!post) {
      generateSlug(newTitle);
    }
  };

  const handleFormSubmit = async (data: CreatePostData) => {
    try {
      setIsLoading(true);

      const submitData = {
        ...data,
        content,
        featured_image_url: featuredImage,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
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
                  className="w-full p-3 rounded-xl bg-white transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">🚀 Published</option>
                </select>
              </div>

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
