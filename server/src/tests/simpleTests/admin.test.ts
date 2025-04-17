import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Mock article data
const mockArticles = [
  {
    id: 1,
    slug: 'test-article-1',
    title: 'Test Article 1',
    description: 'This is a test article',
    locale: 'en',
    layers: {
      headline: { content: 'Test Headline' },
      context: { content: 'Test Context' },
      detail: { content: 'Test Detail' },
      discussion: { content: 'Test Discussion' },
    },
    date: new Date().toISOString(),
    published: true,
    viewCount: 100,
    tags: ['JavaScript', 'React'],
  },
  {
    id: 2,
    slug: 'test-article-2',
    title: 'Test Article 2',
    description: 'This is another test article',
    locale: 'en',
    layers: {
      headline: { content: 'Test Headline 2' },
      context: { content: 'Test Context 2' },
      detail: { content: 'Test Detail 2' },
      discussion: { content: 'Test Discussion 2' },
    },
    date: new Date().toISOString(),
    published: false,
    viewCount: 0,
    tags: ['TypeScript', 'Node.js'],
  },
];

// Middleware to check admin authentication
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, 'test-secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create a simple admin articles route for testing
app.get('/api/admin/articles', authenticateAdmin, (req, res) => {
  return res.json(mockArticles);
});

// Create a simple admin create article route for testing
app.post('/api/admin/articles', authenticateAdmin, (req, res) => {
  const { title, slug, locale, description, layers, published } = req.body;
  
  if (!title || !slug || !locale || !description || !layers) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Check if slug is already in use
  const existingArticle = mockArticles.find(article => article.slug === slug);
  if (existingArticle) {
    return res.status(400).json({ message: 'Slug already in use' });
  }
  
  const newArticle = {
    id: mockArticles.length + 1,
    title,
    slug,
    locale,
    description,
    layers,
    published: published || false,
    date: new Date().toISOString(),
    viewCount: 0,
    tags: req.body.tags || [],
  };
  
  return res.status(201).json(newArticle);
});

// Create a simple admin update article route for testing
app.put('/api/admin/articles/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  
  const article = mockArticles.find(article => article.id === articleId);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  
  const updatedArticle = {
    ...article,
    ...req.body,
  };
  
  return res.json(updatedArticle);
});

// Create a simple admin delete article route for testing
app.delete('/api/admin/articles/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  
  const article = mockArticles.find(article => article.id === articleId);
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  
  return res.json({ message: 'Article deleted successfully' });
});

describe('Admin API Tests', () => {
  describe('GET /api/admin/articles', () => {
    it('should return all articles for admin', async () => {
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockArticles.length);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/articles');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });
    
    it('should return 403 if not an admin', async () => {
      // Generate a user token
      const token = jwt.sign(
        { userId: 2, role: 'user' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
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
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Test Article',
          slug: 'new-test-article',
          locale: 'en',
          description: 'This is a test article created in the test',
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
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Duplicate Slug Article',
          slug: 'test-article-1', // Existing slug
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
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .put('/api/admin/articles/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Article Title',
          description: 'This article has been updated',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Updated Article Title');
      expect(response.body).toHaveProperty('description', 'This article has been updated');
    });
    
    it('should return 404 if article is not found', async () => {
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
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
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .delete('/api/admin/articles/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Article deleted successfully');
    });
    
    it('should return 404 if article is not found', async () => {
      // Generate an admin token
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .delete('/api/admin/articles/9999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Article not found');
    });
  });
});
