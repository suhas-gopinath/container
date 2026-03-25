import { verifyV2, refreshToken, logout } from './authApi';
import { setAccessToken, clearAccessToken } from '../shared-auth/authSlice';

// Mock fetch globally
global.fetch = jest.fn();

// Mock dispatch function
const mockDispatch = jest.fn();

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('verifyV2', () => {
    test('should call verify/v2 API with Authorization header', async () => {
      const mockResponse = { message: 'Token is valid' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyV2('test-token-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:90/users/verify/v2',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
          }),
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should throw error when API call fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(verifyV2('invalid-token')).rejects.toThrow('Verify v2 failed: Unauthorized');
    });
  });

  describe('refreshToken', () => {
    test('should call refresh API and dispatch setAccessToken', async () => {
      const mockResponse = {
        message: 'Token refreshed successfully',
        accessToken: 'new-access-token-789',
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await refreshToken(mockDispatch as any);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:90/users/refresh',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(setAccessToken('new-access-token-789'));
      expect(result).toEqual(mockResponse);
    });

    test('should not dispatch if no accessToken in response', async () => {
      const mockResponse = { message: 'Refresh failed' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await refreshToken(mockDispatch as any);

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    test('should throw error when refresh fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(refreshToken(mockDispatch as any)).rejects.toThrow('Refresh token failed: Forbidden');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Mock sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          clear: jest.fn(),
        },
        writable: true,
      });
    });

    test('should call logout API and dispatch clearAccessToken', async () => {
      const mockResponse = { message: 'Logged out successfully' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await logout(mockDispatch as any);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:90/users/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(clearAccessToken());
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    test('should clear Redux state and sessionStorage even on API failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(logout(mockDispatch as any)).rejects.toThrow('Network error');

      expect(mockDispatch).toHaveBeenCalledWith(clearAccessToken());
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });
});