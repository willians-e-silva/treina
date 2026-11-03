-- Checks the Row Level Security policies with two throwaway accounts.
-- Everything runs in one transaction that is rolled back, so it leaves no
-- data behind. Run it with:
--   npx supabase@latest db query --remote --file supabase/tests/rls.sql
-- or paste it in the dashboard's SQL editor. It stops at the first failing
-- check with "FAIL: …"; the last row says "RLS: all checks passed".

begin;

-- Two accounts, A and B. Creating them also runs the sign-up trigger.
insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('00000000-0000-4000-a000-00000000000a', 'rls-a@test.local', 'authenticated', 'authenticated',
   '{"name": "Conta A", "birth_date": "1995-04-10", "sex": "female", "height_cm": 165, "weight_kg": 62.4}'),
  ('00000000-0000-4000-a000-00000000000b', 'rls-b@test.local', 'authenticated', 'authenticated',
   '{"name": "Conta B", "birth_date": "not a date", "height_cm": 999}');

-- The sign-up trigger fills the profile and the first weigh-in, and leaves
-- out values that do not fit instead of failing.
do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = '00000000-0000-4000-a000-00000000000a'
      and name = 'Conta A' and birth_date = '1995-04-10' and sex = 'female' and height_cm = 165
  ) then
    raise exception 'FAIL: profile of A was not created from the sign-up data';
  end if;
  if not exists (
    select 1 from public.weigh_ins where user_id = '00000000-0000-4000-a000-00000000000a' and kg = 62.4
  ) then
    raise exception 'FAIL: first weigh-in of A was not created';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = '00000000-0000-4000-a000-00000000000b'
      and name = 'Conta B' and birth_date is null and height_cm is null
  ) then
    raise exception 'FAIL: invalid sign-up data of B was not left out';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Signed in as A: A writes its own data.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000a", "role": "authenticated"}', true);

insert into public.tasks (id, user_id, title, start_date)
values ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-00000000000a', 'Beber água', current_date);
insert into public.workouts (id, user_id, name)
values ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-00000000000a', 'Treino A');
insert into public.planned_exercises (workout_id, user_id, position, name, category, sets, reps, weight_kg)
values ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-00000000000a', 0, 'Supino', 'strength', 4, 10, 20);
insert into public.chat_messages (user_id, trainer_id, sender, body)
select '00000000-0000-4000-a000-00000000000a', id, 'student', 'Olá!' from public.trainers limit 1;
update public.profiles set goal_weight_kg = 58 where id = '00000000-0000-4000-a000-00000000000a';

do $$
begin
  if (select count(*) from public.weigh_ins) <> 1 then
    raise exception 'FAIL: A does not see exactly its own weigh-in';
  end if;
  if (select goal_weight_kg from public.profiles) <> 58 then
    raise exception 'FAIL: A could not update its profile';
  end if;
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'FAIL: A sees profiles of other accounts';
  end if;
end;
$$;

-- A cannot send a message as the trainer.
do $$
begin
  begin
    insert into public.chat_messages (user_id, trainer_id, sender, body)
    select '00000000-0000-4000-a000-00000000000a', id, 'trainer', 'Resposta falsa' from public.trainers limit 1;
  exception when others then
    return;
  end;
  raise exception 'FAIL: A sent a message as the trainer';
end;
$$;

-- A cannot change the trainer catalog.
do $$
begin
  begin
    update public.trainers set followers = 0;
  exception when others then
    return;
  end;
  raise exception 'FAIL: A changed the trainer catalog';
end;
$$;

-- ---------------------------------------------------------------------------
-- Signed in as B: none of A's data is visible or writable.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000b", "role": "authenticated"}', true);

do $$
declare
  changed integer;
begin
  if exists (select 1 from public.weigh_ins)
    or exists (select 1 from public.tasks)
    or exists (select 1 from public.workouts)
    or exists (select 1 from public.planned_exercises)
    or exists (select 1 from public.chat_messages)
    or exists (select 1 from public.profiles where id = '00000000-0000-4000-a000-00000000000a') then
    raise exception 'FAIL: B sees data of A';
  end if;

  update public.tasks set title = 'Invadido' where id = '00000000-0000-4000-b000-000000000001';
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'FAIL: B changed a task of A';
  end if;

  delete from public.workouts where id = '00000000-0000-4000-b000-000000000002';
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'FAIL: B deleted a workout of A';
  end if;

  if (select count(*) from public.trainers) = 0 then
    raise exception 'FAIL: B cannot read the trainer catalog';
  end if;
end;
$$;

-- B cannot create rows in A's name.
do $$
begin
  begin
    insert into public.weigh_ins (user_id, date, kg)
    values ('00000000-0000-4000-a000-00000000000a', current_date - 1, 70);
  exception when others then
    return;
  end;
  raise exception 'FAIL: B created a weigh-in for A';
end;
$$;

-- B cannot attach its own rows to A's workout.
do $$
begin
  begin
    insert into public.planned_exercises (workout_id, user_id, position, name, category, minutes)
    values ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-00000000000b', 1, 'Esteira', 'cardio', 20);
  exception when others then
    return;
  end;
  raise exception 'FAIL: B added an exercise to a workout of A';
end;
$$;

-- ---------------------------------------------------------------------------
-- Signed out: only the catalog is readable.
-- ---------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

do $$
begin
  if (select count(*) from public.training_packages) = 0 then
    raise exception 'FAIL: the catalog is not readable signed out';
  end if;
  begin
    perform 1 from public.profiles;
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'FAIL: profiles are readable signed out';
end;
$$;

reset role;
select 'RLS: all checks passed' as result;

rollback;
