'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { PostForm } from '@/components/dashboard/post-form'
import { CreatePostData } from '@/lib/types'

export default function NewPostPage() {
  const router = useRouter()

  const handleSubmit = async (data: CreatePostData) => {
    // Simulate API call
    console.log('Creating post:', data)
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to posts list
    router.push('/dashboard/posts')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Create New Post" />
      
      <main className="p-6">
        <PostForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
