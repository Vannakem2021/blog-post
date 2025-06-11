'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  actions?: React.ReactNode
}

export function Header({ title, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 lg:hidden"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
