import { 
  ClockIcon, 
  Square3Stack3DIcon, 
  TrashIcon, 
  Cog6ToothIcon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import History, { ChatHistory } from './History'

interface CollectionItem {
  id: string
  content: string
  timestamp: Date
}

interface SidebarProps {
  collection?: CollectionItem[]
  onDeleteFromCollection?: (id: string) => void
  onNewChat: () => void
  chatHistory: ChatHistory[]
  currentChatId?: string
  onSelectChat: (chatId: string, messages: ChatHistory['messages']) => void
  onDeleteChat: (chatId: string) => void
  binChats: ChatHistory[]
  onRestoreChat: (chatId: string) => void
  onPermanentDelete: (chatId: string) => void
  onEmptyBin: () => void
}

interface PreviewModalProps {
  content: string;
  onClose: () => void;
}

function PreviewModal({ content, onClose }: PreviewModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#011f13] border border-[#1a2e23] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#1a2e23]">
          <h3 className="text-white font-medium">Preview Content</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a2e23] rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-gray-300 text-base whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ 
  collection = [], 
  onDeleteFromCollection,
  onNewChat,
  chatHistory,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  binChats,
  onRestoreChat,
  onPermanentDelete,
  onEmptyBin
}: SidebarProps) {
  const [user, setUser] = useState<any>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)
  const [isBinOpen, setIsBinOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<{ id: string; content: string } | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="w-64 bg-[#000a06] flex flex-col h-screen text-gray-400">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-tr from-green-400 to-green-500 rounded-full"></div>
          <div className="flex items-center">
            <span className="logo-text text-white text-2xl tracking-tight">Jasmine</span>
            <span className="logo-text logo-text-ai text-2xl ml-1.5">AI</span>
          </div>
        </div>
        <button className="p-1 hover:bg-[#1a2e23] rounded-lg">
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onNewChat}
          className="w-full bg-[#00D26A] hover:bg-[#00bf62] text-black font-medium rounded-xl p-3 flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <span className="text-lg font-normal">+</span>
          <span>New chat</span>
        </button>
      </div>

      {/* Menu Section */}
      <div className="px-3 flex-1 overflow-hidden">
        <h2 className="px-4 text-xs font-medium mb-2 text-gray-500">MENU</h2>
        <nav className="space-y-1">
          <div>
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group"
            >
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5" />
                <span>History</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#1a2e23] text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {chatHistory.length}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isHistoryOpen ? 'transform rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isHistoryOpen ? 'max-h-[calc(100vh-300px)]' : 'max-h-0'
            }`}>
              <History 
                isOpen={isHistoryOpen} 
                onSelectChat={onSelectChat}
                currentChatId={currentChatId}
                chatHistory={chatHistory}
                onDeleteChat={onDeleteChat}
              />
            </div>
          </div>

          {/* Collection Section */}
          <div className="relative">
            <button 
              onClick={() => setIsCollectionOpen(!isCollectionOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group"
            >
              <div className="flex items-center space-x-3">
                <Square3Stack3DIcon className="h-5 w-5" />
                <span>Collection</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#1a2e23] text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {collection.length}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isCollectionOpen ? 'transform rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isCollectionOpen ? 'max-h-[300px]' : 'max-h-0'
            }`}>
              <div className="bg-[#011f13] border border-[#1a2e23] rounded-lg mt-1 overflow-y-auto max-h-[300px]">
                {collection.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No saved messages yet
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {collection.map((item) => (
                      <div key={item.id} className="group relative p-3 hover:bg-[#1a2e23] transition-colors">
                        <p className={`text-gray-300 text-sm ${
                          previewContent?.id === item.id ? '' : 'line-clamp-2'
                        } mb-1`}>
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setModalContent(item.content)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#243b2f] rounded text-gray-400 hover:text-[#00D26A] transition-all"
                              title="Show in modal"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {onDeleteFromCollection && (
                              <button
                                onClick={() => onDeleteFromCollection(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#243b2f] rounded text-gray-400 hover:text-red-400 transition-all"
                                title="Delete from collection"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* General Section */}
          <div>
            <h2 className="px-4 text-xs font-medium mb-2 mt-4 text-gray-500">GENERAL</h2>
            <div className="space-y-1">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <div>
                <button 
                  onClick={() => setIsBinOpen(!isBinOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group"
                >
                  <div className="flex items-center space-x-3">
                    <TrashIcon className="h-5 w-5" />
                    <span>Bin</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#1a2e23] text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      {binChats.length}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isBinOpen ? 'transform rotate-180' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isBinOpen ? 'max-h-[300px]' : 'max-h-0'
                }`}>
                  <div className="bg-[#011f13] border border-[#1a2e23] rounded-lg mt-1 overflow-y-auto max-h-[300px]">
                    {binChats.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        Bin is empty
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {binChats.map((chat) => (
                          <div key={chat.id} className="group relative p-3 hover:bg-[#1a2e23] transition-colors">
                            <div className="space-y-2">
                              {chat.messages.slice(0, 1).map((message, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    message.role === 'user' 
                                      ? 'bg-[#00D26A]/20 text-[#00D26A]' 
                                      : 'bg-gray-700/20 text-gray-300'
                                  }`}>
                                    {message.role === 'user' ? 'You' : 'AI'}
                                  </span>
                                  <p className="text-sm line-clamp-1 flex-1 text-gray-300">
                                    {message.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(chat.updatedAt)}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => onRestoreChat(chat.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#243b2f] rounded text-gray-400 hover:text-[#00D26A] transition-all"
                                  title="Restore chat"
                                >
                                  <ArrowRightOnRectangleIcon className="h-4 w-4 transform rotate-180" />
                                </button>
                                <button
                                  onClick={() => onPermanentDelete(chat.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#243b2f] rounded text-gray-400 hover:text-red-400 transition-all"
                                  title="Delete permanently"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={onEmptyBin}
                          className="w-full text-center p-2 text-xs text-gray-400 hover:text-red-400 hover:bg-[#1a2e23] transition-colors"
                        >
                          Empty Bin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-[#1a2e23]">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 hover:bg-[#1a2e23] rounded-lg text-gray-400 hover:text-white"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
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
        )}
      </div>

      {/* Preview Modal */}
      {modalContent && (
        <PreviewModal
          content={modalContent}
          onClose={() => setModalContent(null)}
        />
      )}
    </div>
  )
} 