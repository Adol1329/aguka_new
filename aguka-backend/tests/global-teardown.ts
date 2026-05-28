import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async () => {
  console.log('Cleaning up test database...');

  try {
    // Delete test database file if using SQLite
    if (process.env.DATABASE_URL?.includes('test.db')) {
      await execPromise('del "F:\\Aguka Smart Framing Kit\\aguka-backend\\test.db" 2>nul');
    }
    console.log('Test database cleanup complete');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
};
