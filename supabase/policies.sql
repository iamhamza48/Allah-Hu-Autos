-- ============================================
-- Allah-Hu-Autos — Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.vehicles enable row level security;
alter table public.product_compatibility enable row level security;
alter table public.branches enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.addresses enable row level security;
alter table public.user_vehicles enable row level security;

-- ==================
-- Profiles
-- ==================
create policy "Users can view own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "Admins can view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- User Roles
-- ==================
create policy "Users can view own role" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "Admins can manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Categories (public read, admin write)
-- ==================
create policy "Anyone can read categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins can manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Products (public read, admin write)
-- ==================
create policy "Anyone can read products" on public.products for select to anon, authenticated using (true);
create policy "Admins can manage products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Product Variants (public read, admin write)
-- ==================
create policy "Anyone can read variants" on public.product_variants for select to anon, authenticated using (true);
create policy "Admins can manage variants" on public.product_variants for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Product Images (public read, admin write)
-- ==================
create policy "Anyone can read images" on public.product_images for select to anon, authenticated using (true);
create policy "Admins can manage images" on public.product_images for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Vehicle Makes/Models/Vehicles (public read)
-- ==================
create policy "Anyone can read makes" on public.vehicle_makes for select to anon, authenticated using (true);
create policy "Admins can manage makes" on public.vehicle_makes for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can read models" on public.vehicle_models for select to anon, authenticated using (true);
create policy "Admins can manage models" on public.vehicle_models for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can read vehicles" on public.vehicles for select to anon, authenticated using (true);
create policy "Admins can manage vehicles" on public.vehicles for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Product Compatibility (public read)
-- ==================
create policy "Anyone can read compatibility" on public.product_compatibility for select to anon, authenticated using (true);
create policy "Admins can manage compatibility" on public.product_compatibility for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Branches (public read)
-- ==================
create policy "Anyone can read branches" on public.branches for select to anon, authenticated using (true);
create policy "Admins can manage branches" on public.branches for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Inventory (admin only)
-- ==================
create policy "Admins can manage inventory" on public.inventory for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Orders (own orders + admin)
-- ==================
create policy "Users can view own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "Admins can manage orders" on public.orders for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Order Items
-- ==================
create policy "Users can view own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage order items" on public.order_items for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Bookings
-- ==================
create policy "Users can view own bookings" on public.bookings for select to authenticated using (user_id = auth.uid());
create policy "Admins can manage bookings" on public.bookings for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Reviews
-- ==================
create policy "Anyone can read approved reviews" on public.reviews for select to anon, authenticated using (is_approved = true);
create policy "Users can create reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "Admins can manage reviews" on public.reviews for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ==================
-- Addresses
-- ==================
create policy "Users can manage own addresses" on public.addresses for all to authenticated using (user_id = auth.uid());

-- ==================
-- User Vehicles
-- ==================
create policy "Users can manage own vehicles" on public.user_vehicles for all to authenticated using (user_id = auth.uid());

-- ==================
-- Storage: product-images
-- ==================
create policy "Anyone can read product images" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
