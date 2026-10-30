alter function public.is_lap_admin() security invoker;
revoke execute on function public.is_lap_admin() from public, anon;
grant execute on function public.is_lap_admin() to authenticated, service_role;

revoke execute on function public.consume_public_request_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_request_rate_limit(text, integer, integer)
  to service_role;

alter function public.get_product_availability(bigint, date, date)
  set search_path = '';

revoke execute on function public.get_product_availability(bigint, date, date)
  from public, anon, authenticated;
grant execute on function public.get_product_availability(bigint, date, date)
  to service_role;

revoke select on table public.admin_users from anon;
