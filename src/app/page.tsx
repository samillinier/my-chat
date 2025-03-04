'use client'

import { useState } from 'react'
import { ChatBubbleLeftIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import ChatInput from '@/components/ChatInput'
import AnimatedBackground from '@/components/AnimatedBackground'

interface Message {
  content: string
  role: 'user' | 'assistant'
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      // Add user message
      const userMessage = { content, role: 'user' as const }
      setMessages(prev => [...prev, userMessage])

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      setMessages(prev => [...prev, {
        content: data.message.content,
        role: 'assistant'
      }])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    handleSendMessage(example.replace(/[""]/g, '').replace(' →', ''))
  }

  return (
    <AnimatedBackground>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Main content area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center pt-12">
                <h1 className="text-4xl font-bold text-white mb-12">JasmineAI</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
                  {/* Examples */}
                  <div className="p-5 rounded-xl bg-[#011f13]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg hover:bg-[#011f13]/50 transition-colors duration-200">
                    <div className="flex items-center mb-4">
                      <div className="p-1.5 bg-[#00ff88]/10 rounded-lg">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-[#00ff88]" />
                      </div>
                      <h2 className="ml-3 text-lg font-semibold text-white">Examples</h2>
                    </div>
                    <div className="space-y-3">
                      <p 
                        onClick={() => handleExampleClick("Explain quantum computing in simple terms")}
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "Explain quantum computing in simple terms" →
                      </p>
                      <p 
                        onClick={() => handleExampleClick("Got any creative ideas for a 10 year old's birthday?")}
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "Got any creative ideas for a 10 year old's birthday?" →
                      </p>
                      <p 
                        onClick={() => handleExampleClick("How do I make an HTTP request in JavaScript?")}
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "How do I make an HTTP request in JavaScript?" →
                      </p>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="p-5 rounded-xl bg-[#011f13]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-1.5 bg-[#00ff88]/10 rounded-lg">
                        <BoltIcon className="h-5 w-5 text-[#00ff88]" />
                      </div>
                      <h2 className="ml-3 text-lg font-semibold text-white">Capabilities</h2>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        Remembers what user said earlier in the conversation
                      </p>
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        Allows user to provide follow-up corrections
                      </p>
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        Trained to decline inappropriate requests
                      </p>
                    </div>
                  </div>

                  {/* Limitations */}
                  <div className="p-5 rounded-xl bg-[#011f13]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-1.5 bg-[#00ff88]/10 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-[#00ff88]" />
                      </div>
                      <h2 className="ml-3 text-lg font-semibold text-white">Limitations</h2>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        May occasionally generate incorrect information
                      </p>
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        May occasionally produce harmful instructions or biased content
                      </p>
                      <p className="text-[#e2e8f0] text-sm p-3 rounded-lg bg-[#0c2b1c]/40">
                        Limited knowledge of world and events after 2021
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages will be rendered here */}
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === 'user'
                      ? 'p-6 bg-[#00D26A] ml-auto max-w-[600px] rounded-[24px] shadow-lg'
                      : 'p-6 bg-[#0a1f15] mr-auto max-w-[800px] rounded-[20px] shadow-lg border border-[#0c2b1c]/30'
                  }
                >
                  <p className={`text-lg leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user' ? 'text-black' : 'text-white'
                  }`}>{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="p-6 bg-[#0a1f15] mr-auto max-w-[800px] rounded-[20px] shadow-lg border border-[#0c2b1c]/30">
                  <p className="text-white text-lg">Thinking...</p>
                </div>
              )}
            </div>
          </main>

          {/* Input area */}
          <div className="border-t border-[#0c2b1c]/20 p-4 backdrop-blur-sm bg-[#001208]/20">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
