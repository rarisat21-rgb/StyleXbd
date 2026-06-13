import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Calendar, ShoppingCart, Users, Gem, RefreshCw, Check,
  BaggageClaim, Archive, ToggleLeft, QrCode, Sparkles, MessageSquare, 
  HelpCircle, Image as ImageIcon, Star, Send, X, ArrowLeft, Eye
} from 'lucide-react';
import { StyleXDb } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Product, Category, Order, OrderStatus, Review, Chat, ChatMessage, SiteSettings, UserProfile } from '../types';

interface AdminPanelProps {
  onBackToStore: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

type AdminTab = 'dashboard' | 'inventory' | 'orders' | 'banners' | 'reviews' | 'coupons' | 'campaigns' | 'lottery' | 'seo';

export default function AdminPanel({ onBackToStore, user, onOpenAuth }: AdminPanelProps) {
  // DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Active Tab Node
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');

  // Form states for Product CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(100);
  const [prodOldPrice, setProdOldPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState(50);
  const [prodCat, setProdCat] = useState('MEN');
  const [prodSizesStr, setProdSizesStr] = useState('S,XS');
  const [prodColorsStr, setProdColorsStr] = useState('#0F0F0F,#D4AF37');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600');

  // Active Chat Dashboard node
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Coupon configuration fallback states
  const [coupons, setCoupons] = useState([
    { code: 'ROYAL20', discount: '20% OFF', type: 'percentage', active: true },
    { code: 'GOLD100', discount: '৳100 Fixed', type: 'fixed', active: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState('');

  // Banner Editor states
  const [bannersHeader, setBannersHeader] = useState('');
  const [whatsappNumberSetting, setWhatsappNumberSetting] = useState('');
  const [shippingSetting, setShippingSetting] = useState(50);

  // SEO configuration states
  const [seoTitle, setSeoTitle] = useState('Style X | premium Bespoke Fashion');
  const [seoMeta, setSeoMeta] = useState('Exquisite apparel handcrafted with gold detailing and tailored lines in Bangladesh.');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const p = await StyleXDb.getProducts();
      const c = await StyleXDb.getCategories();
      const o = await StyleXDb.getOrders();
      const r = await StyleXDb.getReviews();
      const s = await StyleXDb.getSiteSettings();
      
      setProducts(p);
      setCategories(c);
      setOrders(o);
      setReviews(r);
      setSiteSettings(s);

      setBannersHeader(s.homepage_header);
      setWhatsappNumberSetting(s.whatsapp_number);
      setShippingSetting(s.shipping_charge);
    } catch (err) {
      console.error('Error fetching admin data streams:', err);
    }
  };

  // Auto Generate matching slugs based on Product Names
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProdName(name);
    if (formMode === 'create') {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setProdSlug(slug);
    }
  };

  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditId(null);
    setProdName('');
    setProdSlug('');
    setProdDesc('');
    setProdPrice(100);
    setProdOldPrice(150);
    setProdStock(50);
    setProdCat('MEN');
    setProdSizesStr('S,XS');
    setProdColorsStr('#0F0F0F,#D4AF37');
    setProdImage('https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: Product) => {
    setFormMode('edit');
    setEditId(p.id);
    setProdName(p.name);
    setProdSlug(p.slug);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdOldPrice(p.old_price);
    setProdStock(p.stock);
    setProdCat(p.category || 'MEN');
    setProdSizesStr(p.sizes ? p.sizes.join(',') : 'S');
    setProdColorsStr(p.colors ? p.colors.join(',') : '#000');
    setProdImage(p.image_url);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sizesArray = prodSizesStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      const colorsArray = prodColorsStr.split(',').map(c => c.trim()).filter(Boolean);

      const payload: Partial<Product> = {
        name: prodName,
        slug: prodSlug,
        description: prodDesc,
        price: Number(prodPrice),
        old_price: prodOldPrice ? Number(prodOldPrice) : undefined,
        stock: Number(prodStock),
        category: prodCat,
        sizes: sizesArray,
        colors: colorsArray,
        image_url: prodImage,
        gallery: [prodImage]
      };

      if (formMode === 'edit' && editId) {
        payload.id = editId;
      }

      await StyleXDb.saveProduct(payload);
      setIsFormOpen(false);
      loadAdminStats();
    } catch (err: any) {
      alert(err.message || 'Error compiling database records.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to retract this garment from active distribution?')) return;
    try {
      await StyleXDb.deleteProduct(id);
      loadAdminStats();
    } catch (err) {
      alert('Error purging item records.');
    }
  };

  // Status Modifiers for orders tab
  const handleUpdateOrderStatus = async (oId: string, status: OrderStatus) => {
    try {
      await StyleXDb.updateOrderStatus(oId, status);
      loadAdminStats();
    } catch (err) {
      alert('Failed to modify order state.');
    }
  };

  // Approve review submission status logs
  const handleApproveReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, verified_purchase: true } : r));
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // Coupon Builders
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponVal.trim()) return;
    setCoupons(prev => [...prev, { code: newCouponCode.toUpperCase(), discount: newCouponVal, type: 'fixed', active: true }]);
    setNewCouponCode('');
    setNewCouponVal('');
  };

  // Configuration modifications
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await StyleXDb.updateSiteSettings({
        homepage_header: bannersHeader,
        whatsapp_number: whatsappNumberSetting,
        shipping_charge: Number(shippingSetting)
      });
      loadAdminStats();
      alert('Site configuration successfully synchronized!');
    } catch {
      alert('Error updating configuration parameters.');
    }
  };

  // Generate real QR code image representations just like the inventory screenshot!
  const generateQrUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}&color=212-175-55&bgcolor=15-15-15`;
  };

  // Finance metrics computations
  const totalRevenueVal = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, curr) => sum + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 flex flex-col md:flex-row">
      {/* LEFT SIDEBAR CONTROLLER */}
      <aside className="w-full md:w-64 bg-[#0F0F0F] border-b md:border-b-0 md:border-r border-purple-500/10 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl border border-yellow-500/20 bg-purple-950/20 text-yellow-500 text-lg font-black">
            SX
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-neutral-100">Style X Control</h1>
            <span className="text-[8px] text-[#D4AF37] uppercase tracking-wider block font-bold mt-0.5">⚜️ Imperial Admin Portal</span>
          </div>
        </div>

        {/* Tab Selection Lists */}
        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard Statistics', icon: Archive },
            { id: 'inventory', label: 'Inventory list', icon: BaggageClaim },
            { id: 'orders', label: 'Order Tracking', icon: ShoppingCart },
            { id: 'banners', label: 'Site Settings', icon: ImageIcon },
            { id: 'reviews', label: 'Review Moderation', icon: Star },
            { id: 'coupons', label: 'Coupons / BOGO', icon: Users },
            { id: 'campaigns', label: 'Campaign ideas', icon: Sparkles },
            { id: 'lottery', label: 'Lottery rules', icon: HelpCircle },
            { id: 'seo', label: 'SEO tags', icon: RefreshCw }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer outline-none ${
                  isSel
                    ? 'bg-yellow-500 border border-yellow-500/20 text-[#0F0F0F] font-black shadow-[0_4px_15px_rgba(212,175,55,0.2)]'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back To Storefront Button */}
        <button
          onClick={onBackToStore}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-white hover:border-[#D4AF37]/35 transition-all cursor-pointer"
        >
          <ArrowLeft size={12} /> Exit Portal
        </button>
      </aside>

      {/* CORE CONTENT RUNWAY */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* UPPER STATUS DECK */}
        <div id="admin-topbar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/10 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'inventory' && 'Products inventory'}
              {activeTab === 'orders' && 'Bespoke Orders Tracker'}
              {activeTab === 'banners' && 'Site settings Customizer'}
              {activeTab === 'reviews' && 'Reviews Moderation'}
              {activeTab === 'coupons' && 'Coupons & Discounts'}
              {activeTab === 'campaigns' && 'Campaign Center'}
              {activeTab === 'lottery' && 'Imperial Lottery'}
              {activeTab === 'seo' && 'SEO Optimizer'}
            </h2>
            <span className="text-[10px] text-neutral-400 font-medium block uppercase tracking-wider mt-0.5">
              Live updates configured via state fallbacks
            </span>
          </div>

          {/* Screenshot live node markers: "LIVE 1" and "VISITS 125" */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 px-4 py-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live 1 node</span>
            </div>
            <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-4 py-1.5 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Visits: 125 users</span>
            </div>
            <button
              onClick={loadAdminStats}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-purple-500/20 cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ==================== LIVE DATABASE & AUTHENTICATION DIAGNOSTICS ==================== */}
        <div className="mb-8 p-5 rounded-2xl border border-yellow-500/10 bg-gradient-to-r from-yellow-500/5 via-transparent to-purple-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 p-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-[#D4AF37] border border-yellow-500/20">
                DATABASE MODE
              </span>
              {isSupabaseConfigured ? (
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  🌐 PRODUCTION SUPABASE ACTIVE
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold text-yellow-500 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  💾 LOCAL STORAGE FALLBACK
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-neutral-400 max-w-2xl leading-relaxed">
              {isSupabaseConfigured ? (
                <>
                  Your app is connected to live production tables under your configuration endpoint. 
                  {!user ? (
                    <span className="text-rose-400 block mt-1 font-semibold">
                      ⚠️ UNAUTHENTICATED GUEST: You are currently log-in bypassed. Saving products will be rejected by Supabase RLS. Click "Authenticate Admin Email" and sign up or sign in as rarisat21@gmail.com!
                    </span>
                  ) : user.role !== 'admin' ? (
                    <span className="text-amber-400 block mt-1 font-semibold">
                      ⚠️ ACCESS ROLE: You are logged in as "{user.full_name}" but your security role is classified as <strong>'{user.role}'</strong>. Product uploads will be blocked by Supabase Row-Level Security.
                    </span>
                  ) : (
                    <span className="text-emerald-400 block mt-1 font-semibold">
                      👑 VERIFIED ADMINISTRATOR: Logged in as "{user.full_name}" ({user.email}). You possess authorized CRUD rights on core products, categories, and orders.
                    </span>
                  )}
                </>
              ) : (
                "Your application is running on client-side sandbox mode. All modifications are perfectly retained in your browser's private LocalStorage workspace."
              )}
            </p>
          </div>

          {isSupabaseConfigured && (!user || user.role !== 'admin') && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-widest text-[10px] hover:bg-yellow-500 hover:text-black hover:border-transparent active:scale-[0.98] transition-all cursor-pointer outline-none shrink-0"
            >
              🔐 Authenticate Admin Email
            </button>
          )}
        </div>

        {/* ==================== 1. DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick stats indices */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[#D4AF37]"><Gem size={22} /></div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Total Sales Volume</span>
                <span id="stat-revenue" className="text-2xl font-black text-[#D4AF37] mt-1.5 block">৳{totalRevenueVal}</span>
                <span className="text-[8px] text-emerald-400 mt-1 block font-semibold">↑ 14% growth monthly</span>
              </div>
              <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-purple-400"><ShoppingCart size={22} /></div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Total Orders</span>
                <span id="stat-orders" className="text-2xl font-black text-white mt-1.5 block">{orders.length} orders</span>
                <span className="text-[8px] text-neutral-400 mt-1 block font-semibold">98.2% fulfillment rate</span>
              </div>
              <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-emerald-400"><Users size={22} /></div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Total users database</span>
                <span id="stat-users" className="text-2xl font-black text-white mt-1.5 block">16 members</span>
                <span className="text-[8px] text-[#D4AF37] mt-1 block font-semibold">Premium collective enrollment</span>
              </div>
              <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-rose-400"><Archive size={22} /></div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Active Products</span>
                <span id="stat-products" className="text-2xl font-black text-white mt-1.5 block">{products.length} garments</span>
                <span className="text-[8px] text-rose-400 mt-1 block font-semibold">Curated capsule list</span>
              </div>
            </div>

            {/* Quick recent orders logs list */}
            <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4">Incoming Order Queue</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4">No recent purchases logged via local cash checkout.</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-purple-500/5 text-neutral-500 text-[9px] uppercase tracking-widest">
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Receiver</th>
                        <th className="pb-3">Total amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Delivery date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-neutral-900/40">
                          <td className="py-3 font-mono font-bold text-neutral-300">{o.order_code}</td>
                          <td className="py-3">{o.customer_name}</td>
                          <td className="py-3 text-[#D4AF37] font-semibold">৳{o.total_amount}</td>
                          <td className="py-3">
                            <span className="text-[9px] bg-purple-950/40 border border-purple-500/30 text-purple-400 uppercase font-bold px-2 py-0.5 rounded">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-neutral-500">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. INVENTORY LIST & CRUD ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-4">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">Manage runway inventory</span>
              <button
                id="create-product-btn"
                onClick={handleOpenCreateForm}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-600 text-neutral-950 px-5  py-2.5 text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg active:scale-95 transition-all cursor-pointer outline-none"
              >
                <Plus size={14} /> NEW PRODUCT
              </button>
            </div>

            {/* Inventory table replicating screenshot */}
            <div className="rounded-2xl border border-purple-500/10 bg-[#0F0F0F] overflow-hidden">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-purple-500/10 text-neutral-500 text-[10px] uppercase tracking-widest bg-neutral-950/80">
                      <th className="p-4">CODE</th>
                      <th className="p-4">GARMENT BLOCK / DETAILS</th>
                      <th className="p-4">CATEGORY</th>
                      <th className="p-4">PRICE</th>
                      <th className="p-4">STOCK STATUS</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-neutral-900/30 transition-colors">
                        {/* Styled QR Code next to the item just like the screenshot */}
                        <td className="p-4">
                          <div className="flex flex-col items-center gap-1 bg-black p-1.5 rounded-lg border border-yellow-500/25 w-18">
                            <img src={generateQrUrl(p.slug)} alt="QR" className="h-10 w-10 object-contain bg-neutral-950" />
                            <span className="text-[8px] font-mono text-yellow-500/70">{p.id.substring(0, 5).toUpperCase()}</span>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded overflow-hidden bg-neutral-800 shrink-0 border border-neutral-800">
                              <img src={p.image_url} alt={p.name} className="object-cover h-full w-full" />
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-200 text-xs uppercase tracking-wide">{p.name}</h4>
                              <span className="block text-[8px] text-neutral-500 font-mono italic">slug: {p.slug}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-[9px] bg-purple-950/40 border border-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded">
                            {p.category}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-[#D4AF37]">
                          ৳{p.price}
                          {p.old_price && <span className="block text-[9px] text-neutral-500 line-through">৳{p.old_price}</span>}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${p.stock > 15 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
                            <span className="font-semibold text-neutral-300">{p.stock} units</span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleOpenEditForm(p)}
                              className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-yellow-500 hover:border-yellow-500/30 transition-colors cursor-pointer"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 hover:text-white transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. ORDER MANAGEMENT ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] border border-purple-500/10 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4">Customer Shipment Operations</h3>
              
              {orders.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4">No recent purchases found in local state database.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-purple-500/5 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-neutral-300">{order.order_code}</span>
                          <span className="text-[8px] bg-[#3B0764]/30 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            COD Order
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-400">Status state:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#D4AF37] focus:outline-none focus:border-yellow-500/30 font-semibold"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold">Buyer Details</span>
                          <p className="mt-1 font-semibold text-neutral-300">{order.customer_name}</p>
                          <p className="text-neutral-400 font-mono text-[10px]">{order.customer_phone}</p>
                          <p className="text-neutral-500 mt-0.5">{order.customer_email}</p>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold">Delivery Address</span>
                          <p className="mt-1 font-semibold text-neutral-300">{order.delivery_address}</p>
                          <p className="text-[#D4AF37] font-semibold">{order.city} CITY • BD</p>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold">Total Amount Due</span>
                          <span className="block text-base font-black text-yellow-500 mt-1">৳{order.total_amount}</span>
                          <span className="text-[8px] text-neutral-500">Includes flat shipping charges</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 4. BANNERS & SITE SETTINGS ==================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveConfig} className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Modify Landing Configurations</h3>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Announcement Ticker Header Message</label>
                <textarea
                  value={bannersHeader}
                  onChange={(e) => setBannersHeader(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">WhatsApp Ordering Number (Fulfillment Hub)</label>
                  <input
                    type="text"
                    value={whatsappNumberSetting}
                    onChange={(e) => setWhatsappNumberSetting(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Nationwide Shipping Charge (৳ BDT)</label>
                  <input
                    type="number"
                    value={shippingSetting}
                    onChange={(e) => setShippingSetting(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-tr from-purple-800 to-indigo-900 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg cursor-pointer hover:opacity-90"
              >
                Synchronize Configuration Changes
              </button>
            </form>
          </div>
        )}

        {/* ==================== 5. REVIEWS MODERATION ==================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Manage Curator Reviews</h3>
              
              {reviews.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4">No reviews recorded on any products yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl relative space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-neutral-200 text-xs">{r.user_name}</h4>
                          <span className="text-[8px] text-neutral-500 font-mono">product: {r.product_id}</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star key={st} size={10} className={r.rating >= st ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-800'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 italic">"{r.comment}"</p>

                      <div className="flex justify-between items-center pt-2 border-t border-purple-500/5">
                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${r.verified_purchase ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' : 'bg-yellow-950/20 text-yellow-400 border border-yellow-500/10'}`}>
                          {r.verified_purchase ? 'Approve Verified' : 'Pending Verification'}
                        </span>

                        <div className="flex gap-1.5">
                          {!r.verified_purchase && (
                            <button
                              onClick={() => handleApproveReview(r.id)}
                              className="bg-emerald-800 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="bg-red-950/20 text-red-400 text-[9px] font-bold px-2 py-1 rounded cursor-pointer hover:bg-red-900"
                          >
                            Purge
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 6. COUPONS ==================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Build coupon */}
              <form onSubmit={handleCreateCoupon} className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Generate Golden Promo Code</h3>
                
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Coupon Code</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. VIPCOUTURE"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 uppercase tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Discount Description</label>
                  <input
                    type="text"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(e.target.value)}
                    placeholder="e.g. 15% OFF, ৳100 BDT Off"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-yellow-500 text-neutral-950 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-yellow-400"
                >
                  Publish Coupon
                </button>
              </form>

              {/* Coupons list */}
              <div className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4 font-bold">Active Coupons directory</h3>
                <div className="space-y-3">
                  {coupons.map((c, idx) => (
                    <div key={idx} className="p-3 bg-neutral-950 border border-neutral-900 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white tracking-widest block">{c.code}</strong>
                        <span className="text-[9px] text-[#D4AF37]">{c.discount}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 uppercase">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 7. CAMPAIGN CONSOLE ==================== */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] border border-purple-500/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Active Marketing Campaigns</h3>
              <p className="text-xs text-neutral-400 leading-normal">
                Configure promotional layouts, timed drop notifications, and newsletter templates for existing customer list nodes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2">
                  <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest">Active Campaign Drop</span>
                  <h4 className="font-bold text-white text-base">🍂 Autumn Couture drop 2026</h4>
                  <p className="text-neutral-400">Trigger VIP priority emails to 16 enrolled members presenting recent arrivals.</p>
                  <button className="bg-purple-800 px-3 py-1.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider cursor-pointer">
                    Broadcast Drop SMS
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Seasonal Discounts</span>
                  <h4 className="font-bold text-white text-base">⚜️ Cash-on-Delivery BDT Waiver</h4>
                  <p className="text-neutral-400">Active setting across Bangladesh offering ৳0 shipping on premium orders exceeding ৳500.</p>
                  <button className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-[9px] font-bold text-neutral-400 uppercase tracking-wider cursor-pointer">
                    Deactivate Waiver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 8. LOTTERY RULES ==================== */}
        {activeTab === 'lottery' && (
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Imperial Sweepstakes & Lottery</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Configure administrative lottery criteria for enrolled customers. Order coupons or free bespoke products are randomly gifted to a selected buyer monthly.
              </p>

              <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center bg-neutral-900 p-2 rounded border border-neutral-800">
                  <span className="font-bold text-white">Current Sweepstakes Draw:</span>
                  <strong className="text-yellow-500 font-mono">SX-JUNE-2026</strong>
                </div>
                <div className="flex justify-between text-neutral-400 py-1.5">
                  <span>Enrolled candidates:</span>
                  <span>16 valid buyer order codes matched</span>
                </div>
                <button 
                  onClick={() => alert(`Sweepstakes compiled successfully! Random winning ticket code selected: SX-2026-${Math.floor(100000 + Math.random() * 900000)} (Dispatched WhatsApp voucher automatically)`)}
                  className="w-full py-2.5 bg-yellow-500 text-neutral-950 rounded-lg text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                >
                  ⚡ Execute Random Triage Draw
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 9. SEO OPTIONS ==================== */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="bg-[#0F0F0F] rounded-2xl border border-purple-500/10 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Dynamic SEO Meta Control</h3>
              
              <div className="space-y-1 text-xs">
                <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider block">Global Homepage Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider block">Global Meta Description</label>
                <textarea
                  value={seoMeta}
                  onChange={(e) => setSeoMeta(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200"
                  rows={3}
                />
              </div>

              <button
                onClick={() => alert('Search engine optimizer cache renewed! meta.json tracking updated successfully.')}
                className="w-full py-2 bg-gradient-to-tr from-purple-800 to-indigo-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                Compile robots.txt & Sitemap assets
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* 5. PRODUCT RECORD MODAL FORM */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-purple-500/25 bg-neutral-950 p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="font-sans text-xl font-bold uppercase tracking-widest text-[#D4AF37] mb-6">
                {formMode === 'create' ? 'Curate New Masterpiece' : 'Edit Curated Details'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Item Name</label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={handleNameChange}
                      required
                      placeholder="e.g. Risat Adnan"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Slug URL code</label>
                    <input
                      type="text"
                      value={prodSlug}
                      onChange={(e) => setProdSlug(e.target.value)}
                      required
                      placeholder="risat-adnan"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block">Garment Narrative</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    required
                    placeholder="Describe material weave density, drape profile, craftsmanship accents..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-200 focus:outline-none focus:border-yellow-500/30"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Price (৳ BDT)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block">Compare Price (৳)</label>
                    <input
                      type="number"
                      value={prodOldPrice || ''}
                      onChange={(e) => setProdOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Optional strikethrough"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Stock Count</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Category</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-yellow-500/30"
                    >
                      <option value="MEN">MEN</option>
                      <option value="WOMEN">WOMEN</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                      <option value="COLLECTIVE">COLLECTIVE</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block">Sizes (split by comma)</label>
                    <input
                      type="text"
                      value={prodSizesStr}
                      onChange={(e) => setProdSizesStr(e.target.value)}
                      placeholder="XS, S, M, L"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block">Colors (split by comma)</label>
                    <input
                      type="text"
                      value={prodColorsStr}
                      onChange={(e) => setProdColorsStr(e.target.value)}
                      placeholder="#0F0F0F, #6D28D9"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block font-bold">Garment Image URL</label>
                  <input
                    type="url"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-yellow-500/30 font-mono"
                  />
                  <span className="text-[8px] text-neutral-500 block">Provide high-resolution Unsplash links for outstanding styling depth.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-800 to-indigo-950 rounded-xl text-xs font-black uppercase tracking-widest text-[#FFF] hover:opacity-95 shadow-lg active:scale-98 cursor-pointer mt-4"
                >
                  {formMode === 'create' ? 'Introduce Curated Piece' : 'Update Curated Records'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
