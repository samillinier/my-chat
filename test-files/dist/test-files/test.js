"use strict";
const fs = require('fs');
const path = require('path');
const { processImage } = require('../src/utils/contentProcessing');
const { extractTextFromPDF } = require('../src/utils/pdfUtils');
async function runTests() {
    console.log('Starting tests...\n');
    // Test PDF processing
    console.log('Testing PDF processing...');
    try {
        const pdfBuffer = fs.readFileSync(path.join(__dirname, 'test.pdf'));
        const pdfFile = new File([pdfBuffer], 'test.pdf', { type: 'application/pdf' });
        const pdfText = await extractTextFromPDF(pdfFile);
        console.log('PDF processing successful:', pdfText.substring(0, 100) + '...');
    }
    catch (error) {
        console.error('PDF processing failed:', error);
    }
    // Test image processing
    console.log('\nTesting image processing...');
    try {
        const imageBuffer = fs.readFileSync(path.join(__dirname, 'test.jpg'));
        const imageFile = new File([imageBuffer], 'test.jpg', { type: 'image/jpeg' });
        const imageResult = await processImage(imageFile);
        console.log('Image processing successful:', imageResult);
    }
    catch (error) {
        console.error('Image processing failed:', error);
    }
}
runTests().catch(console.error);
