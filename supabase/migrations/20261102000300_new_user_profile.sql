-- Creates the profile (and the first weigh-in) of each new account from the
-- sign-up data the app sends in `options.data`:
--   name, birth_date (YYYY-MM-DD), sex, height_cm, weight_kg.
-- Running in the database means it also works when email confirmation is on,
-- before the app has a session to write with. Accounts from Google bring only
-- their name; the app asks for the rest later.

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  data jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(data ->> 'name'), ''),
      nullif(trim(data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );

  -- Optional fields: a value that does not fit is left out instead of
  -- failing the sign-up.
  begin
    update public.profiles set birth_date = (data ->> 'birth_date')::date where id = new.id;
  exception when others then
    null;
  end;
  begin
    update public.profiles set sex = data ->> 'sex' where id = new.id;
  exception when others then
    null;
  end;
  begin
    update public.profiles set height_cm = (data ->> 'height_cm')::smallint where id = new.id;
  exception when others then
    null;
  end;

  begin
    if data ? 'weight_kg' then
      insert into public.weigh_ins (user_id, date, kg)
      values (
        new.id,
        (now() at time zone 'America/Sao_Paulo')::date,
        round((data ->> 'weight_kg')::numeric, 1)
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$;

-- Only the auth trigger runs it.
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
