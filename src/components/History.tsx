import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export interface ChatHistory {
  id: string;
  title: string;
  messages: {
    content: string;
    role: 'user' | 'assistant';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryProps {
  onSelectChat: (chatId: string, messages: ChatHistory['messages']) => void;
  isOpen: boolean;
  currentChatId?: string;
  chatHistory: ChatHistory[];
}

export default function History({ onSelectChat, isOpen, currentChatId, chatHistory }: HistoryProps) {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return format(new Date(date), 'M/d/yyyy, h:mm:ss a');
  };

  return (
    <div className="bg-[#011f13] border border-[#1a2e23] mt-1 rounded-lg overflow-hidden">
      <div className="divide-y divide-[#1a2e23]">
        {chatHistory.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">
            No chat history
          </div>
        ) : (
          chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id, chat.messages)}
              className={`w-full text-left p-3 hover:bg-[#1a2e23] transition-colors ${
                currentChatId === chat.id ? 'bg-[#1a2e23]' : ''
              }`}
            >
              <div className="space-y-2">
                {chat.messages.slice(0, 2).map((message, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      message.role === 'user' 
                        ? 'bg-[#00D26A]/20 text-[#00D26A]' 
                        : 'bg-gray-700/20 text-gray-300'
                    }`}>
                      {message.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <p className={`text-sm line-clamp-1 flex-1 ${
                      message.role === 'user' ? 'text-[#00D26A]' : 'text-gray-300'
                    }`}>
                      {message.content}
                    </p>
                  </div>
                ))}
                {chat.messages.length > 2 && (
                  <p className="text-xs text-gray-500 pl-7">
                    +{chat.messages.length - 2} more messages
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {formatDate(chat.updatedAt)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 