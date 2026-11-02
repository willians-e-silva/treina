export type ChatMessage = {
  id: string;
  /** `me` is the user; `trainer` is the other side of the conversation. */
  from: 'me' | 'trainer';
  text: string;
  /** Milliseconds since the epoch. */
  sentAt: number;
};

/** Conversations by trainer id, each oldest first. */
export type ChatThreads = Record<string, ChatMessage[]>;
