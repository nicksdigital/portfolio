// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '4001'; // Use a different port for tests
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);
