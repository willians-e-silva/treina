-- Every account starts with the diary's default meals (DEFAULT_MEALS in
-- src/lib/foods.ts), so an empty `meals` list always means the user removed
-- them all.

create function private.create_default_meals(account_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.meals (user_id, key, name, position)
  values
    (account_id, 'breakfast', 'Café da manhã', 0),
    (account_id, 'lunch', 'Almoço', 1),
    (account_id, 'snack', 'Lanche', 2),
    (account_id, 'dinner', 'Jantar', 3)
  on conflict (user_id, key) do nothing;
$$;

create function private.handle_new_user_meals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.create_default_meals(new.id);
  return new;
end;
$$;

revoke all on function private.create_default_meals(uuid) from public, anon, authenticated;
revoke all on function private.handle_new_user_meals() from public, anon, authenticated;

create trigger on_auth_user_created_meals
after insert on auth.users
for each row execute function private.handle_new_user_meals();

-- Accounts created before this migration.
select private.create_default_meals(users.id)
from auth.users as users
where not exists (select 1 from public.meals where meals.user_id = users.id);
