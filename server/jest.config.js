/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  testMatch: ["**/**/*.test.ts"],
  detectOpenHandles: true,
  testTimeout: 60000
};