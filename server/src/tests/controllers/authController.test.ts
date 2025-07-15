import { Request, Response } from 'express';
import * as authController from '../../controllers/authController';
import * as authService from '../../services/authService';

jest.mock('../../services/authService', () => ({
  handleGoogleLogin: jest.fn(),
  getUserById: jest.fn(),
}));

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', email: 'test@example.com' },
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('googleLogin', () => {
    it('should return 400 if token is missing', async () => {
      mockReq.body = {};

      await authController.googleLogin(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token is required' });
    });

    it('should return JWT token on successful login', async () => {
      const mockToken = 'mock-google-token';
      const mockJwtToken = 'mock-jwt-token';

      mockReq.body = { token: mockToken };
      (authService.handleGoogleLogin as jest.Mock).mockResolvedValue(mockJwtToken);

      await authController.googleLogin(mockReq as Request, mockRes as Response);

      expect(authService.handleGoogleLogin).toHaveBeenCalledWith(mockToken);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ token: mockJwtToken });
    });

    it('should return 500 if authentication fails', async () => {
      // Mock failed login
      mockReq.body = { token: 'invalid-token' };
      (authService.handleGoogleLogin as jest.Mock).mockRejectedValue(new Error('Auth failed'));

      await authController.googleLogin(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
    });
  });

  describe('getUser', () => {
    it('should return 401 if user is not authenticated', async () => {
      // No user in request
      mockReq.user = undefined;

      await authController.getUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return user data for authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await authController.getUser(mockReq as Request, mockRes as Response);

      expect(authService.getUserById).toHaveBeenCalledWith('user-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user is not found', async () => {
      (authService.getUserById as jest.Mock).mockRejectedValue(new Error('User not found'));

      await authController.getUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});
