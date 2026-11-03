import { createContext, use, type PropsWithChildren } from 'react';

import { useSession } from './session';

import { repositoriesFor } from '@/data';
import { createId } from '@/data/ids';
import type { Repositories } from '@/data/types';
import { useUserStore, type StoreStatus } from '@/data/use-user-store';
import { mergeMessages, type ChatMessage, type ChatThreads } from '@/lib/chat';

export type { ChatMessage } from '@/lib/chat';

type ChatContextValue = {
  status: StoreStatus;
  retry: () => void;
  /** A change could not be saved; `retrySave` sends it again. */
  saveFailed: boolean;
  retrySave: () => void;
  /** Messages with the trainer, oldest first. */
  messagesWith: (trainerId: string) => ChatMessage[];
  /** Shows the message right away as `sending`, then `sent` or `failed`. */
  sendMessage: (trainerId: string, text: string) => void;
  /** Sends a `failed` message again. */
  resendMessage: (trainerId: string, messageId: string) => void;
  /**
   * Keeps the conversation up to date while it is open (Realtime). Returns
   * the function that stops it.
   */
  watchConversation: (trainerId: string) => () => void;
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
 * `SessionProvider`. Trainers have no app to answer from yet.
 *
 * Messages are sent one by one instead of through the store's save queue, so
 * each shows its own state and a failed one never holds the others back.
 */
export function ChatProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const store = useUserStore(session, EMPTY, load);

  function changeThread(trainerId: string, change: (thread: ChatMessage[]) => ChatMessage[]) {
    store.update((threads) => ({ ...threads, [trainerId]: change(threads[trainerId] ?? []) }));
  }

  function setStatus(trainerId: string, messageId: string, status: ChatMessage['status']) {
    changeThread(trainerId, (thread) =>
      thread.map((message) => (message.id === messageId ? { ...message, status } : message)),
    );
  }

  function deliver(trainerId: string, message: ChatMessage) {
    if (!session) return;
    repositoriesFor(session)
      .chat.send(trainerId, message)
      .then(
        () => setStatus(trainerId, message.id, undefined),
        (error: unknown) => {
          console.warn('Failed to send a chat message', error);
          setStatus(trainerId, message.id, 'failed');
        },
      );
  }

  function sendMessage(trainerId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: ChatMessage = {
      id: createId(),
      from: 'me',
      text: trimmed,
      sentAt: Date.now(),
      status: 'sending',
    };
    changeThread(trainerId, (thread) => [...thread, message]);
    deliver(trainerId, message);
  }

  function resendMessage(trainerId: string, messageId: string) {
    const message = store.data[trainerId]?.find((candidate) => candidate.id === messageId);
    if (message?.status !== 'failed') return;
    setStatus(trainerId, messageId, 'sending');
    deliver(trainerId, message);
  }

  function watchConversation(trainerId: string) {
    if (!session) return () => {};
    const chat = repositoriesFor(session).chat;
    return chat.watch(trainerId, {
      onMessage: (message) => changeThread(trainerId, (thread) => mergeMessages(thread, [message])),
      // Fills in what arrived while the connection was down.
      onConnected: () => {
        chat.loadThread(trainerId).then(
          (messages) => changeThread(trainerId, (thread) => mergeMessages(thread, messages)),
          (error: unknown) => console.warn('Failed to refresh the conversation', error),
        );
      },
    });
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
        resendMessage,
        watchConversation,
      }}>
      {children}
    </ChatContext>
  );
}
