import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageProvider, useMessage } from './MessageContext';

describe('MessageContext', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hook Initialization', () => {
    it('should throw error when useMessage is used outside MessageProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useMessage());
      }).toThrow('useMessage must be used within a MessageProvider');

      consoleError.mockRestore();
    });

    it('should return context value when used within MessageProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.messages).toEqual([]);
      expect(typeof result.current.showMessage).toBe('function');
      expect(typeof result.current.removeMessage).toBe('function');
      expect(typeof result.current.clearAllMessages).toBe('function');
    });
  });

  describe('showMessage Function', () => {
    it('should add success message to messages array', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'Operation successful');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe('Operation successful');
      expect(result.current.messages[0].type).toBe('success');
      expect(result.current.messages[0].id).toBeDefined();
    });

    it('should add error message to messages array', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('error', 'Operation failed');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe('Operation failed');
      expect(result.current.messages[0].type).toBe('error');
    });

    it('should generate unique id for each message', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'First message');
      });

      const firstId = result.current.messages[0].id;

      act(() => {
        result.current.showMessage('error', 'Second message');
      });

      const secondId = result.current.messages[1].id;

      expect(firstId).not.toBe(secondId);
    });

    it('should support multiple messages simultaneously', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'First message');
        result.current.showMessage('error', 'Second message');
        result.current.showMessage('success', 'Third message');
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].text).toBe('First message');
      expect(result.current.messages[1].text).toBe('Second message');
      expect(result.current.messages[2].text).toBe('Third message');
    });

    it('should auto-remove message after 5 seconds', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'Auto-dismiss message');
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(0);
      });
    });
  });

  describe('removeMessage Function', () => {
    it('should remove specific message by id', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'First message');
        result.current.showMessage('error', 'Second message');
      });

      const messageIdToRemove = result.current.messages[0].id;

      act(() => {
        result.current.removeMessage(messageIdToRemove);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe('Second message');
    });

    it('should not affect other messages when removing one', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'First message');
        result.current.showMessage('error', 'Second message');
        result.current.showMessage('success', 'Third message');
      });

      const middleMessageId = result.current.messages[1].id;

      act(() => {
        result.current.removeMessage(middleMessageId);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].text).toBe('First message');
      expect(result.current.messages[1].text).toBe('Third message');
    });

    it('should handle removing non-existent message id gracefully', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'Test message');
      });

      act(() => {
        result.current.removeMessage(99999);
      });

      expect(result.current.messages).toHaveLength(1);
    });
  });

  describe('clearAllMessages Function', () => {
    it('should clear all messages', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.showMessage('success', 'First message');
        result.current.showMessage('error', 'Second message');
        result.current.showMessage('success', 'Third message');
      });

      expect(result.current.messages).toHaveLength(3);

      act(() => {
        result.current.clearAllMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should handle clearing when no messages exist', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MessageProvider>{children}</MessageProvider>
      );

      const { result } = renderHook(() => useMessage(), { wrapper });

      act(() => {
        result.current.clearAllMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('MessageProvider Component', () => {
    it('should render children correctly', () => {
      render(
        <MessageProvider>
          <div data-testid="test-child">Test Child</div>
        </MessageProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide context to nested components', () => {
      const TestComponent = () => {
        const { messages } = useMessage();
        return <div data-testid="message-count">{messages.length}</div>;
      };

      render(
        <MessageProvider>
          <TestComponent />
        </MessageProvider>
      );

      expect(screen.getByTestId('message-count')).toHaveTextContent('0');
    });
  });
});
