module.exports = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>/test'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '.d.ts', '.js'],
}
