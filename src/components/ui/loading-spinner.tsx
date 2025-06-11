import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        {
          "h-4 w-4": size === 'sm',
          "h-6 w-6": size === 'md',
          "h-8 w-8": size === 'lg',
        },
        className
      )}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-48 w-full rounded-lg mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
        <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
        <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
      </div>
    </div>
  )
}
