"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = void 0;
exports.processDocx = processDocx;
exports.processVideo = processVideo;
exports.processImage = processImage;
exports.processURL = processURL;
exports.isValidURL = isValidURL;
exports.formatDuration = formatDuration;
var pdfjsLib = require("pdfjs-dist");
var mammoth_1 = require("mammoth");
var video_metadata_thumbnails_1 = require("video-metadata-thumbnails");
var imageAnalysis_1 = require("./imageAnalysis");
var pdfUtils_1 = require("./pdfUtils");
Object.defineProperty(exports, "extractTextFromPDF", { enumerable: true, get: function () { return pdfUtils_1.extractTextFromPDF; } });
// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/".concat(pdfjsLib.version, "/pdf.worker.min.js");
function processDocx(file) {
    return __awaiter(this, void 0, void 0, function () {
        var arrayBuffer, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, file.arrayBuffer()];
                case 1:
                    arrayBuffer = _a.sent();
                    return [4 /*yield*/, mammoth_1.default.extractRawText({ arrayBuffer: arrayBuffer })];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.value.trim()];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error processing DOCX:', error_1);
                    throw new Error('Failed to process DOCX file');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function processVideo(file) {
    return __awaiter(this, void 0, void 0, function () {
        var objectUrl, thumbnailUrl, metadata, thumbnails, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    objectUrl = null;
                    thumbnailUrl = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    objectUrl = URL.createObjectURL(file);
                    return [4 /*yield*/, (0, video_metadata_thumbnails_1.getMetadata)(file)
                        // Generate thumbnail
                    ];
                case 2:
                    metadata = _b.sent();
                    return [4 /*yield*/, (0, video_metadata_thumbnails_1.getThumbnails)(file, {
                            quality: 0.6,
                            interval: 1000, // Get thumbnail at 1 second
                            scale: 0.25,
                            start: 0
                        })];
                case 3:
                    thumbnails = _b.sent();
                    if (!((_a = thumbnails[0]) === null || _a === void 0 ? void 0 : _a.blob)) {
                        throw new Error('Failed to generate video thumbnail');
                    }
                    // Convert the first thumbnail to a Blob using its blob property
                    thumbnailUrl = URL.createObjectURL(thumbnails[0].blob);
                    return [2 /*return*/, {
                            duration: metadata.duration,
                            thumbnailUrl: thumbnailUrl,
                            metadata: metadata
                        }];
                case 4:
                    error_2 = _b.sent();
                    if (objectUrl) {
                        URL.revokeObjectURL(objectUrl);
                    }
                    if (thumbnailUrl) {
                        URL.revokeObjectURL(thumbnailUrl);
                    }
                    console.error('Error processing video:', error_2);
                    throw new Error('Failed to process video file');
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processImage(file) {
    return __awaiter(this, void 0, void 0, function () {
        var MAX_FILE_SIZE, objectUrl, base64Data, matches, _, mimeType, content, base64Size, analysis, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        console.error('Invalid file type:', file.type);
                        throw new Error("Invalid file type: ".concat(file.type, ". Only image files are supported."));
                    }
                    MAX_FILE_SIZE = 10 * 1024 * 1024;
                    if (file.size > MAX_FILE_SIZE) {
                        console.error('File too large:', file.size);
                        throw new Error("File is too large: ".concat((file.size / (1024 * 1024)).toFixed(2), "MB. Maximum size is 10MB."));
                    }
                    objectUrl = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Validate file exists and is not empty
                    if (!file.size) {
                        console.error('Empty file detected');
                        throw new Error('File is empty');
                    }
                    console.log('Processing image:', {
                        name: file.name,
                        type: file.type,
                        size: "".concat((file.size / 1024).toFixed(2), "KB")
                    });
                    // Create object URL for display first
                    objectUrl = URL.createObjectURL(file);
                    if (!objectUrl) {
                        console.error('Failed to create object URL');
                        throw new Error('Failed to create object URL for image');
                    }
                    // Convert image to base64 data URL using FileReader
                    console.log('Starting base64 conversion...');
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onloadstart = function () { return console.log('FileReader: Started loading file'); };
                            reader.onprogress = function (event) {
                                if (event.lengthComputable) {
                                    console.log("FileReader: Progress ".concat(Math.round((event.loaded / event.total) * 100), "%"));
                                }
                            };
                            reader.onload = function () {
                                console.log('FileReader: File loaded successfully');
                                if (typeof reader.result === 'string') {
                                    var result = reader.result;
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
                            reader.onerror = function (error) {
                                console.error('FileReader error:', error);
                                reject(new Error("Failed to read file: ".concat(error)));
                            };
                            reader.onabort = function () {
                                console.error('FileReader aborted');
                                reject(new Error('File reading was aborted'));
                            };
                            reader.readAsDataURL(file);
                        })];
                case 2:
                    base64Data = _a.sent();
                    // Additional base64 validation
                    if (!base64Data || typeof base64Data !== 'string') {
                        console.error('Invalid base64 data type:', typeof base64Data);
                        throw new Error('Invalid base64 data format');
                    }
                    // Validate base64 content
                    try {
                        matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (!matches || matches.length !== 3) {
                            throw new Error('Invalid base64 format');
                        }
                        _ = matches[0], mimeType = matches[1], content = matches[2];
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
                    base64Size = base64Data.length * 0.75;
                    console.log('Base64 size:', "".concat((base64Size / 1024).toFixed(2), "KB"));
                    // Get image analysis from OpenAI using base64 data
                    console.log('Sending image for analysis...');
                    return [4 /*yield*/, (0, imageAnalysis_1.analyzeImage)(base64Data)];
                case 3:
                    analysis = _a.sent();
                    console.log('Analysis received:', analysis ? 'success' : 'empty');
                    if (!analysis) {
                        console.error('Empty analysis result');
                        throw new Error('Image analysis returned empty result');
                    }
                    return [2 /*return*/, {
                            url: objectUrl,
                            description: analysis
                        }];
                case 4:
                    error_3 = _a.sent();
                    if (objectUrl) {
                        console.log('Cleaning up object URL');
                        URL.revokeObjectURL(objectUrl);
                    }
                    console.error('Error processing image:', error_3 instanceof Error ? {
                        message: error_3.message,
                        stack: error_3.stack
                    } : error_3);
                    // Handle specific error types
                    if (error_3 instanceof Error) {
                        errorMessage = error_3.message;
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
                            throw new Error("Failed to read image file: ".concat(errorMessage));
                        }
                        if (errorMessage.includes('Invalid image format')) {
                            throw new Error("Invalid image format: ".concat(file.type, ". Please try a different image."));
                        }
                        throw new Error("Failed to process image: ".concat(errorMessage));
                    }
                    throw new Error('Failed to process image');
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processURL(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, text, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    text = _a.sent();
                    return [2 /*return*/, "Content from URL (".concat(url, "):\n\n").concat(text)];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error fetching URL:', error_4);
                    throw new Error('Failed to fetch URL content');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function isValidURL(str) {
    try {
        new URL(str);
        return true;
    }
    catch (_a) {
        return false;
    }
}
function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    if (hours > 0) {
        return "".concat(hours, ":").concat(minutes.toString().padStart(2, '0'), ":").concat(remainingSeconds.toString().padStart(2, '0'));
    }
    return "".concat(minutes, ":").concat(remainingSeconds.toString().padStart(2, '0'));
}
