import request from 'supertest';
import express from 'express';
import articleRoutes from '../../../routes/articles';
import { mockArticles } from '../../testUtils';

// Mock the database
jest.mock('../../../db', () => {
  const mockDb = {
    query: {
      articles: {
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
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  };
  
  return { db: mockDb };
});

// Import the mocked db
import { db } from '../../../db';

describe('Article Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/articles', articleRoutes);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return a list of published articles', async () => {
      // Mock db.select().from().where().orderBy().limit().offset() to return articles
      (db.returning as jest.Mock).mockResolvedValue(
        mockArticles.filter(article => article.published)
      );

      const response = await request(app).get('/api/articles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(
        mockArticles.filter(article => article.published).length
      );
      
      // Verify that the database was called correctly
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalled();
      expect(db.offset).toHaveBeenCalled();
    });

    it('should apply pagination parameters', async () => {
      // Mock db.select().from().where().orderBy().limit().offset() to return articles
      (db.returning as jest.Mock).mockResolvedValue(
        mockArticles.filter(article => article.published).slice(0, 1)
      );

      const response = await request(app)
        .get('/api/articles')
        .query({ page: 2, limit: 1 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify that the database was called correctly with pagination
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(db.offset).toHaveBeenCalledWith(1); // (page - 1) * limit
    });
  });

  describe('GET /:slug', () => {
    it('should return a single article by slug', async () => {
      const article = mockArticles[0];
      
      // Mock db.query.articles.findFirst to return an article
      (db.query.articles.findFirst as jest.Mock).mockResolvedValue(article);
      
      // Mock db.update().set().where() to update view count
      (db.returning as jest.Mock).mockResolvedValue([{ ...article, viewCount: article.viewCount + 1 }]);

      const response = await request(app).get(`/api/articles/${article.slug}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', article.id);
      expect(response.body).toHaveProperty('slug', article.slug);
      expect(response.body).toHaveProperty('title', article.title);
      
      // Verify that the database was called correctly
      expect(db.query.articles.findFirst).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });

    it('should return 404 if article is not found', async () => {
      // Mock db.query.articles.findFirst to return null (article doesn't exist)
      (db.query.articles.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/articles/nonexistent-article');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
      
      // Verify that the database was called correctly
      expect(db.query.articles.findFirst).toHaveBeenCalled();
    });

    it('should return 404 if article is not published', async () => {
      const article = mockArticles.find(a => !a.published);
      
      // Mock db.query.articles.findFirst to return an unpublished article
      (db.query.articles.findFirst as jest.Mock).mockResolvedValue(article);

      const response = await request(app).get(`/api/articles/${article?.slug}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
      
      // Verify that the database was called correctly
      expect(db.query.articles.findFirst).toHaveBeenCalled();
    });
  });
});
