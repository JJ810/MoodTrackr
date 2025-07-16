# MoodTrackr

A comprehensive mental health tracking application that allows users to monitor their emotional well-being over time.

## Overview

MoodTrackr is a full-stack web application designed to help users track and visualize their mental health metrics. It provides a secure, user-friendly interface for logging daily mood states, anxiety levels, sleep patterns, and more, with interactive visualizations to identify trends and patterns.

## Features

- **User Authentication**: Secure login with Google OAuth
- **Daily Mental Health Logging**: Track mood, anxiety, sleep, physical activity, social interactions, and stress levels
- **Interactive Data Visualization**: View trends over time with customizable charts
- **Real-time Updates**: WebSocket integration for immediate data reflection
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Guided User Experience**: Interactive tour for new users

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- Zustand for state management
- Socket.IO client for real-time updates
- Chart.js for data visualization
- Intro.js for interactive tours

### Backend

- Node.js with Express
- TypeScript for type safety
- Prisma ORM with SQLite database
- Socket.IO for WebSockets
- JWT for authentication
- Google OAuth for user login

## Project Structure

This project uses a monorepo structure managed with npm workspaces, allowing for easier dependency management and cross-package development.

The repository is organized into two main workspaces:

- `/client` - Frontend React application
- `/server` - Backend Node.js API

The monorepo setup enables running both client and server with a single command and sharing types and utilities between packages.

## Getting Started

### Prerequisites

- Node.js (v22+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/mood-trackr.git
cd mood-trackr
```

2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables

```bash
# In the server directory
cp .env.example .env
# Edit .env with your Google OAuth credentials and JWT secret
```

4. Initialize the database

```bash
# In the server directory
npx prisma migrate dev
```

### Running the Application

#### Development Mode

**Option 1: Run both server and client concurrently**

```bash
# In the root directory
npm run dev
```

**Option 2: Run server and client separately**

1. Start the backend server

```bash
# In the server directory
npm run dev
```

2. Start the frontend development server

```bash
# In the client directory
npm run dev
```

3. Access the application at `http://localhost:5173`

#### Production Mode

1. Build the frontend

```bash
# In the client directory
npm run build
```

2. Start the production server

```bash
# In the server directory
npm start
```

## Testing

### Backend Tests

```bash
# In the server directory
npm test
```

### Frontend Tests

```bash
# In the client directory
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
