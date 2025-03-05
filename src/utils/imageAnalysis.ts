export async function analyzeImage(imageUrl: string): Promise<string> {
  try {
    console.log('Starting image analysis request...');
    
    // Log the first 100 characters of the image URL to verify format
    console.log('Image URL format check:', {
      startsWithDataImage: imageUrl.startsWith('data:image/'),
      length: imageUrl.length,
      prefix: imageUrl.substring(0, 100) + '...'
    });
    
    console.log('Sending request to analyze-image endpoint...');
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    })

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json()
    console.log('Response data:', {
      hasError: 'error' in data,
      hasAnalysis: 'analysis' in data,
      error: data.error,
      analysisLength: data.analysis?.length
    });

    if (!response.ok) {
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        responseData: data
      });

      // Handle specific error status codes
      switch (response.status) {
        case 400:
          throw new Error(`Invalid request: ${data.error}`);
        case 401:
          throw new Error('Authentication failed. Please check your API key.');
        case 402:
          throw new Error('API quota exceeded. Please check your billing status.');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error(`Server error: ${data.error}`);
        default:
          throw new Error(data.error || 'Failed to analyze image');
      }
    }

    if (!data.analysis) {
      console.error('No analysis in response:', data);
      throw new Error('No analysis received from server')
    }

    console.log('Successfully received analysis of length:', data.analysis.length);
    return data.analysis
  } catch (error) {
    console.error('Error in analyzeImage:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      imageUrlLength: imageUrl?.length
    });
    
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Could not connect to the server. Please check your internet connection.')
      }
      
      // Check for timeout errors
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.')
      }
      
      // Pass through server errors
      if (error.message.includes('API')) {
        throw error
      }
      
      throw new Error(`Image analysis failed: ${error.message}`)
    }
    throw new Error('Failed to analyze image')
  }
} 