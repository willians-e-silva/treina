import { createContext, use, useState, type PropsWithChildren } from 'react';

export type ChatMessage = {
  id: string;
  /** `me` is the user; `trainer` is the other side of the conversation. */
  from: 'me' | 'trainer';
  text: string;
  /** Milliseconds since the epoch. */
  sentAt: number;
};

type ChatContextValue = {
  /** Messages with the trainer, oldest first. */
  messagesWith: (trainerId: string) => ChatMessage[];
  sendMessage: (trainerId: string, text: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const value = use(ChatContext);
  if (!value) {
    throw new Error('useChat must be wrapped in a <ChatProvider />');
  }
  return value;
}

let nextId = 0;
function createId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

/**
 * TEMPORARY: in-memory conversations with trainers until there is a backend.
 * Messages are not delivered anywhere yet, so trainers never answer.
 */
export function ChatProvider({ children }: PropsWithChildren) {
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});

  function sendMessage(trainerId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: ChatMessage = { id: createId(), from: 'me', text: trimmed, sentAt: Date.now() };
    setThreads((current) => ({
      ...current,
      [trainerId]: [...(current[trainerId] ?? []), message],
    }));
  }

  return (
    <ChatContext
      value={{
        messagesWith: (trainerId) => threads[trainerId] ?? [],
        sendMessage,
      }}>
      {children}
    </ChatContext>
  );
}
