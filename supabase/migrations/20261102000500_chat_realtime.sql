-- New chat messages are pushed to the open conversation through Supabase
-- Realtime (Postgres Changes). Row Level Security also applies to these
-- events: a student only receives the rows of their own conversations.
alter publication supabase_realtime add table public.chat_messages;
