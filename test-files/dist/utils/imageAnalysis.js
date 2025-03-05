"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = analyzeImage;
async function analyzeImage(imageUrl) {
    try {
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
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl }),
        });
        // Log raw response details before parsing
        console.log('Raw response details:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        let data;
        let responseText;
        try {
            // First try to get the raw text
            responseText = await response.text();
            console.log('Raw response text:', responseText);
            // Then parse it as JSON if possible
            try {
                data = JSON.parse(responseText);
            }
            catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }
            console.log('Parsed response data:', {
                status: response.status,
                ok: response.ok,
                hasData: !!data,
                hasError: !!data?.error,
                hasAnalysis: !!data?.analysis,
                dataKeys: data ? Object.keys(data) : []
            });
        }
        catch (error) {
            const e = error;
            console.error('Error reading response:', e);
            throw new Error(`Failed to read server response: ${e.message}`);
        }
        if (!response.ok) {
            // Log detailed error information
            console.error('API error details:', {
                status: response.status,
                statusText: response.statusText,
                responseText: responseText,
                parsedData: data,
                headers: Object.fromEntries(response.headers.entries())
            });
            const errorMessage = data?.error || responseText || `Server error (${response.status}: ${response.statusText})`;
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
        return data.analysis;
    }
    catch (error) {
        // Enhanced error logging
        const err = error;
        console.error('Error in analyzeImage:', {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            isError: error instanceof Error,
            errorType: err?.constructor?.name,
            errorKeys: error ? Object.keys(error) : []
        });
        if (error instanceof Error) {
            // Network errors
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Could not connect to the server. Please check your internet connection.');
            }
            // Server configuration errors
            if (error.message.includes('API key')) {
                throw new Error('Server configuration error: The API is not properly configured. Please contact support.');
            }
            // Rate limiting and quota errors
            if (error.message.includes('rate limit') || error.message.includes('quota exceeded')) {
                throw new Error('Service temporarily unavailable: Too many requests. Please try again in a few minutes.');
            }
            // Invalid image errors
            if (error.message.includes('Invalid image') || error.message.includes('corrupted')) {
                throw new Error('Invalid image: The image file may be corrupted or in an unsupported format. Please try a different image.');
            }
            // Size limit errors
            if (error.message.includes('size exceeds')) {
                throw new Error('Image too large: Please use an image smaller than 10MB.');
            }
            // JSON parsing errors
            if (error.message.includes('Invalid JSON')) {
                throw new Error('Server returned invalid data. Please try again or contact support if the issue persists.');
            }
            // Preserve the original error message for other cases
            throw error;
        }
        // Generic error for non-Error objects
        throw new Error('Failed to analyze image: An unexpected error occurred. Please try again.');
    }
}
