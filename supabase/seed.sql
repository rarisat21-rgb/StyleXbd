-- STYLE X LUXURY ECOMMERCE - SEED DATA
-- Populate initial configurations, categories, and luxury items

-- 1. Insert Categories
INSERT INTO categories (name, slug) VALUES 
('MEN', 'men'),
('WOMEN', 'women'),
('ACCESSORIES', 'accessories'),
('COLLECTIVE', 'collective')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products (with dimensions, prices, images, descriptions matching screenshot)
INSERT INTO products (name, slug, description, price, old_price, stock, category, sizes, colors, featured, image_url, gallery) VALUES
('Risat Adnan', 'risat-adnan', 'Curated premium essential constructed with exceptional craftsmanship, designed for modern silhouettes.', 122, 199, 322, 'MEN', ARRAY['S', 'XS'], ARRAY['#1A1A1A', '#333333'], true, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600', ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600']),
('Hello', 'hello-luxury', 'Signature brand item embodying the ultimate expression of our minimalist couture collection.', 100, 150, 112, 'MEN', ARRAY['S', 'XS', 'M'], ARRAY['#D4AF37', '#0F0F0F'], true, 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600', ARRAY['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600']),
('Risat', 'risat-signature', 'Tailored fit premium apparel offering comfort, elegant drapery, and unmatched sophistication.', 100, 180, 50, 'MEN', ARRAY['XS', 'S', 'M', 'L'], ARRAY['#5B21B6', '#F5D76E'], true, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600', ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600']),
('Hi', 'hi-statement', 'Expressive designer piece combining royal details with high-contrast contemporary lines.', 122, 220, 12, 'MEN', ARRAY['S', 'M', 'L'], ARRAY['#000000', '#D4AF37'], true, 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=600', ARRAY['https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=600']),
('Welcome', 'welcome-piece', 'Luxury capsule essential curated for a refined seasonal look. Limited inventory collection.', 100, 120, 12, 'MEN', ARRAY['S', 'M'], ARRAY['#FFFFFF', '#3B0764'], false, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600', ARRAY['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600'])
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert DEFAULT SITE SETTINGS
INSERT INTO site_settings (key, value) VALUES
('general', '{"brand_name": "Style X", "tagline": "LUXURY COLLECTIVE", "whatsapp_number": "+8801700000000", "currency_symbol": "৳", "shipping_charge": 50}'::jsonb),
('banners', '{"homepage_header": "Explore our entire catalogue of premium essentials. Every piece is handpicked for quality and construction."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
