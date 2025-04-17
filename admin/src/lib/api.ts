import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Types
import { ApiError } from '@/types';

// Create a base axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth cookies if not on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        Cookies.remove('user');

        // Redirect to login
      //  window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API wrapper functions
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),

    logout: () =>
      apiClient.post('/auth/logout'),

    getMe: () =>
      apiClient.get('/auth/me'),

    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.put('/auth/change-password', { currentPassword, newPassword }),
  },

  // Article endpoints
  articles: {
    getAll: (params?: {
      locale?: string;
      page?: number;
      limit?: number;
      showUnpublished?: boolean;
    }) =>
      apiClient.get('/admin/articles', { params }),

    getById: (id: number) =>
      apiClient.get(`/admin/articles/${id}`),

    getBySlug: (slug: string) =>
      apiClient.get(`/admin/articles/slug/${slug}`),

    create: (data: any) =>
      apiClient.post('/admin/articles', data),

    update: (id: number, data: any) =>
      apiClient.put(`/admin/articles/${id}`, data),

    delete: (id: number) =>
      apiClient.delete(`/admin/articles/${id}`),

    publish: (id: number) =>
      apiClient.put(`/admin/articles/${id}/publish`, { published: true }),

    unpublish: (id: number) =>
      apiClient.put(`/admin/articles/${id}/publish`, { published: false }),

    // Claps
    getClaps: (articleId: number) =>
      apiClient.get(`/articles/${articleId}/claps`),

    // Annotations
    getAnnotations: (articleId: number) =>
      apiClient.get(`/articles/${articleId}/annotations`),
  },

  // Category endpoints
  categories: {
    getAll: () =>
      apiClient.get('/admin/categories'),

    create: (data: any) =>
      apiClient.post('/admin/categories', data),

    update: (id: number, data: any) =>
      apiClient.put(`/admin/categories/${id}`, data),

    delete: (id: number) =>
      apiClient.delete(`/admin/categories/${id}`),
  },

  // Tag endpoints
  tags: {
    getAll: () =>
      apiClient.get('/admin/tags'),
  },

  // User endpoints (admin only)
  users: {
    getAll: () =>
      apiClient.get('/admin/users'),

    create: (data: any) =>
      apiClient.post('/admin/users', data),

    update: (id: number, data: any) =>
      apiClient.put(`/admin/users/${id}`, data),

    delete: (id: number) =>
      apiClient.delete(`/admin/users/${id}`),
  },

  // Dashboard statistics
  dashboard: {
    getStats: () =>
      apiClient.get('/admin/stats'),
  },
};

export default api;
