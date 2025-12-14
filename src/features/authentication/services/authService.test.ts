// Test file for authentication service
// This file demonstrates how to test the auth service

import { authService } from './authService';

// Mock test data based on Ensogo API
const mockLoginCredentials = {
  phone_number: '0987654321',
  password: 'Password123',
};

const mockLoginResponse = {
  success: true,
  message: 'Login successful',
  data: {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: '123',
      phone_number: '0987654321',
      name: 'Test User',
      is_verified: true,
    },
  },
};

// Example test cases (uncomment when setting up Jest)
/*
describe('AuthService', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock the API call
      const mockApiCall = jest.spyOn(apiClient, 'post').mockResolvedValue(mockLoginResponse);

      const result = await authService.login(mockLoginCredentials);

      expect(mockApiCall).toHaveBeenCalledWith('/iam/v1/auth/login', mockLoginCredentials);
      expect(result.success).toBe(true);
      expect(result.data?.user.phone_number).toBe('0987654321');
    });

    it('should handle login failure', async () => {
      const mockError = {
        success: false,
        message: 'Invalid credentials',
        errors: {
          phone_number: ['Invalid phone number'],
        },
      };

      jest.spyOn(apiClient, 'post').mockRejectedValue(mockError);

      await expect(authService.login(mockLoginCredentials)).rejects.toMatchObject({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockApiCall = jest.spyOn(apiClient, 'post').mockResolvedValue({
        success: true,
        message: 'Logged out successfully',
      });

      const result = await authService.logout();

      expect(result.success).toBe(true);
    });
  });
});
*/

// Manual testing function (for development)
export const testAuthService = async () => {
  console.log('Testing Auth Service...');
  
  try {
    // Test login
    console.log('Testing login...');
    const loginResult = await authService.login(mockLoginCredentials);
    console.log('Login result:', loginResult);

    // Test get current user
    console.log('Testing get current user...');
    const userResult = await authService.getCurrentUser();
    console.log('User result:', userResult);

    // Test logout
    console.log('Testing logout...');
    const logoutResult = await authService.logout();
    console.log('Logout result:', logoutResult);

  } catch (error) {
    console.error('Auth service test failed:', error);
  }
};

// Export for manual testing in development
if (__DEV__) {
  // You can call testAuthService() in your development environment
  // testAuthService();
}
