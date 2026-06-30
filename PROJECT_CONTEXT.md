# Allah-Hu-Autos — Project Context

## Project Overview

Allah-Hu-Autos is a modern automotive accessories ecommerce platform built with Supabase backend support.

The platform includes:
- Product catalog
- Vehicle compatibility system
- Product variants
- Inventory management
- Multi-branch support
- Booking system
- Orders system
- Reviews system
- Admin dashboard
- Authentication & role-based access

The project uses:
- Supabase Database
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

---

# Important Development Rules

## VERY IMPORTANT

This project already has:
- Database schema
- RLS policies
- Relationships
- Storage bucket
- Auth flow

DO NOT:
- break existing schema
- remove RLS policies
- change existing table names unnecessarily
- change relationship logic without reason

Prefer extending the existing system instead of rebuilding it.

---

# Authentication & Roles

Customer accounts are not used. Storefront browsing, checkout, and booking are guest flows.
Only administrators authenticate, through `/admin/login` using email and password.

## User Roles

Roles are stored in:

```sql
public.user_roles
```

Enum:

```sql
admin
user
```

Admin check function:

```sql
public.has_role(auth.uid(), 'admin')
```

Admins manage:
- products
- categories
- variants
- inventory
- compatibility
- branches
- orders
- reviews
- bookings

---

# Existing Storage

Supabase Storage Bucket:

```txt
product-images
```

This bucket is public.

Admins can:
- upload product images
- delete product images

---

# Main Database Structure

## Categories

Table:

```sql
categories
```

Fields:
- id
- name
- slug
- icon
- featured

Relationship:
- One category has many products

---

## Products

Table:

```sql
products
```

Fields:
- id
- name
- slug
- description
- category_id
- base_price
- compare_price
- installable
- featured

Relationships:
- belongs to category
- has many variants
- has many images
- has many compatibility records

---

## Product Variants

Table:

```sql
product_variants
```

Fields:
- id
- product_id
- name
- sku
- price
- compare_price
- attributes (jsonb)

Examples:
- Standard
- Premium
- Luxury

---

## Product Images

Table:

```sql
product_images
```

Fields:
- id
- product_id
- url
- alt
- sort_order

Images are stored in Supabase Storage.

---

## Vehicle Compatibility System

Tables:
- vehicle_makes
- vehicle_models
- vehicles
- product_compatibility

Flow:
Vehicle Make → Vehicle Model → Vehicle Year → Compatible Products

---

## Inventory System

Table:

```sql
inventory
```

Inventory is managed per:
- branch
- product variant

Relationships:
- inventory.variant_id → product_variants.id
- inventory.branch_id → branches.id

---

## Orders

Tables:
- orders
- order_items

Orders contain:
- guest customer name and optional email
- shipping details
- status
- notes
- multiple items

---

## Reviews

Table:

```sql
reviews
```

Rules:
- public can only read approved reviews
- admin approves reviews

---

# Existing Seed Data

The database already contains:
- 43 categories
- 8 vehicle makes
- 30 vehicle models
- 50 vehicle combinations
- 4 branches
- 150+ generated products
- product variants
- product images
- inventory data
- compatibility mappings

---

# Admin Panel Requirements

The admin panel is VERY IMPORTANT.

It should feel modern, scalable, and production-ready.

## Main Admin Features

### Category Management
Admin should be able to:
- create category
- edit category
- delete category
- feature/unfeature category
- upload/update category icon if needed

---

### Product Management

Admin should be able to:
- create product
- edit product
- delete product
- feature/unfeature product
- assign category
- manage pricing
- manage installable flag
- manage description
- manage slug

---

### Product Variant Management

Admin should be able to:
- add variants
- edit variants
- delete variants
- manage SKU
- manage variant pricing
- manage attributes JSON

---

### Product Image Management

Admin should be able to:
- upload images to Supabase Storage
- reorder images
- delete images
- preview images

Use:
```txt
product-images
```

bucket.

---

### Inventory Management

Admin should be able to:
- manage stock quantities
- filter by branch
- filter by product
- update inventory quickly

---

### Vehicle Compatibility Management

Admin should be able to:
- assign compatible vehicles to products
- search by make/model/year
- remove compatibility mappings

---

### Branch Management

Admin should be able to:
- create branch
- edit branch
- activate/deactivate branch

---

### Orders Management

Admin should be able to:
- view all orders
- update order status
- inspect order items
- manage shipping information

---

### Reviews Management

Admin should be able to:
- approve reviews
- delete reviews

---

# UI/UX Requirements

Admin panel should:
- be modern
- responsive
- clean
- fast
- scalable

Preferred features:
- tables
- pagination
- search
- filters
- modal forms
- optimistic UI updates
- loading states
- toast notifications
- confirmation dialogs

---

# Important Technical Notes

## Do NOT Break RLS

All database operations must respect existing RLS policies.

Admin-only actions should use authenticated admin users.

---

## Avoid Hardcoding

Avoid:
- hardcoded IDs
- hardcoded categories
- hardcoded products

Everything should come from database queries.

---

## Keep Existing Relationships

Do not break:
- foreign keys
- cascading deletes
- storage logic
- compatibility system

---

# Recommended Improvements

Cursor may improve:
- admin dashboard UI
- product CRUD
- category CRUD
- inventory management
- image upload experience
- filtering/search
- performance
- reusable components
- table structure
- forms and validation

---

# Current Goal

Primary focus is improving and expanding the admin panel while keeping the existing Supabase architecture intact.

The system should remain production-ready and scalable.
