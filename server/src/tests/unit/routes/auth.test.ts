import request from 'supertest';
import express from 'express';
import authRoutes from '../../../routes/auth';
import { mockUsers } from '../../testUtils';
import crypto from 'crypto';

// Mock the database
jest.mock('../../../db', () => {
  const mockDb = {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };
  
  return { db: mockDb };
});

// Import the mocked db
import { db } from '../../../db';

describe('Auth Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      // Mock db.query.users.findFirst to return null (user doesn't exist)
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock db.insert().values().returning() to return a new user
      (db.returning as jest.Mock).mockResolvedValue([{
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
      }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('token');
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalled();
      expect(db.returning).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      // Mock db.query.users.findFirst to return an existing user
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUsers.admin);

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
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
      
      // Verify that the database was not called
      expect(db.query.users.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('POST /login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a password hash
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync('password123', salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Mock db.query.users.findFirst to return a user with the hashed password
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        ...mockUsers.admin,
        password: passwordWithSalt,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', mockUsers.admin.id);
      expect(response.body.user).toHaveProperty('email', mockUsers.admin.email);
      expect(response.body).toHaveProperty('token');
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it('should return 401 if user does not exist', async () => {
      // Mock db.query.users.findFirst to return null (user doesn't exist)
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it('should return 401 if password is incorrect', async () => {
      // Create a password hash for a different password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync('different-password', salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Mock db.query.users.findFirst to return a user with the hashed password
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        ...mockUsers.admin,
        password: passwordWithSalt,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      // Create a password hash
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync('password123', salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Mock db.query.users.findFirst to return an inactive user
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        ...mockUsers.inactive,
        password: passwordWithSalt,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Account is inactive');
      
      // Verify that the database was called correctly
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });
  });
});
