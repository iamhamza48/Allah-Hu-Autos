export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  featured: boolean | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number | null;
  created_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  compare_price: number | null;
  installable: boolean | null;
  featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_price: number | null;
  attributes: Record<string, string> | null;
  created_at: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number | null;
  created_at: string | null;
}

export interface ProductCompatibility {
  id: string;
  product_id: string;
  vehicle_id: string;
}

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface VehicleModel {
  id: string;
  make_id: string;
  name: string;
  slug: string;
  make?: VehicleMake;
}

export interface Vehicle {
  id: string;
  model_id: string;
  year: number;
  model?: VehicleModel;
}

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Inventory {
  id: string;
  variant_id: string;
  branch_id: string;
  quantity: number | null;
  updated_at: string | null;
  variant?: ProductVariant;
  branch?: Branch;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null;
  total: number | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_phone: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number | null;
  price: number | null;
  install_type: 'self' | 'professional' | null;
  product?: Product;
  variant?: ProductVariant;
}

export interface Booking {
  id: string;
  user_id: string;
  branch_id: string | null;
  product_id: string | null;
  vehicle_id: string | null;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | null;
  notes: string | null;
  created_at: string | null;
  branch?: Branch;
  product?: Product;
  vehicle?: Vehicle;
  profile?: Profile;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean | null;
  created_at: string | null;
  profile?: Profile;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  address_line: string | null;
  city: string | null;
  phone: string | null;
  is_default: boolean | null;
  created_at: string | null;
}

export interface UserVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  nickname: string | null;
  created_at: string;
  vehicle?: Vehicle;
}

export type AppRole = 'admin' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  installType: 'self' | 'professional' | null;
  product?: Product;
  variant?: ProductVariant;
}