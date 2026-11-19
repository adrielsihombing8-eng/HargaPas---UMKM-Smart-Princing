# HargaPas UMKM — Smart Pricing & Financial Simulation Prototype

> **Project Status: Early Prototype (Dummy Data Only)**
>
> This application currently runs entirely on **local dummy/seed data** persisted in browser `localStorage`. **The backend database (Supabase) has not been implemented or connected yet.** All calculations, stock deductions, cash flow entries, and price updates happen locally in the browser for prototyping and UI/UX evaluation.

---

## What is HargaPas UMKM?

**HargaPas UMKM** is a web-based smart pricing, Cost of Goods Sold (HPP/COGS), and financial simulation prototype designed for Indonesian MSMEs (**UMKM**), especially food & beverage businesses. It helps business owners calculate accurate production costs per portion, set profitable selling prices, protect margins against raw material price spikes, and simulate multi-channel marketplace pricing.

---

## What Has Been Built

### 1. 10 Core Interactive Modules
1. **Dashboard Overview** (`src/modules/DashboardOverview.tsx`)
   - Monthly revenue, net profit, average margin %, active product count, and overall financial health badge.
   - Interactive 14-day Revenue & Gross Profit SVG chart (`src/components/charts/SalesProfitChart.tsx`).
   - **Smart Alerts** that automatically warn when ingredient price spikes or low margins fall below the configured threshold.
2. **Kalkulator HPP & Penetapan Harga** (`src/modules/HppCalculator.tsx`)
   - Batch production calculator linked directly to inventory ingredient prices, labor, and operational overhead.
   - Automatic HPP per unit (`Total Cost / Batch Qty`) and recommended selling price (`HPP / (1 - Margin/100)`).
   - Markup vs. Margin breakdown, regional market price benchmarks (Jabodetabek, Bandung, Surabaya, Yogyakarta, Medan, Bali), and one-click save to the Product Catalog.
3. **Simulasi Laba & What-If Analysis** (`src/modules/WhatIfSimulator.tsx`)
   - Interactive sliders for raw material price changes (%), sales volume changes (%), and promotional discounts (%).
   - Real-time projected profit, profit delta, new margin, and a price sensitivity curve (`src/components/charts/SensitivityChart.tsx`).
4. **Analisis BEP & Target Finansial** (`src/modules/BepAnalysis.tsx`)
   - Break-Even Point calculation in both units and IDR, plus progress bars for monthly revenue and net profit targets.
5. **Katalog Produk & Resep (BOM)** (`src/modules/ProductCatalogBom.tsx`)
   - Product list with margin health badges (`Aman`, `Waspada`, `Kritis`), inline selling price editing, and Bill of Materials (BOM) breakdown per portion.
6. **Inventaris Bahan Baku** (`src/modules/IngredientInventory.tsx`)
   - Stock levels, minimum reorder points, quick restocking, price updates (which dynamically recalculate product HPP and Smart Alerts), and price history modal.
7. **Kalkulator Marketplace & Multi-Kanal** (`src/modules/MarketplaceCalculator.tsx`)
   - Online price markup calculator (`Net Price / (1 - Commission%)`) for GoFood (20%), GrabFood (20%), ShopeeFood (20%), and TikTok Shop (10%) plus optional promo subsidy.
8. **Kas & POS Sederhana** (`src/modules/PosCashier.tsx`)
   - Quick sales entry that automatically deducts raw material stock based on the product's BOM, plus cash-in/cash-out logging.
9. **Laporan Laba / Rugi Sederhana** (`src/modules/ProfitLossReport.tsx`)
   - Simple Profit & Loss summary (revenue, COGS used, gross profit, operational expenses, net profit) and per-product contribution breakdown.
10. **Pengaturan Usaha** (`src/modules/BusinessSettings.tsx`)
    - Business profile, category, market region, margin safety threshold, light/dark mode toggle, and a **Reset Data Dummy** button.

### 2. Local Dummy Data (`src/data/seedData.ts`)
Because the database is not connected yet, the app seeds realistic initial data in `src/store/HargaPasContext.tsx`:
- **6 Raw Materials:** Kopi Bubuk (`kg`), Susu UHT (`liter`), Gula Pasir (`kg`), Gelas Plastik (`pcs`), Teh Melati (`kg`), and Es Batu (`kg`), complete with sample purchase price history.
- **2 Sample Products:**
  - *Kopi Susu Gula Aren* (HPP `Rp 8.950`, Selling Price `Rp 13.000`, Margin `~31.2%`)
  - *Es Teh Manis Melati* (HPP `Rp 2.925`, Selling Price `Rp 5.000`, Margin `~41.5%`)
- **14 Days of Sales Transactions & Cash Flow Entries** to populate charts and financial reports immediately.

### 3. Design System & Micro-Interactions
- Built with a light sage (`#f8faf9`) / optional dark slate (`#0f172a`) canvas, deep forest green sidebar (`#2c5f4e` / `#3a6b5a`), and emerald mint accents (`#7bdc93`).
- `rounded-3xl` card surfaces with soft elevation, pointer hover tracking (`PointerCard.tsx`), pressable `scale(0.97)` buttons (`PressButton.tsx`), spring-physics active navigation indicator, and hidden native sidebar scrollbars (`Sidebar.tsx`).

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4 + custom CSS design tokens (`src/index.css`)
- **Icons:** `lucide-react`
- **Charts:** Custom interactive SVG charts
- **Persistence (Temporary):** Browser `localStorage` (`hargapas_umkm_v1`)

---

## Project Structure

```text
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── charts/
    │   │   ├── SalesProfitChart.tsx
    │   │   └── SensitivityChart.tsx
    │   ├── layout/
    │   │   └── Sidebar.tsx
    │   └── ui/
    │       ├── PointerCard.tsx
    │       ├── PressButton.tsx
    │       └── Toast.tsx
    ├── data/
    │   └── seedData.ts
    ├── modules/
    │   ├── BepAnalysis.tsx
    │   ├── BusinessSettings.tsx
    │   ├── DashboardOverview.tsx
    │   ├── HppCalculator.tsx
    │   ├── IngredientInventory.tsx
    │   ├── MarketplaceCalculator.tsx
    │   ├── PosCashier.tsx
    │   ├── ProductCatalogBom.tsx
    │   ├── ProfitLossReport.tsx
    │   └── WhatIfSimulator.tsx
    ├── store/
    │   └── HargaPasContext.tsx
    ├── types/
    │   └── hargapas.ts
    └── utils/
        ├── finance.ts
        └── format.ts
```

---

## Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Type-check and build for production
npm run build
```

*(Note: On Windows PowerShell with restricted script execution policy, use `npm.cmd` instead of `npm`.)*

---

## Roadmap / Next Steps

- [ ] Design PostgreSQL schema in **Supabase** (ingredients, price history, products, BOM items, sales transactions, cash flow, business settings).
- [ ] Replace `localStorage` persistence in `src/store/HargaPasContext.tsx` with Supabase client queries and authentication.
- [ ] Add multi-user / UMKM account support and cloud sync.
