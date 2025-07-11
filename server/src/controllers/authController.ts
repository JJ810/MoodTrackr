import { Request, Response } from 'express';
import { handleGoogleLogin, getUserById } from '../services/authService';

/**
 * Handle Google OAuth login
 * @param req Express request
 * @param res Express response
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    // Process login through service
    const authToken = await handleGoogleLogin(token);
    
    // Return the JWT token
    res.status(200).json({ token: authToken });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

/**
 * Get authenticated user information
 * @param req Express request
 * @param res Express response
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user through service
    try {
      const user = await getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user information' });
  }
};
