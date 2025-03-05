"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
async function POST(request) {
    try {
        console.log('Received image analysis request');
        // Check API key first
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key is not configured');
            return server_1.NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
        }
        // Parse request body
        let body;
        try {
            const clonedRequest = request.clone(); // Clone request to read it twice if needed
            const rawBody = await clonedRequest.text();
            console.log('Raw request body length:', rawBody.length);
            try {
                body = JSON.parse(rawBody);
                console.log('Request body parsed successfully');
            }
            catch (parseError) {
                console.error('Failed to parse request body as JSON:', parseError);
                return server_1.NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
            }
        }
        catch (e) {
            console.error('Failed to read request body:', e);
            return server_1.NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
        }
        const { imageUrl } = body;
        if (!imageUrl) {
            console.error('No image URL provided in request body');
            return server_1.NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }
        // Validate that it's a base64 data URL
        if (!imageUrl.startsWith('data:image/')) {
            console.error('Invalid image format, not a data URL');
            return server_1.NextResponse.json({ error: 'Invalid image format. Expected base64 data URL.' }, { status: 400 });
        }
        // Extract base64 data and mime type
        const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.error('Invalid base64 format in image URL');
            return server_1.NextResponse.json({ error: 'Invalid base64 image format' }, { status: 400 });
        }
        const [_, mimeType, base64Data] = matches;
        // Log mime type and data length for debugging
        console.log('Image details:', {
            mimeType,
            dataLength: base64Data.length,
            approximateSizeKB: Math.round((base64Data.length * 3) / 4 / 1024)
        });
        // Validate maximum size (10MB)
        const sizeInBytes = (base64Data.length * 3) / 4;
        if (sizeInBytes > 10 * 1024 * 1024) {
            console.error('Image size too large:', Math.round(sizeInBytes / 1024 / 1024), 'MB');
            return server_1.NextResponse.json({ error: 'Image size exceeds 10MB limit' }, { status: 400 });
        }
        // Validate base64 content
        try {
            const decodedLength = atob(base64Data).length;
            console.log('Successfully validated base64 data, decoded length:', decodedLength);
        }
        catch (base64Error) {
            console.error('Invalid base64 content:', base64Error);
            return server_1.NextResponse.json({ error: 'Invalid base64 content' }, { status: 400 });
        }
        try {
            console.log('Making request to OpenAI...');
            const response = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Please analyze this image and provide a detailed description."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            });
            console.log('Received response from OpenAI:', {
                status: 'success',
                hasChoices: !!response.choices?.length,
                firstChoiceHasContent: !!response.choices?.[0]?.message?.content
            });
            if (!response.choices?.[0]?.message?.content) {
                console.error('No content in OpenAI response:', JSON.stringify(response, null, 2));
                return server_1.NextResponse.json({ error: 'No analysis received from OpenAI' }, { status: 500 });
            }
            const analysis = response.choices[0].message.content;
            console.log('Analysis details:', {
                length: analysis.length,
                hasContent: analysis.length > 0,
                snippet: analysis.substring(0, 50) + '...'
            });
            return server_1.NextResponse.json({ analysis });
        }
        catch (openaiError) {
            console.error('OpenAI API Error:', {
                name: openaiError?.name,
                message: openaiError?.message,
                status: openaiError?.status,
                type: openaiError?.type,
                code: openaiError?.code,
                stack: openaiError?.stack,
                response: openaiError?.response
            });
            // Handle specific OpenAI error types
            if (openaiError.status === 429) {
                return server_1.NextResponse.json({ error: 'API rate limit exceeded. Please try again later.' }, { status: 429 });
            }
            if (openaiError.status === 400) {
                return server_1.NextResponse.json({ error: 'Invalid request to OpenAI API. The image may be corrupted or in an unsupported format.' }, { status: 400 });
            }
            if (openaiError.status === 401) {
                return server_1.NextResponse.json({ error: 'OpenAI API key is invalid.' }, { status: 401 });
            }
            if (openaiError.status === 413) {
                return server_1.NextResponse.json({ error: 'Image size too large for OpenAI API.' }, { status: 413 });
            }
            return server_1.NextResponse.json({ error: openaiError.message || 'OpenAI API error' }, { status: openaiError.status || 500 });
        }
    }
    catch (error) {
        console.error('Unhandled error in analyze-image API:', error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error);
        if (error instanceof Error) {
            return server_1.NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
        }
        return server_1.NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
