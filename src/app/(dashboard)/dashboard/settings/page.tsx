"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormLabel,
  FormError,
  FormHelpText,
  EnhancedInput,
} from "@/components/ui/form-field";
import { toast } from "sonner";
import {
  profileSettingsSchema,
  blogConfigSchema,
  contentSettingsSchema,
  securitySettingsSchema,
  notificationSettingsSchema,
  ProfileSettingsData,
  BlogConfigData,
  ContentSettingsData,
  SecuritySettingsData,
  NotificationSettingsData,
} from "@/lib/validations";
import {
  ProfileForm,
  BlogConfigForm,
  ContentSettingsForm,
  SecuritySettingsForm,
  NotificationSettingsForm,
} from "@/components/dashboard/settings-forms";
import {
  UserIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface SettingsData {
  // Profile Settings
  profile: ProfileSettingsData;

  // Blog Configuration
  blog: BlogConfigData;

  // Content Settings
  content: ContentSettingsData;

  // Security Settings
  security: SecuritySettingsData;

  // Notification Settings
  notifications: NotificationSettingsData;

  // Appearance Settings (not validated yet)
  appearance: {
    theme: "light" | "dark" | "auto";
    accentColor: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      displayName: "Admin User",
      email: "admin@example.com",
      bio: "",
    },
    blog: {
      siteTitle: "My Blog",
      siteDescription: "A blog about web development and technology",
      defaultCategory: "technology",
    },
    content: {
      postsPerPage: 10,
      enableComments: true,
      moderateComments: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
    },
    appearance: {
      theme: "light",
      accentColor: "#3B82F6",
    },
  });

  const tabs = [
    {
      id: "profile",
      name: "Profile",
      icon: UserIcon,
      description: "Manage your personal information",
    },
    {
      id: "blog",
      name: "Blog Config",
      icon: GlobeAltIcon,
      description: "Site settings and configuration",
    },
    {
      id: "content",
      name: "Content",
      icon: Cog6ToothIcon,
      description: "Content management settings",
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: PaintBrushIcon,
      description: "Customize the look and feel",
    },
    {
      id: "security",
      name: "Security",
      icon: ShieldCheckIcon,
      description: "Security and privacy settings",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: BellIcon,
      description: "Notification preferences",
    },
  ];

  // Form submission handlers
  const handleProfileSubmit = async (data: ProfileSettingsData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings((prev) => ({ ...prev, profile: data }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogConfigSubmit = async (data: BlogConfigData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings((prev) => ({ ...prev, blog: data }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSettingsSubmit = async (data: ContentSettingsData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings((prev) => ({ ...prev, content: data }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySettingsSubmit = async (data: SecuritySettingsData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings((prev) => ({ ...prev, security: data }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSettingsSubmit = async (
    data: NotificationSettingsData
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings((prev) => ({ ...prev, notifications: data }));
    } finally {
      setIsLoading(false);
    }
  };

  // Appearance settings handler (not validated)
  const updateAppearanceSetting = (
    key: keyof SettingsData["appearance"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Settings" />

      <main className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                ⚙️ Dashboard Settings
              </h2>
              <p className="text-gray-600">
                Customize your dashboard and blog configuration
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
                      }`}
                    >
                      <tab.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{tab.name}</p>
                        <p
                          className={`text-xs ${
                            activeTab === tab.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  {activeTab === "profile" && (
                    <ProfileForm
                      defaultValues={settings.profile}
                      onSubmit={handleProfileSubmit}
                    />
                  )}

                  {activeTab === "blog" && (
                    <BlogConfigForm
                      defaultValues={settings.blog}
                      onSubmit={handleBlogConfigSubmit}
                    />
                  )}

                  {activeTab === "content" && (
                    <ContentSettingsForm
                      defaultValues={settings.content}
                      onSubmit={handleContentSettingsSubmit}
                    />
                  )}

                  {activeTab === "appearance" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          🎨 Appearance Settings
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Theme
                            </label>
                            <select
                              value={settings.appearance.theme}
                              onChange={(e) =>
                                updateAppearanceSetting(
                                  "theme",
                                  e.target.value as "light" | "dark" | "auto"
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="light">☀️ Light</option>
                              <option value="dark">🌙 Dark</option>
                              <option value="auto">🔄 Auto</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Accent Color
                            </label>
                            <div className="flex items-center space-x-4">
                              <Input
                                type="color"
                                value={settings.appearance.accentColor}
                                onChange={(e) =>
                                  updateAppearanceSetting(
                                    "accentColor",
                                    e.target.value
                                  )
                                }
                                className="w-16 h-12 border-gray-300 rounded-xl cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={settings.appearance.accentColor}
                                onChange={(e) =>
                                  updateAppearanceSetting(
                                    "accentColor",
                                    e.target.value
                                  )
                                }
                                placeholder="#3B82F6"
                                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <SecuritySettingsForm
                      defaultValues={settings.security}
                      onSubmit={handleSecuritySettingsSubmit}
                    />
                  )}

                  {activeTab === "notifications" && (
                    <NotificationSettingsForm
                      defaultValues={settings.notifications}
                      onSubmit={handleNotificationSettingsSubmit}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
