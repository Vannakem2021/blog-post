"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "All Posts", href: "/dashboard/posts", icon: DocumentTextIcon },
  { name: "New Post", href: "/dashboard/posts/new", icon: PlusIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
      {/* Enhanced Logo */}
      <div className="flex items-center h-20 px-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">📰</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              NewsHub
            </h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white hover:shadow-md"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Enhanced User section */}
      <div className="flex-shrink-0 p-6 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500/30">
              <span className="text-lg font-bold text-white">
                {user?.email ? getUserInitials(user.email) : "A"}
              </span>
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.role === "admin" ? "Admin User" : "User"}
            </p>
            <p className="text-xs text-blue-300 font-medium truncate">
              {user?.email || "admin@example.com"}
            </p>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
