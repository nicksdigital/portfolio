import crypto from 'crypto';

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash a password with crypto', () => {
      const password = 'password123';
      
      // Hash the password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Verify the password format
      expect(passwordWithSalt).toContain(':');
      const [storedSalt, storedHash] = passwordWithSalt.split(':');
      expect(storedSalt).toBeTruthy();
      expect(storedHash).toBeTruthy();
      expect(storedSalt.length).toBe(32); // 16 bytes as hex
      expect(storedHash.length).toBe(128); // 64 bytes as hex
    });
    
    it('should verify a password correctly', () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      
      // Hash the password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      const passwordWithSalt = `${salt}:${hashedPassword}`;
      
      // Verify the correct password
      const [storedSalt, storedHash] = passwordWithSalt.split(':');
      const hash = crypto
        .pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512')
        .toString('hex');
      const isPasswordValid = storedHash === hash;
      
      expect(isPasswordValid).toBe(true);
      
      // Verify the wrong password
      const wrongHash = crypto
        .pbkdf2Sync(wrongPassword, storedSalt, 1000, 64, 'sha512')
        .toString('hex');
      const isWrongPasswordValid = storedHash === wrongHash;
      
      expect(isWrongPasswordValid).toBe(false);
    });
  });
});
