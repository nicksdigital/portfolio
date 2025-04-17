import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { mockDb } from '../mocks/betterDbMock';

// Mock the database
jest.mock('../../db', () => {
  return { db: mockDb };
});

// Mock the auth middleware
jest.mock('../../middleware/auth', () => {
  return {
    authenticate: jest.fn((req, res, next) => {
      // Check if Authorization header is present
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Extract token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Set user on request
      req.user = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      };
      
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

// Create a test app
export function createTestApp() {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
}
