import request from 'supertest';
import { createTestApp } from './setup';
import authRoutes from '../../routes/auth';
import { inMemoryDb } from '../mocks/betterDbMock';
import crypto from 'crypto';

describe('Auth API Integration Tests', () => {
  const app = createTestApp();
  
  // Register auth routes
  app.use('/api/auth', authRoutes);
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();
    });
    
    it('should return 400 if email is already in use', async () => {
      // First, create a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User',
        });
      
      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Another',
          lastName: 'User',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Missing',
          lastName: 'Fields',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // First, create a user with a known password
      const email = 'logintest@example.com';
      const password = 'password123';
      
      // Create a password hash
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Create a user in the in-memory database
      inMemoryDb.createUser({
        email,
        password: passwordWithSalt,
        firstName: 'Login',
        lastName: 'Test',
        role: 'user',
        isActive: true,
      });
      
      // Now try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();
    });
    
    it('should return 401 if credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should logout a user', async () => {
      // First, login to get a token
      const email = 'logouttest@example.com';
      const password = 'password123';
      
      // Create a password hash
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Create a user in the in-memory database
      inMemoryDb.createUser({
        email,
        password: passwordWithSalt,
        firstName: 'Logout',
        lastName: 'Test',
        role: 'user',
        isActive: true,
      });
      
      // Login to get a token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password,
        });
      
      const token = loginResponse.body.token;
      
      // Now logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
});
