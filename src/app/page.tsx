'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatBubbleLeftIcon, BoltIcon, ExclamationTriangleIcon, Square3Stack3DIcon, DocumentDuplicateIcon, CheckCircleIcon, ArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import ChatInput from '@/components/ChatInput'
import AnimatedBackground from '@/components/AnimatedBackground'
import { ChatHistory } from '@/components/History'
import { auth, storage } from '@/lib/firebase'
import HamburgerMenu from '@/components/HamburgerMenu'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import TypingAnimation from '@/components/TypingAnimation'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { extractTextFromPDF } from '@/utils/pdfUtils'

interface Message {
  content: string
  role: 'user' | 'assistant'
  attachments?: {
    name: string
    type: string
    size: number
    url?: string
  }[]
}

interface FileAttachment {
  id: string
  name: string
  type: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  videoDuration?: string
  videoThumbnail?: string
  file?: File
  size?: number
  lastModified?: number
  webkitRelativePath?: string
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

// Add new interface for login prompt
interface LoginPrompt {
  isVisible: boolean
  hasInteracted: boolean
  lastDismissed?: number // Timestamp when user last clicked "Stay logged out"
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [collection, setCollection] = useState<CollectionItem[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [binChats, setBinChats] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loginPrompt, setLoginPrompt] = useState<LoginPrompt>({ isVisible: false, hasInteracted: false })
  const [aiInteractions, setAiInteractions] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Function to handle smooth scrolling to bottom
  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Watch for new messages and scroll if needed
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle scroll events to determine if user is reading
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const mainContent = e.target as HTMLElement
      const isAtBottom = mainContent.scrollHeight - mainContent.scrollTop <= mainContent.clientHeight + 100
      setShouldAutoScroll(isAtBottom)
    }

    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll)
      return () => mainContent.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Load data from localStorage
  const loadDataFromLocalStorage = (userId: string) => {
    // Load login prompt state
    const savedLoginPrompt = localStorage.getItem('loginPrompt')
    if (savedLoginPrompt) {
      setLoginPrompt(JSON.parse(savedLoginPrompt))
    }

    // Load interaction count
    const savedInteractions = localStorage.getItem(`aiInteractions-${userId}`)
    if (savedInteractions) {
      setAiInteractions(parseInt(savedInteractions))
    }
    
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

  // Save AI interactions count to localStorage
  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      localStorage.setItem('aiInteractions-guest', aiInteractions.toString())
    } else {
      localStorage.setItem(`aiInteractions-${user.uid}`, aiInteractions.toString())
    }
  }, [aiInteractions])

  // Save login prompt state to localStorage
  useEffect(() => {
    localStorage.setItem('loginPrompt', JSON.stringify(loginPrompt))
  }, [loginPrompt])

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

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    try {
      console.log('Starting handleSendMessage with attachments:', attachments?.map(f => ({
        name: f.name,
        type: f.type,
        size: f.file?.size
      })))
      setIsLoading(true)
      
      // If there are only attachments without user message, create a default message
      const messageContent = attachments?.length && !content.trim() 
        ? "I've uploaded some files. How can you help me with them?" 
        : content
      
      // Increment AI interaction counter for non-logged-in users
      if (!auth.currentUser) {
        const newCount = aiInteractions + 1
        setAiInteractions(newCount)
        
        // Check if 24 hours have passed since last dismissal
        const twentyFourHours = 24 * 60 * 60 * 1000
        const canShowPrompt = !loginPrompt.lastDismissed || 
                            (Date.now() - loginPrompt.lastDismissed) > twentyFourHours

        if (newCount >= 10 && !loginPrompt.hasInteracted && canShowPrompt) {
          setLoginPrompt({ isVisible: true, hasInteracted: false })
        }
      }
      
      // Create new chat if none exists
      const chatId = currentChatId || createNewChat()
      console.log('Using chat ID:', chatId)

      // Handle file uploads if any
      let uploadedFiles: Message['attachments'] = []
      let fileContents = []

      if (attachments && attachments.length > 0) {
        console.log('Processing attachments:', attachments.length, 'files')
        
        for (const attachment of attachments) {
          if (!attachment.file) continue

          const file = attachment.file
          console.log(`Processing file: ${file.name} (${file.type})`)
          
          try {
            let content = attachment.content
            let url: string | undefined = attachment.imageUrl || attachment.videoUrl

            if (!content) {
              if (file.type === 'application/pdf') {
                console.log('Processing PDF file:', file.name)
                try {
                  content = await extractTextFromPDF(file)
                  console.log(`Successfully extracted text from PDF: ${file.name}`)
                } catch (pdfError) {
                  console.error('Error processing PDF:', pdfError)
                  showToast(`Error processing PDF: ${file.name}`, 'error')
                  continue
                }
              } else if (file.type.startsWith('text/') || file.type === 'application/json') {
                console.log('Reading text content from:', file.name)
                content = await file.text()
                console.log(`Successfully read text content from ${file.name}`)
              }
            }
            
            if (content || url) {
              console.log(`Adding processed file ${file.name} to message`)
              fileContents.push({
                name: file.name,
                type: file.type,
                content: content
              })

              uploadedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                url
              })
              console.log('File successfully processed:', file.name)
            }
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError)
            showToast(`Error processing file: ${file.name}`, 'error')
          }
        }
      }

      console.log('File processing complete. Processed files:', uploadedFiles.length)

      // Add user message with attachments
      const userMessage: Message = { 
        content: messageContent, 
        role: 'user',
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined
      }
      
      console.log('Creating user message:', {
        content: userMessage.content,
        attachments: userMessage.attachments?.map(a => a.name)
      })

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      updateChatHistory(chatId, updatedMessages)

      // Check for questions about the name Jasmine
      const jasmineQuestionPattern = /why.*(?:name|called).*jasmine/i
      if (jasmineQuestionPattern.test(content)) {
        const jasmineResponse = {
          content: "My developer is so deeply in love with his fiancé that he named me after her.",
          role: 'assistant' as const
        }
        const finalMessages = [...updatedMessages, jasmineResponse]
        setMessages(finalMessages)
        updateChatHistory(chatId, finalMessages)
        setIsLoading(false)
        return
      }

      // Send to API for processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          fileContents: fileContents // Send file contents to API
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
      showToast('Failed to send message', 'error')
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
      {/* Hamburger Menu */}
      <HamburgerMenu onClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Login Prompt */}
      {loginPrompt.isVisible && !auth.currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-[#0a1f15]/90 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-[#00D26A]/20 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white mb-4">Get More from Jasmine AI</h2>
            <p className="text-gray-300 mb-6">Log in or sign up to get smarter responses, upload files and images, and more.</p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  const provider = new GoogleAuthProvider();
                  signInWithPopup(auth, provider);
                  setLoginPrompt({ isVisible: false, hasInteracted: true });
                }}
                className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 text-white bg-[#1a2e23] hover:bg-[#243b2f] rounded-lg transition-colors font-medium border border-[#2a3f32]"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
              <button
                onClick={() => {
                  setLoginPrompt({ 
                    isVisible: false, 
                    hasInteracted: true,
                    lastDismissed: Date.now()
                  });
                }}
                className="w-full px-4 py-2.5 text-gray-400 hover:text-white transition-colors font-medium"
              >
                Stay logged out
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* Sidebar - Hidden by default on mobile */}
        <div className={`fixed inset-0 lg:relative z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="h-full">
            <Sidebar 
              collection={collection}
              onDeleteFromCollection={handleDeleteFromCollection}
              onNewChat={createNewChat}
              chatHistory={chatHistory}
              currentChatId={currentChatId}
              onSelectChat={(chatId, messages) => {
                handleSelectChat(chatId, messages)
                setIsSidebarOpen(false) // Close sidebar after selection on mobile
              }}
              onDeleteChat={handleDeleteChat}
              binChats={binChats}
              onRestoreChat={handleRestoreChat}
              onPermanentDelete={handlePermanentDelete}
              onEmptyBin={handleEmptyBin}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Main content area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center pt-12">
                <div className="mb-12">
                  <img src="/my-logo.png" alt="Logo" className="h-12 w-auto" />
                </div>
                
                {/* Example cards - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
                  {/* Examples */}
                  <div className="p-5 rounded-xl bg-[#052e1f]/40 backdrop-blur-md border border-[#0c2b1c]/30 shadow-lg hover:bg-[#052e1f]/50 transition-colors duration-200">
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
                        onClick={() => handleExampleClick("How to make ethiopian doro wot easily")}
                        className="text-[#e2e8f0] text-sm hover:bg-[#0c2b1c]/50 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        "How to make ethiopian doro wot easily" →
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

                {/* Mobile welcome message */}
                <div className="md:hidden text-center px-4">
                  <h2 className="text-xl text-white mb-4">What can I help with?</h2>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-8 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div key={index} className="relative">
                  <div
                    className={
                      message.role === 'user'
                        ? 'p-4 sm:p-6 bg-[#00D26A] ml-auto max-w-[90%] sm:max-w-[600px] rounded-[24px] shadow-lg'
                        : 'p-4 sm:p-6 bg-[#0a1f15] mr-auto max-w-[90%] sm:max-w-[800px] rounded-[20px] shadow-lg border border-[#0c2b1c]/30'
                    }
                  >
                    <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-black' : 'text-white'
                    }`}>{message.content}</p>
                    
                    {/* Display attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, fileIndex) => (
                          <div key={fileIndex}>
                            {file.type.startsWith('image/') && file.url ? (
                              <div className="relative group">
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="max-h-48 rounded-lg object-contain bg-black/20"
                                />
                                <a 
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                >
                                  <span className="text-white text-sm">View full size</span>
                                </a>
                              </div>
                            ) : (
                              <a 
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center space-x-2 p-2 rounded-lg hover:opacity-80 transition-opacity ${
                                  message.role === 'user' 
                                    ? 'bg-[#00bf62] text-black'
                                    : 'bg-[#1a2e23] text-white'
                                }`}
                              >
                                <DocumentTextIcon className="h-5 w-5" />
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs opacity-75">
                                  ({Math.round(file.size / 1024)}KB)
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                <div className="p-4 sm:p-6 bg-[#0a1f15] mr-auto max-w-[90%] sm:max-w-[800px] rounded-[20px] shadow-lg border border-[#0c2b1c]/30">
                  <TypingAnimation />
                </div>
              )}
              {/* Invisible div for scrolling reference */}
              <div ref={messagesEndRef} />

              {/* New message indicator */}
              {!shouldAutoScroll && messages.length > 0 && (
                <button
                  onClick={() => {
                    setShouldAutoScroll(true)
                    scrollToBottom()
                  }}
                  className="fixed bottom-24 right-8 bg-[#00D26A] text-black px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:bg-[#00bf62] transition-colors duration-200"
                >
                  <span>New message</span>
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </main>

          {/* Input area */}
          <div className="max-w-4xl mx-auto w-full p-4">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}
