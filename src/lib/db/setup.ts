import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Run migrations
    console.log('Running migrations...');
    await execPromise('npm run db:migrate');
    console.log('Migrations completed successfully.');
    
    // Run seed
    console.log('Seeding database...');
    await execPromise('npm run db:seed');
    console.log('Database seeding completed successfully.');
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
