import { apiClient } from './client';
import type { AuthResponse, User } from './types';

export class AuthService {
  async googleLogin(googleToken: string): Promise<AuthResponse> {
    try {
      const loginResponse = await apiClient.post(
        '/api/auth/google',
        { token: googleToken }
      );

      let jwtToken: string;

      if (loginResponse) {
        if (loginResponse.token) {
          jwtToken = loginResponse.token;
        } else {
          console.error('Unexpected token response structure:', loginResponse);
          throw new Error('Invalid token format from server');
        }
      } else {
        console.error('Empty login response data');
        throw new Error('Empty response from server');
      }

      if (!jwtToken) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('authToken', jwtToken);

      const userData = await apiClient.get('/api/auth/user');

      let user: User;

      if (userData) {
        if ('id' in userData) {
          user = userData as User;
        } else {
          console.error('Unexpected user response structure:', userData);
          throw new Error('Invalid user data format from server');
        }
      } else {
        console.error('Empty user response data');
        throw new Error('Empty user data from server');
      }

      return { token: jwtToken, user };
    } catch (error) {
      console.error('Google login error:', error);
      localStorage.removeItem('authToken');
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      console.log('AuthService: Fetching current user data');
      const response = await apiClient.get('/api/auth/user', {
        useCache: true,
        cacheTime: 5 * 60 * 1000
      });
      
      console.log('AuthService: User data response:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        // If the response is the user object directly
        if ('id' in response) {
          console.log('AuthService: Direct user object received');
          return response as User;
        }
        // If the response has a data property containing the user
        else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          console.log('AuthService: User object in data property');
          return response.data as User;
        }
      }
      
      console.error('AuthService: Invalid user data format:', response);
      throw new Error('Invalid user data format received');
    } catch (error) {
      console.error('AuthService: Error fetching current user:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    apiClient.clearCache();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
