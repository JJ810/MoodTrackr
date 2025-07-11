import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyGoogleToken } from '../utils/googleAuth';
import config from '../config';

const prisma = new PrismaClient();

/**
 * Handle Google OAuth login
 * @param token Google ID token
 * @returns JWT token for authentication
 */
export const handleGoogleLogin = async (token: string) => {
  // Verify Google token
  const googlePayload = await verifyGoogleToken(token);

  if (!googlePayload || !googlePayload.email) {
    throw new Error('Invalid token payload');
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: googlePayload.email },
  });

  if (!user) {
    // Create new user if not exists
    user = await prisma.user.create({
      data: {
        email: googlePayload.email,
        name: googlePayload.name || 'User',
        picture: googlePayload.picture,
      },
    });
  } else {
    // Update user information if needed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: googlePayload.name || user.name,
        picture: googlePayload.picture || user.picture,
      },
    });
  }

  const payload = {
    id: user.id,
    email: user.email
  };

  const authToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  return authToken;
};

/**
 * Get user by ID
 * @param userId User ID
 * @returns User data
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
