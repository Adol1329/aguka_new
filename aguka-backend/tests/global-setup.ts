import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async () => {
  console.log('Setting up test database...');

  // Run Prisma migrations for test database
  try {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';

    await execPromise('npx prisma migrate deploy --schema=prisma/schema.prisma');
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
};
