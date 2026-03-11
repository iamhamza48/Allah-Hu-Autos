

# Allah-Hu-Autos — Full E-Commerce Platform

**"We Take Pride in Your Ride"** — A complete Pakistani automotive accessories e-commerce platform.

> **Note:** This will be built with React + Vite + React Router (Lovable's stack), not Next.js. The functionality will be identical. Supabase will be connected via Lovable Cloud.

---

## 1. Database & Backend Setup

### Supabase Tables (17 tables)
- **profiles** — auto-created on signup via trigger (name, phone, avatar, created_at)
- **user_roles** — separate roles table (admin/user) with security definer function
- **categories** — 43 automotive categories with name, slug, icon, featured flag
- **products** — name, slug, description, category_id, base_price, compare_price, installable, featured
- **product_variants** — size/color/type variants per product
- **product_images** — URLs linked to products, sort order
- **product_compatibility** — links products to vehicles
- **vehicle_makes** — Toyota, Honda, Suzuki, KIA, Hyundai, MG, Changan, Daihatsu
- **vehicle_models** — Corolla, Civic, Alto, Cultus, Sportage, etc.
- **vehicles** — make + model + year combinations
- **branches** — store locations
- **inventory** — stock per variant per branch
- **orders** — user orders with status, total, address
- **order_items** — line items per order
- **bookings** — installation booking slots
- **reviews** — product reviews with rating
- **addresses** — user saved addresses
- **user_vehicles** — user's registered vehicles for compatibility

### Row Level Security
- Public read on products, categories, vehicles
- Authenticated users: create orders, bookings, reviews; manage own profile/addresses/vehicles
- Admin role: full CRUD on all tables via `has_role()` security definer function

### Seed Data
- 8 vehicle makes, 30 models, 50 vehicles
- 43 categories
- 150+ products with PKR pricing (₨500–₨120,000), 3 variants & 2 placeholder images each
- Sample reviews, branches, inventory

### Storage
- `product-images` bucket for admin uploads

---

## 2. Authentication
- Supabase Auth: Register, Login, Logout
- Auto-create profile + default "user" role on signup
- Protected routes for `/account/*` and `/admin/*`
- Admin guard using `has_role()` check

---

## 3. Storefront Pages

### Homepage
- Hero banner with brand tagline and CTA
- Featured categories grid (icons + names)
- Featured products carousel
- Vehicle compatibility selector (Make → Model → Year)
- "Why Choose Us" section

### Category Pages
- `/categories` — grid of all 43 categories
- `/category/:slug` — products filtered by category with sorting/filtering

### Product Pages
- `/products` — browsable product grid with search, filters, pagination
- `/product/:slug` — full detail page with image gallery, variants, price, compatibility badge, reviews, add to cart

### Search
- `/search?q=...` — full-text search against products table

### Cart & Checkout
- `/cart` — cart items, quantity controls, totals in PKR
- `/checkout` — address selection, order summary, place order (creates real Supabase order)

### Booking
- `/booking` — schedule installation appointment (real Supabase insert)

---

## 4. Customer Account Pages (`/account/*`)
- Dashboard — overview of orders, bookings, vehicles
- My Orders — order history with status
- My Bookings — upcoming/past bookings
- My Vehicles — add/manage vehicles for compatibility
- My Addresses — saved delivery addresses

---

## 5. Admin Panel (`/admin/*`)
- **Dashboard** — stats cards (orders, revenue, products, customers)
- **Products** — CRUD with image upload to Supabase Storage
- **Categories** — CRUD management
- **Orders** — view/update order status
- **Bookings** — manage installation bookings
- **Inventory** — stock management per branch/variant
- **Customers** — user list
- **Reviews** — moderate/approve/delete reviews
- **Vehicles** — manage makes/models
- **Settings** — branch management

---

## 6. Cart (Zustand + localStorage)
- Persistent cart store with productId, variantId, quantity, installType
- Survives page refresh
- Syncs to checkout flow

---

## 7. Design & UI
- **Primary color:** rose-600 (#e11d48)
- **Dark header/footer:** zinc-950 (#09090b)
- **Page background:** zinc-50 (#fafafa)
- **Font:** Inter
- Premium automotive aesthetic with card hover effects, fade-in animations, image zoom, smooth transitions
- Fully responsive (mobile-first)
- Colored placeholder images with product names for demo

---

## 8. Documentation
- Complete README with setup instructions and default admin credentials

