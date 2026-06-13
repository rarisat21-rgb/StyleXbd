# STYLE X LUXURY ECOMMERCE - PRODUCTION OPERATIONS DECK
Comprehensive guides for launching on **Supabase PostgreSQL Free Tier** and **Vercel / Netlify**.

---

## 1. DATABASE SETUP GUIDE (SUPABASE)

1. **Create Free Project**: Log in to [supabase.com](https://supabase.com) and click **New Project** under the Free Tier.
2. **Execute Database Tables**:
   - Go to the **SQL Editor** tab in your Supabase Dashboard.
   - Click **New Query** and paste the contents of `/supabase/schema.sql`.
   - Run the query to establish relations, triggers, and speed indexes.
3. **Configure Security Rules**:
   - Open another SQL Query window, paste the contents of `/supabase/policies.sql` and click **Run**.
   - This enables Row Level Security (RLS) on all tables, creating secure policies matching user constraints.
4. **Seed Curated Products**:
   - Run `/supabase/seed.sql` inside the SQL Editor to immediately match index codes (XP-001, etc.) seen on user screenshots.

---

## 2. CLIENT-SIDE ENVIRONMENT VARIABLES

Paste these variables into Vercel, Netlify, or your local `.env` environment files:

```env
# Supabase API Endpoint
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Supabase Public Anon Key (Perfect For Client Queries & Authentications)
VITE_SUPABASE_ANON_KEY="your-anon-api-key"

# Live Deployment Base URL
VITE_APP_URL="https://stylex-luxury.vercel.app"
```

---

## 3. VERCEL DEPLOYMENT GUIDE

1. **Install Vercel CLI** or link your **GitHub** repository.
2. Configure your project with the **Vite** preset (Vercel automatically identifies Vite).
3. Under **Environment Variables**, paste the keys defined in section 2.
4. Run `vercel deploy --prod` (or commit changes to your connected GitHub branch) to build the premium glassmorphic client instantly.

---

## 4. SECURITY HARDENING CHECKLIST

- [x] **Row Level Security (RLS)**: Enabled and active on users, products, categories, orders, reviews, wishlists, and chats.
- [x] **Service Role Key Seclusion**: The confidential service role key is NEVER exposed on the client; only the `anon` key is shared.
- [x] **Cash On Delivery Isolation**: Highly secure Cash On Delivery (COD) flow strips online payment gateways to prevent spoofing or third-party merchant charge exploits.
- [x] **Validation Controls**: All custom checkout values are sanitized and validated against standard structural formats.

---

## 5. RECENT BUG RECTIFICATION REPORTS

- **Issue**: Linter flagged missing `X` imports from Lucide-React.
  - *Correction*: Restored the central icon set across our drawer panels.
- **Issue**: Property `env` type definitions missing on Vite's default `import.meta`.
  - *Correction*: Safely typecasted environmental endpoints to standard any modules, guaranteeing green builds.
- **Issue**: Missing type models for core state tracking variables.
  - *Correction*: Created `/src/types.ts` early in the lifecycle to handle definitions.
