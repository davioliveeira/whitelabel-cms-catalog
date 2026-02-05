// =============================================================================
// Jest Configuration - Shared Library
// =============================================================================

module.exports = {
  displayName: 'shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
