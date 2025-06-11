'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (data: { email: string; password: string }) => {
    // Simulate authentication
    console.log('Login attempt:', data)
    
    // Mock authentication - in real app, this would call Supabase
    if (data.email === 'admin@example.com' && data.password === 'password') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      throw new Error('Invalid email or password')
    }
  }

  return <LoginForm onSubmit={handleLogin} />
}
