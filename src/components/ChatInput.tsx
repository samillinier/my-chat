import { PlusIcon, GlobeAltIcon, LightBulbIcon, ArrowUpIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, ChartBarIcon, ClipboardDocumentListIcon, LinkIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { extractTextFromPDF, processImage, processURL, isValidURL, processDocx, processVideo, formatDuration } from '@/utils/contentProcessing'
import { PaperClipIcon, VideoCameraIcon, DocumentIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline'

interface ProcessedFile extends File {
  content?: string
  imageUrl?: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  metadata?: any
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments: FileAttachment[]) => void
  onScrollToTop?: () => void
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

let attachmentIdCounter = 0

export default function ChatInput({ onSendMessage, onScrollToTop }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isReasoningMode, setIsReasoningMode] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [idCounter, setIdCounter] = useState(0)

  const generateAttachmentId = () => {
    setIdCounter(prev => prev + 1)
    return `attachment-${idCounter}`
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', { input, attachments: attachments.map(f => f.name) })
    
    if (input.trim() || attachments.length > 0) {
      let message = input
      
      // Check if input is a URL
      if (input.trim() && isValidURL(input.trim())) {
        processURL(input.trim())
          .then(content => {
            const urlMessage = `Please analyze this content from ${input.trim()}:\n\n${content}`
            onSendMessage(urlMessage, [])
          })
          .catch(error => {
            console.error('Error processing URL:', error)
            alert('Failed to fetch URL content. Please try again.')
          })
        return
      }

      if (isReasoningMode) {
        message = `Please help me reason through this step by step: ${input}`
      } else if (isSearchMode) {
        message = `Please search the web for information about: ${input}`
      }
      
      console.log('Sending message with attachments:', {
        message,
        attachmentCount: attachments.length,
        attachmentNames: attachments.map(f => f.name)
      })
      
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Convert FileList to array for iteration
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      try {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 50MB.`)
          continue
        }

        const attachment: FileAttachment = {
          id: generateAttachmentId(),
          name: file.name,
          type: file.type,
          file // Store the original File object
        }

        // Process different file types
        if (file.type === 'application/pdf') {
          const text = await extractTextFromPDF(file)
          attachment.content = text
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                  file.type === 'application/msword') {
          const text = await processDocx(file)
          attachment.content = text
        } else if (file.type.startsWith('video/')) {
          const { duration, thumbnailUrl, metadata } = await processVideo(file)
          const videoUrl = URL.createObjectURL(file)
          attachment.videoUrl = videoUrl
          attachment.videoDuration = formatDuration(duration)
          attachment.videoThumbnail = thumbnailUrl
          attachment.content = `Video: ${file.name} (${formatDuration(duration)})`
        } else if (file.type.startsWith('image/')) {
          const { url, description } = await processImage(file)
          attachment.imageUrl = url
          attachment.content = description
        } else if (file.type === 'text/plain' || file.type === 'application/json') {
          const text = await file.text()
          attachment.content = text
        } else {
          alert(`Unsupported file type: ${file.type}`)
          continue
        }

        setAttachments(prev => [...prev, attachment])
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        alert(`Failed to process file ${file.name}. Please try again.`)
      }
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  // Cleanup object URLs when component unmounts or attachments change
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.imageUrl) {
          URL.revokeObjectURL(attachment.imageUrl)
        }
        if (attachment.videoUrl) {
          URL.revokeObjectURL(attachment.videoUrl)
        }
        if (attachment.videoThumbnail) {
          URL.revokeObjectURL(attachment.videoThumbnail)
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
    onSendMessage(randomSurprise, [])
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
            onClick={(e) => {
              e.preventDefault();
              if (input.trim() || attachments.length > 0) {
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#00D26A] transition-all duration-200"
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
              accept="text/*,.json,.pdf,application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4"
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
                    {file.type.startsWith('image/') && file.file && (
                      <div className="relative w-8 h-8">
                        <img
                          src={URL.createObjectURL(file.file)}
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
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-[#2a2a2a] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-xs text-center">
                  Supports text, JSON, PDF, images, DOC, DOCX, and MP4 files. You can also paste URLs.
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