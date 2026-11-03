-- Treina: tables for the app's data. Column meanings follow the types in
-- src/lib (foods.ts, exercises.ts, workouts.ts, tasks.ts, profile.ts,
-- dashboard-widgets.ts, trainers.ts, chat.ts); rules such as meal order, task
-- repetition and the workout queue stay in the app.

-- Functions that must not be callable through the Data API.
create schema if not exists private;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trainer catalog (read by everyone, written only by the project's admins)
-- ---------------------------------------------------------------------------

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  -- Stable key used by the app, e.g. `ana-souza`.
  slug text not null unique,
  name text not null,
  photo_url text,
  -- Without the `@`.
  instagram text,
  specialty text not null,
  bio text not null default '',
  followers integer not null default 0 check (followers >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  students integer not null default 0 check (students >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.training_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  name text not null,
  description text not null default '',
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  weeks integer not null check (weeks > 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index training_packages_trainer_id_idx on public.training_packages (trainer_id);

create table public.package_workouts (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.training_packages (id) on delete cascade,
  position integer not null,
  name text not null,
  summary text not null default '',
  description text not null default '',
  -- `NewPlannedExercise[]` (src/lib/workouts.ts); copied into the user's plan on join.
  exercises jsonb not null default '[]' check (jsonb_typeof(exercises) = 'array'),
  created_at timestamptz not null default now(),
  unique (package_id, position)
);

create table public.package_comments (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.training_packages (id) on delete cascade,
  -- Set once students can comment from the app; seeded comments have none.
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  commented_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index package_comments_package_id_idx on public.package_comments (package_id);
create index package_comments_user_id_idx on public.package_comments (user_id);

-- ---------------------------------------------------------------------------
-- Account
-- ---------------------------------------------------------------------------

-- The email lives in auth.users, and the current weight is the latest
-- weigh-in (never a column here).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  birth_date date check (birth_date > '1900-01-01'),
  sex text check (sex in ('female', 'male', 'unspecified')),
  height_cm smallint check (height_cm between 100 and 250),
  goal_weight_kg numeric(4, 1) check (goal_weight_kg between 30 and 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Diary day in the user's local time.
  date date not null,
  kg numeric(4, 1) not null check (kg between 30 and 400),
  created_at timestamptz not null default now(),
  -- At most one per day: logging again replaces it.
  unique (user_id, date)
);

-- ---------------------------------------------------------------------------
-- Food diary
-- ---------------------------------------------------------------------------

-- Meals the diary shows, in order.
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Preset key (`breakfast`, …) or `custom-…` (`Meal.id` in the app).
  key text not null,
  name text not null check (length(trim(name)) > 0),
  position integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  -- `meals.key`; not a foreign key, since an entry stays after its meal is removed.
  meal_key text not null,
  meal_name text not null,
  -- `taco:<id>` or `off:<barcode>`.
  food_id text not null,
  source text not null check (source in ('taco', 'off')),
  name text not null,
  detail text,
  grams numeric(7, 1) not null check (grams > 0),
  -- Already scaled to `grams`.
  kcal numeric(8, 1) not null check (kcal >= 0),
  carbs numeric(7, 1) not null check (carbs >= 0),
  protein numeric(7, 1) not null check (protein >= 0),
  fat numeric(7, 1) not null check (fat >= 0),
  fiber numeric(7, 1) check (fiber >= 0),
  created_at timestamptz not null default now()
);
create index food_entries_user_id_date_idx on public.food_entries (user_id, date);

-- ---------------------------------------------------------------------------
-- Workouts and plan
-- ---------------------------------------------------------------------------

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  summary text,
  description text,
  -- Package the workout was copied from; such workouts cannot be changed.
  source_package_id uuid references public.training_packages (id) on delete set null,
  created_at timestamptz not null default now(),
  -- Target of the (id, user_id) foreign keys below.
  unique (id, user_id)
);
create index workouts_user_id_idx on public.workouts (user_id);
create index workouts_source_package_id_idx on public.workouts (source_package_id);

create table public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null,
  user_id uuid not null,
  position integer not null,
  name text not null,
  category text not null check (category in ('cardio', 'strength')),
  met numeric(4, 1) check (met > 0),
  -- Trainer's note on how to do it.
  note text,
  minutes integer check (minutes > 0),
  sets integer check (sets > 0),
  reps integer check (reps > 0),
  weight_kg numeric(5, 1) check (weight_kg >= 0),
  created_at timestamptz not null default now(),
  unique (id, user_id),
  -- A row of another account's workout cannot be created.
  foreign key (workout_id, user_id) references public.workouts (id, user_id) on delete cascade,
  check (
    (category = 'cardio' and minutes is not null and sets is null and reps is null and weight_kg is null)
    or (category = 'strength' and minutes is null and sets is not null and reps is not null and weight_kg is not null)
  )
);
create index planned_exercises_workout_id_idx on public.planned_exercises (workout_id, user_id);
create index planned_exercises_user_id_idx on public.planned_exercises (user_id);

-- One plan per account (`WorkoutPlan` in the app).
create table public.workout_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mode text not null default 'weekly' check (mode in ('weekly', 'queue')),
  -- Day of the week (`Date#getDay()`, "0" = Sunday) → workout id; missing = rest day.
  weekly jsonb not null default '{}' check (jsonb_typeof(weekly) = 'object'),
  -- Workout ids in order; one workout may appear more than once.
  queue uuid[] not null default '{}',
  -- Index in `queue` of the next workout.
  queue_index integer not null default 0 check (queue_index >= 0),
  updated_at timestamptz not null default now()
);
create trigger workout_plans_set_updated_at
before update on public.workout_plans
for each row execute function private.set_updated_at();

create table public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  workout_id uuid not null,
  -- Set when the workout was finished from a timed session.
  duration_seconds integer check (duration_seconds >= 0),
  feeling smallint check (feeling between 0 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, date),
  foreign key (workout_id, user_id) references public.workouts (id, user_id) on delete cascade,
  check ((duration_seconds is null) = (feeling is null))
);
create index workout_completions_workout_id_idx on public.workout_completions (workout_id, user_id);

create table public.exercise_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  name text not null,
  category text not null check (category in ('cardio', 'strength')),
  -- Set when the entry was logged from the day's workout.
  planned_exercise_id uuid,
  minutes integer check (minutes > 0),
  calories integer check (calories >= 0),
  sets integer check (sets > 0),
  reps integer check (reps > 0),
  weight_kg numeric(5, 1) check (weight_kg >= 0),
  created_at timestamptz not null default now(),
  foreign key (planned_exercise_id, user_id)
    references public.planned_exercises (id, user_id) on delete set null (planned_exercise_id),
  check (
    (category = 'cardio' and minutes is not null and calories is not null and sets is null and reps is null and weight_kg is null)
    or (category = 'strength' and minutes is null and calories is null and sets is not null and reps is not null and weight_kg is not null)
  )
);
create index exercise_entries_user_id_date_idx on public.exercise_entries (user_id, date);
create index exercise_entries_planned_exercise_id_idx on public.exercise_entries (planned_exercise_id, user_id);

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  -- `none`: a one-off task; `every`: repeats every `repeat_interval` days or weeks.
  repeat_kind text not null default 'none' check (repeat_kind in ('none', 'every')),
  repeat_interval integer check (repeat_interval > 0),
  repeat_unit text check (repeat_unit in ('day', 'week')),
  start_date date not null,
  done_dates date[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (
    (repeat_kind = 'none' and repeat_interval is null and repeat_unit is null)
    or (repeat_kind = 'every' and repeat_interval is not null and repeat_unit is not null)
  )
);
create index tasks_user_id_idx on public.tasks (user_id);
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function private.set_updated_at();

create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  user_id uuid not null,
  position integer not null,
  title text not null check (length(trim(title)) > 0),
  done_dates date[] not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);
create index subtasks_task_id_idx on public.subtasks (task_id, user_id);
create index subtasks_user_id_idx on public.subtasks (user_id);

-- ---------------------------------------------------------------------------
-- Home dashboard
-- ---------------------------------------------------------------------------

create table public.dashboard_layouts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- `DashboardRows`: rows of widget ids, top to bottom.
  rows jsonb not null check (jsonb_typeof(rows) = 'array'),
  updated_at timestamptz not null default now()
);
create trigger dashboard_layouts_set_updated_at
before update on public.dashboard_layouts
for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Coaching and chat
-- ---------------------------------------------------------------------------

-- The package the user follows: one at a time. Its workouts are the user's
-- workouts with this `source_package_id`.
create table public.coaching_memberships (
  user_id uuid primary key references auth.users (id) on delete cascade,
  package_id uuid not null references public.training_packages (id) on delete cascade,
  joined_at timestamptz not null default now()
);
create index coaching_memberships_package_id_idx on public.coaching_memberships (package_id);

-- A conversation is (user_id, trainer_id).
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  sender text not null check (sender in ('student', 'trainer')),
  body text not null check (length(trim(body)) between 1 and 4000),
  sent_at timestamptz not null default now()
);
create index chat_messages_conversation_idx on public.chat_messages (user_id, trainer_id, sent_at);
create index chat_messages_trainer_id_idx on public.chat_messages (trainer_id);
