alter table public.customers enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.unit_assignments enable row level security;

revoke all on table public.customers from anon, authenticated;
revoke all on table public.reservations from anon, authenticated;
revoke all on table public.reservation_items from anon, authenticated;
revoke all on table public.unit_assignments from anon, authenticated;
