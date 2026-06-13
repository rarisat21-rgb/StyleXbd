import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Search, Heart, User, Sparkles, MapPin, Phone, 
  Trash2, Send, Star, HelpCircle, Package, ChevronDown, Check,
  ArrowRight, Landmark, RefreshCw, Eye, ShieldCheck, PhoneCall, X
} from 'lucide-react';
import { StyleXDb } from '../lib/db';
import { Product, Category, Order, CartItem, UserProfile, SiteSettings } from '../types';

interface StorefrontProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export default function Storefront({ user, onOpenAuth, onLogout, onOpenAdmin }: StorefrontProps) {
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');

  // Customer Interactive States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [expandedWhyUs, setExpandedWhyUs] = useState<string | null>(null);
  
  // Size/Color Selection per product
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Navigations or Dialog Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewsProductId, setReviewsProductId] = useState<string | null>(null);

  // Checkout Form States
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('Dhaka');

  // Tracker State
  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Review Submissions
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [activeReviews, setActiveReviews] = useState<any[]>([]);

  // Checkout Completion Success Screen State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Load Inventory Configuration on Mount
  useEffect(() => {
    loadStoreData();
    // Load local cart
    const savedCart = localStorage.getItem('stylex_shopping_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch { setCart([]); }
    }
  }, []);

  // Sync wishlist when user shifts
  useEffect(() => {
    if (user) {
      StyleXDb.getWishlist(user.id).then(list => {
        setWishlist(list.map(w => w.product_id));
      });
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadStoreData = async () => {
    try {
      const prodList = await StyleXDb.getProducts();
      const catList = await StyleXDb.getCategories();
      const settings = await StyleXDb.getSiteSettings();
      
      setProducts(prodList);
      setCategories(catList);
      setSiteSettings(settings);

      // Pre-set default sizes & colors for easy click handling
      const sizesMap: Record<string, string> = {};
      const colorsMap: Record<string, string> = {};
      prodList.forEach(p => {
        if (p.sizes && p.sizes.length > 0) sizesMap[p.id] = p.sizes[0];
        if (p.colors && p.colors.length > 0) colorsMap[p.id] = p.colors[0];
      });
      setSelectedSizes(sizesMap);
      setSelectedColors(colorsMap);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    }
  };

  // Cart Local Persistence Sync
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('stylex_shopping_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product, immediateCheckout = false) => {
    const size = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || 'S';
    const color = selectedColors[product.id] || (product.colors && product.colors[0]) || '#000000';

    const existingIdx = cart.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === size && 
              item.selectedColor === color
    );

    let updatedCart = [...cart];
    if (existingIdx !== -1) {
      if (updatedCart[existingIdx].quantity < product.stock) {
        updatedCart[existingIdx].quantity += 1;
      }
    } else {
      updatedCart.push({
        product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color
      });
    }

    saveCart(updatedCart);

    if (immediateCheckout) {
      // Auto-populate customer info if logged in
      if (user) {
        setCheckoutName(user.full_name);
        setCheckoutPhone(user.phone || '');
        setCheckoutEmail(user.email);
      }
      setIsCheckoutOpen(true);
    } else {
      setIsCartOpen(true);
    }
  };

  const handleUpdateCartQty = (idx: number, change: number) => {
    let updated = [...cart];
    const newQty = updated[idx].quantity + change;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else if (newQty <= updated[idx].product.stock) {
      updated[idx].quantity = newQty;
    }
    saveCart(updated);
  };

  const handleToggleWishlist = async (prodId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const isAdded = await StyleXDb.toggleWishlist(user.id, prodId);
    if (isAdded) {
      setWishlist(prev => [...prev, prodId]);
    } else {
      setWishlist(prev => prev.filter(id => id !== prodId));
    }
  };

  // Filter Catalog logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'low-to-high') return a.price - b.price;
    if (sortOption === 'high-to-low') return b.price - a.price;
    if (sortOption === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.featured ? 1 : -1; // Default featured sort
  });

  // Calculate Order prices
  const itemsSubtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const checkoutTotal = itemsSubtotal + (siteSettings?.shipping_charge || 50);

  // Order Submission Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const order = await StyleXDb.createOrder(
        {
          name: checkoutName,
          email: checkoutEmail,
          phone: checkoutPhone,
          address: checkoutAddress,
          city: checkoutCity
        },
        cart,
        user?.id
      );

      setPlacedOrder(order);
      saveCart([]); // Clear cart
      setIsCheckoutOpen(false);
    } catch (err: any) {
      alert(err.message || 'An error occurred during order dispatch.');
    }
  };

  // Launch WhatsApp Confirmation link
  const triggerWhatsAppRedirect = () => {
    if (!placedOrder || !siteSettings) return;

    const itemsStr = cart.length > 0 
      ? cart.map(i => `- ${i.product.name} [Size: ${i.selectedSize || 'Standard'}] (QTY: ${i.quantity})`).join('\n')
      : `Order Code: ${placedOrder.order_code}`;

    const textPayload = `👑 *STYLE X LUXURY CONFIRMATION* 👑\n\nHello Style X Team, I would like to confirm my luxury order!\n\n*Order Code:* ${placedOrder.order_code}\n*Name:* ${placedOrder.customer_name}\n*Phone:* ${placedOrder.customer_phone}\n*City:* ${placedOrder.city}\n*Delivery Address:* ${placedOrder.delivery_address}\n\n*Amount Due:* ${siteSettings.currency_symbol}${placedOrder.total_amount} (Cash on Delivery)\n\nThank you! Please process my delivery.`;
    
    // Smoothly strip unnecessary characters from phone
    const formattedTel = siteSettings.whatsapp_number.replace(/[+\s-]/g, '');
    const encodedPayload = encodeURIComponent(textPayload);
    const apiLink = `https://api.whatsapp.com/send?phone=${formattedTel}&text=${encodedPayload}`;
    
    window.open(apiLink, '_blank');
  };

  // Trigger WhatsApp directly for a single item
  const handleWhatsAppDirectBuy = (product: Product) => {
    if (!siteSettings) return;
    const size = selectedSizes[product.id] || 'S';
    const textPayload = `👑 *STYLE X INQUIRY / ORDER* 👑\n\nHello Style X, I am interested in purchasing this exclusive item:\n\n*Product Name:* ${product.name}\n*Item Code:* ${product.id}\n*Category:* ${product.category}\n*Requested Size:* ${size}\n*Price:* ${siteSettings.currency_symbol}${product.price}\n\nIs this item available for instant Cash on Delivery?`;
    
    const formattedTel = siteSettings.whatsapp_number.replace(/[+\s-]/g, '');
    const encodedPayload = encodeURIComponent(textPayload);
    window.open(`https://api.whatsapp.com/send?phone=${formattedTel}&text=${encodedPayload}`, '_blank');
  };

  // Track Order Query
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackedOrder(null);

    if (!trackCode.trim()) return;

    try {
      const allOrders = await StyleXDb.getOrders();
      const match = allOrders.find(o => o.order_code.toUpperCase() === trackCode.trim().toUpperCase());
      
      if (match) {
        setTrackedOrder(match);
      } else {
        setTrackError('No luxury shipment details discovered matching this code.');
      }
    } catch (err) {
      setTrackError('Failed checking records database.');
    }
  };

  // Load reviews overlay
  const handleOpenReviews = async (product: Product) => {
    setReviewsProductId(product.id);
    const reviews = await StyleXDb.getReviews(product.id);
    setActiveReviews(reviews);
    setIsReviewsOpen(true);
  };

  // Review Submissions
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewsProductId) return;

    const currentUserName = user ? user.full_name : 'Anonymous Curator';
    const result = await StyleXDb.addReview({
      product_id: reviewsProductId,
      user_id: user?.id,
      user_name: currentUserName,
      rating: newReviewRating,
      comment: newReviewComment,
      verified_purchase: true
    });

    setActiveReviews(prev => [result, ...prev]);
    setNewReviewComment('');
    // Reload main product info
    const prodList = await StyleXDb.getProducts();
    setProducts(prodList);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-neutral-200 selection:bg-purple-800 selection:text-white pb-12">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-950/20 via-neutral-950/0 to-transparent pointer-events-none" />

      {/* 1. STICKY BLUR NAVIGATION HARBOR */}
      <nav className="sticky top-0 z-30 w-full border-b border-purple-500/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3 shrink-0">
              <div 
                id="brand-logo" 
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-500/20 bg-purple-950/20 text-yellow-500 font-sans font-extrabold text-lg tracking-tighter"
                onClick={() => setSelectedCategory('ALL')}
                style={{ cursor: 'pointer' }}
              >
                SX
              </div>
              <div>
                <span className="block font-sans text-xs font-black uppercase tracking-[0.2em] text-neutral-100">
                  {siteSettings?.brand_name || 'Style X'}
                </span>
                <span className="block text-[8px] tracking-[0.3em] uppercase text-yellow-500/80 font-semibold">
                  {siteSettings?.tagline || 'LUXURY COLLECTIVE'}
                </span>
              </div>
            </div>

            {/* Quick Categories Bar */}
            <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-bold">
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className={`transition-colors cursor-pointer outline-none ${selectedCategory === 'ALL' ? 'text-yellow-500' : 'text-neutral-400 hover:text-white'}`}
              >
                Collective
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`transition-colors cursor-pointer outline-none ${selectedCategory.toUpperCase() === c.name.toUpperCase() ? 'text-yellow-500' : 'text-neutral-400 hover:text-white'}`}
                >
                  {c.name}
                </button>
              ))}
              <button 
                onClick={() => setIsTrackerOpen(true)}
                className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer outline-none"
              >
                <Package size={12} className="text-purple-500" /> Track Order
              </button>
            </div>

            {/* Global Search Interface */}
            <div className="relative max-w-xs flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={searchQuery}
                aria-label="Search items"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-neutral-800 bg-neutral-900/60 py-1.5 pl-9 pr-4 text-xs tracking-wider placeholder-neutral-500 focus:border-yellow-500/30 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all text-neutral-200"
              />
            </div>

            {/* Interactive Operations Deck */}
            <div className="flex items-center gap-3">
              {/* Profile Account Indicator */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {user.role === 'admin' ? '⚜️ Admin' : 'Curator'}
                  </span>
                  <div className="relative group">
                    <button className="flex h-8 w-8 overflow-hidden rounded-full border border-purple-500/35 bg-neutral-900 cursor-pointer outline-none">
                      <img src={user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=user"} alt="Avatar" referrerPolicy="no-referrer" />
                    </button>
                    {/* Hover dropdown list */}
                    <div className="absolute right-0 top-full mt-2 w-48 hidden group-hover:block rounded-xl border border-purple-500/10 bg-neutral-950 p-2 shadow-2xl z-50">
                      {user.role === 'admin' && (
                        <button
                          onClick={onOpenAdmin}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-yellow-500 hover:bg-purple-950/40 transition-colors"
                        >
                          🏰 Admin Panel
                        </button>
                      )}
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-neutral-900 transition-colors"
                      >
                        Sign Out Session
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/25 px-3 py-1.5 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors outline-none cursor-pointer"
                >
                  <User size={12} /> Sign In
                </button>
              )}

              {/* Wishlist toggle */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Heart size={16} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Shopping Bag Drawer Button */}
              <button
                id="cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-600/90 to-yellow-500 text-neutral-950 px-4 py-1.5 text-xs font-black uppercase tracking-widest hover:opacity-95 shadow-[0_2px_15px_rgba(212,175,55,0.25)] transition-all cursor-pointer outline-none"
              >
                <ShoppingBag size={14} />
                <span>Cart</span>
                <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[9px] font-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* 2. THE TICKER PROMOTIONAL BANNER */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/10 bg-neutral-950/60 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-950/40 text-yellow-500 border border-yellow-500/10 shrink-0">
                <Sparkles size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                  Style X Announcement
                </span>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed mt-1">
                  {siteSettings?.homepage_header || 'Explore our entire catalogue of premium essentials. Every piece is handpicked for quality and construction.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => setIsTrackerOpen(true)}
                className="rounded-lg bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Track Shipments
              </button>
              <button 
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="rounded-lg bg-gradient-to-tr from-purple-800 to-indigo-900 px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-[#FFF] hover:opacity-90 transition-opacity cursor-pointer shadow-[0_4px_10px_rgba(109,40,217,0.25)]"
              >
                Reset Catalog
              </button>
            </div>
          </div>
        </div>

        {/* Categories filters drawer for mobile devices */}
        <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none font-bold uppercase tracking-widest text-[9px]">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${selectedCategory === 'ALL' ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
          >
            All Collective
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${selectedCategory.toUpperCase() === c.name.toUpperCase() ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 3. PRODUCT CATALOG GRID */}
        <div className="mt-8 flex items-center justify-between border-b border-purple-500/10 pb-4">
          <div>
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">
              Luxury Runway
            </span>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mt-1">
              Curated <span className="font-light text-neutral-400">{selectedCategory}</span> Collection
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
              Sort By:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-[10px] uppercase tracking-wider text-neutral-300 focus:outline-none focus:border-yellow-500/30 font-semibold"
            >
              <option value="featured">👑 Premium Rank</option>
              <option value="low-to-high">৳ Value (Low to High)</option>
              <option value="high-to-low">৳ Elite (High to Low)</option>
              <option value="newest">✨ Fresh Launch</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl mt-6">
            <ShoppingBag size={48} className="mx-auto text-neutral-600 mb-4 animate-bounce" />
            <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-neutral-400">Empty Runway</h3>
            <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
              No outstanding garments matched your visual search. Reset parameters or explore another list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {filteredProducts.map((p) => {
              const sizes = p.sizes || ['S', 'XS'];
              const selSize = selectedSizes[p.id] || sizes[0];
              const isPWhished = wishlist.includes(p.id);

              return (
                <motion.div
                  key={p.id}
                  layoutId={`product-card-${p.id}`}
                  className="group relative flex flex-col rounded-2xl border border-purple-500/5 bg-neutral-950 overflow-hidden shadow-2xl hover:border-purple-500/15 hover:shadow-[0_0_30px_rgba(109,40,217,0.1)] transition-all"
                >
                  {/* Top bar nodes */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                    <span className="rounded bg-black/60 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-800/50">
                      XP-{p.id.substring(0, 3).toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleToggleWishlist(p.id)}
                      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-neutral-800 text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer outline-none"
                    >
                      <Heart size={14} className={isPWhished ? 'fill-rose-500 text-rose-500' : ''} />
                    </button>
                  </div>

                  {/* Product visual container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900 border-b border-purple-500/5">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent h-1/2 p-4 flex items-end">
                      {p.stock === 0 ? (
                        <span className="rounded bg-rose-950/80 border border-rose-500/30 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-rose-400">
                          🔴 Stock Expired
                        </span>
                      ) : p.stock < 15 ? (
                        <span className="rounded bg-yellow-950/80 border border-yellow-500/30 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-yellow-400 animate-pulse">
                          ⚡ Limited Supply ({p.stock} units left)
                        </span>
                      ) : (
                        <span className="rounded bg-purple-950/80 border border-purple-500/30 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-purple-400">
                          💫 TRENDING / EXCLUSIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Core */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-neutral-950/80">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-sans text-base font-bold uppercase tracking-wider text-neutral-100/90 group-hover:text-yellow-500 transition-colors">
                            {p.name}
                          </h4>
                          <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                            CURATED PIECE
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-base font-extrabold text-[#D4AF37]">
                            {siteSettings?.currency_symbol || '৳'}{p.price}
                          </span>
                          {p.old_price && (
                            <span className="block text-[10px] text-neutral-500 line-through">
                              {siteSettings?.currency_symbol || '৳'}{p.old_price}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dimensions selector */}
                      <div className="mt-4">
                        <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                          DIMENSIONS
                        </span>
                        <div className="flex gap-1.5">
                          {sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => setSelectedSizes(prev => ({ ...prev, [p.id]: size }))}
                              className={`flex h-6 w-10 items-center justify-center rounded-md text-[9px] font-black uppercase border transition-all cursor-pointer outline-none ${
                                selSize === size
                                  ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
                                  : 'border-neutral-800/80 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Brand Buy Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddToCart(p, false)}
                          disabled={p.stock === 0}
                          className="w-full bg-neutral-900 border border-neutral-800 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg text-neutral-300 hover:text-white active:scale-95 transition-all outline-none cursor-pointer disabled:opacity-40"
                        >
                          Add To Cart
                        </button>
                        <button
                          onClick={() => handleAddToCart(p, true)}
                          disabled={p.stock === 0}
                          className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-600 text-neutral-950 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg active:scale-95 transition-all outline-none cursor-pointer disabled:opacity-40"
                        >
                          Order Now
                        </button>
                      </div>

                      {/* WhatsApp Confirmation order */}
                      <button
                        onClick={() => handleWhatsAppDirectBuy(p)}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-950/30 border border-emerald-500/25 rounded-lg py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-950/50 transition-colors cursor-pointer"
                      >
                        <PhoneCall size={10} /> Order Via WhatsApp
                      </button>

                      {/* Why Buy Expanded Toggle (Bengali text matching screens) */}
                      <div className="border-t border-purple-500/5 pt-1">
                        <button
                          onClick={() => setExpandedWhyUs(expandedWhyUs === p.id ? null : p.id)}
                          className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 hover:text-yellow-500 transition-colors py-1 cursor-pointer"
                        >
                          <span>✨ আপনি কেন কিনবেন?</span>
                          <ChevronDown size={12} className={`transform transition-transform ${expandedWhyUs === p.id ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {expandedWhyUs === p.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-[10px] text-neutral-400/90 leading-relaxed bg-[#0F0F0Y] p-2.5 rounded-lg border border-purple-500/5 space-y-1.5 mt-1 overflow-hidden"
                            >
                              <p>✅ <strong>প্রিমিয়াম কোয়ালিটি:</strong> ১০০% প্রিমিয়াম সুতা ও নিখুঁত ডিজাইন কাপলড উইথ ব্র্যান্ডেড গোল্ডেন বর্ডার।</p>
                              <p>✅ <strong>ক্যাশ অন ডেলিভারি:</strong> সারা বাংলাদেশে ডেলিভারি ম্যানের সামনে দেখে পেমেন্ট করার সুবিধা।</p>
                              <p>✅ <strong>সহজ রিটার্ন বা এক্সচেঞ্জ:</strong> কোনো সমস্যা থাকলে ইনস্ট্যান্ট চ্যাট বা হোয়াটসঅ্যাপের মাধ্যমে পরিবর্তন সম্ভব।</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Small Reviews link */}
                      <button
                        onClick={() => handleOpenReviews(p)}
                        className="w-full text-center text-[10px] text-neutral-500 hover:text-neutral-300 py-1 flex items-center justify-center gap-1 cursor-pointer bg-neutral-950 border border-neutral-900 rounded-lg hover:border-purple-500/10 transition-colors"
                      >
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span>View Reviews ({Math.floor(Math.random() * 25) + 5} submissions)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. BRAND FOOTER & ADMIN PORTAL ACCESS */}
      <footer className="mt-20 border-t border-purple-500/10 bg-black/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg border border-yellow-500/20 bg-purple-950/10 text-yellow-500 font-extrabold text-xs">
              SX
            </div>
            <span className="font-sans text-xs font-black uppercase tracking-[0.2em] text-neutral-200">
              {siteSettings?.brand_name || 'Style X'}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
            ⚜️ THE PINNACLE OF BESPOKE LUXURY FASHION
          </p>
          <p className="text-[10px] text-neutral-500 max-w-md mx-auto leading-relaxed">
            Painstakingly handcrafted garments featuring custom borders, precise drapes, and 100% secure Cash on Delivery nationwide across Bangladesh.
          </p>
          
          <div className="pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
            <span>&copy; {new Date().getFullYear()} Style X Collective. All rights reserved.</span>
            <button
              id="admin-portal-link"
              onClick={onOpenAdmin}
              className="group flex items-center gap-1.5 font-bold uppercase tracking-widest text-neutral-500 hover:text-yellow-500 transition-colors cursor-pointer outline-none"
            >
              <span>🏰 Administrative Hub</span>
              <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded group-hover:bg-yellow-500 group-hover:text-black transition-all">
                admin
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 4. OVERLAYS, DIALOGS AND CART SLIDERS */}
      {/* ========================================================= */}

      {/* SHOPPING BAG DRAWER OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="relative w-full max-w-md bg-neutral-950 border-l border-purple-500/15 h-full flex flex-col p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <ShoppingBag size={16} /> Luxury Bag
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg h-8 w-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <ShoppingBag size={42} className="text-neutral-700 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Bag is currently empty</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl relative">
                        <div className="h-16 w-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                          <img src={item.product.image_url} alt={item.product.name} referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                        </div>
                        <div className="flex-1 text-xs">
                          <h4 className="font-bold text-neutral-100 uppercase tracking-wide">{item.product.name}</h4>
                          <span className="block text-[9px] text-yellow-500 font-semibold mt-0.5">
                            SIZE: {item.selectedSize || 'S'}
                          </span>
                          <span className="block text-xs font-black text-[#D4AF37] mt-1">
                            {siteSettings?.currency_symbol || '৳'}{item.product.price}
                          </span>
                          
                          {/* Qty edit controllers */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateCartQty(idx, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-[#1C1C1E] border border-neutral-800 font-bold hover:text-yellow-500 cursor-pointer text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(idx, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-[#1C1C1E] border border-neutral-800 font-bold hover:text-yellow-500 cursor-pointer text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const updated = [...cart];
                            updated.splice(idx, 1);
                            saveCart(updated);
                          }}
                          className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-purple-500/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <span>Total Cart Value</span>
                      <span className="text-[#D4AF37] text-lg font-black">
                        {siteSettings?.currency_symbol || '৳'}{itemsSubtotal}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        if (user) {
                          setCheckoutName(user.full_name);
                          setCheckoutPhone(user.phone || '');
                          setCheckoutEmail(user.email);
                        }
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-800 to-indigo-950 hover:opacity-95 rounded-xl text-xs font-semibold uppercase tracking-widest text-white transition-all shadow-lg active:scale-98 cursor-pointer fill-yellow-500"
                    >
                      Bespoke Checkout ({siteSettings?.currency_symbol || '৳'}{itemsSubtotal})
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WISHLIST DRAWER OVERLAY */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsWishlistOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-sm bg-neutral-950 border-l border-purple-500/15 h-full flex flex-col p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <Heart size={16} /> Wishlist Draw
                </h3>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="rounded-lg h-8 w-8 flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-500">
                  <Heart size={38} className="animate-spin" style={{ animationDuration: '8s' }} />
                  <p className="text-[10px] uppercase tracking-widest font-black">Design roster empty</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {wishlist.map(id => {
                    const matchedProd = products.find(p => p.id === id);
                    if (!matchedProd) return null;
                    return (
                      <div key={id} className="flex gap-4 p-3 bg-neutral-900/30 border border-neutral-800 rounded-xl items-center">
                        <div className="h-12 w-10 overflow-hidden bg-neutral-800 rounded">
                          <img src={matchedProd.image_url} alt={matchedProd.name} referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                        </div>
                        <div className="flex-1 text-xs">
                          <h4 className="font-bold text-neutral-200">{matchedProd.name}</h4>
                          <span className="text-[#D4AF37] font-semibold">{siteSettings?.currency_symbol || '৳'}{matchedProd.price}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              handleAddToCart(matchedProd);
                              setIsWishlistOpen(false);
                            }}
                            className="bg-yellow-500 text-neutral-950 text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer hover:bg-yellow-400"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => handleToggleWishlist(id)}
                            className="text-rose-500 bg-[#250101]/30 p-1.5 rounded cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BESPOKE CASH_ON_DELIVERY CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsCheckoutOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-purple-500/25 bg-neutral-950 p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="font-sans text-xl font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                Bespoke Checkout
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400/90 flex items-center gap-1.5 mb-6">
                🛡️ 100% Secure Cash On Delivery • Nationwide Courier Fulfillment
              </p>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      required
                      placeholder="Receiver's name"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Receiver's Phone</label>
                    <input
                      type="tel"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      required
                      placeholder="+8801XXXXXXXXX"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Shipping Address</label>
                    <input
                      type="text"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      required
                      placeholder="House, Road, Area..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">City</label>
                    <select
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-yellow-500/30"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Comilla">Comilla</option>
                    </select>
                  </div>
                </div>

                {/* Bill Review */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Items Subtotal</span>
                    <span>{siteSettings?.currency_symbol || '৳'}{itemsSubtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Nationwide Flat Shipping</span>
                    <span>{siteSettings?.currency_symbol || '৳'}{siteSettings?.shipping_charge || 50}</span>
                  </div>
                  <hr className="border-neutral-800" />
                  <div className="flex justify-between items-center font-bold text-[#D4AF37]">
                    <span>Amount Due on Delivery</span>
                    <span>{siteSettings?.currency_symbol || '৳'}{checkoutTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4.5 bg-gradient-to-r from-purple-800 to-[#6D28D9] rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-xl hover:opacity-95 cursor-pointer"
                >
                  Confirm Order & Generate ID
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISPATCH SUCCESS & WHATSAPP REDIRECT SCREEN */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-lg"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl border border-purple-500/20 bg-neutral-950 p-8 text-center shadow-[0_0_60px_rgba(212,175,55,0.15)] z-10"
            >
              <div className="mx-auto h-16 w-16 bg-emerald-950/40 text-emerald-500 rounded-full border border-emerald-500/20 flex items-center justify-center mb-6">
                <Check size={32} className="animate-bounce" />
              </div>

              <h3 className="font-sans text-2xl font-black uppercase tracking-widest text-[#D4AF37] mb-2">
                Order Registered!
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 animate-pulse bg-rose-950/15 border border-rose-500/10 rounded-lg py-1 max-w-sm mx-auto mb-6">
                Final Step Required Below
              </p>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 mb-6 relative">
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[7px] text-neutral-500 uppercase tracking-wider font-bold">Live Store</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black tracking-widest uppercase text-neutral-500">Order System Code</span>
                  <span id="placed-order-code" className="text-xl font-mono text-neutral-100 font-black">{placedOrder.order_code}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left text-xs text-neutral-400 mt-2">
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-neutral-500">Curator name</span>
                    <p className="text-neutral-200 mt-0.5 font-semibold">{placedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-neutral-500">Final Price</span>
                    <p className="text-neutral-200 mt-0.5 font-semibold text-[#D4AF37]">{siteSettings?.currency_symbol || '৳'}{placedOrder.total_amount}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-2 leading-relaxed mb-6">
                Awesome! Your Cash on Delivery order is filed. To prioritize shipping speeds and confirm coordinates, please tap the gold WhatsApp link below to direct confirm details.
              </p>

              <div className="space-y-3">
                <button
                  onClick={triggerWhatsAppRedirect}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:opacity-95 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-950 shadow-lg cursor-pointer transition-all"
                >
                  <Send size={14} /> Send WhatsApp Confirmation
                </button>
                <button
                  onClick={() => setPlacedOrder(null)}
                  className="w-full py-3 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close & Back to Storefront
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER TRACKING OVERLAY */}
      <AnimatePresence>
        {isTrackerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsTrackerOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-purple-500/20 bg-neutral-950 p-8 shadow-2xl z-10"
            >
              <button
                onClick={() => {
                  setIsTrackerOpen(false);
                  setTrackedOrder(null);
                  setTrackCode('');
                  setTrackError(null);
                }}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="font-sans text-xl font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                Order Tracking
              </h3>
              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-6">
                Enter your order system code (Format: SX-2026-XXXXXX)
              </p>

              <form onSubmit={handleTrackSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SX-2026-123456"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/30 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-800 hover:bg-purple-700 text-white rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer outline-none transition-colors"
                >
                  Locate
                </button>
              </form>

              {trackError && <p className="text-xs text-red-400 font-semibold mt-4 text-center">{trackError}</p>}

              {/* Status Visual Tracker Stepper */}
              {trackedOrder && (
                <div className="mt-8 space-y-6">
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wide">Status state</span>
                      <strong className="text-[#D4AF37] uppercase font-bold mt-0.5 block">{trackedOrder.status}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-neutral-500 block uppercase tracking-wide">Destination</span>
                      <strong className="text-neutral-300 mt-0.5 block">{trackedOrder.city} • BD</strong>
                    </div>
                  </div>

                  {/* Visual Stepper Nodes */}
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-800" />
                    <div className="space-y-4">
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                        const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                        const activeIdx = statuses.indexOf(trackedOrder.status);
                        const isCompleted = activeIdx >= idx;
                        const isCurrent = activeIdx === idx;

                        return (
                          <div key={step} className="flex items-center gap-4 relative">
                            <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center border z-10 shrink-0 ${
                              isCurrent ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                              isCompleted ? 'bg-purple-950/40 border-purple-500 text-purple-400' :
                              'bg-[#121214] border-neutral-800 text-neutral-600'
                            }`}>
                              <Check size={12} className={isCompleted && !isCurrent ? 'opacity-100' : 'opacity-0'} />
                              {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />}
                            </div>
                            <div>
                              <span className={`block text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-yellow-500' : isCompleted ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                {step}
                              </span>
                              <span className="text-[9px] text-neutral-500">
                                {step === 'pending' ? 'Order generated via COD checkouts' :
                                 step === 'confirmed' ? 'Verified & triaged by administrators' :
                                 step === 'processing' ? 'Assembling item details inside warehouse' :
                                 step === 'shipped' ? 'Handed off to luxury express logistics courier' :
                                 'Arrived and confirmed safe coordinates'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEWS LIST & FORM OVERLAY */}
      <AnimatePresence>
        {isReviewsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setIsReviewsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-purple-500/20 bg-neutral-950 p-8 shadow-2xl z-10 overflow-y-auto max-h-[85vh]"
            >
              <button
                onClick={() => setIsReviewsOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="font-sans text-xl font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                Curator Reviews
              </h3>
              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-6">
                Social verified satisfaction scores
              </p>

              {/* Add review form */}
              <form onSubmit={handleAddReview} className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 space-y-3">
                <span className="block text-[8px] font-black text-yellow-500 uppercase tracking-widest">Submit verified feedback</span>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Your Score:</span>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setNewReviewRating(stars)}
                      className="text-neutral-500 hover:text-yellow-500 transition-colors cursor-pointer"
                    >
                      <Star size={16} className={newReviewRating >= stars ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-700'} />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Share details of the fabric quality, fitting, and overall couture satisfaction..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/30"
                  rows={3}
                  required
                />

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-tr from-purple-800 to-indigo-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Verify Dispatch Score
                </button>
              </form>

              {/* Reviews History */}
              <div className="space-y-4">
                {activeReviews.length === 0 ? (
                  <p className="text-center text-xs text-neutral-500 italic">No curator reviews entered yet on this catalog node.</p>
                ) : (
                  activeReviews.map(r => (
                    <div key={r.id} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1.5 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-neutral-200">{r.user_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star key={st} size={10} className={r.rating >= st ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-800'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 leading-normal">{r.comment}</p>
                      
                      <div className="flex justify-between items-center pt-1 border-t border-purple-500/5 mt-2">
                        <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-bold bg-[#3B0764]/20 border border-[#D4AF37]/10 px-1.5 py-0.5 rounded">
                          🛡️ Verified purchase
                        </span>
                        <span className="text-[8px] text-neutral-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
