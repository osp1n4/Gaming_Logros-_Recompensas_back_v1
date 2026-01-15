module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.e2e.spec.ts', '**/*.contract.spec.ts', '**/*.resilience.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
  testTimeout: 60000, // 60 segundos para tests E2E
};
