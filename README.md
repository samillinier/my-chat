# Jasmine AI Chat Interface

A modern chat interface built with Next.js, TypeScript, and Firebase, inspired by AI chat applications.

## Features

- 🎨 Modern and responsive design
- 🔐 Google Authentication
- 💾 Firebase integration for data persistence
- 📱 Mobile-friendly interface
- 🌙 Dark mode design

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- A Firebase project with Google Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd jasmine-chat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Firebase](https://firebase.google.com/) - Backend and Authentication
- [Heroicons](https://heroicons.com/) - Icons

## Development

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking

## License

This project is licensed under the MIT License - see the LICENSE file for details.
