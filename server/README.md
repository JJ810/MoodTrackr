# MoodTrackr API

Backend server for the MoodTrackr application.

## Authentication Endpoints

### Google OAuth Login

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

### Get User Information

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

## Setup

1. Copy `.env.example` to `.env` and update the values:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

4. Run database migrations:
   ```
   npm run prisma:migrate
   ```

5. Start the development server:
   ```
   npm run dev
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
