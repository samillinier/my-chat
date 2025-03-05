"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDocx = processDocx;
exports.processVideo = processVideo;
exports.processImage = processImage;
exports.processURL = processURL;
exports.isValidURL = isValidURL;
exports.formatDuration = formatDuration;
const pdfjsLib = __importStar(require("pdfjs-dist"));
const mammoth_1 = __importDefault(require("mammoth"));
const video_metadata_thumbnails_1 = require("video-metadata-thumbnails");
const imageAnalysis_1 = require("./imageAnalysis");
// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
async function processDocx(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth_1.default.extractRawText({ arrayBuffer });
        return result.value.trim();
    }
    catch (error) {
        console.error('Error processing DOCX:', error);
        throw new Error('Failed to process DOCX file');
    }
}
async function processVideo(file) {
    let objectUrl = null;
    let thumbnailUrl = null;
    try {
        objectUrl = URL.createObjectURL(file);
        // Get video metadata
        const metadata = await (0, video_metadata_thumbnails_1.getMetadata)(file);
        // Generate thumbnail
        const thumbnails = await (0, video_metadata_thumbnails_1.getThumbnails)(file, {
            quality: 0.6,
            interval: 1000, // Get thumbnail at 1 second
            scale: 0.25,
            start: 0
        });
        if (!thumbnails[0]?.blob) {
            throw new Error('Failed to generate video thumbnail');
        }
        // Convert the first thumbnail to a Blob using its blob property
        thumbnailUrl = URL.createObjectURL(thumbnails[0].blob);
        return {
            duration: metadata.duration,
            thumbnailUrl,
            metadata
        };
    }
    catch (error) {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        if (thumbnailUrl) {
            URL.revokeObjectURL(thumbnailUrl);
        }
        console.error('Error processing video:', error);
        throw new Error('Failed to process video file');
    }
}
async function processImage(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        throw new Error(`Invalid file type: ${file.type}. Only image files are supported.`);
    }
    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
        console.error('File too large:', file.size);
        throw new Error(`File is too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 10MB.`);
    }
    let objectUrl = null;
    try {
        // Validate file exists and is not empty
        if (!file.size) {
            console.error('Empty file detected');
            throw new Error('File is empty');
        }
        console.log('Processing image:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / 1024).toFixed(2)}KB`
        });
        // Create object URL for display first
        objectUrl = URL.createObjectURL(file);
        if (!objectUrl) {
            console.error('Failed to create object URL');
            throw new Error('Failed to create object URL for image');
        }
        // Convert image to base64 data URL using FileReader
        console.log('Starting base64 conversion...');
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadstart = () => console.log('FileReader: Started loading file');
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    console.log(`FileReader: Progress ${Math.round((event.loaded / event.total) * 100)}%`);
                }
            };
            reader.onload = () => {
                console.log('FileReader: File loaded successfully');
                if (typeof reader.result === 'string') {
                    const result = reader.result;
                    // Validate base64 format
                    if (!result.startsWith('data:image/')) {
                        reject(new Error('Invalid base64 image format'));
                        return;
                    }
                    // Log base64 data length and first few characters
                    console.log('Base64 data length:', result.length);
                    console.log('Base64 data prefix:', result.substring(0, 50));
                    resolve(result);
                }
                else {
                    reject(new Error('FileReader result is not a string'));
                }
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(new Error(`Failed to read file: ${error}`));
            };
            reader.onabort = () => {
                console.error('FileReader aborted');
                reject(new Error('File reading was aborted'));
            };
            reader.readAsDataURL(file);
        });
        // Additional base64 validation
        if (!base64Data || typeof base64Data !== 'string') {
            console.error('Invalid base64 data type:', typeof base64Data);
            throw new Error('Invalid base64 data format');
        }
        // Validate base64 content
        try {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 format');
            }
            const [_, mimeType, content] = matches;
            if (!mimeType.startsWith('image/')) {
                throw new Error('Invalid mime type');
            }
            // Try to decode a small portion to validate base64
            atob(content.slice(0, 100));
        }
        catch (e) {
            console.error('Base64 validation failed:', e);
            throw new Error('Invalid image data format');
        }
        const base64Size = base64Data.length * 0.75; // Approximate size in bytes
        console.log('Base64 size:', `${(base64Size / 1024).toFixed(2)}KB`);
        // Get image analysis from OpenAI using base64 data
        console.log('Sending image for analysis...');
        const analysis = await (0, imageAnalysis_1.analyzeImage)(base64Data);
        console.log('Analysis received:', analysis ? 'success' : 'empty');
        if (!analysis) {
            console.error('Empty analysis result');
            throw new Error('Image analysis returned empty result');
        }
        return {
            url: objectUrl,
            description: analysis
        };
    }
    catch (error) {
        if (objectUrl) {
            console.log('Cleaning up object URL');
            URL.revokeObjectURL(objectUrl);
        }
        console.error('Error processing image:', error instanceof Error ? {
            message: error.message,
            stack: error.stack
        } : error);
        // Handle specific error types
        if (error instanceof Error) {
            const errorMessage = error.message;
            if (errorMessage.includes('API rate limit')) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (errorMessage.includes('quota exceeded')) {
                throw new Error('API quota exceeded. Please try again later.');
            }
            if (errorMessage.includes('configuration error')) {
                throw new Error('Server configuration error. Please contact support.');
            }
            if (errorMessage.includes('Failed to read file')) {
                throw new Error(`Failed to read image file: ${errorMessage}`);
            }
            if (errorMessage.includes('Invalid image format')) {
                throw new Error(`Invalid image format: ${file.type}. Please try a different image.`);
            }
            throw new Error(`Failed to process image: ${errorMessage}`);
        }
        throw new Error('Failed to process image');
    }
}
async function processURL(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        return `Content from URL (${url}):\n\n${text}`;
    }
    catch (error) {
        console.error('Error fetching URL:', error);
        throw new Error('Failed to fetch URL content');
    }
}
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    }
    catch {
        return false;
    }
}
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
