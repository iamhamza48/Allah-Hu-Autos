# Allah-Hu-Autos 🚗

**"We Take Pride in Your Ride"**

A complete production-ready e-commerce platform for Pakistani automotive accessories, built with React + Vite + TypeScript + Supabase.

---

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **State:** Zustand (persistent cart)
- **Backend:** Supabase (Auth, Database, Storage)
- **UI:** shadcn/ui, Lucide Icons, Framer Motion

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Set Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run SQL Scripts

In Supabase Dashboard → SQL Editor, run these scripts **in order**:

1. **`supabase/schema.sql`** — Creates all 17 tables, triggers, and storage bucket
2. **`supabase/policies.sql`** — Sets up Row Level Security on all tables
3. **`supabase/seed.sql`** — Inserts 43 categories, 150+ products, vehicles, branches

### 4. Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Create a user (e.g., `admin@allahhuautos.pk` / `admin123456`)
3. In SQL Editor, run:

```sql
-- Replace USER_ID with the actual user ID from the auth.users table
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### 5. Install & Run

```bash
pnpm install
pnpm dev
```

The app will be running at `http://localhost:8080`

---

## Default Credentials

After setup, create your admin account manually (step 4 above).

| Role    | Access                          |
|---------|----------------------------------|
| User    | Storefront, cart, checkout, account |
| Admin   | Full admin panel at `/admin`     |

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout, AdminLayout, AccountLayout
│   ├── ui/              # shadcn/ui components
│   ├── ProductCard.tsx   # Product card component
│   ├── CategoryCard.tsx  # Category card component
│   ├── VehicleSelector.tsx # Make → Model → Year selector
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
├── hooks/
│   └── use-auth.ts      # Authentication hook
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── format.ts        # PKR formatter, placeholders
│   └── utils.ts         # cn() utility
├── pages/
│   ├── Index.tsx         # Homepage
│   ├── Categories.tsx    # All categories
│   ├── CategoryDetail.tsx
│   ├── Products.tsx      # All products with filters
│   ├── ProductDetail.tsx # Product page with variants, compatibility
│   ├── Search.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Booking.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── account/          # Customer account pages
│   └── admin/            # Admin panel pages
├── stores/
│   └── cart.ts           # Zustand cart store
├── types/
│   └── database.ts       # TypeScript types
└── App.tsx               # Router setup

supabase/
├── schema.sql            # Database schema (17 tables)
├── policies.sql          # RLS policies
└── seed.sql              # Seed data (43 categories, 150+ products)
```

---

## Features

### Storefront
- 🏠 Homepage with hero, featured categories/products
- 📂 43 product categories with browsing
- 🛍️ Product pages with variants, images, reviews
- 🔍 Full-text search
- 🚗 Vehicle compatibility checker (Make → Model → Year)
- 🛒 Persistent cart (Zustand + localStorage)
- 💳 Real checkout with Supabase orders
- 📅 Installation booking system

### Customer Account
- 📋 Order history
- 📅 Booking management
- 🚗 Vehicle management
- 📍 Address book

### Admin Panel
- 📊 Dashboard with stats
- 📦 Product CRUD
- 📂 Category management
- 🛒 Order management
- 📅 Booking management
- 📦 Inventory management
- 👥 Customer list
- ⭐ Review moderation
- 🚗 Vehicle management
- ⚙️ Branch settings

---

## Pricing

All prices are in Pakistani Rupees (PKR), ranging from Rs 500 to Rs 120,000.
