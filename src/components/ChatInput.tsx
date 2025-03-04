import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useState, FormEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Send a message..."
        className="w-full p-4 pr-12 bg-[#1a2e23] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a3f33] placeholder-gray-400"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white disabled:hover:text-gray-400"
        disabled={!input.trim()}
      >
        <PaperAirplaneIcon className="h-6 w-6" />
      </button>
    </form>
  )
} 