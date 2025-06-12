"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    watch,
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

  const title = watch("title");

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    // Auto-generate slug for new posts
    if (!post) {
      const slug = generateSlug(newTitle);
      // You would set the slug here if you had a slug field
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

      console.log("Form submission data:", submitData);
      console.log("Featured image URL:", featuredImage);
      console.log("Featured image state type:", typeof featuredImage);
      console.log("Featured image state length:", featuredImage?.length);

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                >
                  Title *
                </label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  {...register("title", { required: "Title is required" })}
                  onChange={handleTitleChange}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-medium mb-2"
                >
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the post"
                  rows={3}
                  {...register("excerpt")}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional. Used for post previews and SEO.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog post content here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {newsCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  {...register("status")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Urgency Level
                </label>
                <select
                  {...register("urgency_level")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="breaking">Breaking News</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_breaking"
                    {...register("is_breaking")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_breaking"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Mark as Breaking News
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    {...register("is_featured")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_featured"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Feature this post
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : post ? (
                    "Update Post"
                  ) : (
                    "Create Post"
                  )}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={featuredImage}
                onChange={(url) => {
                  console.log(
                    "🔄 PostForm: ImageUpload onChange called with:",
                    url
                  );
                  console.log("🔄 PostForm: URL type:", typeof url);
                  console.log("🔄 PostForm: URL length:", url?.length);
                  console.log("🔄 PostForm: Previous state:", featuredImage);
                  setFeaturedImage(url);
                  console.log("🔄 PostForm: State setter called with:", url);

                  // Verify state update
                  setTimeout(() => {
                    console.log(
                      "🔄 PostForm: State after update:",
                      featuredImage
                    );
                  }, 50);
                }}
                placeholder="Upload featured image"
              />

              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>
                  Current featured image state:{" "}
                  <span className="font-mono">{featuredImage || "empty"}</span>
                </p>
                <p>
                  State length:{" "}
                  <span className="font-mono">
                    {featuredImage?.length || 0}
                  </span>
                </p>
                <p>
                  State type:{" "}
                  <span className="font-mono">{typeof featuredImage}</span>
                </p>
              </div>

              {featuredImage && (
                <div>
                  <label
                    htmlFor="featured_image_alt"
                    className="block text-sm font-medium mb-2"
                  >
                    Alt Text
                  </label>
                  <Input
                    id="featured_image_alt"
                    placeholder="Describe the image"
                    {...register("featured_image_alt")}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Important for accessibility and SEO.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
