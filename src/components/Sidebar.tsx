import { 
  ClockIcon, 
  Square3Stack3DIcon, 
  TrashIcon, 
  Cog6ToothIcon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon 
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
}

export default function Sidebar({ 
  collection = [], 
  onDeleteFromCollection,
  onNewChat,
  chatHistory,
  currentChatId,
  onSelectChat
}: SidebarProps) {
  const [user, setUser] = useState<any>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)

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
                        <p className="text-gray-300 text-sm line-clamp-2 mb-1">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
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
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
                <TrashIcon className="h-5 w-5" />
                <span>Bin</span>
              </button>
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
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white bg-[#1a2e23] hover:bg-[#243b2f] rounded-lg transition-colors"
          >
            <span>Sign in</span>
          </button>
        )}
      </div>
    </div>
  )
} 