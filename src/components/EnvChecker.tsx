'use client';

export default function EnvChecker() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50">
      <p className="font-bold">Missing Environment Variables:</p>
      <ul className="list-disc list-inside">
        {missingVars.map(variable => (
          <li key={variable}>{variable}</li>
        ))}
      </ul>
    </div>
  );
} 