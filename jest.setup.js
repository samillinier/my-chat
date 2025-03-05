// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Mock TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Blob
global.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
}; 