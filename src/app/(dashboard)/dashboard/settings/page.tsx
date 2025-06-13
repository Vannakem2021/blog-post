"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  displayName: string;
  email: string;
  bio: string;

  // Blog Configuration
  siteTitle: string;
  siteDescription: string;
  defaultCategory: string;

  // Content Settings
  postsPerPage: number;
  enableComments: boolean;
  moderateComments: boolean;

  // Appearance Settings
  theme: "light" | "dark" | "auto";
  accentColor: string;

  // Security Settings
  twoFactorEnabled: boolean;
  sessionTimeout: number;

  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    // Default values
    displayName: "Admin User",
    email: "admin@example.com",
    bio: "",
    siteTitle: "My Blog",
    siteDescription: "A blog about web development and technology",
    defaultCategory: "technology",
    postsPerPage: 10,
    enableComments: true,
    moderateComments: true,
    theme: "light",
    accentColor: "#3B82F6",
    twoFactorEnabled: false,
    sessionTimeout: 30,
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (
    key: keyof SettingsData,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          👤 Profile Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Display Name
                            </label>
                            <Input
                              value={settings.displayName}
                              onChange={(e) =>
                                updateSetting("displayName", e.target.value)
                              }
                              placeholder="Your display name"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Email Address
                            </label>
                            <Input
                              type="email"
                              value={settings.email}
                              onChange={(e) =>
                                updateSetting("email", e.target.value)
                              }
                              placeholder="your@email.com"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Bio
                          </label>
                          <Textarea
                            value={settings.bio}
                            onChange={(e) =>
                              updateSetting("bio", e.target.value)
                            }
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "blog" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          🌐 Blog Configuration
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Site Title
                            </label>
                            <Input
                              value={settings.siteTitle}
                              onChange={(e) =>
                                updateSetting("siteTitle", e.target.value)
                              }
                              placeholder="Your blog title"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Site Description
                            </label>
                            <Textarea
                              value={settings.siteDescription}
                              onChange={(e) =>
                                updateSetting("siteDescription", e.target.value)
                              }
                              placeholder="Describe your blog..."
                              rows={3}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Default Category
                            </label>
                            <select
                              value={settings.defaultCategory}
                              onChange={(e) =>
                                updateSetting("defaultCategory", e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="technology">Technology</option>
                              <option value="business">Business</option>
                              <option value="lifestyle">Lifestyle</option>
                              <option value="travel">Travel</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          📝 Content Settings
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Posts Per Page
                            </label>
                            <Input
                              type="number"
                              value={settings.postsPerPage}
                              onChange={(e) =>
                                updateSetting(
                                  "postsPerPage",
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                              max="50"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="enableComments"
                                  checked={settings.enableComments}
                                  onChange={(e) =>
                                    updateSetting(
                                      "enableComments",
                                      e.target.checked
                                    )
                                  }
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor="enableComments"
                                  className="ml-3 block text-sm font-medium text-blue-900"
                                >
                                  💬 Enable Comments
                                </label>
                              </div>
                              <p className="text-xs text-blue-700 mt-2 ml-8">
                                Allow readers to comment on your posts
                              </p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="moderateComments"
                                  checked={settings.moderateComments}
                                  onChange={(e) =>
                                    updateSetting(
                                      "moderateComments",
                                      e.target.checked
                                    )
                                  }
                                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor="moderateComments"
                                  className="ml-3 block text-sm font-medium text-yellow-900"
                                >
                                  🛡️ Moderate Comments
                                </label>
                              </div>
                              <p className="text-xs text-yellow-700 mt-2 ml-8">
                                Require approval before comments are published
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                              value={settings.theme}
                              onChange={(e) =>
                                updateSetting("theme", e.target.value)
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
                                value={settings.accentColor}
                                onChange={(e) =>
                                  updateSetting("accentColor", e.target.value)
                                }
                                className="w-16 h-12 border-gray-300 rounded-xl cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={settings.accentColor}
                                onChange={(e) =>
                                  updateSetting("accentColor", e.target.value)
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
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          🔒 Security Settings
                        </h3>
                        <div className="space-y-6">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="twoFactorEnabled"
                                checked={settings.twoFactorEnabled}
                                onChange={(e) =>
                                  updateSetting(
                                    "twoFactorEnabled",
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="twoFactorEnabled"
                                className="ml-3 block text-sm font-medium text-green-900"
                              >
                                🔐 Two-Factor Authentication
                              </label>
                            </div>
                            <p className="text-xs text-green-700 mt-2 ml-8">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Session Timeout (minutes)
                            </label>
                            <Input
                              type="number"
                              value={settings.sessionTimeout}
                              onChange={(e) =>
                                updateSetting(
                                  "sessionTimeout",
                                  parseInt(e.target.value)
                                )
                              }
                              min="5"
                              max="480"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Automatically log out after this period of
                              inactivity
                            </p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h4 className="font-medium text-red-900 mb-2">
                              🔑 Change Password
                            </h4>
                            <p className="text-sm text-red-700 mb-4">
                              Update your password to keep your account secure
                            </p>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          🔔 Notification Settings
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={settings.emailNotifications}
                                onChange={(e) =>
                                  updateSetting(
                                    "emailNotifications",
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="emailNotifications"
                                className="ml-3 block text-sm font-medium text-blue-900"
                              >
                                📧 Email Notifications
                              </label>
                            </div>
                            <p className="text-xs text-blue-700 mt-2 ml-8">
                              Receive email notifications for important events
                            </p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="pushNotifications"
                                checked={settings.pushNotifications}
                                onChange={(e) =>
                                  updateSetting(
                                    "pushNotifications",
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="pushNotifications"
                                className="ml-3 block text-sm font-medium text-purple-900"
                              >
                                🔔 Push Notifications
                              </label>
                            </div>
                            <p className="text-xs text-purple-700 mt-2 ml-8">
                              Get instant notifications in your browser
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="weeklyDigest"
                                checked={settings.weeklyDigest}
                                onChange={(e) =>
                                  updateSetting(
                                    "weeklyDigest",
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="weeklyDigest"
                                className="ml-3 block text-sm font-medium text-green-900"
                              >
                                📊 Weekly Digest
                              </label>
                            </div>
                            <p className="text-xs text-green-700 mt-2 ml-8">
                              Receive a weekly summary of your blog performance
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-8"
                  >
                    {isLoading ? "Saving..." : "💾 Save Settings"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
