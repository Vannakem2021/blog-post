export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  status: "draft" | "published";
  publishedAt?: Date | string;
  authorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  // News-specific fields
  category: NewsCategory;
  urgencyLevel: "breaking" | "urgent" | "normal";
  readingTime?: number;
  sourceAttribution?: string[];
  isBreaking?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  shareCount?: number;
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
  isActive: boolean;
  priority: number;
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: "admin" | "user";
  createdAt: Date | string;
  updatedAt: Date | string;
  // News author fields
  bio?: string;
  title?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  createdAt: Date | string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
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
