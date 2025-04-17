import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema';
import { articles, tags, articleTags } from './schema';

// Load environment variables
dotenv.config();

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}


// @ts-ignore
const pool = new Pool({
  connectionString,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
});
 
const db = drizzle(pool, { schema: { articles, tags, articleTags } });



if (!pool) {
  throw new Error('Failed to create Drizzle client');
}
else {
  console.log('Drizzle client created successfully');
}
// Export the pool for raw queries



export { db};

// Export the schema
export { schema };
