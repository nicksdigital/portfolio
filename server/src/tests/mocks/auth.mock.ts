import { mockUsers } from '../testUtils';

// Mock the auth middleware
jest.mock('../../middleware/auth', () => {
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
