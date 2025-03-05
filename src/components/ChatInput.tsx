import { PlusIcon, GlobeAltIcon, LightBulbIcon, ArrowUpIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { useState, FormEvent, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  onScrollToTop?: () => void
}

export default function ChatInput({ onSendMessage, onScrollToTop }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isReasoningMode, setIsReasoningMode] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() || attachments.length > 0) {
      let message = input
      if (isReasoningMode) {
        message = `Please help me reason through this step by step: ${input}`
      } else if (isSearchMode) {
        message = `Please search the web for information about: ${input}`
      }
      onSendMessage(message, attachments)
      setInput('')
      setAttachments([])
      setIsSearchMode(false)
      setIsReasoningMode(false)
    }
  }

  const toggleReasoningMode = () => {
    setIsReasoningMode(!isReasoningMode)
    setIsSearchMode(false)
  }

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode)
    setIsReasoningMode(false)
  }

  const handleAttachClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Attach button clicked')
    if (fileInputRef.current) {
      console.log('Opening file picker')
      fileInputRef.current.click()
    } else {
      console.error('File input reference is null')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selection started')
    try {
      const files = Array.from(e.target.files || [])
      console.log('Selected files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })))
      
      if (files.length > 0) {
        // Validate file types and sizes
        const validFiles = files.filter(file => {
          const maxSize = 10 * 1024 * 1024; // 10MB limit
          if (file.size > maxSize) {
            alert(`File ${file.name} is too large (max 10MB)`)
            return false
          }
          
          // Only allow specific image types
          const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          if (file.type.startsWith('image/')) {
            if (!allowedImageTypes.includes(file.type)) {
              alert(`Image type ${file.type} is not supported. Please use JPEG, PNG, GIF, or WebP.`)
              return false
            }
            return true
          }
          
          // Allow text files
          if (file.type.startsWith('text/') || file.type === 'application/json') {
            return true
          }
          
          alert(`Sorry, ${file.name} cannot be processed. Only images (JPEG, PNG, GIF, WebP) and text files are supported.`)
          return false
        })

        if (validFiles.length === 0) {
          return
        }

        console.log('Valid files:', validFiles.map(f => ({ name: f.name, type: f.type, size: f.size })))
        setAttachments(prev => [...prev, ...validFiles])
        
        // Clear the input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
          console.log('File input cleared')
        }
      }
    } catch (error) {
      console.error('Error in file selection:', error)
      alert('Error processing files. Please try again with supported file types only.')
    }
  }

  const removeAttachment = (index: number) => {
    console.log('Removing attachment at index:', index)
    setAttachments(prev => {
      const newAttachments = [...prev]
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }

  // Add cleanup for file object URLs
  useEffect(() => {
    return () => {
      // Cleanup any created object URLs when component unmounts
      attachments.forEach(file => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file))
        }
      })
    }
  }, [attachments])

  const handleSummarizeClick = () => {
    setInput('Please summarize the following text:\n\n')
  }

  const handleSurpriseClick = () => {
    const surprises = [
      "Tell me a fascinating fact about space",
      "Share a unique historical event from this day in history",
      "Give me a creative writing prompt",
      "Tell me an interesting science fact",
      "Share a coding tip or best practice"
    ]
    const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)]
    onSendMessage(randomSurprise)
  }

  const handleAnalyzeClick = () => {
    setInput('Please analyze the following data:\n\n')
  }

  const handlePlanClick = () => {
    setInput('Please create a detailed plan for:\n\n')
  }

  return (
    <div className="max-w-4xl mx-auto relative space-y-4">
      <div className="relative">
        <div className="absolute right-4 top-4">
          <button
            onClick={onScrollToTop}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2a2a2a] text-gray-400 hover:text-white"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-[#141414] rounded-[20px] p-6">
          <form onSubmit={handleSubmit}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,text/*,.json"
              onClick={e => {
                (e.target as HTMLInputElement).value = ''
              }}
            />

            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className={`relative group flex items-center gap-2 ${
                      file.type.startsWith('image/') ? 'bg-[#2a2a2a]/50' : 'bg-[#2a2a2a]'
                    } text-white px-3 py-1.5 rounded-lg text-sm`}
                  >
                    {file.type.startsWith('image/') && (
                      <div className="relative w-8 h-8">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        removeAttachment(index)
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isSearchMode 
                    ? "Enter your search query..."
                    : isReasoningMode 
                      ? "Enter your question for step-by-step reasoning..."
                      : "Ask Jasmine anything"
                }
                className="w-full p-4 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttachClick}
                className={`flex items-center gap-2 px-4 py-2 ${
                  attachments.length > 0
                    ? 'text-[#00ff88] border-[#00ff88]'
                    : 'text-gray-400 hover:text-white border-[#2a2a2a]'
                } border rounded-full text-sm transition-colors duration-200 hover:bg-[#2a2a2a] group relative`}
              >
                <PlusIcon className="h-4 w-4" />
                Attach
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-[#2a2a2a] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Supports text and image files
                </span>
              </button>
              <button
                type="button"
                onClick={toggleSearchMode}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isSearchMode
                    ? 'text-[#00ff88] border-[#00ff88]'
                    : 'text-gray-400 hover:text-white border-[#2a2a2a]'
                } border rounded-full text-sm transition-colors duration-200`}
              >
                <GlobeAltIcon className="h-4 w-4" />
                Search
              </button>
              <button
                type="button"
                onClick={toggleReasoningMode}
                className={`flex items-center gap-2 px-4 py-2 ${
                  isReasoningMode 
                    ? 'text-[#00ff88] border-[#00ff88]' 
                    : 'text-gray-400 hover:text-white border-[#2a2a2a]'
                } border rounded-full text-sm transition-colors duration-200`}
              >
                <LightBulbIcon className="h-4 w-4" />
                Reason
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-2">
          {isSearchMode
            ? "Search mode: I'll look up information from the web"
            : isReasoningMode 
              ? "Reasoning mode: I'll break down the problem step by step"
              : attachments.length > 0
                ? `${attachments.length} file${attachments.length === 1 ? '' : 's'} attached`
                : ""}
        </p>
      </div>

      {/* Action buttons outside the chatbox */}
      <div className="bg-[#141414]/50 backdrop-blur-sm rounded-[20px] p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={handleSummarizeClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl text-gray-400 hover:text-[#00ff88] transition-all duration-200"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="text-sm">Summarize text</span>
          </button>
          <button 
            onClick={handleSurpriseClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl text-gray-400 hover:text-[#00ff88] transition-all duration-200"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="text-sm">Surprise me</span>
          </button>
          <button 
            onClick={handleAnalyzeClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl text-gray-400 hover:text-[#00ff88] transition-all duration-200"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span className="text-sm">Analyze data</span>
          </button>
          <button 
            onClick={handlePlanClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl text-gray-400 hover:text-[#00ff88] transition-all duration-200"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span className="text-sm">Make a plan</span>
          </button>
        </div>
      </div>

      {/* Disclaimer message at the bottom */}
      <p className="text-center text-sm text-gray-500">
        Jasmine AI can make mistakes. Check important info.
      </p>
    </div>
  )
}