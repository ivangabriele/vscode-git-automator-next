module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src', '<rootDir>/test/unit'],
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
};
