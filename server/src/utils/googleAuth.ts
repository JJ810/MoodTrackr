import { OAuth2Client } from 'google-auth-library';
import config from '../config';

// Create a new OAuth client
const client = new OAuth2Client(config.google.clientId);

/**
 * Verify a Google ID token and return the payload
 * @param token Google ID token
 * @returns The token payload if valid
 */
export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });
    
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};
