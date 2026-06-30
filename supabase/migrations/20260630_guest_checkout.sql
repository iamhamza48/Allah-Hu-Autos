-- Guest checkout/booking migration for Allah-Hu-Autos.
-- Run this first, then deploy the frontend, then run the hardening migration.

begin;

alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists parent_id uuid;
alter table public.categories add column if not exists sort_order integer default 0;
alter table public.products add column if not exists show_in_new_arrivals boolean default false;

alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;

alter table public.bookings alter column user_id drop not null;
alter table public.bookings add column if not exists customer_name text;
alter table public.bookings add column if not exists customer_email text;
alter table public.bookings add column if not exists customer_phone text;

update public.orders o
set customer_name = coalesce(o.customer_name, p.full_name),
    customer_email = coalesce(o.customer_email, u.email)
from public.profiles p
left join auth.users u on u.id = p.id
where o.user_id = p.id
  and (o.customer_name is null or o.customer_email is null);

update public.bookings b
set customer_name = coalesce(b.customer_name, p.full_name),
    customer_email = coalesce(b.customer_email, u.email),
    customer_phone = coalesce(b.customer_phone, p.phone)
from public.profiles p
left join auth.users u on u.id = p.id
where b.user_id = p.id
  and (b.customer_name is null or b.customer_email is null or b.customer_phone is null);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.categories'::regclass
      and conname = 'categories_parent_id_fkey'
  ) then
    alter table public.categories
      add constraint categories_parent_id_fkey
      foreign key (parent_id) references public.categories(id) on delete set null;
  end if;
end $$;

with ranked as (
  select id,
    row_number() over (partition by variant_id, branch_id order by updated_at desc nulls last, id) as rn,
    sum(greatest(coalesce(quantity, 0), 0)) over (partition by variant_id, branch_id) as total_quantity
  from public.inventory
), updated as (
  update public.inventory i
  set quantity = r.total_quantity, updated_at = now()
  from ranked r
  where i.id = r.id and r.rn = 1
)
delete from public.inventory i using ranked r where i.id = r.id and r.rn > 1;

create unique index if not exists inventory_variant_branch_uidx on public.inventory (variant_id, branch_id);
create index if not exists categories_parent_sort_idx on public.categories (parent_id, sort_order, name);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists product_compatibility_vehicle_idx on public.product_compatibility (vehicle_id, product_id);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (shipping_phone);
create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists reviews_product_approved_idx on public.reviews (product_id, is_approved, created_at desc);

create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_phone text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_items jsonb;
  v_item_count integer;
  v_total numeric;
begin
  if nullif(trim(p_customer_name), '') is null
     or char_length(trim(p_customer_name)) > 120 then
    raise exception 'A valid customer name is required';
  end if;
  if nullif(trim(p_shipping_address), '') is null
     or nullif(trim(p_shipping_city), '') is null
     or nullif(trim(p_shipping_phone), '') is null then
    raise exception 'Complete shipping details are required';
  end if;
  if char_length(regexp_replace(p_shipping_phone, '\D', '', 'g')) not between 10 and 15 then
    raise exception 'A valid phone number is required';
  end if;
  if exists (
    select 1 from public.orders
    where regexp_replace(shipping_phone, '\D', '', 'g') = regexp_replace(p_shipping_phone, '\D', '', 'g')
      and created_at > now() - interval '30 seconds'
  ) then
    raise exception 'Please wait before placing another order';
  end if;
  if nullif(trim(coalesce(p_customer_email, '')), '') is not null
     and trim(p_customer_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'A valid email address is required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or coalesce(jsonb_array_length(p_items), 0) = 0
     or jsonb_array_length(p_items) > 50 then
    raise exception 'Between 1 and 50 order items are required';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) item
    where coalesce(item ->> 'variant_id', '') = ''
       or coalesce(item ->> 'quantity', '') !~ '^[0-9]+$'
       or (item ->> 'quantity')::integer not between 1 and 99
       or coalesce(item ->> 'install_type', '') not in ('', 'self', 'professional')
  ) then
    raise exception 'One or more order items are invalid';
  end if;

  select jsonb_agg(jsonb_build_object(
      'product_id', p.id, 'variant_id', pv.id, 'name', p.name,
      'variant_name', pv.name, 'quantity', (item ->> 'quantity')::integer,
      'price', pv.price, 'install_type', nullif(item ->> 'install_type', '')
    )), count(*)
  into v_items, v_item_count
  from jsonb_array_elements(p_items) item
  join public.product_variants pv on pv.id = (item ->> 'variant_id')::uuid
  join public.products p on p.id = pv.product_id
  where coalesce(item ->> 'install_type', '') <> 'professional' or p.installable = true;

  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'An item or installation option is no longer available';
  end if;

  select coalesce(sum((item ->> 'price')::numeric * (item ->> 'quantity')::integer), 0)
  into v_total from jsonb_array_elements(v_items) item;

  insert into public.orders (
    user_id, customer_name, customer_email, status, total,
    shipping_address, shipping_city, shipping_phone, notes
  ) values (
    auth.uid(), trim(p_customer_name), nullif(lower(trim(coalesce(p_customer_email, ''))), ''),
    'pending', v_total, trim(p_shipping_address), trim(p_shipping_city),
    trim(p_shipping_phone), nullif(trim(coalesce(p_notes, '')), '')
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, variant_id, quantity, price, install_type)
  select v_order.id, (item ->> 'product_id')::uuid, (item ->> 'variant_id')::uuid,
    (item ->> 'quantity')::integer, (item ->> 'price')::numeric,
    nullif(item ->> 'install_type', '')
  from jsonb_array_elements(v_items) item;

  return jsonb_build_object('id', v_order.id, 'total', v_order.total, 'items', v_items);
end;
$$;

create or replace function public.create_guest_booking(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_branch_id uuid,
  p_booking_date date,
  p_booking_time text,
  p_services text[],
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking_id uuid;
  v_notes text;
begin
  if nullif(trim(p_customer_name), '') is null then raise exception 'Customer name is required'; end if;
  if char_length(regexp_replace(p_customer_phone, '\D', '', 'g')) not between 10 and 15 then
    raise exception 'A valid phone number is required';
  end if;
  if nullif(trim(coalesce(p_customer_email, '')), '') is not null
     and trim(p_customer_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'A valid email address is required';
  end if;
  if p_booking_date < current_date then raise exception 'Booking date cannot be in the past'; end if;
  if nullif(trim(p_booking_time), '') is null then raise exception 'Booking time is required'; end if;
  if coalesce(array_length(p_services, 1), 0) = 0 then raise exception 'Select at least one service'; end if;
  if not exists (select 1 from public.branches where id = p_branch_id and is_active = true) then
    raise exception 'The selected branch is unavailable';
  end if;
  if exists (
    select 1 from public.bookings
    where regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_customer_phone, '\D', '', 'g')
      and branch_id = p_branch_id
      and booking_date = p_booking_date
      and booking_time = p_booking_time
      and status <> 'cancelled'
  ) then
    raise exception 'This booking request already exists';
  end if;

  v_notes := 'SERVICES: ' || array_to_string(p_services, ', ') || E'\n\nUSER NOTES: ' || coalesce(p_notes, '');
  insert into public.bookings (
    user_id, customer_name, customer_email, customer_phone, branch_id,
    booking_date, booking_time, status, notes
  ) values (
    auth.uid(), trim(p_customer_name), nullif(lower(trim(coalesce(p_customer_email, ''))), ''),
    trim(p_customer_phone), p_branch_id, p_booking_date, trim(p_booking_time), 'pending', v_notes
  ) returning id into v_booking_id;
  return v_booking_id;
end;
$$;

revoke all on function public.create_guest_order(text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_guest_order(text, text, text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.create_guest_booking(text, text, text, uuid, date, text, text[], text) from public;
grant execute on function public.create_guest_booking(text, text, text, uuid, date, text, text[], text) to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

commit;
