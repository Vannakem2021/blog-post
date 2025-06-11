'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from './rich-text-editor'
import { ImageUpload } from '@/components/common/image-upload'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { generateSlug } from '@/lib/utils'
import { CreatePostData, BlogPost } from '@/lib/types'

interface PostFormProps {
  post?: BlogPost
  onSubmit: (data: CreatePostData) => Promise<void>
  onCancel?: () => void
}

export function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState(post?.content || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImageUrl || '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreatePostData>({
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      featuredImageAlt: post?.featuredImageAlt || '',
      status: post?.status || 'draft'
    }
  })

  const title = watch('title')

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue('title', newTitle)
    // Auto-generate slug for new posts
    if (!post) {
      const slug = generateSlug(newTitle)
      // You would set the slug here if you had a slug field
    }
  }

  const handleFormSubmit = async (data: CreatePostData) => {
    try {
      setIsLoading(true)
      await onSubmit({
        ...data,
        content,
        featuredImageUrl: featuredImage
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  {...register('title', { required: 'Title is required' })}
                  onChange={handleTitleChange}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the post"
                  rows={3}
                  {...register('excerpt')}
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
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    post ? 'Update Post' : 'Create Post'
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
                onChange={setFeaturedImage}
                placeholder="Upload featured image"
              />
              
              {featuredImage && (
                <div>
                  <label htmlFor="featuredImageAlt" className="block text-sm font-medium mb-2">
                    Alt Text
                  </label>
                  <Input
                    id="featuredImageAlt"
                    placeholder="Describe the image"
                    {...register('featuredImageAlt')}
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
  )
}
