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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
const pdfjsLib = __importStar(require("pdfjs-dist"));
// Initialize PDF.js worker
const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
let workerInitialized = false;
function initializeWorker() {
    if (!workerInitialized) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        workerInitialized = true;
        console.log('PDF.js worker initialized');
    }
}
async function extractTextFromPDF(file) {
    try {
        console.log('Starting PDF text extraction for:', file.name);
        // Initialize worker if needed
        initializeWorker();
        // Validate file type
        if (file.type !== 'application/pdf') {
            throw new Error('Invalid file type. Expected PDF.');
        }
        // Convert file to ArrayBuffer
        console.log('Converting PDF to ArrayBuffer...');
        const arrayBuffer = await file.arrayBuffer();
        // Load the PDF document
        console.log('Loading PDF document...');
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
        let fullText = '';
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Processing page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => {
                if ('str' in item) {
                    return item.str;
                }
                return '';
            })
                .join(' ');
            fullText += `Page ${i}:\n${pageText}\n\n`;
            console.log(`Page ${i} processed successfully`);
        }
        const result = fullText.trim();
        console.log('PDF text extraction completed successfully');
        return result;
    }
    catch (error) {
        const err = error;
        console.error('Error extracting text from PDF:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        if (error instanceof Error) {
            if (error.message.includes('Password required')) {
                throw new Error('This PDF is password protected. Please provide an unprotected PDF.');
            }
            if (error.message.includes('Invalid PDF structure')) {
                throw new Error('The PDF file appears to be corrupted. Please try a different file.');
            }
            if (error.message.includes('worker')) {
                throw new Error('PDF processing service is not initialized. Please try again.');
            }
        }
        throw new Error('Failed to extract text from PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
