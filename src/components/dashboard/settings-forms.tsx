"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormLabel,
  FormError,
  FormHelpText,
  EnhancedInput,
} from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
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

interface ProfileFormProps {
  defaultValues: ProfileSettingsData;
  onSubmit: (data: ProfileSettingsData) => Promise<void>;
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: ProfileSettingsData) => {
    try {
      await onSubmit(data);
      toast.success("Profile settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save profile settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          👤 Profile Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField>
            <FormLabel htmlFor="displayName" required>
              Display Name
            </FormLabel>
            <EnhancedInput
              id="displayName"
              placeholder="Your display name"
              error={errors.displayName?.message}
              isLoading={isSubmitting}
              {...register("displayName")}
            />
            <FormError message={errors.displayName?.message} />
            <FormHelpText>
              This name will be displayed publicly on your posts (2-50
              characters)
            </FormHelpText>
          </FormField>

          <FormField>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <EnhancedInput
              id="email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              isLoading={isSubmitting}
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
            <FormHelpText>
              Your email address for account notifications
            </FormHelpText>
          </FormField>
        </div>

        <FormField className="mt-6">
          <FormLabel htmlFor="bio">Bio</FormLabel>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            rows={4}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
            {...register("bio")}
          />
          <FormError message={errors.bio?.message} />
          <FormHelpText>
            Optional bio that appears on your profile (max 500 characters)
          </FormHelpText>
        </FormField>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? "Saving..." : "Save Profile Settings"}
        </Button>
      </div>
    </form>
  );
}

interface BlogConfigFormProps {
  defaultValues: BlogConfigData;
  onSubmit: (data: BlogConfigData) => Promise<void>;
}

export function BlogConfigForm({
  defaultValues,
  onSubmit,
}: BlogConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogConfigData>({
    resolver: zodResolver(blogConfigSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: BlogConfigData) => {
    try {
      await onSubmit(data);
      toast.success("Blog configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save blog configuration");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🌐 Blog Configuration
        </h3>
        <div className="space-y-6">
          <FormField>
            <FormLabel htmlFor="siteTitle" required>
              Site Title
            </FormLabel>
            <EnhancedInput
              id="siteTitle"
              placeholder="Your blog title"
              error={errors.siteTitle?.message}
              isLoading={isSubmitting}
              {...register("siteTitle")}
            />
            <FormError message={errors.siteTitle?.message} />
            <FormHelpText>
              The main title of your blog (3-100 characters)
            </FormHelpText>
          </FormField>

          <FormField>
            <FormLabel htmlFor="siteDescription" required>
              Site Description
            </FormLabel>
            <Textarea
              id="siteDescription"
              placeholder="Describe your blog..."
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
              {...register("siteDescription")}
            />
            <FormError message={errors.siteDescription?.message} />
            <FormHelpText>
              A brief description of your blog for SEO and social sharing
              (10-300 characters)
            </FormHelpText>
          </FormField>

          <FormField>
            <FormLabel htmlFor="defaultCategory" required>
              Default Category
            </FormLabel>
            <select
              id="defaultCategory"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              {...register("defaultCategory")}
            >
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="politics">Politics</option>
              <option value="sports">Sports</option>
              <option value="world">World</option>
              <option value="health">Health</option>
              <option value="local">Local</option>
              <option value="opinion">Opinion</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <FormError message={errors.defaultCategory?.message} />
            <FormHelpText>The default category for new posts</FormHelpText>
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? "Saving..." : "Save Blog Configuration"}
        </Button>
      </div>
    </form>
  );
}

interface ContentSettingsFormProps {
  defaultValues: ContentSettingsData;
  onSubmit: (data: ContentSettingsData) => Promise<void>;
}

export function ContentSettingsForm({
  defaultValues,
  onSubmit,
}: ContentSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContentSettingsData>({
    resolver: zodResolver(contentSettingsSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: ContentSettingsData) => {
    try {
      await onSubmit(data);
      toast.success("Content settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save content settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📝 Content Settings
        </h3>
        <div className="space-y-6">
          <FormField>
            <FormLabel htmlFor="postsPerPage" required>
              Posts Per Page
            </FormLabel>
            <EnhancedInput
              id="postsPerPage"
              type="number"
              min="1"
              max="50"
              error={errors.postsPerPage?.message}
              isLoading={isSubmitting}
              {...register("postsPerPage", { valueAsNumber: true })}
            />
            <FormError message={errors.postsPerPage?.message} />
            <FormHelpText>
              Number of posts to display per page (1-50)
            </FormHelpText>
          </FormField>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableComments"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register("enableComments")}
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
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  {...register("moderateComments")}
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

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? "Saving..." : "Save Content Settings"}
        </Button>
      </div>
    </form>
  );
}

interface SecuritySettingsFormProps {
  defaultValues: SecuritySettingsData;
  onSubmit: (data: SecuritySettingsData) => Promise<void>;
}

export function SecuritySettingsForm({
  defaultValues,
  onSubmit,
}: SecuritySettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SecuritySettingsData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: SecuritySettingsData) => {
    try {
      await onSubmit(data);
      toast.success("Security settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save security settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                {...register("twoFactorEnabled")}
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

          <FormField>
            <FormLabel htmlFor="sessionTimeout" required>
              Session Timeout (minutes)
            </FormLabel>
            <EnhancedInput
              id="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              error={errors.sessionTimeout?.message}
              isLoading={isSubmitting}
              {...register("sessionTimeout", { valueAsNumber: true })}
            />
            <FormError message={errors.sessionTimeout?.message} />
            <FormHelpText>
              Automatically log out after this period of inactivity (5-1440
              minutes)
            </FormHelpText>
          </FormField>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-medium text-red-900 mb-2">
              🔑 Change Password
            </h4>
            <p className="text-sm text-red-700 mb-4">
              Update your password to keep your account secure
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? "Saving..." : "Save Security Settings"}
        </Button>
      </div>
    </form>
  );
}

interface NotificationSettingsFormProps {
  defaultValues: NotificationSettingsData;
  onSubmit: (data: NotificationSettingsData) => Promise<void>;
}

export function NotificationSettingsForm({
  defaultValues,
  onSubmit,
}: NotificationSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: NotificationSettingsData) => {
    try {
      await onSubmit(data);
      toast.success("Notification settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save notification settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register("emailNotifications")}
              />
              <label
                htmlFor="emailNotifications"
                className="ml-3 block text-sm font-medium text-blue-900"
              >
                📧 Email Notifications
              </label>
            </div>
            <p className="text-xs text-blue-700 mt-2 ml-8">
              Receive email notifications for important updates
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                {...register("pushNotifications")}
              />
              <label
                htmlFor="pushNotifications"
                className="ml-3 block text-sm font-medium text-purple-900"
              >
                🔔 Push Notifications
              </label>
            </div>
            <p className="text-xs text-purple-700 mt-2 ml-8">
              Get instant push notifications in your browser
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="weeklyDigest"
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                {...register("weeklyDigest")}
              />
              <label
                htmlFor="weeklyDigest"
                className="ml-3 block text-sm font-medium text-green-900"
              >
                📊 Weekly Digest
              </label>
            </div>
            <p className="text-xs text-green-700 mt-2 ml-8">
              Receive a weekly summary of your blog's performance
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? "Saving..." : "Save Notification Settings"}
        </Button>
      </div>
    </form>
  );
}
