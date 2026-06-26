create or replace function handle_new_user()
returns trigger language plpgsql
security definer set search_path = public
as $$
declare
  base  text;
  uname text;
  n     int := 0;
begin
  base := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substr(new.id::text, 1, 8)
  );
  uname := base;
  while exists (select 1 from profiles where username = uname) loop
    n := n + 1;
    uname := base || n::text;
  end loop;
  insert into profiles (id, username, display_name)
  values (new.id, uname, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), base))
  on conflict (id) do nothing;
  insert into profiles_private (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
