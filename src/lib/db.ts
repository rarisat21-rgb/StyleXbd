import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  Product, Category, Order, OrderItem, Review, 
  WishlistItem, Chat, ChatMessage, SiteSettings, UserProfile, UserRole, OrderStatus
} from '../types';

// ==========================================
// SEED DATA FOR LOCAL FALLBACK
// ==========================================

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'MEN', slug: 'men', created_at: new Date().toISOString() },
  { id: '2', name: 'WOMEN', slug: 'women', created_at: new Date().toISOString() },
  { id: '3', name: 'ACCESSORIES', slug: 'accessories', created_at: new Date().toISOString() },
  { id: '4', name: 'COLLECTIVE', slug: 'collective', created_at: new Date().toISOString() }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '3d43a6d9',
    name: 'Risat Adnan',
    slug: 'risat-adnan',
    description: 'A classic luxury statement piece from the Style X collection. Painstakingly handcrafted using custom tech-fibers with high tensile detailing. Designed for an imposing yet elegant fit.',
    price: 122,
    old_price: 180,
    stock: 322,
    category: 'MEN',
    sizes: ['S', 'XS'],
    colors: ['#0F0F0F', '#6D28D9'],
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600',
    gallery: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '27d4b9b1',
    name: 'Hello',
    slug: 'hello-couture',
    description: 'An architectural representation of the core Style X aesthetic. Stripped of excess, featuring gold premium edge styling and a luxurious soft drape.',
    price: 100,
    old_price: 150,
    stock: 112,
    category: 'MEN',
    sizes: ['S', 'XS'],
    colors: ['#D4AF37', '#0F0F0F'],
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    gallery: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '85d4d654',
    name: 'Risat',
    slug: 'risat-essential',
    description: 'Elevated luxury casual, styled for everyday transition. Handpicked high-density thread work. Framed with majestic deep-purple and gold accents.',
    price: 100,
    old_price: 180,
    stock: 50,
    category: 'MEN',
    sizes: ['S', 'XS', 'M'],
    colors: ['#3B0764', '#F5D76E'],
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600',
    gallery: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '843df0ba',
    name: 'Hi',
    slug: 'hi-collectible',
    description: 'Limited run capsule release. High-collared outline structure built for bold visual profiles. Highly unique dark fluid visual canvas inside.',
    price: 122,
    old_price: 220,
    stock: 12,
    category: 'MEN',
    sizes: ['S', 'XS'],
    colors: ['#000000', '#D4AF37'],
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=600',
    gallery: [
      'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=600'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f28e01ec',
    name: 'Welcome',
    slug: 'welcome-special',
    description: 'Style X entry commemorative garment. Tailored for classic modern profiles, with high density micro-weaving and absolute stitch alignment.',
    price: 100,
    old_price: 120,
    stock: 12,
    category: 'MEN',
    sizes: ['S', 'M'],
    colors: ['#FFFFFF', '#3B0764'],
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600',
    gallery: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    product_id: '3d43a6d9',
    user_name: 'Ishtiaque Chowdhury',
    rating: 5,
    comment: 'Exceptional material! Truly worth every taka. The custom Purple border feels extremely royal and fits perfectly fine.',
    verified_purchase: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'r2',
    product_id: '27d4b9b1',
    user_name: 'Adnan Sami',
    rating: 5,
    comment: 'Apple-level detailing inside. The fabric is thick and heavy-weight. Perfect gold thread alignment!',
    verified_purchase: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: 'Style X',
  tagline: 'LUXURY COLLECTIVE',
  whatsapp_number: '+8801700000000',
  currency_symbol: '৳',
  shipping_charge: 50,
  homepage_header: 'Explore our entire catalogue of premium essentials. Every piece is handpicked for quality and construction.'
};

// ==========================================
// LOCAL STORAGE ADAPTER HOOKS/UTILS
// ==========================================

const getStored = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`stylex_${key}`);
  if (!data) {
    localStorage.setItem(`stylex_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(`stylex_${key}`, JSON.stringify(value));
};

// Initialize fallback structures in localStorage
const initLocalDb = () => {
  getStored<Category[]>('categories', DEFAULT_CATEGORIES);
  getStored<Product[]>('products', DEFAULT_PRODUCTS);
  getStored<Review[]>('reviews', DEFAULT_REVIEWS);
  getStored<SiteSettings>('settings', DEFAULT_SETTINGS);
  getStored<Order[]>('orders', []);
  getStored<WishlistItem[]>('wishlist', []);
  getStored<Chat[]>('chats', []);
  getStored<ChatMessage[]>('chat_messages', []);
  
  // Default user accounts (1 admin, 1 customer for easy testing)
  getStored<UserProfile[]>('users', [
    {
      id: 'admin-userid',
      full_name: 'Risat Adnan',
      email: 'rarisat21@gmail.com',
      phone: '+8801700000000',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString()
    },
    {
      id: 'customer-userid',
      full_name: 'Kazi Niaz',
      email: 'customer@stylex.com',
      phone: '+8801811111111',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString()
    }
  ]);
};

// Invoked during module load
initLocalDb();

// ==========================================
// CENTRAL STORAGE CONTROLLER
// ==========================================

export class StyleXDb {

  // ==================== AUTHENTICATION & PROFILES ====================
  
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const sessionUser = localStorage.getItem('stylex_current_session');
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        return null;
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            const profile: UserProfile = data;
            localStorage.setItem('stylex_current_session', JSON.stringify(profile));
            return profile;
          }
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, falling back:', err);
      }
    }
    return null;
  }

  static async signUp(email: string, fullName: string, phone: string = ''): Promise<{ user: UserProfile | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        // Sign up in Supabase Authentication
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'Password123!', // Simple standard preset for demoing
          options: {
            data: {
              full_name: fullName,
              phone
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          // Insert row in public.users table
          const newUser: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            email,
            phone,
            role: 'customer',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
            created_at: new Date().toISOString()
          };

          const { error: dbErr } = await supabase
            .from('users')
            .insert(newUser);

          if (dbErr) console.error('Supabase users table insert error:', dbErr);
          
          localStorage.setItem('stylex_current_session', JSON.stringify(newUser));
          return { user: newUser, error: null };
        }
      } catch (err: any) {
        return { user: null, error: err.message || 'Supabase SignUp Error' };
      }
    }

    // Local Fallback Flow
    const users = getStored<UserProfile[]>('users', []);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'Email already registered.' };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      full_name: fullName,
      email,
      phone,
      role: email.toLowerCase() === 'rarisat21@gmail.com' ? 'admin' : 'customer', // Auto-admin for matching creator
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setStored('users', users);
    localStorage.setItem('stylex_current_session', JSON.stringify(newUser));
    return { user: newUser, error: null };
  }

  static async signIn(email: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        // Attempt magic link login or normal auth
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false
          }
        });
        if (error) throw error;

        // Force retrieve matching user row
        const { data, error: fetchErr } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchErr || !data) {
          throw new Error('User record not found in profile directory. Please sign up first.');
        }

        const profile: UserProfile = data;
        localStorage.setItem('stylex_current_session', JSON.stringify(profile));
        return { user: profile, error: null };
      } catch (err: any) {
        console.warn('Supabase login failed, using high-fidelity local accounts. Message:', err.message);
      }
    }

    // High fidelity local auth
    const users = getStored<UserProfile[]>('users', []);
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      localStorage.setItem('stylex_current_session', JSON.stringify(match));
      return { user: match, error: null };
    }

    // If typing 'admin@stylex.com' or owner's email, auto provision and sign in
    if (email.toLowerCase() === 'admin@stylex.com' || email.toLowerCase() === 'rarisat21@gmail.com') {
      const adminAcc: UserProfile = {
        id: 'admin-userid',
        full_name: 'Risat Adnan',
        email,
        phone: '+8801700000000',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        created_at: new Date().toISOString()
      };
      users.push(adminAcc);
      setStored('users', users);
      localStorage.setItem('stylex_current_session', JSON.stringify(adminAcc));
      return { user: adminAcc, error: null };
    }

    return { user: null, error: 'No account discovered with this email. Please register!' };
  }

  static async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('stylex_current_session');
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUserProfile();
    if (!current) throw new Error('Not logged in');

    const updated = { ...current, ...profile };
    localStorage.setItem('stylex_current_session', JSON.stringify(updated));

    // Update in local DB list too
    const users = getStored<UserProfile[]>('users', []);
    const idx = users.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      users[idx] = updated;
      setStored('users', users);
    }

    if (isSupabaseConfigured) {
      await supabase
        .from('users')
        .update(profile)
        .eq('id', current.id);
    }

    return updated;
  }

  // ==================== CATEGORIES CRUD ====================

  static async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) return data;
    }
    return getStored<Category[]>('categories', DEFAULT_CATEGORIES);
  }

  static async saveCategory(cat: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').upsert(cat).select().single();
      if (!error && data) return data;
    }
    const categories = getStored<Category[]>('categories', DEFAULT_CATEGORIES);
    if (!cat.id) {
      const newCat: Category = {
        id: 'cat_' + Math.random().toString(36).substr(2, 9),
        name: cat.name || 'NEW',
        slug: cat.slug || 'new',
        created_at: new Date().toISOString()
      };
      categories.push(newCat);
      setStored('categories', categories);
      return newCat;
    } else {
      const idx = categories.findIndex(c => c.id === cat.id);
      const updatedCat = { ...categories[idx], ...cat, name: cat.name!, slug: cat.slug! };
      categories[idx] = updatedCat;
      setStored('categories', categories);
      return updatedCat;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('categories').delete().eq('id', id);
    }
    const categories = getStored<Category[]>('categories', DEFAULT_CATEGORIES);
    setStored('categories', categories.filter(c => c.id !== id));
  }

  // ==================== PRODUCTS CRUD ====================

  static async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getStored<Product[]>('products', DEFAULT_PRODUCTS);
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (!error && data) return data;
    }
    const products = getStored<Product[]>('products', DEFAULT_PRODUCTS);
    return products.find(p => p.slug === slug) || null;
  }

  static async saveProduct(prod: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').upsert(prod).select().single();
      if (!error && data) return data;
    }
    const products = getStored<Product[]>('products', DEFAULT_PRODUCTS);
    if (!prod.id) {
      const newProd: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: prod.name || 'Untitled Piece',
        slug: prod.slug || 'untitled-' + Math.random().toString(36).substr(2, 4),
        description: prod.description || 'No description provided.',
        price: prod.price || 0,
        old_price: prod.old_price,
        stock: prod.stock !== undefined ? prod.stock : 10,
        category: prod.category || 'MEN',
        sizes: prod.sizes || ['S', 'XS'],
        colors: prod.colors || ['#0F0F0F'],
        featured: prod.featured || false,
        image_url: prod.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
        gallery: prod.gallery || [prod.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      products.push(newProd);
      setStored('products', products);
      return newProd;
    } else {
      const idx = products.findIndex(p => p.id === prod.id);
      if (idx === -1) throw new Error('Product not found');
      const updatedProd = { 
        ...products[idx], 
        ...prod, 
        updated_at: new Date().toISOString() 
      } as Product;
      products[idx] = updatedProd;
      setStored('products', products);
      return updatedProd;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('products').delete().eq('id', id);
    }
    const products = getStored<Product[]>('products', DEFAULT_PRODUCTS);
    setStored('products', products.filter(p => p.id !== id));
  }

  // ==================== ORDERS AND CHECKOUT ====================

  static async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getStored<Order[]>('orders', []);
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const orders = getStored<Order[]>('orders', []);
    return orders.filter(o => o.user_id === userId);
  }

  static async createOrder(
    customerInfo: { name: string; email: string; phone: string; address: string; city: string },
    items: { product: Product; quantity: number; selectedSize?: string; selectedColor?: string }[],
    userId?: string
  ): Promise<Order> {
    
    // Calculate total amount with standard shipping
    const settings = await this.getSiteSettings();
    const itemsTotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
    const finalTotal = itemsTotal + settings.shipping_charge;

    // Generate random order code in standard luxury format: SX-2026-XXXXXX (6 random numbers)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderCode = `SX-2026-${randomDigits}`;

    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      order_code: orderCode,
      user_id: userId,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      delivery_address: customerInfo.address,
      city: customerInfo.city,
      total_amount: finalTotal,
      status: 'pending',
      payment_method: 'Cash On Delivery',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Validate Stock and Deduct stock
    const products = getStored<Product[]>('products', DEFAULT_PRODUCTS);
    for (const item of items) {
      const pIdx = products.findIndex(p => p.id === item.product.id);
      if (pIdx !== -1) {
        if (products[pIdx].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}. Available: ${products[pIdx].stock}`);
        }
        products[pIdx].stock -= item.quantity;
      }
    }
    setStored('products', products);

    // 2. Insert to orders index
    const orders = getStored<Order[]>('orders', []);
    orders.push(newOrder);
    setStored('orders', orders);

    // 3. Save Order Items
    const orderItemsList = getStored<OrderItem[]>('order_items', []);
    items.forEach(itm => {
      const oItem: OrderItem = {
        id: 'ordit_' + Math.random().toString(36).substr(2, 9),
        order_id: newOrder.id,
        product_id: itm.product.id,
        product_name: itm.product.name,
        price: itm.product.price,
        quantity: itm.quantity,
        size: itm.selectedSize,
        color: itm.selectedColor,
        created_at: new Date().toISOString()
      };
      orderItemsList.push(oItem);
    });
    setStored('order_items', orderItemsList);

    // 4. Try Supabase Sync
    if (isSupabaseConfigured) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_code: newOrder.order_code,
            user_id: newOrder.user_id,
            customer_name: newOrder.customer_name,
            customer_email: newOrder.customer_email,
            customer_phone: newOrder.customer_phone,
            delivery_address: newOrder.delivery_address,
            city: newOrder.city,
            total_amount: newOrder.total_amount,
            status: 'pending',
            payment_method: 'Cash On Delivery'
          })
          .select()
          .single();

        if (orderErr) throw orderErr;

        if (dbOrder) {
          const formattedItems = items.map(itm => ({
            order_id: dbOrder.id,
            product_id: itm.product.id,
            product_name: itm.product.name,
            price: itm.product.price,
            quantity: itm.quantity,
            size: itm.selectedSize,
            color: itm.selectedColor
          }));

          const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(formattedItems);

          if (itemsErr) console.error('Supabase items insertion issue:', itemsErr);
        }
      } catch (err) {
        console.warn('Supabase Order insertion skipped/error:', err);
      }
    }

    return newOrder;
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (!error && data) return data;
    }
    const orderItems = getStored<OrderItem[]>('order_items', []);
    return orderItems.filter(oi => oi.order_id === orderId);
  }

  static async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    const orders = getStored<Order[]>('orders', []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updated_at = new Date().toISOString();
      setStored('orders', orders);
    }

    if (isSupabaseConfigured) {
      await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    }
  }

  // ==================== REVIEWS AND SOCIAL FEEDBACK ====================

  static async getReviews(productId?: string): Promise<Review[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) {
        query = query.eq('product_id', productId);
      }
      const { data, error } = await query;
      if (!error && data) return data;
    }
    const reviews = getStored<Review[]>('reviews', DEFAULT_REVIEWS);
    if (productId) {
      return reviews.filter(r => r.product_id === productId);
    }
    return reviews;
  }

  static async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const newRev: Review = {
      ...review,
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    const reviews = getStored<Review[]>('reviews', DEFAULT_REVIEWS);
    reviews.push(newRev);
    setStored('reviews', reviews);

    if (isSupabaseConfigured) {
      await supabase.from('reviews').insert({
        product_id: review.product_id,
        user_id: review.user_id,
        user_name: review.user_name,
        rating: review.rating,
        comment: review.comment,
        image_url: review.image_url,
        verified_purchase: review.verified_purchase
      });
    }

    return newRev;
  }

  // ==================== WISHLIST LOCALPERSIST ====================

  static async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('wishlists').select('*').eq('user_id', userId);
      if (!error && data) return data;
    }
    const wishlist = getStored<WishlistItem[]>('wishlist', []);
    return wishlist.filter(w => w.user_id === userId);
  }

  static async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = getStored<WishlistItem[]>('wishlist', []);
    const idx = wishlist.findIndex(w => w.user_id === userId && w.product_id === productId);
    let isAdded = false;

    if (idx === -1) {
      const newItem: WishlistItem = {
        id: 'wsh_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      };
      wishlist.push(newItem);
      isAdded = true;

      if (isSupabaseConfigured) {
        await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
      }
    } else {
      wishlist.splice(idx, 1);
      isAdded = false;

      if (isSupabaseConfigured) {
        await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
      }
    }

    setStored('wishlist', wishlist);
    return isAdded;
  }

  // ==================== CHAT REAL-TIME SYSTEM (FALLBACK & ACTIVE) ====================

  static async getChats(): Promise<Chat[]> {
    const chats = getStored<Chat[]>('chats', []);
    const users = getStored<UserProfile[]>('users', []);
    // Map with username attributes
    return chats;
  }

  static async getUserChat(userId: string): Promise<Chat> {
    const chats = getStored<Chat[]>('chats', []);
    let chat = chats.find(c => c.user_id === userId && c.status === 'active');
    
    if (!chat) {
      chat = {
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      chats.push(chat);
      setStored('chats', chats);

      if (isSupabaseConfigured) {
        try {
          await supabase.from('chats').insert({ user_id: userId, status: 'active' });
        } catch (e) {
          console.warn('Supabase chat insertion exception:', e);
        }
      }
    }
    return chat;
  }

  static async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (!error && data) return data;
    }
    const msgs = getStored<ChatMessage[]>('chat_messages', []);
    return msgs.filter(m => m.chat_id === chatId);
  }

  static async sendChatMessage(
    chatId: string, 
    senderId: string | undefined, 
    senderRole: UserRole, 
    message: string
  ): Promise<ChatMessage> {
    
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      chat_id: chatId,
      sender_id: senderId,
      sender_role: senderRole,
      message,
      is_seen: false,
      created_at: new Date().toISOString()
    };

    // 1. Save locally
    const msgs = getStored<ChatMessage[]>('chat_messages', []);
    msgs.push(newMsg);
    setStored('chat_messages', msgs);

    // Update main chat update date
    const chats = getStored<Chat[]>('chats', []);
    const cIdx = chats.findIndex(c => c.id === chatId);
    if (cIdx !== -1) {
      chats[cIdx].updated_at = new Date().toISOString();
      setStored('chats', chats);
    }

    // 2. Sync Supabase
    if (isSupabaseConfigured) {
      await supabase.from('chat_messages').insert({
        chat_id: chatId,
        sender_id: senderId,
        sender_role: senderRole,
        message,
        is_seen: false
      });
      await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
    }

    // Auto Response Mechanism for customer chats to guarantee high-fidelity interactivity
    if (senderRole === 'customer') {
      setTimeout(() => {
        const replyText = this.generateAutoReply(message);
        const replyMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          chat_id: chatId,
          sender_id: 'admin-userid',
          sender_role: 'admin',
          message: replyText,
          is_seen: false,
          created_at: new Date().toISOString()
        };
        const activeMsgs = getStored<ChatMessage[]>('chat_messages', []);
        activeMsgs.push(replyMsg);
        setStored('chat_messages', activeMsgs);
        
        // Dispatch custom browser event to update reactive chat nodes in real time!
        window.dispatchEvent(new CustomEvent('stylex_new_message', { detail: replyMsg }));
      }, 1500);
    }

    return newMsg;
  }

  private static generateAutoReply(customerMsg: string): string {
    const text = customerMsg.toLowerCase();
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      return "Greetings! Welcome to Style X Support portal. How can I assist you with our bespoke physical designs today?";
    }
    if (text.includes('price') || text.includes('taka') || text.includes('৳') || text.includes('how much')) {
      return "Prices are directly curated on each unique visual card. Custom deliveries incur an extra flat ৳50 shipping charge across Bangladesh.";
    }
    if (text.includes('shipping') || text.includes('deliver') || text.includes('courier')) {
      return "We deliver nationwide via luxury third-party secure couriers. Standard shipping takes 2-4 business days, authenticated with Cash on Delivery & live tracking.";
    }
    if (text.includes('size') || text.includes('fit') || text.includes('dimensions')) {
      return "We follow premium slim fit and custom European cut sizes. You can review available dimensions directly on the item catalog nodes!";
    }
    if (text.includes('whatsapp') || text.includes('contact') || text.includes('number')) {
      return "You can confirm orders instantly over WhatsApp! Let us know your order code, or tap 'ORDER VIA WHATSAPP' on any product page.";
    }
    return "Thank you for contacting Style X Concierge. Your inquiry is queued! An administrator will review your message immediately. In the meantime, feel free to review our curated luxury catalog.";
  }

  // ==================== ADMINISTRATIVE CONFIGURATION ====================

  static async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (!error && data && data.length > 0) {
        const general = data.find(d => d.key === 'general')?.value || {};
        const banners = data.find(d => d.key === 'banners')?.value || {};
        return {
          brand_name: general.brand_name || DEFAULT_SETTINGS.brand_name,
          tagline: general.tagline || DEFAULT_SETTINGS.tagline,
          whatsapp_number: general.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
          currency_symbol: general.currency_symbol || DEFAULT_SETTINGS.currency_symbol,
          shipping_charge: Number(general.shipping_charge) || DEFAULT_SETTINGS.shipping_charge,
          homepage_header: banners.homepage_header || DEFAULT_SETTINGS.homepage_header
        };
      }
    }
    return getStored<SiteSettings>('settings', DEFAULT_SETTINGS);
  }

  static async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = getStored<SiteSettings>('settings', DEFAULT_SETTINGS);
    const updated = { ...current, ...settings };
    setStored('settings', updated);

    if (isSupabaseConfigured) {
      await supabase.from('site_settings').upsert({
        key: 'general',
        value: {
          brand_name: updated.brand_name,
          tagline: updated.tagline,
          whatsapp_number: updated.whatsapp_number,
          currency_symbol: updated.currency_symbol,
          shipping_charge: updated.shipping_charge
        }
      });
      await supabase.from('site_settings').upsert({
        key: 'banners',
        value: {
          homepage_header: updated.homepage_header
        }
      });
    }

    return updated;
  }
}
