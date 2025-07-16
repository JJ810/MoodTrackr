# MoodTrackr Frontend

The frontend for the MoodTrackr mental health tracking application, built with React, TypeScript, and Vite.

## Features

- **User Dashboard**: Interactive dashboard displaying mental health metrics and trends
- **Daily Log Form**: Comprehensive form for recording daily mental health status
- **Data Visualization**: Interactive charts showing mood, anxiety, and other metrics over time
- **Real-time Updates**: WebSocket integration for immediate data reflection
- **Responsive Design**: Mobile-first approach ensuring usability across all devices
- **Interactive Tour**: Guided onboarding experience for new users
- **Authentication**: Secure login with Google OAuth

## Tech Stack

- **React 18** with TypeScript for UI development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Shadcn/UI** for accessible, customizable UI components
- **Zustand** for state management
- **Socket.IO Client** for real-time WebSocket communication
- **Recharts** library for data visualization
- **React Router** for client-side routing
- **Intro.js** for interactive user tours
- **Vitest** for unit and component testing

## Project Structure

```
src/
├── assets/          # Static assets like images
├── components/      # Reusable UI components
│   ├── auth/        # Authentication-related components
│   ├── dashboard/   # Dashboard-related components
│   ├── layout/      # Layout components (header, footer, etc.)
│   ├── mood-logs/   # Components for logging and displaying mood data
│   └── ui/          # Base UI components (buttons, inputs, etc.)
├── contexts/        # React context providers
├── lib/             # Utility functions and helpers
├── pages/           # Page components (empty directory for future use)
├── stores/          # Zustand state stores
├── test/            # Test setup and utilities
└── types/           # TypeScript type definitions (empty directory for future use)
```

## Getting Started

### Prerequisites

- Node.js (v22+)
- npm or yarn

### Installation

1. Install dependencies

```bash
npm install
```

2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your API URL and other settings
```

### Development

```bash
npm run dev
```

This starts the development server at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Built files will be in the `dist` directory

### Running Tests

```bash
npm test
```

For test coverage:

```bash
npm test -- --coverage
```

## Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for static type checking
