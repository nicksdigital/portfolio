import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Mock user data
const mockUser = {
  id: 1,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
};

// Create a simple auth route for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === mockUser.email && password === 'password123') {
    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id, role: mockUser.role },
      'test-secret',
      { expiresIn: '1h' }
    );
    
    return res.status(200).json({
      user: mockUser,
      token,
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Create a simple register route for testing
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === mockUser.email) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: 2, role: 'user' },
    'test-secret',
    { expiresIn: '1h' }
  );
  
  return res.status(201).json({
    user: {
      id: 2,
      email,
      firstName,
      lastName,
      role: 'user',
      isActive: true,
    },
    token,
  });
});

// Create a simple logout route for testing
app.post('/api/auth/logout', (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
});

describe('Auth API Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();
    });
    
    it('should return 401 if credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
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
    
    it('should return 400 if user already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          firstName: 'Admin',
          lastName: 'User',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should logout a user', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
});
