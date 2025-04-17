import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const JWT_SECRET = 'test-jwt-secret';
  
  describe('Token Generation and Verification', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 1, role: 'admin' };
      
      // Generate token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      
      // Verify token format
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header, payload, signature
    });
    
    it('should verify a valid token', () => {
      const payload = { userId: 1, role: 'admin' };
      
      // Generate token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string; iat: number; exp: number };
      
      expect(decoded).toHaveProperty('userId', 1);
      expect(decoded).toHaveProperty('role', 'admin');
      expect(decoded).toHaveProperty('iat'); // Issued at
      expect(decoded).toHaveProperty('exp'); // Expiration
    });
    
    it('should reject an expired token', () => {
      const payload = { userId: 1, role: 'admin' };
      
      // Generate token that expires immediately
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });
      
      // Wait a moment to ensure the token is expired
      setTimeout(() => {
        // Verify token
        expect(() => {
          jwt.verify(token, JWT_SECRET);
        }).toThrow('jwt expired');
      }, 100);
    });
    
    it('should reject a token with invalid signature', () => {
      const payload = { userId: 1, role: 'admin' };
      
      // Generate token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      
      // Verify token with wrong secret
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow('invalid signature');
    });
  });
});
