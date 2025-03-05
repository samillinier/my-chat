'use client'

import { useEffect, useState } from 'react'
import { initFirebase } from '@/lib/firebase'
import EnvChecker from './EnvChecker'

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      console.log('Starting Firebase initialization...');
      try {
        if (typeof window === 'undefined') {
          console.log('Window is undefined, skipping initialization');
          return;
        }
        
        console.log('Setting client state...');
        setIsClient(true);
        
        console.log('Initializing Firebase...');
        const result = await Promise.resolve(initFirebase());
        console.log('Firebase initialization result:', result);
        
        if (mounted) {
          console.log('Setting initialized state...');
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Detailed Firebase initialization error:', err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize application';
          console.error('Setting error state:', errorMessage);
          setError(errorMessage);
          setIsInitialized(false);
        }
      }
    };

    initialize();

    return () => {
      console.log('Cleanup: unmounting AppWrapper');
      mounted = false;
    };
  }, []);

  if (!isClient || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00D26A] mb-4"></div>
        <div className="text-center mb-4">
          <p className="text-gray-400">
            {!isClient ? 'Initializing client...' : 'Initializing Firebase...'}
          </p>
        </div>
        {error && (
          <div className="text-red-500 text-center max-w-md px-4">
            <p className="font-medium">Initialization Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <EnvChecker />
      {children}
    </>
  )
} 