import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { createId } from '@/data/ids';
import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import type { ChatMessage, ChatThreads } from '@/lib/chat';

export type { ChatMessage } from '@/lib/chat';

type ChatContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
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

const EMPTY: ChatThreads = {};
const load = (repositories: Repositories) => repositories.chat.load();

/**
 * Conversations of the signed-in account with trainers. Must sit inside
 * `SessionProvider`. Messages are not delivered anywhere yet, so trainers
 * never answer.
 */
export function ChatProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function sendMessage(trainerId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: ChatMessage = { id: createId(), from: 'me', text: trimmed, sentAt: Date.now() };
    store.update((threads) => ({
      ...threads,
      [trainerId]: [...(threads[trainerId] ?? []), message],
    }));
    store.write((repositories) => repositories.chat.send(trainerId, message));
  }

  return (
    <ChatContext
      value={{
        status: store.status,
        retry: store.retry,
        saveFailed: store.saveFailed,
        retrySave: store.retrySave,
        messagesWith: (trainerId) => store.data[trainerId] ?? [],
        sendMessage,
      }}>
      {children}
    </ChatContext>
  );
}
