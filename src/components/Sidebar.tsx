import { ClockIcon, Square3Stack3DIcon, TrashIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default function Sidebar() {
  const [user, setUser] = useState<any>(null)

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

  return (
    <div className="w-64 bg-[#000a06] flex flex-col h-screen text-gray-400">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-white font-medium">JasmineAI</span>
        </div>
        <button className="p-1 hover:bg-[#1a2e23] rounded-lg">
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => {/* Handle new chat */}}
          className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-medium rounded-2xl p-3.5 flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <span className="text-lg font-normal">+</span>
          <span>New chat</span>
        </button>
      </div>

      {/* Menu Section */}
      <div className="px-3 py-2">
        <h2 className="px-4 text-xs font-medium mb-2">MENU</h2>
        <nav className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
            <ClockIcon className="h-5 w-5" />
            <span>History</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
            <Square3Stack3DIcon className="h-5 w-5" />
            <span>Collection</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
            <TrashIcon className="h-5 w-5" />
            <span>Bin</span>
          </button>
        </nav>
      </div>

      {/* General Section */}
      <div className="px-3 py-2 mt-4">
        <h2 className="px-4 text-xs font-medium mb-2">GENERAL</h2>
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-[#1a2e23] rounded-lg group">
          <Cog6ToothIcon className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Profile */}
      <div className="p-4 mt-auto">
        {user ? (
          <div className="flex items-center space-x-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-white">{user.displayName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="w-full bg-[#1a2e23] hover:bg-[#2a3f33] text-white rounded-lg p-2"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
} 