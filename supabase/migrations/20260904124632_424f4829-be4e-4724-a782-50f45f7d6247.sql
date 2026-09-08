create or replace function public.verify_admin_password(_password text)
returns boolean language sql security definer set search_path = public, extensions as $$
  select exists (select 1 from public.admin_auth where id = 1 and password_hash = extensions.crypt(_password, password_hash));
$$;
revoke all on function public.verify_admin_password(text) from public, anon, authenticated;
grant execute on function public.verify_admin_password(text) to service_role;

create or replace function public.set_admin_password(_password text)
returns void language sql security definer set search_path = public, extensions as $$
  update public.admin_auth set password_hash = extensions.crypt(_password, extensions.gen_salt('bf')) where id = 1;
$$;
revoke all on function public.set_admin_password(text) from public, anon, authenticated;
grant execute on function public.set_admin_password(text) to service_role;