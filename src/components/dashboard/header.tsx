"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-slate-100 shadow-xl border-b border-gray-200 backdrop-blur-sm">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative flex items-center justify-between h-20 px-6 sm:px-8 lg:px-12">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your content with ease
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-4">{actions}</div>
        )}
      </div>
    </header>
  );
}
