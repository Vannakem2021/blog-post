import { z } from "zod";
import { NewsCategory } from "./types";

// Common validation patterns
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be less than 100 characters");

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  );

const urlSchema = z.string().url("Please enter a valid URL").or(z.literal(""));

// News categories validation
const newsCategorySchema = z.enum([
  "politics",
  "business",
  "technology",
  "sports",
  "world",
  "health",
  "local",
  "opinion",
  "entertainment",
] as const);

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Post creation/editing schemas
export const postSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .min(10, "Title must be at least 10 characters")
      .max(200, "Title must be less than 200 characters"),

    content: z
      .string()
      .min(1, "Content is required")
      .min(100, "Content must be at least 100 characters"),

    excerpt: z
      .string()
      .max(300, "Excerpt must be less than 300 characters")
      .optional()
      .or(z.literal("")),

    slug: slugSchema.optional(),

    featured_image_url: urlSchema.optional(),

    featured_image_alt: z
      .string()
      .max(200, "Alt text must be less than 200 characters")
      .optional(),

    category: newsCategorySchema,

    status: z.enum(["draft", "published", "scheduled"]),

    scheduled_at: z
      .string()
      .datetime("Please enter a valid date and time")
      .optional()
      .or(z.literal("")),

    timezone: z
      .string()
      .min(1, "Timezone is required when scheduling")
      .optional(),

    auto_publish: z.boolean().optional(),

    urgency_level: z.enum(["breaking", "urgent", "normal"]).optional(),

    is_breaking: z.boolean().optional(),

    is_featured: z.boolean().optional(),

    // SEO fields - These are separate from the main title and should not conflict
    meta_title: z
      .string()
      .max(60, "Meta title should be less than 60 characters for SEO")
      .optional()
      .or(z.literal("")),

    meta_description: z
      .string()
      .max(160, "Meta description should be less than 160 characters for SEO")
      .optional()
      .or(z.literal("")),

    focus_keywords: z
      .array(z.string())
      .max(5, "Maximum 5 focus keywords allowed")
      .optional(),

    primary_keyword: z
      .string()
      .max(50, "Primary keyword must be less than 50 characters")
      .optional()
      .or(z.literal("")),

    is_pillar_content: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If status is scheduled, scheduled_at and timezone are required
      if (data.status === "scheduled") {
        return data.scheduled_at && data.scheduled_at !== "" && data.timezone;
      }
      return true;
    },
    {
      message: "Scheduled date and timezone are required for scheduled posts",
      path: ["scheduled_at"],
    }
  )
  .refine(
    (data) => {
      // If scheduled_at is provided, it must be in the future
      if (data.scheduled_at && data.scheduled_at !== "") {
        const scheduledDate = new Date(data.scheduled_at);
        const now = new Date();
        return scheduledDate > now;
      }
      return true;
    },
    {
      message: "Scheduled date must be in the future",
      path: ["scheduled_at"],
    }
  )
  .refine(
    (data) => {
      // If featured image is provided, alt text should be provided
      if (data.featured_image_url && data.featured_image_url !== "") {
        return data.featured_image_alt && data.featured_image_alt.trim() !== "";
      }
      return true;
    },
    {
      message:
        "Alt text is required when featured image is provided for accessibility",
      path: ["featured_image_alt"],
    }
  );

export type PostFormData = z.infer<typeof postSchema>;

// Ensure create and update operations use the same validation rules
export const createPostSchema = postSchema;
export const updatePostSchema = postSchema;

export type CreatePostData = z.infer<typeof createPostSchema>;
export type UpdatePostData = z.infer<typeof updatePostSchema>;

// Settings schemas
export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),

  email: emailSchema,

  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

export const blogConfigSchema = z.object({
  siteTitle: z
    .string()
    .min(1, "Site title is required")
    .min(3, "Site title must be at least 3 characters")
    .max(100, "Site title must be less than 100 characters"),

  siteDescription: z
    .string()
    .min(1, "Site description is required")
    .min(10, "Site description must be at least 10 characters")
    .max(300, "Site description must be less than 300 characters"),

  defaultCategory: newsCategorySchema,
});

export type BlogConfigData = z.infer<typeof blogConfigSchema>;

export const contentSettingsSchema = z.object({
  postsPerPage: z
    .number()
    .min(1, "Posts per page must be at least 1")
    .max(50, "Posts per page must be less than 50"),

  enableComments: z.boolean(),

  moderateComments: z.boolean(),
});

export type ContentSettingsData = z.infer<typeof contentSettingsSchema>;

export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),

  sessionTimeout: z
    .number()
    .min(5, "Session timeout must be at least 5 minutes")
    .max(1440, "Session timeout must be less than 24 hours"),
});

export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>;

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type NotificationSettingsData = z.infer<
  typeof notificationSettingsSchema
>;

// Validation helper functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message };
    }
    return { isValid: false, error: "Validation failed" };
  }
};

// Real-time validation helpers
export const createFieldValidator = <T>(schema: z.ZodSchema<T>) => {
  return (value: unknown) => validateField(schema, value);
};

// Common validation messages
export const validationMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be less than ${max} characters`,
  url: "Please enter a valid URL",
  future: "Date must be in the future",
  past: "Date must be in the past",
} as const;
