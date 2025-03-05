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
exports.extractTextFromPDF = extractTextFromPDF;
var pdfjsLib = require("pdfjs-dist");
// Initialize PDF.js worker
var workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/".concat(pdfjsLib.version, "/pdf.worker.min.js");
var workerInitialized = false;
function initializeWorker() {
    if (!workerInitialized) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        workerInitialized = true;
        console.log('PDF.js worker initialized');
    }
}
function extractTextFromPDF(file) {
    return __awaiter(this, void 0, void 0, function () {
        var arrayBuffer, pdf, fullText, i, page, textContent, pageText, result, error_1, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log('Starting PDF text extraction for:', file.name);
                    // Initialize worker if needed
                    initializeWorker();
                    // Validate file type
                    if (file.type !== 'application/pdf') {
                        throw new Error('Invalid file type. Expected PDF.');
                    }
                    // Convert file to ArrayBuffer
                    console.log('Converting PDF to ArrayBuffer...');
                    return [4 /*yield*/, file.arrayBuffer()];
                case 1:
                    arrayBuffer = _a.sent();
                    // Load the PDF document
                    console.log('Loading PDF document...');
                    return [4 /*yield*/, pdfjsLib.getDocument({ data: arrayBuffer }).promise];
                case 2:
                    pdf = _a.sent();
                    console.log("PDF loaded successfully. Pages: ".concat(pdf.numPages));
                    fullText = '';
                    i = 1;
                    _a.label = 3;
                case 3:
                    if (!(i <= pdf.numPages)) return [3 /*break*/, 7];
                    console.log("Processing page ".concat(i, " of ").concat(pdf.numPages, "..."));
                    return [4 /*yield*/, pdf.getPage(i)];
                case 4:
                    page = _a.sent();
                    return [4 /*yield*/, page.getTextContent()];
                case 5:
                    textContent = _a.sent();
                    pageText = textContent.items
                        .map(function (item) {
                        if ('str' in item) {
                            return item.str;
                        }
                        return '';
                    })
                        .join(' ');
                    fullText += "Page ".concat(i, ":\n").concat(pageText, "\n\n");
                    console.log("Page ".concat(i, " processed successfully"));
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 3];
                case 7:
                    result = fullText.trim();
                    console.log('PDF text extraction completed successfully');
                    return [2 /*return*/, result];
                case 8:
                    error_1 = _a.sent();
                    err = error_1;
                    console.error('Error extracting text from PDF:', {
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    });
                    if (error_1 instanceof Error) {
                        if (error_1.message.includes('Password required')) {
                            throw new Error('This PDF is password protected. Please provide an unprotected PDF.');
                        }
                        if (error_1.message.includes('Invalid PDF structure')) {
                            throw new Error('The PDF file appears to be corrupted. Please try a different file.');
                        }
                        if (error_1.message.includes('worker')) {
                            throw new Error('PDF processing service is not initialized. Please try again.');
                        }
                    }
                    throw new Error('Failed to extract text from PDF: ' + (error_1 instanceof Error ? error_1.message : 'Unknown error'));
                case 9: return [2 /*return*/];
            }
        });
    });
}
