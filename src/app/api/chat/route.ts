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

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

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
            content: `You are helping the user search the web. Here are the search results for their query:\n\n${searchResultsText}\n\nPlease summarize these results in a helpful and concise way. Include relevant facts and cite sources when appropriate.`
          }
        ],
      })

      return NextResponse.json({
        message: completion.choices[0].message
      })
    }

    // Handle normal chat messages
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
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