import type {Config} from 'jest';

const config: Config = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['dotenv/config', '<rootDir>/src/test_setup.ts'],
  testMatch: ['**/*.test.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true
};

export default config;
