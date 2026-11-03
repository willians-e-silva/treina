import type { ChatRepository } from '../types';
import { done, selectAll, supabase } from './client';

import type { ChatThreads } from '@/lib/chat';

/** `chat_messages`; a conversation is the user and one trainer. */
export function chatRepository(userId: string): ChatRepository {
  return {
    async load() {
      const rows = await selectAll((from, to) =>
        supabase
          .from('chat_messages')
          .select('id, trainer_id, sender, body, sent_at')
          .eq('user_id', userId)
          .order('sent_at')
          .range(from, to),
      );
      const threads: ChatThreads = {};
      for (const row of rows) {
        (threads[row.trainer_id] ??= []).push({
          id: row.id,
          from: row.sender === 'student' ? 'me' : 'trainer',
          text: row.body,
          sentAt: Date.parse(row.sent_at),
        });
      }
      return threads;
    },

    async send(trainerId, message) {
      done(
        await supabase.from('chat_messages').insert({
          id: message.id,
          user_id: userId,
          trainer_id: trainerId,
          sender: 'student',
          body: message.text,
          sent_at: new Date(message.sentAt).toISOString(),
        }),
      );
    },
  };
}
