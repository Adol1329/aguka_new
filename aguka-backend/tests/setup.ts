// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.IOT_MASTER_SECRET = 'test-iot-secret';

// Global setup
beforeAll(async () => {
  // You can add database setup here
});

// Cleanup after each test
afterEach(async () => {
  // Add cleanup logic here
});
