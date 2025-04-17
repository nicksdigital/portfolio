import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/portfoliodb';

// Create a postgres client
const sql = postgres(connectionString, { max: 1 });

// Create a drizzle client
const db = drizzle(sql);

// Run migrations
async function runMigrations() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await sql.end();
  }
}

runMigrations();
