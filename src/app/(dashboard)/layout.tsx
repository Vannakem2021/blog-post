"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Enhanced Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm" />
          </div>
        )}

        {/* Enhanced Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Enhanced Main content */}
        <div className="flex-1 overflow-auto focus:outline-none bg-gradient-to-b from-gray-50/50 to-white">
          {children}
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </ProtectedRoute>
  );
}
