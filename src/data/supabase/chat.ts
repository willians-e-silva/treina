import type { Tables } from '../database.types';
import { createId } from '../ids';
import type { ChatRepository } from '../types';
import { done, selectAll, supabase } from './client';

import type { ChatMessage, ChatThreads } from '@/lib/chat';

type MessageRow = Pick<
  Tables<'chat_messages'>,
  'id' | 'trainer_id' | 'sender' | 'body' | 'sent_at'
>;

const COLUMNS = 'id, trainer_id, sender, body, sent_at';

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    from: row.sender === 'student' ? 'me' : 'trainer',
    text: row.body,
    sentAt: Date.parse(row.sent_at),
  };
}

/**
 * `chat_messages`; a conversation is the user and one trainer. New messages
 * arrive through Realtime (the table is in the `supabase_realtime`
 * publication), limited by Row Level Security to the user's own.
 */
export function chatRepository(userId: string): ChatRepository {
  return {
    async load() {
      const rows = await selectAll((from, to) =>
        supabase
          .from('chat_messages')
          .select(COLUMNS)
          .eq('user_id', userId)
          .order('sent_at')
          .range(from, to),
      );
      const threads: ChatThreads = {};
      for (const row of rows) (threads[row.trainer_id] ??= []).push(toMessage(row));
      return threads;
    },

    async loadThread(trainerId) {
      const rows = await selectAll((from, to) =>
        supabase
          .from('chat_messages')
          .select(COLUMNS)
          .eq('user_id', userId)
          .eq('trainer_id', trainerId)
          .order('sent_at')
          .range(from, to),
      );
      return rows.map(toMessage);
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

    watch(trainerId, { onMessage, onConnected }) {
      // A topic of its own each time, so watching again never joins a channel
      // that is still closing.
      const channel = supabase
        .channel(`chat:${trainerId}:${createId()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `trainer_id=eq.${trainerId}`,
          },
          (payload) => onMessage(toMessage(payload.new as MessageRow)),
        )
        .subscribe((status, error) => {
          if (status === 'SUBSCRIBED') onConnected();
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            // The client tries again on its own; the screen keeps what it has.
            console.warn('Chat realtime connection problem', status, error);
          }
        });
      return () => {
        void supabase.removeChannel(channel);
      };
    },
  };
}
