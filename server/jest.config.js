/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/test/**/*.test.ts'],
  // This is important to allow Jest to find paths defined in tsconfig.json if any
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
