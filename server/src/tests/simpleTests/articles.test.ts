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

// Create a simple articles route for testing
app.get('/api/articles', (req, res) => {
  const { locale = 'en', limit = 10, page = 1, category = '', tag = '' } = req.query;
  
  // Filter articles
  let filteredArticles = mockArticles.filter(article => article.published && article.locale === locale);
  
  // Apply tag filter if provided
  if (tag) {
    filteredArticles = filteredArticles.filter(article => article.tags.includes(String(tag)));
  }
  
  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  const paginatedArticles = filteredArticles.slice(offset, offset + Number(limit));
  
  return res.json(paginatedArticles);
});

// Create a simple article by slug route for testing
app.get('/api/articles/:slug', (req, res) => {
  const { slug } = req.params;
  const { locale = 'en' } = req.query;
  
  const article = mockArticles.find(article => article.slug === slug && article.locale === locale && article.published);
  
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  
  return res.json(article);
});

// Create a simple claps route for testing
app.get('/api/articles/:slug/claps', (req, res) => {
  const { slug } = req.params;
  
  const article = mockArticles.find(article => article.slug === slug);
  
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  
  return res.json([
    {
      id: 1,
      articleId: article.id,
      textFragment: 'This is a great article',
      position: { startOffset: 10, endOffset: 30 },
      count: 5,
    },
  ]);
});

// Create a simple add clap route for testing
app.post('/api/articles/:slug/clap', (req, res) => {
  const { slug } = req.params;
  const { textFragment, position } = req.body;
  
  // Check for authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const article = mockArticles.find(article => article.slug === slug);
  
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }
  
  if (!textFragment || !position) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  return res.status(200).json({ message: 'Clap added successfully' });
});

describe('Articles API Tests', () => {
  describe('GET /api/articles', () => {
    it('should return a list of published articles', async () => {
      const response = await request(app).get('/api/articles');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(mockArticles.filter(a => a.published).length);
    });
    
    it('should apply pagination parameters', async () => {
      const response = await request(app)
        .get('/api/articles')
        .query({ page: 1, limit: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });
    
    it('should filter by tag', async () => {
      const response = await request(app)
        .get('/api/articles')
        .query({ tag: 'JavaScript' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(mockArticles.filter(a => a.published).length);
    });
  });
  
  describe('GET /api/articles/:slug', () => {
    it('should return a single article by slug', async () => {
      const article = mockArticles.find(a => a.published);
      
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
  });
  
  describe('POST /api/articles/:slug/clap', () => {
    it('should add a clap to an article', async () => {
      const article = mockArticles.find(a => a.published);
      
      // Generate a test token
      const token = jwt.sign(
        { userId: 1, role: 'user' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
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
      const token = jwt.sign(
        { userId: 1, role: 'user' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
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
      const article = mockArticles.find(a => a.published);
      
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
});
