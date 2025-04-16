import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// In ESM, we need to create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// This script runs the migrations
async function runMigrations() {
  // Get the database connection string from environment variables
  const connectionString = process.env.DATABASE_URL;

  // Check if the connection string is defined
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  // Create a connection pool
  const pool = new Pool({
    connectionString,
  });

  // Create a Drizzle client
  const db = drizzle(pool);

  // Run the migrations
  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: path.join(__dirname, 'migrations'),
  });

  console.log('Migrations completed successfully!');

  process.exit(0);
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
