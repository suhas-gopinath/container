import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useRef,
} from "react";

type MessageType = "success" | "error";

interface Message {
  id: number;
  text: string;
  type: MessageType;
}

interface MessageContextType {
  messages: Message[];
  showMessage: (type: MessageType, text: string) => void;
  removeMessage: (id: number) => void;
  clearAllMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdCounterRef = useRef(0);

  const removeMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const showMessage = useCallback(
    (type: MessageType, text: string) => {
      const id = Date.now() + messageIdCounterRef.current;
      messageIdCounterRef.current += 1;
      const newMessage: Message = { id, text, type };

      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        removeMessage(id);
      }, 5000);
    },
    [removeMessage],
  );

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <MessageContext.Provider
      value={{ messages, showMessage, removeMessage, clearAllMessages }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
