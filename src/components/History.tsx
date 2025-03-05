import { useState } from 'react';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface ChatHistory {
  id: string;
  title: string;
  messages: {
    content: string;
    role: 'user' | 'assistant';
    attachments?: {
      name: string;
      type: string;
      size: number;
      url?: string;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryProps {
  onSelectChat: (chatId: string, messages: ChatHistory['messages']) => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  currentChatId?: string;
  chatHistory: ChatHistory[];
}

export default function History({ onSelectChat, onDeleteChat, isOpen, currentChatId, chatHistory }: HistoryProps) {
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return format(new Date(date), 'M/d/yyyy, h:mm:ss a');
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
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
            <div
              key={chat.id}
              className={`relative group ${
                currentChatId === chat.id ? 'bg-[#1a2e23]' : ''
              }`}
            >
              <button
                onClick={() => {
                  onSelectChat(chat.id, chat.messages);
                  setExpandedChatId(expandedChatId === chat.id ? null : chat.id);
                }}
                className="w-full text-left p-3 hover:bg-[#1a2e23] transition-colors"
              >
                <div className="space-y-2">
                  {(expandedChatId === chat.id ? chat.messages : chat.messages.slice(0, 2)).map((message, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        message.role === 'user' 
                          ? 'bg-[#00D26A]/20 text-[#00D26A]' 
                          : 'bg-gray-700/20 text-gray-300'
                      }`}>
                        {message.role === 'user' ? 'You' : 'AI'}
                      </span>
                      <p className={`text-sm ${expandedChatId === chat.id ? '' : 'line-clamp-1'} flex-1 ${
                        message.role === 'user' ? 'text-[#00D26A]' : 'text-gray-300'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  ))}
                  {expandedChatId !== chat.id && chat.messages.length > 2 && (
                    <p className="text-xs text-gray-500 pl-7">
                      +{chat.messages.length - 2} more messages
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(chat.updatedAt)}
                </p>
              </button>
              <button
                onClick={(e) => handleDelete(e, chat.id)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#243b2f] rounded text-gray-400 hover:text-red-400 transition-all"
                title="Delete chat"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 