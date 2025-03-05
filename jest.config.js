/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.mjs$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(pdfjs-dist|video-metadata-thumbnails|mammoth)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
}; 