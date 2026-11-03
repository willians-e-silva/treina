-- Row Level Security: every account sees and changes only its own rows; the
-- trainer catalog is public and read-only. See supabase/tests/rls.sql.

-- Tables owned by one account through `user_id`: the account may read, create,
-- change and delete its own rows, and nothing else.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'weigh_ins',
    'meals',
    'food_entries',
    'workouts',
    'planned_exercises',
    'workout_plans',
    'workout_completions',
    'exercise_entries',
    'tasks',
    'subtasks',
    'dashboard_layouts',
    'coaching_memberships'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);

    execute format(
      'create policy "Own rows: select" on public.%I for select to authenticated
         using ((select auth.uid()) = user_id)', table_name);
    execute format(
      'create policy "Own rows: insert" on public.%I for insert to authenticated
         with check ((select auth.uid()) = user_id)', table_name);
    execute format(
      'create policy "Own rows: update" on public.%I for update to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', table_name);
    execute format(
      'create policy "Own rows: delete" on public.%I for delete to authenticated
         using ((select auth.uid()) = user_id)', table_name);
  end loop;
end;
$$;

-- Profiles: keyed by the account id itself. Created by the sign-up trigger,
-- and removed with the account, so the app only reads and updates them.
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

create policy "Own profile: select" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Chat: the student reads their conversations and sends messages as the
-- student. Messages are never edited or deleted from the app; trainers will
-- answer from their own app, under its own policies.
alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from anon;
grant select, insert on public.chat_messages to authenticated;

create policy "Own conversations: select" on public.chat_messages for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Own conversations: send as student" on public.chat_messages for insert to authenticated
  with check ((select auth.uid()) = user_id and sender = 'student');

-- Trainer catalog: anyone may read it; no policy allows writing, so only the
-- service role (dashboard, migrations) can change it.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'trainers',
    'training_packages',
    'package_workouts',
    'package_comments'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format(
      'create policy "Catalog: public read" on public.%I for select to anon, authenticated
         using (true)', table_name);
  end loop;
end;
$$;
