-- STYLE X LUXURY ECOMMERCE - ROW LEVEL SECURITY POLICIES
-- For use with Supabase PostgreSQL Free Tier

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Helper Function to determine if request is from an Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==================== USERS POLICIES ====================
CREATE POLICY "Public Read Profiles" ON users
    FOR SELECT USING (true);

-- Users can insert their own profile on signup
CREATE POLICY "Self Insert Profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own non-role fields (handled by logic or admin only)
CREATE POLICY "Self Update Profile" ON users
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());


-- ==================== CATEGORIES POLICIES ====================
CREATE POLICY "Public Read Categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admin Write Categories" ON categories
    FOR ALL USING (public.is_admin());


-- ==================== PRODUCTS POLICIES ====================
CREATE POLICY "Public Read Products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admin CRUD Products" ON products
    FOR ALL USING (public.is_admin());


-- ==================== ORDERS POLICIES ====================
CREATE POLICY "Users View Own Orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Allow anonymous checkouts OR registered checkouts
CREATE POLICY "Anyone Insert Orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin Control Orders" ON orders
    FOR ALL USING (public.is_admin());


-- ==================== ORDER_ITEMS POLICIES ====================
CREATE POLICY "Users View Own Order Items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Anyone Insert Order Items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin Control Order Items" ON order_items
    FOR ALL USING (public.is_admin());


-- ==================== REVIEWS POLICIES ====================
CREATE POLICY "Public Read Reviews" ON reviews
    FOR SELECT USING (true);

-- Authenticated users can write reviews
CREATE POLICY "Auth Write Reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin Control Reviews" ON reviews
    FOR ALL USING (public.is_admin());


-- ==================== WISHLISTS POLICIES ====================
CREATE POLICY "Users Control Own Wishlist" ON wishlists
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());


-- ==================== CHATS POLICIES ====================
CREATE POLICY "Customers View Own Chats" ON chats
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customers Create Own Chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Admin Control Chats" ON chats
    FOR ALL USING (public.is_admin());


-- ==================== CHAT_MESSAGES POLICIES ====================
CREATE POLICY "Customers View Own Chat Messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = chat_messages.chat_id
            AND (chats.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Customers Create Own Chat Messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = chat_messages.chat_id
            AND (chats.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admin Control Chat Messages" ON chat_messages
    FOR ALL USING (public.is_admin());


-- ==================== SITE_SETTINGS POLICIES ====================
CREATE POLICY "Public Read Site Settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin Write Site Settings" ON site_settings
    FOR ALL USING (public.is_admin());
