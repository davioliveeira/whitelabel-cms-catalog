// =============================================================================
// Jest Configuration - Admin App
// =============================================================================

module.exports = {
  displayName: 'admin',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@repo/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@radix-ui)/)',
  ],
};
