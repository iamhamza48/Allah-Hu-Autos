-- ============================================
-- Allah-Hu-Autos — Row Level Security (RLS) Policies
-- ============================================

-- 1. Enable RLS on all tables
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

-- ============================================
-- PUBLIC READ POLICIES (Anyone can view these)
-- ============================================
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Product variants are viewable by everyone" on public.product_variants for select using (true);
create policy "Product images are viewable by everyone" on public.product_images for select using (true);
create policy "Vehicle makes are viewable by everyone" on public.vehicle_makes for select using (true);
create policy "Vehicle models are viewable by everyone" on public.vehicle_models for select using (true);
create policy "Vehicles are viewable by everyone" on public.vehicles for select using (true);
create policy "Product compatibility is viewable by everyone" on public.product_compatibility for select using (true);
create policy "Branches are viewable by everyone" on public.branches for select using (true);
create policy "Inventory is viewable by everyone" on public.inventory for select using (true);
create policy "Approved reviews are viewable by everyone" on public.reviews for select using (is_approved = true);

-- ============================================
-- USER POLICIES (Users can manage their own data)
-- ============================================

-- Profiles
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- User Roles
create policy "Users can view their own role" on public.user_roles for select using (auth.uid() = user_id);

-- Orders
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert their own orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order Items
create policy "Users can view their own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "Users can insert their own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
);

-- Bookings
create policy "Users can view their own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Users can insert their own bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users can update their own bookings" on public.bookings for update using (auth.uid() = user_id);

-- Addresses
create policy "Users can view their own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert their own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update their own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete their own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- User Vehicles
create policy "Users can view their own vehicles" on public.user_vehicles for select using (auth.uid() = user_id);
create policy "Users can insert their own vehicles" on public.user_vehicles for insert with check (auth.uid() = user_id);
create policy "Users can update their own vehicles" on public.user_vehicles for update using (auth.uid() = user_id);
create policy "Users can delete their own vehicles" on public.user_vehicles for delete using (auth.uid() = user_id);

-- Reviews
create policy "Users can view their own unapproved reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users can insert their own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update their own reviews" on public.reviews for update using (auth.uid() = user_id);

-- ============================================
-- ADMIN POLICIES (Admins can do ANYTHING)
-- ============================================

-- Helper function check (assumes you have the public.has_role function from the schema)
-- We apply this ALL policy to every table so Admins have unrestricted access

create policy "Admins have full access to profiles" on public.profiles for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to user_roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to categories" on public.categories for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to products" on public.products for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to product_variants" on public.product_variants for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to product_images" on public.product_images for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to vehicle_makes" on public.vehicle_makes for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to vehicle_models" on public.vehicle_models for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to vehicles" on public.vehicles for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to product_compatibility" on public.product_compatibility for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to branches" on public.branches for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to inventory" on public.inventory for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to orders" on public.orders for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to order_items" on public.order_items for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to bookings" on public.bookings for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to reviews" on public.reviews for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to addresses" on public.addresses for all using (public.has_role(auth.uid(), 'admin'));
create policy "Admins have full access to user_vehicles" on public.user_vehicles for all using (public.has_role(auth.uid(), 'admin'));
