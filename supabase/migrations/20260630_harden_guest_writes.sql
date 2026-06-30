-- Run after the guest-checkout frontend has been deployed.
begin;
drop policy if exists "Users can create orders" on public.orders;
drop policy if exists "Users can create order items" on public.order_items;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Users can insert their own order items" on public.order_items;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users can insert their own bookings" on public.bookings;
drop policy if exists "Users can update their own bookings" on public.bookings;
commit;
