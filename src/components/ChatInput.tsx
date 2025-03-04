import { PlusIcon, GlobeAltIcon, LightBulbIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { useState, FormEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onScrollToTop?: () => void
}

export default function ChatInput({ onSendMessage, onScrollToTop }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative">
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
          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jasmine anything"
              className="w-full p-4 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-[#2a2a2a] rounded-full text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Attach
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-[#2a2a2a] rounded-full text-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              Search
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-[#2a2a2a] rounded-full text-sm"
            >
              <LightBulbIcon className="h-4 w-4" />
              Reason
            </button>
          </div>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-2">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  )
} 