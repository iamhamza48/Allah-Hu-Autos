-- ============================================
-- Allah-Hu-Autos — Database Schema
-- ============================================

-- 1. Profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. User Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  unique (user_id, role)
);

-- 3. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text default '🔧',
  featured boolean default false,
  created_at timestamptz default now()
);

-- 4. Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  category_id uuid references public.categories(id) on delete set null,
  base_price numeric not null default 0,
  compare_price numeric,
  installable boolean default false,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Product Variants
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null,
  sku text,
  price numeric not null default 0,
  compare_price numeric,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 6. Product Images
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 7. Vehicle Makes
create table public.vehicle_makes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text
);

-- 8. Vehicle Models
create table public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid references public.vehicle_makes(id) on delete cascade not null,
  name text not null,
  slug text not null unique
);

-- 9. Vehicles (make + model + year)
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.vehicle_models(id) on delete cascade not null,
  year int not null
);

-- 10. Product Compatibility
create table public.product_compatibility (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  unique (product_id, vehicle_id)
);

-- 11. Branches
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text default '',
  city text default '',
  phone text default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 12. Inventory
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references public.product_variants(id) on delete cascade not null,
  branch_id uuid references public.branches(id) on delete cascade not null,
  quantity int default 0,
  updated_at timestamptz default now()
);

-- 13. Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null not null,
  status text default 'pending',
  total numeric default 0,
  shipping_address text default '',
  shipping_city text default '',
  shipping_phone text default '',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. Order Items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int default 1,
  price numeric default 0,
  install_type text
);

-- 15. Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null not null,
  branch_id uuid references public.branches(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  booking_date date not null,
  booking_time text not null,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- 16. Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text default '',
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- 17. Addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Home',
  address_line text default '',
  city text default '',
  phone text default '',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 18. User Vehicles
create table public.user_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  nickname text,
  created_at timestamptz default now()
);

-- ============================================
-- Trigger: Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Security definer function for role checks
-- ============================================
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- ============================================
-- Storage bucket
-- ============================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);
