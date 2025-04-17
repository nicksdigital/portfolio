import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  },
  author: {
    id: 2,
    email: 'author@example.com',
    firstName: 'Author',
    lastName: 'User',
    role: 'author',
    isActive: true,
  },
  user: {
    id: 3,
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    isActive: true,
  },
  inactive: {
    id: 4,
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'user',
    isActive: false,
  },
};

// Generate a JWT token for testing
export const generateTestToken = (userId: number, role: string = 'user'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
};

// Helper to make authenticated requests
export const authRequest = (app: Express, token: string) => {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body?: any) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body?: any) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
};

// Mock article data for testing
export const mockArticles = [
  {
    id: 1,
    slug: 'test-article-1',
    locale: 'en',
    title: 'Test Article 1',
    description: 'This is a test article',
    layers: {
      headline: { content: 'Test Headline' },
      context: { content: 'Test Context' },
      detail: { content: 'Test Detail' },
      discussion: { content: 'Test Discussion' },
    },
    date: new Date().toISOString(),
    published: true,
    authorId: 2,
    viewCount: 100,
  },
  {
    id: 2,
    slug: 'test-article-2',
    locale: 'en',
    title: 'Test Article 2',
    description: 'This is another test article',
    layers: {
      headline: { content: 'Test Headline 2' },
      context: { content: 'Test Context 2' },
      detail: { content: 'Test Detail 2' },
      discussion: { content: 'Test Discussion 2' },
    },
    date: new Date().toISOString(),
    published: false,
    authorId: 2,
    viewCount: 0,
  },
];

// Mock category data for testing
export const mockCategories = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related articles',
  },
  {
    id: 2,
    name: 'Design',
    slug: 'design',
    description: 'Design related articles',
  },
];

// Mock tag data for testing
export const mockTags = [
  {
    id: 1,
    name: 'JavaScript',
  },
  {
    id: 2,
    name: 'React',
  },
  {
    id: 3,
    name: 'Node.js',
  },
];

// Mock database for testing
export const mockDb = {
  query: {
    users: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    articles: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    categories: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    tags: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  transaction: jest.fn(),
};
