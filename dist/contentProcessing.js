import { getMetadata, getThumbnails } from 'video-metadata-thumbnails';
import mammoth from 'mammoth';
import { extractTextFromPDF } from './pdfUtils';
export async function processImage(file) {
    try {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: dataUrl }),
        });
        if (!response.ok) {
            throw new Error(`Image analysis failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.analysis;
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}
export async function processDocument(file) {
    const fileType = file.type;
    if (fileType === 'application/pdf') {
        return extractTextFromPDF(file);
    }
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }
    else {
        throw new Error('Unsupported document type');
    }
}
export async function processVideo(file) {
    try {
        const metadata = await getMetadata(file);
        const thumbnails = await getThumbnails(file, {
            quality: 0.6,
            interval: 1,
            scale: 0.5,
        });
        // Convert thumbnails to base64 strings
        const thumbnailUrls = await Promise.all(thumbnails.map(async (thumbnail) => {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(thumbnail);
            });
        }));
        return {
            metadata,
            thumbnails: thumbnailUrls,
        };
    }
    catch (error) {
        console.error('Error processing video:', error);
        throw error;
    }
}
