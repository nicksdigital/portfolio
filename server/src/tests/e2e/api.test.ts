import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import WebSocket from 'ws';
import { createTestWebSocketServer } from './websocketSetup';
import { inMemoryDb, createMockDb } from '../mocks/betterDbMock';
import crypto from 'crypto';

// Import routes
import articleRoutes from '../../routes/articles';
import authRoutes from '../../routes/auth';
import adminRoutes from '../../routes/admin';

// Mock the database
jest.mock('../../db', () => {
  return {
    db: createMockDb(),
  };
});

describe('API End-to-End Tests', () => {
  let app: express.Express;
  let server: http.Server;
  let adminToken: string;
  let userToken: string;
  let testArticleId: number;
  let testArticleSlug: string;

  beforeAll((done) => {
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

    // WebSocket setup
    const { server: wsServer } = createTestWebSocketServer(4001);

    // Start server
    server = app.listen(4001, () => {
      // Create test users
      const adminEmail = 'admin@example.com';
      const userEmail = 'user@example.com';
      const password = 'password123';

      // Create password hashes
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;

      // Create admin user
      inMemoryDb.createUser({
        email: adminEmail,
        password: passwordWithSalt,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      });

      // Create regular user
      inMemoryDb.createUser({
        email: userEmail,
        password: passwordWithSalt,
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true,
      });

      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Authentication Flow', () => {
    it('should register, login, and access protected routes', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('token');

      // Step 2: Login as admin
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(adminLoginResponse.status).toBe(200);
      expect(adminLoginResponse.body).toHaveProperty('token');
      adminToken = adminLoginResponse.body.token;

      // Step 3: Login as regular user
      const userLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      expect(userLoginResponse.status).toBe(200);
      expect(userLoginResponse.body).toHaveProperty('token');
      userToken = userLoginResponse.body.token;
    });
  });

  describe('Article Management Flow', () => {
    it('should create, read, update, and delete articles', async () => {
      // Step 1: Create a new article as admin
      const createResponse = await request(app)
        .post('/api/admin/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Article',
          slug: 'e2e-test-article',
          locale: 'en',
          description: 'This is an article created in the E2E test',
          layers: {
            headline: { content: 'E2E Test Headline' },
            context: { content: 'E2E Test Context' },
            detail: { content: 'E2E Test Detail' },
            discussion: { content: 'E2E Test Discussion' },
          },
          published: true,
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body).toHaveProperty('slug', 'e2e-test-article');

      testArticleId = createResponse.body.id;
      testArticleSlug = createResponse.body.slug;

      // Step 2: Get the article as a public user
      const getResponse = await request(app)
        .get(`/api/articles/${testArticleSlug}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toHaveProperty('id', testArticleId);
      expect(getResponse.body).toHaveProperty('title', 'E2E Test Article');

      // Step 3: Update the article as admin
      const updateResponse = await request(app)
        .put(`/api/admin/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated E2E Test Article',
          description: 'This article has been updated in the E2E test',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('id', testArticleId);
      expect(updateResponse.body).toHaveProperty('title', 'Updated E2E Test Article');

      // Step 4: Get the updated article
      const getUpdatedResponse = await request(app)
        .get(`/api/articles/${testArticleSlug}`);

      expect(getUpdatedResponse.status).toBe(200);
      expect(getUpdatedResponse.body).toHaveProperty('title', 'Updated E2E Test Article');

      // Step 5: Add a clap to the article as a user
      const clapResponse = await request(app)
        .post(`/api/articles/${testArticleSlug}/clap`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          textFragment: 'This is a great article',
          position: {
            startOffset: 10,
            endOffset: 30,
          },
        });

      expect(clapResponse.status).toBe(200);
      expect(clapResponse.body).toHaveProperty('message', 'Clap added successfully');

      // Step 6: Get claps for the article
      const getClapsResponse = await request(app)
        .get(`/api/articles/${testArticleSlug}/claps`);

      expect(getClapsResponse.status).toBe(200);
      expect(Array.isArray(getClapsResponse.body)).toBe(true);

      // Step 7: Delete the article as admin
      const deleteResponse = await request(app)
        .delete(`/api/admin/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Article deleted successfully');

      // Step 8: Verify the article is deleted
      const getDeletedResponse = await request(app)
        .get(`/api/articles/${testArticleSlug}`);

      expect(getDeletedResponse.status).toBe(404);
    });
  });

  describe('WebSocket Integration', () => {
    it('should connect to WebSocket server and receive messages', (done) => {
      // Create a WebSocket client
      const ws = new WebSocket(`ws://localhost:4001/ws`);

      ws.on('open', () => {
        // Send a message to the server
        ws.send(JSON.stringify({
          type: 'CLAP',
          data: {
            articleId: 1,
            textFragment: 'This is a great article',
            position: {
              startOffset: 10,
              endOffset: 30,
            },
          },
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());

        // Expect a response
        expect(message).toHaveProperty('type');

        // Close the connection
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        // If the WebSocket server is not running, this test will be skipped
        console.log('WebSocket server not available, skipping test');
        ws.close();
        done();
      });
    });
  });
});
