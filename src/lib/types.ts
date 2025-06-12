export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  status: "draft" | "published";
  published_at?: Date | string;
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
  status: "draft" | "published";
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
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
