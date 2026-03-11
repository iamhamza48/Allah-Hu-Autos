export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  featured: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  compare_price: number | null;
  installable: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  compare_price: number | null;
  attributes: Record<string, string>;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
  created_at: string;
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
  address: string;
  city: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface Inventory {
  id: string;
  variant_id: string;
  branch_id: string;
  quantity: number;
  updated_at: string;
  variant?: ProductVariant;
  branch?: Branch;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  install_type: 'self' | 'professional' | null;
  product?: Product;
  variant?: ProductVariant;
}

export interface Booking {
  id: string;
  user_id: string;
  branch_id: string;
  product_id: string | null;
  vehicle_id: string | null;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
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
  comment: string;
  is_approved: boolean;
  created_at: string;
  profile?: Profile;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  phone: string;
  is_default: boolean;
  created_at: string;
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
