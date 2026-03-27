import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MessageDisplay from './MessageDisplay';
import { MessageProvider, useMessage } from '../contexts/MessageContext';

// Mock CSS import
jest.mock('./MessageDisplay.css', () => ({}), { virtual: true });

describe('MessageDisplay Component', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MessageProvider>{children}</MessageProvider>
  );

  describe('Rendering', () => {
    it('should render nothing when no messages exist', () => {
      const { container } = render(
        <TestWrapper>
          <MessageDisplay />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render message container when messages exist', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render message with correct text', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Success message text');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Success message text')).toBeInTheDocument();
    });

    it('should render multiple messages', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'First message');
          showMessage('error', 'Second message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  describe('Message Type Styling', () => {
    it('should apply success class for success messages', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Success message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const messageElement = container.querySelector('.message-success');
      expect(messageElement).toBeInTheDocument();
    });

    it('should apply error class for error messages', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('error', 'Error message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const messageElement = container.querySelector('.message-error');
      expect(messageElement).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button for each message', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const closeButton = screen.getByLabelText('Dismiss message');
      expect(closeButton).toBeInTheDocument();
    });

    it('should remove message when close button is clicked', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const closeButton = screen.getByLabelText('Dismiss message');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should only remove clicked message when multiple exist', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'First message');
          showMessage('error', 'Second message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const closeButtons = screen.getAllByLabelText('Dismiss message');
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('First message')).not.toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" on container', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite" on container', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const messageContainer = container.querySelector('[aria-live="polite"]');
      expect(messageContainer).toBeInTheDocument();
    });

    it('should have role="alert" on each message', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-label on close button', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Dismiss message')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply message-container class', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(container.querySelector('.message-container')).toBeInTheDocument();
    });

    it('should apply message class to each message', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(container.querySelector('.message')).toBeInTheDocument();
    });

    it('should apply message-text class to message text', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(container.querySelector('.message-text')).toBeInTheDocument();
    });

    it('should apply message-close class to close button', () => {
      const TestComponent = () => {
        const { showMessage } = useMessage();
        React.useEffect(() => {
          showMessage('success', 'Test message');
        }, [showMessage]);
        return <MessageDisplay />;
      };

      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(container.querySelector('.message-close')).toBeInTheDocument();
    });
  });
});
