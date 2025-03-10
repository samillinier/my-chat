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
async function performWebSearch(query) {
    try {
        // Extract the actual search query from the message
        const searchQuery = query.replace('Please search the web for information about:', '').trim();
        // Perform the web search
        const searchResponse = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY || ''
            }
        });
        if (!searchResponse.ok) {
            throw new Error('Search API request failed');
        }
        const searchData = await searchResponse.json();
        return searchData.webPages?.value?.slice(0, 3).map((result) => ({
            title: result.name,
            snippet: result.snippet,
            url: result.url
        }));
    }
    catch (error) {
        console.error('Error performing web search:', error);
        return null;
    }
}
async function POST(req) {
    try {
        const { messages, fileContents } = await req.json();
        const lastMessage = messages[messages.length - 1];
        // Check for name-related questions
        const nameQuestions = [
            'what is your name',
            'what\'s your name',
            'who are you',
            'what should i call you',
            'tell me your name'
        ];
        if (nameQuestions.some(q => lastMessage.content.toLowerCase().includes(q))) {
            return server_1.NextResponse.json({
                message: {
                    role: 'assistant',
                    content: "I'm Jasmine AI, your friendly AI assistant. How can I help you today?"
                }
            });
        }
        // Check if this is a search request
        if (lastMessage.content.startsWith('Please search the web for information about:')) {
            const searchResults = await performWebSearch(lastMessage.content);
            if (!searchResults) {
                return server_1.NextResponse.json({
                    message: {
                        role: 'assistant',
                        content: "I apologize, but I wasn't able to perform the web search at this time. Please try again later or rephrase your query."
                    }
                });
            }
            // Format search results into a readable message
            const searchResultsText = searchResults
                .map((result) => `${result.title}\n${result.snippet}\nSource: ${result.url}\n`)
                .join('\n---\n\n');
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    ...messages.slice(0, -1),
                    {
                        role: 'system',
                        content: `You are helping the user search the web. Here are the search results for their query:\n\n${searchResultsText}\n\nPlease summarize these results in a helpful and concise way. Include relevant facts and cite sources when appropriate.`
                    }
                ],
            });
            return server_1.NextResponse.json({
                message: completion.choices[0].message
            });
        }
        // Handle file processing
        if (fileContents && fileContents.length > 0) {
            // Prepare file content for GPT
            const fileInfo = fileContents.map((file) => `File: ${file.name} (${file.type})\nContent:\n${file.content}\n---\n`).join('\n');
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: 'system',
                        content: `You are analyzing files for the user. Here are the contents of the uploaded files:\n\n${fileInfo}\n\nPlease analyze these files and provide insights, summaries, or answer any questions the user has about them. If the files contain code, you can provide code review, suggestions for improvement, or help fix any issues.`
                    },
                    ...messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
            });
            return server_1.NextResponse.json({
                message: completion.choices[0].message
            });
        }
        // Handle normal chat messages
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content
            })),
        });
        return server_1.NextResponse.json({
            message: completion.choices[0].message
        });
    }
    catch (error) {
        console.error('Error in chat API:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
