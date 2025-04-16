// User types
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'author' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'author' | 'user';
  isActive?: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// Article types
export interface ArticleLayers {
  headline: { content: string };
  context: { content: string };
  detail: { content: string };
  discussion: { content: string };
}

export interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  description?: string;
  layers: ArticleLayers;
  date: string;
  image?: string;
  published: boolean;
  featured?: boolean;
  authorId?: number;
  viewCount?: number;
  tags?: string[];
  categories?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  locale: string;
  description?: string;
  layers: ArticleLayers;
  date?: string;
  image?: string;
  published?: boolean;
  featured?: boolean;
  tags?: string[];
  categories?: number[];
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

// Clap types
export interface Clap {
  id: number;
  articleId: number;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  count: number;
  createdAt: string;
  updatedAt?: string;
}

// Annotation types
export interface Annotation {
  id: number;
  articleId: number;
  userId: string;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  note: string;
  createdAt: string;
  updatedAt?: string;
}

// Dashboard statistics types
export interface DashboardStats {
  articles: {
    total: number;
    published: number;
    views: number;
    mostViewed: {
      id: number;
      title: string;
      slug: string;
      viewCount: number;
    }[];
  };
  tags: {
    total: number;
    mostUsed: {
      tagId: number;
      tagName: string;
      count: number;
    }[];
  };
  users: {
    total: number;
  };
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
