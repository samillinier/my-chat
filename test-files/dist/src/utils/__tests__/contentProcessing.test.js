"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contentProcessing_1 = require("../contentProcessing");
// Mock File implementation
class MockFile {
    constructor(content, name, options) {
        this.webkitRelativePath = '';
        this._content = content.join('');
        this.name = name;
        this.type = options.type;
        this.size = options.size || this._content.length;
        this.lastModified = options.lastModified || Date.now();
    }
    async arrayBuffer() {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(this._content);
        return uint8Array.buffer;
    }
    async bytes() {
        const encoder = new TextEncoder();
        return encoder.encode(this._content);
    }
    async text() {
        return this._content;
    }
    slice(start, end, contentType) {
        const slicedContent = this._content.slice(start, end);
        return new MockFile([slicedContent], this.name, {
            type: contentType || this.type,
            size: slicedContent.length,
            lastModified: this.lastModified
        });
    }
    stream() {
        const content = this._content;
        const encoder = new TextEncoder();
        return new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(content));
                controller.close();
            }
        });
    }
    get [Symbol.toStringTag]() {
        return 'File';
    }
}
// Mock the dependencies
jest.mock('pdfjs-dist', () => ({
    getDocument: jest.fn(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: jest.fn(() => Promise.resolve({
                getTextContent: jest.fn(() => Promise.resolve({
                    items: [{ str: 'Test PDF content' }]
                }))
            }))
        })
    })),
    GlobalWorkerOptions: {
        workerSrc: ''
    }
}));
jest.mock('mammoth', () => ({
    extractRawText: jest.fn().mockResolvedValue({ value: 'Test DOCX content' })
}));
jest.mock('video-metadata-thumbnails', () => ({
    getMetadata: jest.fn(),
    getThumbnails: jest.fn()
}));
jest.mock('../imageAnalysis', () => ({
    analyzeImage: jest.fn()
}));
describe('Content Processing Utils', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset URL.createObjectURL and URL.revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
        // Replace global File constructor with our mock
        global.File = MockFile;
    });
    describe('processImage', () => {
        it('should process an image file correctly', async () => {
            const mockFile = new MockFile(['test image content'], 'test.jpg', {
                type: 'image/jpeg',
                size: 1024 // 1KB
            });
            const mockAnalysis = 'This is a test image';
            const { analyzeImage } = require('../imageAnalysis');
            analyzeImage.mockResolvedValue(mockAnalysis);
            const result = await (0, contentProcessing_1.processImage)(mockFile);
            expect(result).toEqual({
                url: 'mock-url',
                description: mockAnalysis
            });
            expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
        });
        it('should clean up object URL on error', async () => {
            const mockFile = new MockFile(['test image content'], 'test.jpg', {
                type: 'image/jpeg',
                size: 1024
            });
            const { analyzeImage } = require('../imageAnalysis');
            analyzeImage.mockRejectedValue(new Error('Analysis failed'));
            await expect((0, contentProcessing_1.processImage)(mockFile)).rejects.toThrow('Failed to process image');
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
        });
        it('should reject files that are too large', async () => {
            const mockFile = new MockFile(['large image content'], 'large.jpg', {
                type: 'image/jpeg',
                size: 15 * 1024 * 1024 // 15MB
            });
            await expect((0, contentProcessing_1.processImage)(mockFile)).rejects.toThrow('File is too large');
        });
    });
    describe('processVideo', () => {
        it('should process a video file correctly', async () => {
            const mockFile = new MockFile(['test video content'], 'test.mp4', {
                type: 'video/mp4',
                size: 1024 * 1024 // 1MB
            });
            const mockMetadata = { duration: 120 };
            const mockThumbnail = { blob: new Blob(['']) };
            const { getMetadata, getThumbnails } = require('video-metadata-thumbnails');
            getMetadata.mockResolvedValue(mockMetadata);
            getThumbnails.mockResolvedValue([mockThumbnail]);
            const result = await (0, contentProcessing_1.processVideo)(mockFile);
            expect(result).toEqual({
                duration: 120,
                thumbnailUrl: 'mock-url',
                metadata: mockMetadata
            });
            expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
        });
        afterEach(() => {
            // Clean up any remaining object URLs
            const createObjectURLCalls = URL.createObjectURL.mock.calls.length;
            const revokeObjectURLCalls = URL.revokeObjectURL.mock.calls.length;
            // If there are any uncleaned URLs, clean them up now
            if (createObjectURLCalls > revokeObjectURLCalls) {
                for (let i = 0; i < createObjectURLCalls - revokeObjectURLCalls; i++) {
                    URL.revokeObjectURL('mock-url');
                }
            }
        });
    });
    describe('extractTextFromPDF', () => {
        it('should extract text from multi-page PDF correctly', async () => {
            const pdfjsLib = require('pdfjs-dist');
            pdfjsLib.getDocument.mockImplementation(() => ({
                promise: Promise.resolve({
                    numPages: 2,
                    getPage: (pageNum) => Promise.resolve({
                        getTextContent: () => Promise.resolve({
                            items: [{ str: `Test PDF content page ${pageNum}` }]
                        })
                    })
                })
            }));
            const mockFile = new MockFile(['PDF content'], 'test.pdf', {
                type: 'application/pdf',
                size: 1024
            });
            const result = await (0, contentProcessing_1.extractTextFromPDF)(mockFile);
            expect(result).toContain('Test PDF content page 1');
            expect(result).toContain('Test PDF content page 2');
        });
        it('should handle password-protected PDFs', async () => {
            const pdfjsLib = require('pdfjs-dist');
            pdfjsLib.getDocument.mockImplementation(() => ({
                promise: Promise.reject(new Error('Password required'))
            }));
            const mockFile = new MockFile(['PDF content'], 'protected.pdf', {
                type: 'application/pdf',
                size: 1024
            });
            await expect((0, contentProcessing_1.extractTextFromPDF)(mockFile)).rejects.toThrow('Failed to extract text from PDF');
        });
    });
    describe('processDocx', () => {
        it('should process DOCX file correctly', async () => {
            const mockFile = new MockFile(['DOCX content'], 'test.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const result = await (0, contentProcessing_1.processDocx)(mockFile);
            expect(result).toBe('Test DOCX content');
        });
    });
    describe('formatDuration', () => {
        it('should format duration correctly', () => {
            expect((0, contentProcessing_1.formatDuration)(65)).toBe('1:05');
            expect((0, contentProcessing_1.formatDuration)(3665)).toBe('1:01:05');
            expect((0, contentProcessing_1.formatDuration)(45)).toBe('0:45');
        });
    });
    describe('isValidURL', () => {
        it('should validate URLs correctly', () => {
            expect((0, contentProcessing_1.isValidURL)('https://example.com')).toBe(true);
            expect((0, contentProcessing_1.isValidURL)('not-a-url')).toBe(false);
            expect((0, contentProcessing_1.isValidURL)('http://localhost:3000')).toBe(true);
        });
    });
    describe('processURL', () => {
        it('should fetch and process URL content', async () => {
            const mockResponse = 'Mock webpage content';
            global.fetch = jest.fn().mockResolvedValue({
                text: () => Promise.resolve(mockResponse)
            });
            const result = await (0, contentProcessing_1.processURL)('https://example.com');
            expect(result).toContain(mockResponse);
            expect(result).toContain('https://example.com');
        });
        it('should handle fetch errors', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
            await expect((0, contentProcessing_1.processURL)('https://example.com')).rejects.toThrow('Failed to fetch URL content');
        });
    });
});
