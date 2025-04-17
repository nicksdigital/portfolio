import request from 'supertest';
import express from 'express';
import adminRoutes from '../../../routes/admin';
import { mockArticles, mockUsers, mockCategories, mockTags, generateTestToken } from '../../testUtils';

// Mock the auth middleware
jest.mock('../../../middleware/auth', () => {
  return {
    authenticate: jest.fn((req, res, next) => {
      req.user = mockUsers.admin;
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

// Mock the database
jest.mock('../../../db', () => {
  const mockDb = {
    query: {
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
      users: {
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
    transaction: jest.fn(async (callback) => {
      return await callback({
        query: {
          articles: {
            findFirst: jest.fn(),
          },
          categories: {
            findFirst: jest.fn(),
          },
          tags: {
            findFirst: jest.fn(),
          },
        },
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockArticles[0]]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      });
    }),
  };
  
  return { db: mockDb };
});

// Import the mocked db
import { db } from '../../../db';

describe('Admin Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRoutes);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /articles', () => {
    it('should return all articles for admin', async () => {
      // Mock db.select().from().where().orderBy().limit().offset() to return articles
      (db.returning as jest.Mock).mockResolvedValue(mockArticles);

      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${generateTestToken(mockUsers.admin.id, 'admin')}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockArticles.length);
      
      // Verify that the database was called correctly
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalled();
      expect(db.offset).toHaveBeenCalled();
    });
  });

  describe('POST /articles', () => {
    it('should create a new article', async () => {
      // Mock db.query.articles.findFirst to return null (slug doesn't exist)
      (db.query.articles.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock db.transaction to return a new article
      (db.transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback({
          query: {
            articles: {
              findFirst: jest.fn().mockResolvedValue(null),
            },
            tags: {
              findFirst: jest.fn().mockResolvedValue(mockTags[0]),
            },
            categories: {
              findFirst: jest.fn().mockResolvedValue(mockCategories[0]),
            },
          },
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{
            id: 3,
            slug: 'new-article',
            title: 'New Article',
            locale: 'en',
            description: 'A new article',
            layers: {
              headline: { content: 'New Headline' },
              context: { content: 'New Context' },
              detail: { content: 'New Detail' },
              discussion: { content: 'New Discussion' },
            },
            date: new Date().toISOString(),
            published: false,
            authorId: mockUsers.admin.id,
          }]),
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        });
      });

      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${generateTestToken(mockUsers.admin.id, 'admin')}`)
        .send({
          title: 'New Article',
          slug: 'new-article',
          locale: 'en',
          description: 'A new article',
          layers: {
            headline: { content: 'New Headline' },
            context: { content: 'New Context' },
            detail: { content: 'New Detail' },
            discussion: { content: 'New Discussion' },
          },
          published: false,
          tags: ['JavaScript'],
          categories: [1],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('slug', 'new-article');
      expect(response.body).toHaveProperty('title', 'New Article');
      
      // Verify that the database transaction was called
      expect(db.transaction).toHaveBeenCalled();
    });

    it('should return 400 if slug is already in use', async () => {
      // Mock db.query.articles.findFirst to return an existing article
      (db.query.articles.findFirst as jest.Mock).mockResolvedValue(mockArticles[0]);

      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${generateTestToken(mockUsers.admin.id, 'admin')}`)
        .send({
          title: 'New Article',
          slug: mockArticles[0].slug,
          locale: 'en',
          description: 'A new article',
          layers: {
            headline: { content: 'New Headline' },
            context: { content: 'New Context' },
            detail: { content: 'New Detail' },
            discussion: { content: 'New Discussion' },
          },
          published: false,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Slug already in use');
      
      // Verify that the database was called correctly
      expect(db.query.articles.findFirst).toHaveBeenCalled();
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });

  describe('GET /categories', () => {
    it('should return all categories', async () => {
      // Mock db.select().from().orderBy() to return categories
      (db.returning as jest.Mock).mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/admin/categories')
        .set('Authorization', `Bearer ${generateTestToken(mockUsers.admin.id, 'admin')}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockCategories.length);
      
      // Verify that the database was called correctly
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
    });
  });

  describe('GET /tags', () => {
    it('should return all tags', async () => {
      // Mock db.select().from().orderBy() to return tags
      (db.returning as jest.Mock).mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/admin/tags')
        .set('Authorization', `Bearer ${generateTestToken(mockUsers.admin.id, 'admin')}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockTags.length);
      
      // Verify that the database was called correctly
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
    });
  });
});
