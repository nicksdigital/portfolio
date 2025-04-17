import request from 'supertest';
import { createTestApp } from './setup';
import adminRoutes from '../../routes/admin';
import { inMemoryDb } from '../mocks/betterDbMock';
import { generateTestToken } from '../testUtils';

// Mock the auth middleware
jest.mock('../../middleware/auth', () => {
  return {
    authenticate: jest.fn((req, res, next) => {
      // Check if Authorization header is present
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Extract token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Set user on request
      req.user = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      };
      
      next();
    }),
    authorizeAdmin: jest.fn((req, res, next) => {
      if (req.user?.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }),
    authorizeAuthor: jest.fn((req, res, next) => {
      if (req.user?.role === 'admin' || req.user?.role === 'author') {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }),
  };
});

describe('Admin API Integration Tests', () => {
  const app = createTestApp();
  
  // Register admin routes
  app.use('/api/admin', adminRoutes);
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });
  
  describe('GET /api/admin/articles', () => {
    it('should return all articles for admin', async () => {
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/articles');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });
    
    it('should return 403 if not an admin', async () => {
      // Mock the auth middleware to return a non-admin user
      require('../../middleware/auth').authenticate.mockImplementationOnce((req, res, next) => {
        req.user = {
          id: 2,
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          isActive: true,
        };
        next();
      });
      
      // Generate a user token
      const token = generateTestToken(2, 'user');
      
      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Forbidden');
    });
  });
  
  describe('POST /api/admin/articles', () => {
    it('should create a new article', async () => {
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Test Article',
          slug: 'new-test-article',
          locale: 'en',
          description: 'This is a test article created in the integration test',
          layers: {
            headline: { content: 'Test Headline' },
            context: { content: 'Test Context' },
            detail: { content: 'Test Detail' },
            discussion: { content: 'Test Discussion' },
          },
          published: false,
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Test Article');
      expect(response.body).toHaveProperty('slug', 'new-test-article');
    });
    
    it('should return 400 if slug is already in use', async () => {
      // Get an existing article from the in-memory database
      const existingArticle = inMemoryDb.getArticles()[0];
      
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Duplicate Slug Article',
          slug: existingArticle.slug,
          locale: 'en',
          description: 'This article has a duplicate slug',
          layers: {
            headline: { content: 'Test Headline' },
            context: { content: 'Test Context' },
            detail: { content: 'Test Detail' },
            discussion: { content: 'Test Discussion' },
          },
          published: false,
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Slug already in use');
    });
  });
  
  describe('PUT /api/admin/articles/:id', () => {
    it('should update an article', async () => {
      // Get an existing article from the in-memory database
      const article = inMemoryDb.getArticles()[0];
      
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .put(`/api/admin/articles/${article.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Article Title',
          description: 'This article has been updated',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', article.id);
      expect(response.body).toHaveProperty('title', 'Updated Article Title');
      expect(response.body).toHaveProperty('description', 'This article has been updated');
    });
    
    it('should return 404 if article is not found', async () => {
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .put('/api/admin/articles/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Article Title',
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
  });
  
  describe('DELETE /api/admin/articles/:id', () => {
    it('should delete an article', async () => {
      // Get an existing article from the in-memory database
      const article = inMemoryDb.getArticles()[0];
      
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .delete(`/api/admin/articles/${article.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Article deleted successfully');
    });
    
    it('should return 404 if article is not found', async () => {
      // Generate an admin token
      const token = generateTestToken(1, 'admin');
      
      const response = await request(app)
        .delete('/api/admin/articles/9999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
  });
});
