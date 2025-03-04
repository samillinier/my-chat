'use client'

import { useState, useEffect } from 'react'
import { ChatBubbleLeftIcon, BoltIcon, ExclamationTriangleIcon, Square3Stack3DIcon, DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import ChatInput from '@/components/ChatInput'
import AnimatedBackground from '@/components/AnimatedBackground'
import { ChatHistory } from '@/components/History'
import { auth } from '@/lib/firebase'

interface Message {
  content: string
  role: 'user' | 'assistant'
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface CollectionItem {
  id: string
  content: string
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [collection, setCollection] = useState<CollectionItem[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [binChats, setBinChats] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  // Load data from localStorage
  const loadDataFromLocalStorage = (userId: string) => {
    // Load chat history
    const savedHistory = localStorage.getItem(`chatHistory-${userId}`)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        const history = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt)
        }))
        setChatHistory(history)
        
        // Load the most recent chat if exists
        if (history.length > 0) {
          const mostRecent = history[0]
          setCurrentChatId(mostRecent.id)
          setMessages(mostRecent.messages)
        }
      } catch (error) {
        console.error('Error parsing chat history:', error)
      }
    }

    // Load bin
    const savedBin = localStorage.getItem(`binChats-${userId}`)
    if (savedBin) {
      try {
        const parsed = JSON.parse(savedBin)
        const bin = parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt)
        }))
        setBinChats(bin)
      } catch (error) {
        console.error('Error parsing bin:', error)
      }
    }

    // Load collection
    const savedCollection = localStorage.getItem(`collection-${userId}`)
    if (savedCollection) {
      try {
        const parsed = JSON.parse(savedCollection)
        const collectionItems = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setCollection(collectionItems)
      } catch (error) {
        console.error('Error parsing collection:', error)
      }
    }
  }

  // Add auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Load data when user logs in
        loadDataFromLocalStorage(user.uid)
      } else {
        // Only clear the state, not the localStorage
        setMessages([])
        setCollection([])
        setChatHistory([])
        setBinChats([])
        setCurrentChatId(undefined)
      }
    })

    return () => unsubscribe()
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return // Don't save if no user is logged in

    if (chatHistory.length > 0) {
      localStorage.setItem(`chatHistory-${user.uid}`, JSON.stringify(chatHistory))
    } else {
      localStorage.removeItem(`chatHistory-${user.uid}`)
    }
  }, [chatHistory])

  // Save bin to localStorage whenever it changes
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return // Don't save if no user is logged in

    if (binChats.length > 0) {
      localStorage.setItem(`binChats-${user.uid}`, JSON.stringify(binChats))
    } else {
      localStorage.removeItem(`binChats-${user.uid}`)
    }
  }, [binChats])

  // Save collection to localStorage whenever it changes
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return // Don't save if no user is logged in

    if (collection.length > 0) {
      localStorage.setItem(`collection-${user.uid}`, JSON.stringify(collection))
    } else {
      localStorage.removeItem(`collection-${user.uid}`)
    }
  }, [collection])

  const createNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
    return newChat.id
  }

  const updateChatHistory = (chatId: string, newMessages: Message[]) => {
    setChatHistory(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: newMessages,
          updatedAt: new Date()
        }
      }
      return chat
    }))
  }

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      
      // Create new chat if none exists
      const chatId = currentChatId || createNewChat()

      // Add user message
      const userMessage = { content, role: 'user' as const }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      updateChatHistory(chatId, updatedMessages)

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      const finalMessages = [...updatedMessages, {
        content: data.message.content,
        role: 'assistant' as const
      }]
      setMessages(finalMessages)
      updateChatHistory(chatId, finalMessages)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChat = (chatId: string, chatMessages: Message[]) => {
    setCurrentChatId(chatId)
    setMessages(chatMessages)
  }

  const handleDeleteChat = (chatId: string) => {
    const chatToDelete = chatHistory.find(chat => chat.id === chatId)
    if (chatToDelete) {
      // Move to bin
      setBinChats(prev => [chatToDelete, ...prev])
      // Remove from active chats
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
      if (currentChatId === chatId) {
        setCurrentChatId(undefined)
        setMessages([])
      }
      showToast('Chat moved to bin', 'success')
    }
  }

  const handleRestoreChat = (chatId: string) => {
    const chatToRestore = binChats.find(chat => chat.id === chatId)
    if (chatToRestore) {
      // Move back to active chats
      setChatHistory(prev => [chatToRestore, ...prev])
      // Remove from bin
      setBinChats(prev => prev.filter(chat => chat.id !== chatId))
      showToast('Chat restored', 'success')
    }
  }

  const handlePermanentDelete = (chatId: string) => {
    setBinChats(prev => prev.filter(chat => chat.id !== chatId))
    showToast('Chat permanently deleted', 'success')
  }

  const handleEmptyBin = () => {
    setBinChats([])
    showToast('Bin emptied', 'success')
  }

  const handleExampleClick = (example: string) => {
    handleSendMessage(example.replace(/[""]/g, '').replace(' →', ''))
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2000)
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      showToast('Copied to clipboard!', 'success')
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleAddToCollection = (content: string) => {
    // Check if the message is already in the collection
    if (collection.some(item => item.content === content)) {
      showToast('Message already in collection', 'error')
      return
    }

    const newItem: CollectionItem = {
      id: Date.now().toString(),
      content,
      timestamp: new Date()
    }
    setCollection(prev => [...prev, newItem])
    showToast('Added to collection!', 'success')
  }

  const handleDeleteFromCollection = (id: string) => {
    setCollection(prev => prev.filter(item => item.id !== id))
    showToast('Removed from collection', 'success')
  }

  return (
    <AnimatedBackground>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg bg-[#1a2e23] text-white">
          {toast.type === 'success' && (
            <CheckCircleIcon className="h-5 w-5 text-[#00ff88]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          collection={collection}
          onDeleteFromCollection={handleDeleteFromCollection}
          onNewChat={createNewChat}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          binChats={binChats}
          onRestoreChat={handleRestoreChat}
          onPermanentDelete={handlePermanentDelete}
          onEmptyBin={handleEmptyBin}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Main content area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center pt-12">
                <div className="mb-12">
                  <img src="/my-logo.png" alt="Logo" className="h-12 w-auto" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
                  {/* Examples */}
                  <div 
                    onClick={() => handleExampleClick("Explain quantum computing in simple terms")}
                    className="p-5 rounded-xl bg-[#052e1f]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg hover:bg-[#052e1f]/50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-1.5 bg-[#00ff88]/10 rounded-lg">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-[#00ff88]" />
                      </div>
                      <h2 className="ml-3 text-lg font-semibold text-white">Examples</h2>
                    </div>
                    <div className="space-y-3">
                      <p 
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "Explain quantum computing in simple terms" →
                      </p>
                      <p 
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "How to make ethiopian doro wot easily" →
                      </p>
                      <p 
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "How do I make an HTTP request in JavaScript?" →
                      </p>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div 
                    onClick={() => handleExampleClick("Tell me about your capabilities")}
                    className="p-5 rounded-xl bg-[#052e1f]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg hover:bg-[#052e1f]/50 transition-colors duration-200 cursor-pointer"
                  >
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
                  <div 
                    onClick={() => handleExampleClick("What are your limitations?")}
                    className="p-5 rounded-xl bg-[#052e1f]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg hover:bg-[#052e1f]/50 transition-colors duration-200 cursor-pointer"
                  >
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
            <div className="space-y-8 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div key={index} className="relative">
                  <div
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
                  
                  {message.role === 'assistant' && (
                    <div className="absolute -bottom-6 left-4 flex space-x-2">
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="group p-1.5 bg-[#1a2e23] hover:bg-[#243b2f] rounded-lg text-gray-400 hover:text-[#00ff88] transition-all duration-200"
                        title="Copy message"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAddToCollection(message.content)}
                        className="group p-1.5 bg-[#1a2e23] hover:bg-[#243b2f] rounded-lg text-gray-400 hover:text-[#00ff88] transition-all duration-200"
                        title="Add to collection"
                      >
                        <Square3Stack3DIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
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
