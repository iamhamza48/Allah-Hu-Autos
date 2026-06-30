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
alter table public.bookings add column if not exists order_id uuid;

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

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_order_id_fkey'
  ) then
    alter table public.bookings
      add constraint bookings_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
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
create unique index if not exists bookings_order_uidx on public.bookings (order_id) where order_id is not null;
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
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120 then
    raise exception 'A valid customer name is required';
  end if;
  if char_length(trim(coalesce(p_shipping_address, ''))) not between 8 and 500
     or char_length(trim(coalesce(p_shipping_city, ''))) not between 2 and 80 then
    raise exception 'Complete shipping details are required';
  end if;
  if regexp_replace(trim(coalesce(p_shipping_phone, '')), '[[:space:]()-]', '', 'g')
     !~ '^([+]92|92|0)3[0-9]{9}$' then
    raise exception 'Use a Pakistani mobile number such as 03000000000 or +923000000000';
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
  if char_length(coalesce(p_notes, '')) > 1000 then raise exception 'Notes are too long'; end if;
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

-- Creates the order and, when professional installation is selected, a linked
-- appointment in the same transaction. Any failure rolls both records back.
create or replace function public.create_guest_order_with_booking(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_phone text,
  p_notes text,
  p_items jsonb,
  p_installation jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_requires_installation boolean;
  v_result jsonb;
  v_order_id uuid;
  v_booking_id uuid;
  v_branch_id uuid;
  v_booking_date date;
  v_booking_time text;
  v_vehicle_info text;
  v_installation_notes text;
  v_products text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order items are invalid';
  end if;

  select exists (
    select 1 from jsonb_array_elements(p_items) item
    where item ->> 'install_type' = 'professional'
  ) into v_requires_installation;

  if v_requires_installation then
    if p_installation is null or jsonb_typeof(p_installation) <> 'object' then
      raise exception 'Installation appointment details are required';
    end if;

    begin
      v_branch_id := (p_installation ->> 'branch_id')::uuid;
      v_booking_date := (p_installation ->> 'booking_date')::date;
    exception when invalid_text_representation then
      raise exception 'Select a valid branch and installation date';
    end;

    v_booking_time := trim(coalesce(p_installation ->> 'booking_time', ''));
    v_vehicle_info := trim(coalesce(p_installation ->> 'vehicle_info', ''));
    v_installation_notes := trim(coalesce(p_installation ->> 'notes', ''));

    if not exists (select 1 from public.branches where id = v_branch_id and is_active = true) then
      raise exception 'The selected installation branch is unavailable';
    end if;
    if v_booking_date is null or v_booking_date < current_date then
      raise exception 'Select a valid installation date';
    end if;
    if v_booking_time !~ '^(09|10|11|12|13|14|15|16|17):00$' then
      raise exception 'Select a valid installation time';
    end if;
    if char_length(v_vehicle_info) not between 3 and 200 then
      raise exception 'Enter your vehicle make, model, and year';
    end if;
    if char_length(v_installation_notes) > 500 then
      raise exception 'Installation notes are too long';
    end if;
  end if;

  v_result := public.create_guest_order(
    p_customer_name,
    p_customer_email,
    p_shipping_address,
    p_shipping_city,
    p_shipping_phone,
    p_notes,
    p_items
  );
  v_order_id := (v_result ->> 'id')::uuid;

  if v_requires_installation then
    select string_agg(product.name || ' (' || variant.name || ')', ', ' order by product.name)
    into v_products
    from jsonb_array_elements(p_items) item
    join public.product_variants variant on variant.id = (item ->> 'variant_id')::uuid
    join public.products product on product.id = variant.product_id
    where item ->> 'install_type' = 'professional';

    insert into public.bookings (
      user_id, order_id, customer_name, customer_email, customer_phone,
      branch_id, booking_date, booking_time, status, notes
    ) values (
      auth.uid(), v_order_id, trim(p_customer_name),
      nullif(lower(trim(coalesce(p_customer_email, ''))), ''), trim(p_shipping_phone),
      v_branch_id, v_booking_date, v_booking_time, 'pending',
      'INSTALLATION PRODUCTS: ' || coalesce(v_products, '') || E'\nVEHICLE: ' || v_vehicle_info ||
      E'\n\nUSER NOTES: ' || v_installation_notes
    ) returning id into v_booking_id;

    v_result := v_result || jsonb_build_object(
      'booking_id', v_booking_id,
      'installation', jsonb_build_object(
        'branch_id', v_branch_id,
        'booking_date', v_booking_date,
        'booking_time', v_booking_time,
        'vehicle_info', v_vehicle_info
      )
    );
  end if;

  return v_result;
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
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120 then
    raise exception 'A valid customer name is required';
  end if;
  if regexp_replace(trim(coalesce(p_customer_phone, '')), '[[:space:]()-]', '', 'g')
     !~ '^([+]92|92|0)3[0-9]{9}$' then
    raise exception 'Use a Pakistani mobile number such as 03000000000 or +923000000000';
  end if;
  if nullif(trim(coalesce(p_customer_email, '')), '') is not null
     and trim(p_customer_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'A valid email address is required';
  end if;
  if p_booking_date is null or p_booking_date < current_date then raise exception 'Select a valid booking date'; end if;
  if coalesce(p_booking_time, '') !~ '^(09|10|11|12|13|14|15|16|17):00$' then raise exception 'Select a valid booking time'; end if;
  if coalesce(array_length(p_services, 1), 0) not between 1 and 20 then raise exception 'Select valid services'; end if;
  if exists (select 1 from unnest(p_services) service where char_length(trim(service)) not between 1 and 80) then
    raise exception 'One or more services are invalid';
  end if;
  if char_length(coalesce(p_notes, '')) > 1000 then raise exception 'Notes are too long'; end if;
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
revoke all on function public.create_guest_order_with_booking(text, text, text, text, text, text, jsonb, jsonb) from public;
grant execute on function public.create_guest_order_with_booking(text, text, text, text, text, text, jsonb, jsonb) to anon, authenticated;
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
