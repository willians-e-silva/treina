export type ChatMessage = {
  id: string;
  /** `me` is the user; `trainer` is the other side of the conversation. */
  from: 'me' | 'trainer';
  text: string;
  /** Milliseconds since the epoch. */
  sentAt: number;
  /**
   * Only on the user's messages not saved yet: `sending` while on its way,
   * `failed` when it could not be sent (it can be sent again). Missing once sent.
   */
  status?: 'sending' | 'failed';
};

/** Conversations by trainer id, each oldest first. */
export type ChatThreads = Record<string, ChatMessage[]>;

/**
 * `thread` with the messages that came from the server: those replace the
 * copy on screen with the same id (which is then sent), the rest are added,
 * and messages still sending or failed stay. Oldest first.
 */
export function mergeMessages(
  thread: readonly ChatMessage[],
  incoming: readonly ChatMessage[],
): ChatMessage[] {
  const byId = new Map(thread.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.sentAt - b.sentAt);
}
