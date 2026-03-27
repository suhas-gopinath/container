import React from 'react';
import { useMessage } from '../contexts/MessageContext';
import './MessageDisplay.css';

const MessageDisplay: React.FC = () => {
  const { messages, removeMessage } = useMessage();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="message-container" role="status" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message message-${message.type}`}
          role="alert"
        >
          <span className="message-text">{message.text}</span>
          <button
            className="message-close"
            onClick={() => removeMessage(message.id)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default MessageDisplay;
