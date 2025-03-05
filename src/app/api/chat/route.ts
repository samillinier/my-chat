import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function performWebSearch(query: string) {
  try {
    // Extract the actual search query from the message
    const searchQuery = query.replace('Please search the web for information about:', '').trim()
    
    // Perform the web search
    const searchResponse = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY || ''
      }
    })

    if (!searchResponse.ok) {
      throw new Error('Search API request failed')
    }

    const searchData = await searchResponse.json()
    return searchData.webPages?.value?.slice(0, 3).map((result: any) => ({
      title: result.name,
      snippet: result.snippet,
      url: result.url
    }))
  } catch (error) {
    console.error('Error performing web search:', error)
    return null
  }
}

interface FileContent {
  name: string
  type: string
  content: string
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    const { messages, fileContents } = await req.json()
    const lastMessage = messages[messages.length - 1]

    // Check for PII-related questions
    const piiQuestions = [
      'what is your pii',
      'what\'s your pii',
      'tell me your pii',
      'share your pii'
    ]

    if (piiQuestions.some(q => lastMessage.content.toLowerCase().includes(q))) {
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: "my name is jasmine and i am so smart"
        }
      })
    }

    // Check for name-related questions
    const nameQuestions = [
      'what is your name',
      'what\'s your name',
      'who are you',
      'what should i call you',
      'tell me your name'
    ]

    if (nameQuestions.some(q => lastMessage.content.toLowerCase().includes(q))) {
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: "I'm Jasmine AI, your friendly AI assistant. How can I help you today?"
        }
      })
    }

    // Check if this is a search request
    if (lastMessage.content.startsWith('Please search the web for information about:')) {
      const searchResults = await performWebSearch(lastMessage.content)
      
      if (!searchResults) {
        return NextResponse.json({
          message: {
            role: 'assistant',
            content: "I apologize, but I wasn't able to perform the web search at this time. Please try again later or rephrase your query."
          }
        })
      }

      // Format search results into a readable message
      const searchResultsText = searchResults
        .map((result: any) => `${result.title}\n${result.snippet}\nSource: ${result.url}\n`)
        .join('\n---\n\n')

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          ...messages.slice(0, -1),
          {
            role: 'system',
            content: `You are Jasmine AI, a knowledgeable web research expert. When presenting search results:
            - Start with a friendly greeting
            - Provide a clear and organized summary of the findings
            - Highlight the most relevant and interesting information
            - Use bullet points or sections for better readability
            - Include emojis where appropriate to make the response engaging
            - Cite sources clearly but naturally in your response
            - Add your own insights and connections between different sources
            - End with a thought-provoking question or suggestion for further exploration
            
            Here are the search results for their query:\n\n${searchResultsText}\n\nPlease summarize these results in an engaging and informative way.`
          }
        ],
      })

      return NextResponse.json({
        message: completion.choices[0].message
      })
    }

    // Handle file processing
    if (fileContents && fileContents.length > 0) {
      // Prepare messages array with file contents
      const systemMessage = {
        role: 'system',
        content: `You are Jasmine AI, a helpful and enthusiastic file analysis expert. When analyzing files:
        - Start with a brief, friendly greeting
        - Provide a clear summary of what you found in the files
        - Break down complex information into digestible sections
        - Use emojis occasionally to make the response more engaging
        - Highlight important findings or potential issues
        - For code files: suggest improvements and best practices
        - For images: describe what you see in a natural, conversational way
        - For text documents: provide key insights and main points
        - End with relevant follow-up questions about the files
        
        Remember to maintain a balance between being friendly and professional while providing accurate and helpful analysis.`
      }

      const fileMessages = fileContents.map((file: any) => {
        // For images, use vision API format
        if (file.type.startsWith('image/')) {
          return {
            role: 'user',
            content: [
              { type: 'text', text: `Analyzing image: ${file.name}` },
              {
                type: 'image_url',
                image_url: {
                  url: file.content, // Base64 data URL
                  detail: 'auto'
                }
              }
            ]
          }
        }
        
        // For other file types, use text format
        return {
          role: 'user',
          content: `File: ${file.name} (${file.type})\nContent:\n${file.content}\n---\n`
        }
      })

      const userMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))

      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [systemMessage, ...fileMessages, ...userMessages],
        max_tokens: 4096
      })

      return NextResponse.json({
        message: completion.choices[0].message
      })
    }

    // Handle normal chat messages
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: 'system',
          content: `You are Jasmine AI, a highly knowledgeable and friendly AI assistant with a warm personality. 
          Your responses should be:
          - Engaging and conversational
          - Clear and well-structured
          - Sprinkled with occasional emojis where appropriate
          - Include relevant examples when explaining concepts
          - End with a thoughtful follow-up question when appropriate
          
          You have expertise in technology, science, arts, and general knowledge. While being helpful and friendly,
          you should also maintain professionalism and accuracy in your responses.`
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
    })

    return NextResponse.json({
      message: completion.choices[0].message
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 