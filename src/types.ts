// STYLE X LUXURY ECOMMERCE - TYPES & INTERFACES

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price?: number;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  image_url: string;
  gallery: string[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_code: string; // SX-2026-XXXXXX
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string; // "Cash On Delivery"
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  image_url?: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id?: string;
  sender_role: UserRole;
  message: string;
  is_seen: boolean;
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  whatsapp_number: string;
  currency_symbol: string;
  shipping_charge: number;
  homepage_header: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
