import request from 'supertest';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { generateTestToken, mockUsers } from '../testUtils';

// Import routes
import articleRoutes from '../../routes/articles';
import authRoutes from '../../routes/auth';
import adminRoutes from '../../routes/admin';

// Mock the database and auth middleware
import '../mocks/db.mock';
import '../mocks/auth.mock';

describe('API Integration Tests', () => {
  let app: express.Express;
  let server: http.Server;

  beforeAll(() => {
    // Create Express app
    app = express();
    
    // Middleware
    app.use(helmet());
    app.use(compression());
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // API Routes
    app.use('/api/articles', articleRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Start server
    server = app.listen(4001);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Authentication Flow', () => {
    it('should register, login, and access protected routes', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('token');
      const token = registerResponse.body.token;
      
      // Step 2: Access a protected route with the token
      const protectedResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body).toHaveProperty('id');
      expect(protectedResponse.body).toHaveProperty('email', 'test@example.com');
      
      // Step 3: Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('Article Access', () => {
    it('should get public articles without authentication', async () => {
      const response = await request(app).get('/api/articles');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should access admin routes with admin token', async () => {
      const token = generateTestToken(mockUsers.admin.id, 'admin');
      
      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    it('should not access admin routes without admin token', async () => {
      const token = generateTestToken(mockUsers.user.id, 'user');
      
      const response = await request(app)
        .get('/api/admin/articles')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Forbidden');
    });
  });
});
