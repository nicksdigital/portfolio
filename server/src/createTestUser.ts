import crypto from 'crypto';
import { db } from './db';
import { users } from './db/schema';

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@example.com')
    });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto
      .pbkdf2Sync('password123', salt, 1000, 64, 'sha512')
      .toString('hex');
    const passwordWithSalt = `${salt}:${hashedPassword}`;
    
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: 'admin@example.com',
        password: passwordWithSalt,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      })
      .returning();
    
    console.log('Test user created:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
