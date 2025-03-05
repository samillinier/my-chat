import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock File class for Node.js environment
class File {
  constructor(buffer, name, type) {
    this.buffer = buffer;
    this.name = name;
    this.type = type;
    this.arrayBuffer = () => Promise.resolve(buffer);
  }
}

async function runTests() {
  try {
    console.log('Starting tests...');

    // Test PDF processing
    console.log('\nTesting PDF processing:');
    const pdfPath = join(__dirname, 'test.pdf');
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfFile = new File(pdfBuffer, 'test.pdf', 'application/pdf');
    
    const { extractTextFromPDF } = await import('../src/utils/pdfUtils.js');
    try {
      const pdfText = await extractTextFromPDF(pdfFile);
      console.log('PDF text extracted successfully:', pdfText.substring(0, 100) + '...');
    } catch (error) {
      console.error('PDF processing error:', error);
    }

    // Test image processing
    console.log('\nTesting image processing:');
    const imagePath = join(__dirname, 'test.jpg');
    const imageBuffer = await fs.readFile(imagePath);
    const imageFile = new File(imageBuffer, 'test.jpg', 'image/jpeg');
    
    const { processImage } = await import('../src/utils/contentProcessing.js');
    try {
      const imageAnalysis = await processImage(imageFile);
      console.log('Image processed successfully:', imageAnalysis);
    } catch (error) {
      console.error('Image processing error:', error);
    }

  } catch (error) {
    console.error('Test execution error:', error);
  }
}

runTests().catch(console.error);
