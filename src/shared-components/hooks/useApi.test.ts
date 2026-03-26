import { renderHook, act } from '@testing-library/react';
import { useApi } from './useApi';
import '@testing-library/jest-dom';

describe('useApi Custom Hook', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const BASE_URL = 'http://localhost:90/users';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization Tests', () => {
    it('should return callApi function', () => {
      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      expect(result.current.callApi).toBeDefined();
      expect(typeof result.current.callApi).toBe('function');
    });

    it('should return isLoading state (initially false)', () => {
      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      expect(result.current.isLoading).toBe(false);
    });

    it('should accept path parameter', () => {
      const { result } = renderHook(() =>
        useApi('/custom-path', mockOnSuccess, mockOnError)
      );

      expect(result.current).toBeDefined();
    });

    it('should accept onSuccess callback', () => {
      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      expect(result.current).toBeDefined();
    });

    it('should accept onError callback', () => {
      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      expect(result.current).toBeDefined();
    });

    it('should accept optional ApiOptions parameter', () => {
      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
        headers: { 'Content-Type': 'application/json' },
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('API Call Tests', () => {
    it('should construct correct URL using BASE_URL and path', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const { result } = renderHook(() =>
        useApi('/test-path', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test-path`,
        undefined
      );
    });

    it('should call fetch with correct URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const { result } = renderHook(() =>
        useApi('/verify', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:90/users/verify',
        undefined
      );
    });

    it('should pass options to fetch (method, headers, credentials, body)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
        headers: { Authorization: 'Bearer token123' },
        body: JSON.stringify({ data: 'test' }),
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        options
      );
    });

    it('should set isLoading to true when API call starts', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Success' }),
                }),
              100
            );
          })
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      act(() => {
        result.current.callApi();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to false when API call completes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should parse response as JSON', async () => {
      const mockJsonFn = jest.fn().mockResolvedValue({ message: 'Success' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: mockJsonFn,
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockJsonFn).toHaveBeenCalled();
    });
  });

  describe('Success Flow Tests', () => {
    it('should call onSuccess callback with message on successful response (response.ok = true)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Operation successful' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('Operation successful');
    });

    it('should extract message from response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test message' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('Test message');
    });

    it('should handle 200 status code correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Success 200' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('Success 200');
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle 201 status code correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ message: 'Created 201' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('Created 201');
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('Error Flow Tests', () => {
    it('should call onError callback when response.ok is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error occurred' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith('Error occurred');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should call onError with error message from response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Custom error message' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith('Custom error message');
    });

    it('should handle 400 status code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith('Bad Request');
    });

    it('should handle 401 status code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith('Unauthorized');
    });

    it('should handle 500 status code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith('Internal Server Error');
    });

    it('should call onError with "Service is down. Please try again later" on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        'Service is down. Please try again later'
      );
    });

    it('should handle fetch exceptions gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Fetch failed')
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Loading State Tests', () => {
    it('isLoading should be false initially', () => {
      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      expect(result.current.isLoading).toBe(false);
    });

    it('isLoading should be true during API call', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Success' }),
                }),
              100
            );
          })
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      act(() => {
        result.current.callApi();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('isLoading should be false after successful API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('isLoading should be false after failed API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('isLoading should be false after network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Options Tests', () => {
    it('should support GET method', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'GET' as const,
        credentials: 'include' as RequestCredentials,
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should support POST method', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should include Authorization header when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'GET' as const,
        credentials: 'include' as RequestCredentials,
        headers: { Authorization: 'Bearer token123' },
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({
          headers: { Authorization: 'Bearer token123' },
        })
      );
    });

    it('should include credentials: "include" when specified', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should include custom headers when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('should include request body when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const requestBody = JSON.stringify({ username: 'test', password: 'pass' });
      const options = {
        method: 'POST' as const,
        credentials: 'include' as RequestCredentials,
        body: requestBody,
      };

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, options)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({ body: requestBody })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith('');
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        'Service is down. Please try again later'
      );
    });

    it('should handle undefined options parameter', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError, undefined)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        undefined
      );
      expect(mockOnSuccess).toHaveBeenCalledWith('Success');
    });

    it('should handle network timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const { result } = renderHook(() =>
        useApi('/test', mockOnSuccess, mockOnError)
      );

      await act(async () => {
        await result.current.callApi();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        'Service is down. Please try again later'
      );
      expect(result.current.isLoading).toBe(false);
    });
  });
});
