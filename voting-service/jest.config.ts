import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/index.ts', // only includes injection setup, which is impossible to properly mock
    '<rootDir>/services/config.ts', // only includes switches based on environment variables
  ],
  slowTestThreshold: 0.5,
  verbose: true,
};
export default config;
