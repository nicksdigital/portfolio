const crypto = require('crypto');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portfolio'
});

async function createTestUser() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (existingUser.rows.length > 0) {
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
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role`,
      ['admin@example.com', passwordWithSalt, 'Admin', 'User', 'admin', true]
    );
    
    console.log('Test user created:', result.rows[0]);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
