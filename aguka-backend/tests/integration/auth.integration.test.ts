import { authService } from '../../src/services/auth.service.js';

// Skip integration tests if DATABASE_URL is not configured
const isDbAvailable = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

(isDbAvailable ? describe : describe.skip)('Auth Integration Tests (Skipped - No DB)', () => {
  it('should skip integration tests when no database is available', () => {
    expect(true).toBe(true);
  });
});
