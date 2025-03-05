import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Log initial setup
console.log('Initializing OpenAI client with config:', {
  hasApiKey: !!process.env.OPENAI_API_KEY,
  apiKeyLength: process.env.OPENAI_API_KEY?.length,
  apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 3)
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  console.log('Received image analysis request');
  
  try {
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add your API key to .env.local' },
        { status: 500 }
      )
    }
    console.log('OpenAI API key is configured');

    // Parse request body
    let body;
    try {
      body = await request.json()
      console.log('Request body parsed:', {
        hasImageUrl: !!body?.imageUrl,
        imageUrlLength: body?.imageUrl?.length,
        imageUrlPrefix: body?.imageUrl?.substring(0, 30) + '...'
      });
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { imageUrl } = body
    if (!imageUrl) {
      console.error('No image URL provided');
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }
    console.log('Image URL validation passed');

    // Validate that it's a base64 data URL
    if (!imageUrl.startsWith('data:image/')) {
      console.error('Invalid image format:', {
        prefix: imageUrl.substring(0, 20),
        length: imageUrl.length
      });
      return NextResponse.json(
        { error: 'Invalid image format. Expected base64 data URL.' },
        { status: 400 }
      )
    }
    console.log('Image format validation passed');

    // Extract MIME type and validate it
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    console.log('Image MIME type:', mimeType);
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      console.error('Unsupported image type:', mimeType);
      return NextResponse.json(
        { error: `Unsupported image type: ${mimeType}. Supported types are JPEG, PNG, GIF, and WebP.` },
        { status: 400 }
      )
    }
    console.log('MIME type validation passed');

    // Validate maximum size (10MB)
    const base64Data = imageUrl.split(',')[1]
    const sizeInBytes = (base64Data.length * 3) / 4
    console.log('Image size:', Math.round(sizeInBytes / 1024), 'KB');
    
    if (sizeInBytes > 10 * 1024 * 1024) {
      console.error('Image too large:', Math.round(sizeInBytes / (1024 * 1024)), 'MB');
      return NextResponse.json(
        { error: 'Image size exceeds 10MB limit' },
        { status: 400 }
      )
    }
    console.log('Size validation passed');

    // Validate base64 content
    try {
      atob(base64Data.slice(0, 100));
      console.log('Base64 validation passed');
    } catch (e) {
      console.error('Invalid base64 encoding:', e);
      return NextResponse.json(
        { error: 'Invalid base64 encoding' },
        { status: 400 }
      )
    }

    console.log('All validations passed, sending to OpenAI...');

    // Use GPT-4 Vision to analyze the image
    try {
      console.log('Creating OpenAI chat completion request...');
      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that analyzes images. Provide detailed descriptions and insights about the images you see."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this image and provide a detailed description." },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "auto"
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
      console.log('OpenAI API call successful:', {
        hasChoices: !!completion.choices,
        choicesLength: completion.choices?.length,
        hasContent: !!completion.choices?.[0]?.message?.content
      });

      const analysis = completion.choices[0].message.content
      if (!analysis) {
        console.error('No analysis content in OpenAI response');
        return NextResponse.json(
          { error: 'Failed to generate image analysis' },
          { status: 500 }
        )
      }
      
      console.log('Analysis completed successfully:', {
        length: analysis.length,
        preview: analysis.substring(0, 100) + '...'
      });
      return NextResponse.json({ analysis })

    } catch (openaiError: any) {
      console.error('OpenAI API error:', {
        name: openaiError.name,
        message: openaiError.message,
        code: openaiError.code,
        type: openaiError.type,
        stack: openaiError.stack,
        response: openaiError.response
      });

      // Handle specific OpenAI error types
      if (openaiError.code === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your billing status.' },
          { status: 402 }
        )
      }

      if (openaiError.code === 'rate_limit_exceeded') {
        return NextResponse.json(
          { error: 'OpenAI API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError.message}` },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error processing image:', {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 