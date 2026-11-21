-- ============================================================================
-- HARGAPAS UMKM — SUPABASE POSTGRESQL SCHEMA, RLS POLICIES & AUTH TRIGGERS
-- ============================================================================
-- Jalankan seluruh script ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Aktifkan ekstensi UUID
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABEL PROFILES (Terhubung ke Supabase Auth / Google OAuth)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Pengguna UMKM',
  email text not null,
  business_name text not null default 'Usaha UMKM Saya',
  role text not null default 'Owner UMKM' check (role in ('Owner UMKM', 'Kasir')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. TABEL BUSINESS SETTINGS
-- ============================================================================
create table if not exists public.business_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null default 'Kedai Kopi Nusantara',
  category text not null default 'Minuman' check (category in ('Makanan', 'Minuman', 'Jasa')),
  region text not null default 'Jabodetabek' check (
    region in ('Jabodetabek', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Bali')
  ),
  margin_threshold numeric(5,2) not null default 25,
  monthly_revenue_target numeric(14,2) not null default 18000000,
  monthly_profit_target numeric(14,2) not null default 6000000,
  monthly_fixed_cost numeric(14,2) not null default 3500000,
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. TABEL INGREDIENTS & RIWAYAT HARGA BAHAN BAKU
-- ============================================================================
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unit text not null check (unit in ('kg', 'liter', 'pcs', 'gram', 'ml')),
  price_per_unit numeric(14,2) not null default 0,
  stock numeric(14,4) not null default 0,
  min_stock numeric(14,4) not null default 0,
  supplier text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ingredients_user_id on public.ingredients(user_id);

create table if not exists public.ingredient_price_history (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  price_per_unit numeric(14,2) not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_price_history_ingredient_id
  on public.ingredient_price_history(ingredient_id);

-- ============================================================================
-- 4. TABEL PRODUCTS & RESEP BOM (BILL OF MATERIALS)
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Minuman',
  selling_price numeric(14,2) not null default 0,
  labor_cost_per_unit numeric(14,2) not null default 0,
  overhead_cost_per_unit numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_user_id on public.products(user_id);

create table if not exists public.product_bom_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  qty_per_unit numeric(14,4) not null check (qty_per_unit > 0),
  unique (product_id, ingredient_id)
);

create index if not exists idx_bom_product_id on public.product_bom_items(product_id);

-- ============================================================================
-- 5. TABEL SALE TRANSACTIONS (KASIR POS)
-- ============================================================================
create table if not exists public.sale_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(14,2) not null,
  unit_hpp numeric(14,2) not null,
  channel text not null check (
    channel in ('Offline', 'GoFood', 'GrabFood', 'ShopeeFood', 'TikTok Shop')
  ),
  total_revenue numeric(14,2) not null,
  total_hpp numeric(14,2) not null,
  profit numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_user_date on public.sale_transactions(user_id, date desc);

-- ============================================================================
-- 6. TABEL CASH FLOW ENTRIES (ARUS KAS MASUK & KELUAR)
-- ============================================================================
create table if not exists public.cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  type text not null check (type in ('in', 'out')),
  category text not null,
  description text not null default '',
  amount numeric(14,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_cashflow_user_date on public.cash_flow_entries(user_id, date desc);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) — SETIAP USER HANYA MENGAKSES DATA MILIKNYA
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.business_settings enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_price_history enable row level security;
alter table public.products enable row level security;
alter table public.product_bom_items enable row level security;
alter table public.sale_transactions enable row level security;
alter table public.cash_flow_entries enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Business settings policies
create policy "Users can manage own settings"
  on public.business_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ingredients policies
create policy "Users can manage own ingredients"
  on public.ingredients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ingredient price history policies
create policy "Users can manage own ingredient price history"
  on public.ingredient_price_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Products policies
create policy "Users can manage own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- BOM policies
create policy "Users can manage own product bom"
  on public.product_bom_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Sale transactions policies
create policy "Users can manage own sales"
  on public.sale_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cash flow policies
create policy "Users can manage own cash flow"
  on public.cash_flow_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 8. TRIGGER OTOMATIS SAAT USER BARU DAFTAR (EMAIL / GOOGLE OAUTH)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_business text;
  v_avatar text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, 'user@hargapas.id'), '@', 1)
  );
  v_business := coalesce(
    new.raw_user_meta_data ->> 'business_name',
    'Usaha ' || v_name
  );
  v_avatar := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, name, email, business_name, role, avatar_url)
  values (new.id, v_name, coalesce(new.email, ''), v_business, 'Owner UMKM', v_avatar)
  on conflict (id) do nothing;

  insert into public.business_settings (user_id, business_name)
  values (new.id, v_business)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
