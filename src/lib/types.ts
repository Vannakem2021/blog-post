export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  status: "draft" | "published" | "scheduled"; // Updated to include 'scheduled'
  published_at?: Date | string;
  scheduled_at?: Date | string; // New: When the post is scheduled to be published
  timezone?: string; // New: Timezone for scheduled publishing
  auto_publish?: boolean; // New: Whether to automatically publish when scheduled time arrives
  author_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  // News-specific fields
  category: NewsCategory;
  urgency_level: "breaking" | "urgent" | "normal";
  reading_time?: number;
  source_attribution?: string[];
  is_breaking?: boolean;
  is_featured?: boolean;
  view_count?: number;
  share_count?: number;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string[];
  primary_keyword?: string;
  is_pillar_content?: boolean;
  seo_score?: number;
  readability_score?: number;
  word_count?: number;
  keyword_density?: Record<string, number>;
  seo_analysis?: SEOAnalysis;
  // Profile relation (when joined)
  profiles?: {
    full_name?: string;
    email: string;
  };
}

export type NewsCategory =
  | "politics"
  | "business"
  | "technology"
  | "sports"
  | "world"
  | "health"
  | "local"
  | "opinion"
  | "entertainment";

export interface BreakingNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  timestamp: Date | string;
  is_active: boolean;
  priority: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "admin" | "user";
  created_at: Date | string;
  updated_at: Date | string;
  // News author fields
  bio?: string;
  title?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
  };
}

// Supabase Auth Types
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  created_at: Date | string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  status: "draft" | "published" | "scheduled"; // Updated to include 'scheduled'
  scheduled_at?: Date | string; // New: When to publish the post
  timezone?: string; // New: Timezone for scheduling
  auto_publish?: boolean; // New: Auto-publish when scheduled time arrives
  category?: NewsCategory; // Added for completeness
  urgency_level?: "breaking" | "urgent" | "normal"; // Added for completeness
  is_breaking?: boolean; // Added for completeness
  is_featured?: boolean; // Added for completeness
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string[];
  primary_keyword?: string;
  is_pillar_content?: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// SEO-specific types
export interface SEOAnalysis {
  word_count: number;
  title_has_keyword: boolean;
  meta_description_has_keyword: boolean;
  slug_has_keyword: boolean;
  content_has_keyword: boolean;
  content_length_adequate: boolean;
  meta_title_length_good: boolean;
  meta_description_length_good: boolean;
  has_focus_keywords: boolean;
  seo_score: number;
}

export interface SEOCheck {
  id: string;
  label: string;
  status: "success" | "error" | "warning";
  message: string;
  suggestion?: string;
}

export interface FocusKeyword {
  keyword: string;
  isPrimary: boolean;
}

export interface SEOSuggestion {
  type: "error" | "warning" | "info";
  message: string;
  field: string;
  action?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: BlogPost[];
  pagination: PaginationData;
}

// Scheduled Posts Specific Types
export interface ScheduledPostsMetrics {
  totalScheduled: number;
  successfulPublications: number;
  failedPublications: number;
  averageScheduleAdvance: number; // Days in advance
  popularSchedulingTimes: string[];
  categoryBreakdown: Record<string, number>;
}

export interface ScheduleAuditEntry {
  id: string;
  post_id: string;
  action: "scheduled" | "rescheduled" | "cancelled" | "published";
  old_scheduled_at?: Date | string;
  new_scheduled_at?: Date | string;
  old_status?: string;
  new_status?: string;
  user_id?: string;
  created_at: Date | string;
  // Joined data
  post?: {
    title: string;
    slug: string;
  };
  user?: {
    full_name?: string;
    email: string;
  };
}

export interface ScheduledPostsLog {
  id: string;
  published_count: number;
  executed_at: Date | string;
  error_message?: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  popular?: boolean;
}

export interface SchedulingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Post status type for better type safety
export type PostStatus = "draft" | "published" | "scheduled";

// Scheduling-specific form data
export interface SchedulePostData {
  scheduled_at: Date | string;
  timezone: string;
  auto_publish: boolean;
}
