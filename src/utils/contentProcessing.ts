import * as pdfjsLib from 'pdfjs-dist'
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'
import mammoth from 'mammoth'
import { getMetadata, getThumbnails } from 'video-metadata-thumbnails'
import { analyzeImage } from './imageAnalysis'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => 'str' in item ? item.str : '')
        .join(' ')
      fullText += `Page ${i}:\n${pageText}\n\n`
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function processDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value.trim()
  } catch (error) {
    console.error('Error processing DOCX:', error)
    throw new Error('Failed to process DOCX file')
  }
}

export async function processVideo(file: File): Promise<{ duration: number; thumbnailUrl: string; metadata: any }> {
  let objectUrl: string | null = null;
  let thumbnailUrl: string | null = null;
  try {
    objectUrl = URL.createObjectURL(file)
    
    // Get video metadata
    const metadata = await getMetadata(file)
    
    // Generate thumbnail
    const thumbnails = await getThumbnails(file, {
      quality: 0.6,
      interval: 1000, // Get thumbnail at 1 second
      scale: 0.25,
      start: 0
    })

    if (!thumbnails[0]?.blob) {
      throw new Error('Failed to generate video thumbnail')
    }

    // Convert the first thumbnail to a Blob using its blob property
    thumbnailUrl = URL.createObjectURL(thumbnails[0].blob)
    
    return {
      duration: metadata.duration,
      thumbnailUrl,
      metadata
    }
  } catch (error) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl)
    }
    console.error('Error processing video:', error)
    throw new Error('Failed to process video file')
  }
}

export async function processImage(file: File): Promise<{ url: string; description: string }> {
  // Log initial file details
  console.log('Starting image processing for file:', {
    name: file.name,
    type: file.type,
    size: Math.round(file.size / 1024) + 'KB',
    lastModified: new Date(file.lastModified).toISOString(),
    isPNG: file.type === 'image/png'
  });

  try {
    // Special handling for PNG files
    if (file.type === 'image/png') {
      console.log('Processing PNG file...');
      
      // Validate PNG signature
      const buffer = await file.arrayBuffer();
      const header = new Uint8Array(buffer.slice(0, 8));
      const isPNG = header[0] === 0x89 && 
                   header[1] === 0x50 && // P
                   header[2] === 0x4E && // N
                   header[3] === 0x47 && // G
                   header[4] === 0x0D && // CR
                   header[5] === 0x0A && // LF
                   header[6] === 0x1A && // EOF
                   header[7] === 0x0A;   // LF
                   
      if (!isPNG) {
        console.error('Invalid PNG file format');
        throw new Error('Invalid PNG file format. The file appears to be corrupted.');
      }
      console.log('PNG signature validation passed');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      throw new Error(`Invalid file type: ${file.type}. Only image files are supported.`)
    }

    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.error('File too large:', sizeMB + 'MB');
      throw new Error(`File is too large: ${sizeMB}MB. Maximum size is 10MB.`)
    }

    let objectUrl: string | null = null;
    try {
      // Validate file exists and is not empty
      if (!file.size) {
        console.error('Empty file detected');
        throw new Error('File is empty')
      }

      // Create object URL for display first
      console.log('Creating object URL...');
      objectUrl = URL.createObjectURL(file)
      if (!objectUrl) {
        console.error('Failed to create object URL');
        throw new Error('Failed to create object URL for image')
      }
      console.log('Object URL created successfully:', objectUrl.substring(0, 100));

      // Convert image to base64 data URL using FileReader
      console.log('Converting image to base64...');
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onloadstart = () => console.log('FileReader: Started loading file');
        
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            console.log(`FileReader: Progress ${Math.round((event.loaded / event.total) * 100)}%`);
          }
        };
        
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const result = reader.result;
            // Log base64 data details
            console.log('Base64 conversion details:', {
              length: result.length,
              startsWithDataImage: result.startsWith('data:image/'),
              mimeType: result.split(';')[0].split(':')[1],
              isBase64Encoded: result.includes(';base64,'),
              samplePrefix: result.substring(0, 50)
            });
            resolve(result);
          } else {
            console.error('FileReader result is not a string:', typeof reader.result);
            reject(new Error('Failed to convert image to base64'));
          }
        };
        
        reader.onerror = (error) => {
          console.error('FileReader error:', {
            error,
            type: error.type,
            target: error.target
          });
          reject(new Error(`Failed to read file: ${error.type}`));
        };
        
        reader.onabort = () => {
          console.error('FileReader aborted');
          reject(new Error('File reading was aborted'));
        };
        
        reader.readAsDataURL(file);
      });

      // Validate base64 data
      if (!base64Data || !base64Data.startsWith('data:image/')) {
        console.error('Invalid base64 data format:', {
          hasData: !!base64Data,
          startsCorrectly: base64Data?.startsWith('data:image/'),
          length: base64Data?.length
        });
        throw new Error('Invalid image data format')
      }
      
      // Get image analysis from OpenAI using base64 data
      console.log('Sending image for analysis...');
      const analysis = await analyzeImage(base64Data)
      console.log('Analysis response details:', {
        received: !!analysis,
        length: analysis?.length || 0,
        isString: typeof analysis === 'string'
      });

      if (!analysis) {
        console.error('Empty analysis result');
        throw new Error('Image analysis returned empty result')
      }

      return {
        url: objectUrl,
        description: analysis
      }
    } catch (error) {
      if (objectUrl) {
        console.log('Cleaning up object URL');
        URL.revokeObjectURL(objectUrl)
      }
      throw error;
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Error in processImage:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      }
    });
    
    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage.includes('API rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.')
      }
      if (errorMessage.includes('quota exceeded')) {
        throw new Error('API quota exceeded. Please try again later.')
      }
      if (errorMessage.includes('configuration error')) {
        throw new Error('Server configuration error. Please contact support.')
      }
      if (errorMessage.includes('Failed to read file')) {
        throw new Error(`Failed to read image file: ${errorMessage}`)
      }
      if (errorMessage.includes('Invalid image format')) {
        throw new Error(`Invalid image format: ${file.type}. Please try a different image.`)
      }
      if (errorMessage.includes('PNG')) {
        throw new Error(`PNG processing error: ${errorMessage}. Please ensure the file is a valid PNG image.`)
      }
      throw new Error(`Failed to process image: ${errorMessage}`)
    }
    
    throw new Error('Failed to process image')
  }
}

export async function processURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const text = await response.text()
    return `Content from URL (${url}):\n\n${text}`
  } catch (error) {
    console.error('Error fetching URL:', error)
    throw new Error('Failed to fetch URL content')
  }
}

export function isValidURL(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}