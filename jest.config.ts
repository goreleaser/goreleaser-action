module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['dotenv/config', '<rootDir>/src/test_setup.ts'],
  testMatch: ['**/*.test.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
};
