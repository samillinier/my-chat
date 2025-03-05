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
exports.analyzeImage = analyzeImage;
function analyzeImage(imageUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, responseText, error_1, e, errorMessage, error_2, err;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    console.log('Making request to analyze image...');
                    // Validate input
                    if (!imageUrl || typeof imageUrl !== 'string') {
                        console.error('Invalid imageUrl:', imageUrl);
                        throw new Error('Invalid image data provided');
                    }
                    // Log request details (without the actual image data)
                    console.log('Request details:', {
                        method: 'POST',
                        contentType: 'application/json',
                        dataLength: imageUrl.length,
                        isBase64: imageUrl.startsWith('data:image/')
                    });
                    return [4 /*yield*/, fetch('/api/analyze-image', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ imageUrl: imageUrl }),
                        })];
                case 1:
                    response = _b.sent();
                    // Log raw response details before parsing
                    console.log('Raw response details:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok,
                        headers: Object.fromEntries(response.headers.entries())
                    });
                    data = void 0;
                    responseText = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.text()];
                case 3:
                    // First try to get the raw text
                    responseText = _b.sent();
                    console.log('Raw response text:', responseText);
                    // Then parse it as JSON if possible
                    try {
                        data = JSON.parse(responseText);
                    }
                    catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        throw new Error("Invalid JSON response: ".concat(responseText.substring(0, 100), "..."));
                    }
                    console.log('Parsed response data:', {
                        status: response.status,
                        ok: response.ok,
                        hasData: !!data,
                        hasError: !!(data === null || data === void 0 ? void 0 : data.error),
                        hasAnalysis: !!(data === null || data === void 0 ? void 0 : data.analysis),
                        dataKeys: data ? Object.keys(data) : []
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    e = error_1;
                    console.error('Error reading response:', e);
                    throw new Error("Failed to read server response: ".concat(e.message));
                case 5:
                    if (!response.ok) {
                        // Log detailed error information
                        console.error('API error details:', {
                            status: response.status,
                            statusText: response.statusText,
                            responseText: responseText,
                            parsedData: data,
                            headers: Object.fromEntries(response.headers.entries())
                        });
                        errorMessage = (data === null || data === void 0 ? void 0 : data.error) || responseText || "Server error (".concat(response.status, ": ").concat(response.statusText, ")");
                        throw new Error(errorMessage);
                    }
                    if (!data) {
                        console.error('Empty response data');
                        throw new Error('Empty response from server');
                    }
                    if (!data.analysis) {
                        console.error('Response data without analysis:', data);
                        throw new Error('No analysis received from server');
                    }
                    // Log success (without the actual analysis content)
                    console.log('Analysis received successfully:', {
                        length: data.analysis.length,
                        hasContent: data.analysis.length > 0,
                        snippet: data.analysis.substring(0, 50) + '...'
                    });
                    return [2 /*return*/, data.analysis];
                case 6:
                    error_2 = _b.sent();
                    err = error_2;
                    console.error('Error in analyzeImage:', {
                        name: err === null || err === void 0 ? void 0 : err.name,
                        message: err === null || err === void 0 ? void 0 : err.message,
                        stack: err === null || err === void 0 ? void 0 : err.stack,
                        isError: error_2 instanceof Error,
                        errorType: (_a = err === null || err === void 0 ? void 0 : err.constructor) === null || _a === void 0 ? void 0 : _a.name,
                        errorKeys: error_2 ? Object.keys(error_2) : []
                    });
                    if (error_2 instanceof Error) {
                        // Network errors
                        if (error_2.message.includes('Failed to fetch')) {
                            throw new Error('Network error: Could not connect to the server. Please check your internet connection.');
                        }
                        // Server configuration errors
                        if (error_2.message.includes('API key')) {
                            throw new Error('Server configuration error: The API is not properly configured. Please contact support.');
                        }
                        // Rate limiting and quota errors
                        if (error_2.message.includes('rate limit') || error_2.message.includes('quota exceeded')) {
                            throw new Error('Service temporarily unavailable: Too many requests. Please try again in a few minutes.');
                        }
                        // Invalid image errors
                        if (error_2.message.includes('Invalid image') || error_2.message.includes('corrupted')) {
                            throw new Error('Invalid image: The image file may be corrupted or in an unsupported format. Please try a different image.');
                        }
                        // Size limit errors
                        if (error_2.message.includes('size exceeds')) {
                            throw new Error('Image too large: Please use an image smaller than 10MB.');
                        }
                        // JSON parsing errors
                        if (error_2.message.includes('Invalid JSON')) {
                            throw new Error('Server returned invalid data. Please try again or contact support if the issue persists.');
                        }
                        // Preserve the original error message for other cases
                        throw error_2;
                    }
                    // Generic error for non-Error objects
                    throw new Error('Failed to analyze image: An unexpected error occurred. Please try again.');
                case 7: return [2 /*return*/];
            }
        });
    });
}
