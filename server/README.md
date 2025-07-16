# MoodTrackr Backend API

The backend server for the MoodTrackr mental health tracking application, built with Node.js, Express, TypeScript, and Prisma.

## Features

- **RESTful API**: Clean, well-structured API endpoints
- **Authentication**: Secure authentication using Google OAuth and JWT
- **Real-time Updates**: WebSocket integration using Socket.IO
- **Database Integration**: Prisma ORM with SQLite database
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive Jest test suite
- **Middleware**: Custom authentication middleware for route protection

## Tech Stack

- **Node.js** with Express framework
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **SQLite** for data storage
- **Socket.IO** for real-time WebSocket communication
- **JWT** for authentication tokens
- **Google OAuth** for user authentication
- **Jest** for testing

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Data models and types
├── prisma/           # Prisma schema and migrations
├── routes/           # API route definitions
├── services/         # Business logic
├── tests/            # Test files
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── app.ts            # Express application setup
└── server.ts         # Server entry point
```

## API Endpoints

### Authentication

#### Google OAuth Login

**Endpoint:** `POST /api/auth/google`

**Description:** Authenticates a user with a Google OAuth token and returns a JWT token.

**Request Body:**

```json
{
  "token": "google-id-token"
}
```

**Response:**

```json
{
  "token": "jwt-auth-token"
}
```

**Status Codes:**

- `200 OK`: Authentication successful
- `400 Bad Request`: Missing or invalid token
- `500 Internal Server Error`: Server error

#### Get User Information

**Endpoint:** `GET /api/auth/user`

**Description:** Returns the authenticated user's information.

**Headers:**

```
Authorization: Bearer jwt-auth-token
```

**Response:**

```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "picture": "https://example.com/profile.jpg"
}
```

**Status Codes:**

- `200 OK`: Request successful
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Logs

#### Create Log

**Endpoint:** `POST /api/logs`

**Description:** Creates a new mental health log entry.

**Headers:**

```
Authorization: Bearer jwt-auth-token
```

**Request Body:**

```json
{
  "date": "2025-07-15",
  "mood": 4,
  "anxiety": 2,
  "sleepHours": 7.5,
  "sleepQuality": 3,
  "physicalActivity": 30,
  "socialInteractions": 2,
  "stressLevel": 3
}
```

**Response:**

```json
{
  "id": "log-id",
  "userId": "user-id",
  "date": "2025-07-15T00:00:00.000Z",
  "mood": 4,
  "anxiety": 2,
  "sleepHours": 7.5,
  "sleepQuality": 3,
  "physicalActivity": 30,
  "socialInteractions": 2,
  "stressLevel": 3,
  "createdAt": "2025-07-15T12:00:00.000Z",
  "updatedAt": "2025-07-15T12:00:00.000Z"
}
```

**Status Codes:**

- `201 Created`: Log created successfully
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Missing or invalid token
- `409 Conflict`: A log already exists for the specified date
- `500 Internal Server Error`: Server error

#### Get Logs

**Endpoint:** `GET /api/logs`

**Description:** Retrieves all logs for the authenticated user.

**Headers:**

```
Authorization: Bearer jwt-auth-token
```

**Query Parameters:**

- `startDate` (optional): Filter logs from this date (YYYY-MM-DD)
- `endDate` (optional): Filter logs until this date (YYYY-MM-DD)

**Response:**

```json
[
  {
    "id": "log-id-1",
    "userId": "user-id",
    "date": "2025-07-15T00:00:00.000Z",
    "mood": 4,
    "anxiety": 2,
    "sleepHours": 7.5,
    "sleepQuality": 3,
    "physicalActivity": 30,
    "socialInteractions": 2,
    "stressLevel": 3,
    "createdAt": "2025-07-15T12:00:00.000Z",
    "updatedAt": "2025-07-15T12:00:00.000Z"
  },
  {
    "id": "log-id-2",
    "userId": "user-id",
    "date": "2025-07-16T00:00:00.000Z",
    "mood": 5,
    "anxiety": 1,
    "sleepHours": 8,
    "sleepQuality": 4,
    "physicalActivity": 45,
    "socialInteractions": 3,
    "stressLevel": 2,
    "createdAt": "2025-07-16T12:00:00.000Z",
    "updatedAt": "2025-07-16T12:00:00.000Z"
  }
]
```

## WebSocket Events

The server uses Socket.IO to emit real-time events:

- `log:created`: Emitted when a new log is created
- `log:updated`: Emitted when a log is updated
- `log:deleted`: Emitted when a log is deleted

## Setup and Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository and navigate to the server directory

2. Copy environment variables template and configure

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Generate Prisma client

   ```bash
   npx prisma generate
   ```

5. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

### Running the Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

### Running Tests

```bash
npm test
```

For test coverage:

```bash
npm test -- --coverage
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration (e.g., "7d")
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `DATABASE_URL`: Database connection URL
- `CORS_ORIGIN`: Allowed CORS origin (e.g., http://localhost:5173)
