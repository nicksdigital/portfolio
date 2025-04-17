import request from 'supertest';
import { createTestApp } from './setup';
import articleRoutes from '../../routes/articles';
import { inMemoryDb } from '../mocks/betterDbMock';
import { generateTestToken } from '../testUtils';

describe('Articles API Integration Tests', () => {
  const app = createTestApp();
  
  // Register article routes
  app.use('/api/articles', articleRoutes);
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });
  
  describe('GET /api/articles', () => {
    it('should return a list of published articles', async () => {
      const response = await request(app).get('/api/articles');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Check that only published articles are returned
      response.body.forEach((article: any) => {
        expect(article.published).toBe(true);
      });
    });
    
    it('should apply pagination parameters', async () => {
      const response = await request(app)
        .get('/api/articles')
        .query({ page: 1, limit: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });
    
    it('should filter by category', async () => {
      // Create a test category
      const category = inMemoryDb.getCategories()[0];
      
      const response = await request(app)
        .get('/api/articles')
        .query({ category: category.slug });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should filter by tag', async () => {
      // Create a test tag
      const tag = inMemoryDb.getTags()[0];
      
      const response = await request(app)
        .get('/api/articles')
        .query({ tag: tag.name });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('GET /api/articles/:slug', () => {
    it('should return a single article by slug', async () => {
      // Get a published article from the in-memory database
      const article = inMemoryDb.getArticles({ published: true })[0];
      
      const response = await request(app)
        .get(`/api/articles/${article.slug}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', article.id);
      expect(response.body).toHaveProperty('slug', article.slug);
      expect(response.body).toHaveProperty('title', article.title);
    });
    
    it('should return 404 if article is not found', async () => {
      const response = await request(app)
        .get('/api/articles/nonexistent-article');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
    
    it('should return 404 if article is not published', async () => {
      // Get an unpublished article from the in-memory database
      const article = inMemoryDb.getArticles({ published: false })[0];
      
      const response = await request(app)
        .get(`/api/articles/${article.slug}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
  });
  
  describe('POST /api/articles/:slug/clap', () => {
    it('should add a clap to an article', async () => {
      // Get a published article from the in-memory database
      const article = inMemoryDb.getArticles({ published: true })[0];
      
      // Generate a test token
      const token = generateTestToken(1, 'user');
      
      const response = await request(app)
        .post(`/api/articles/${article.slug}/clap`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Clap added successfully');
    });
    
    it('should return 404 if article is not found', async () => {
      // Generate a test token
      const token = generateTestToken(1, 'user');
      
      const response = await request(app)
        .post('/api/articles/nonexistent-article/clap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
    
    it('should return 401 if not authenticated', async () => {
      // Get a published article from the in-memory database
      const article = inMemoryDb.getArticles({ published: true })[0];
      
      const response = await request(app)
        .post(`/api/articles/${article.slug}/clap`)
        .send({
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/articles/:slug/claps', () => {
    it('should return claps for an article', async () => {
      // Get a published article from the in-memory database
      const article = inMemoryDb.getArticles({ published: true })[0];
      
      const response = await request(app)
        .get(`/api/articles/${article.slug}/claps`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should return 404 if article is not found', async () => {
      const response = await request(app)
        .get('/api/articles/nonexistent-article/claps');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
  });
});
