module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: [
    "dotenv/config",
    "<rootDir>/src/test_setup.ts"
  ],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: false
}
