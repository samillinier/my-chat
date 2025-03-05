import { PlusIcon, GlobeAltIcon, LightBulbIcon, ArrowUpIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, ChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { useState, FormEvent, useRef } from 'react'

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

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
            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-[#2a2a2a] text-white px-3 py-1.5 rounded-full text-sm"
                  >
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
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

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttachClick}
                className={`flex items-center gap-2 px-4 py-2 ${
                  attachments.length > 0
                    ? 'text-[#00ff88] border-[#00ff88]'
                    : 'text-gray-400 hover:text-white border-[#2a2a2a]'
                } border rounded-full text-sm transition-colors duration-200`}
              >
                <PlusIcon className="h-4 w-4" />
                Attach
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